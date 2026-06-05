---
title: "Rodando Honcho self-hosted: os gotchas que custaram horas"
date: 2026-05-25
tags:
  - homelab
  - honcho
  - self-hosted
  - postgres
  - cloudflare
draft: false
---

Subir o [Honcho](https://github.com/plastic-labs/honcho) no homelab parecia que ia ser um `docker compose up`. Não foi. Não pelos motivos óbvios, a stack é decente, mas pelos cantos onde a documentação assume defaults que não são os meus. Algumas mudanças foram necessárias pra deixar do meu jeito, e esse post é o que eu queria ter lido antes.

<!--more-->

## Contexto rápido

[Honcho](https://github.com/plastic-labs/honcho) é uma camada de memória pra agentes. Eu mando mensagens, interajo com um agent, configuro um hook ou uso um MCP e ele extrai fatos via LLM, indexa via embedding num vector store, e devolve contexto relevante depois. Usei a imagem `ghcr.io/plastic-labs/honcho:latest`, rodando como serviço dentro do meu stack `ai-core` no homelab (o chão dessa estrutura eu detalhei no [post anterior]({{< ref "montando-o-homelab" >}})).

Esse stack precisa de GPU pra rodar embeddings locais (`nomic-embed-text` via Ollama), então vive numa VM com **GPU passthrough via VFIO**. E aqui já entra o primeiro sofrimento que não aparece nos READMEs do Honcho: fazer VFIO direito (isolar IOMMU groups, garantir que a placa sai limpa do host sem o kernel reclamar, lidar com disputa quando outra VM quer a mesma GPU) custou horas antes do primeiro container do Honcho subir. Vai virar post separado nessa série, porque o assunto pede um post inteiro. Aqui só registro que esse degrau existe.

A ideia com esse post é registrar esses aprendizados. Eu vou esquecer em algum momento e, mesmo com memória no meu contexto e nos agents, é bom ter esse backup público e explicativo.

Eu começo esse blog registrando como eu resolvo um problema que me incomodava: privacidade e facilidade ao lidar com múltiplos modelos e agents.

---

## 1. Embedding 768d quando o default é 1536d

O Honcho assume embeddings de 1536 dimensões (escala OpenAI `text-embedding-3-small`). Eu uso `nomic-embed-text` local via LiteLLM, que cospe **768d**. As migrations do Alembic do Honcho **fazem hardcode de 1536** na criação das tabelas. Isso me custou uns debugs e tentativas de start do container para entender o problema.

Mas eu já tinha subido a stack usando os defaults...

Primeiro instinto (errado): "deixa eu dropar o DB e recriar com a coluna certa." Olhei o repo antes de fazer isso. Existe um script:

```bash
scripts/configure_embeddings.py
```

Ele faz `ALTER TABLE` na coluna de vector, reconstrói o índice HNSW, e é **idempotente**. Ou seja: o "workaround" correto nunca foi destruir dados, era rodar o script.

Como eu queria que isso fosse automático em todo provisionamento, o entrypoint custom do compose virou:

```yaml
entrypoint:
  - /bin/sh
  - -c
  - |
    python scripts/provision_db.py
    python scripts/configure_embeddings.py --yes
    fastapi run
```

A primeira lição aprendida: **antes de propor wipe, leia `scripts/`, `docs/`, e a mensagem de erro inteira**. O que assumo, que por uma leve ansiedade e procrastinação não fiz.

## 2. REDIS_PASSWORD com caractere especial

Gerei uma senha forte pro Redis. Ou seja, não é o famoso 'MyStrongPassword'. Funcionou em metade dos clientes e quebrou na outra metade. (Senhas fortes não resolvem tudo sempre)

Causa: clientes que conectam via **string URI** (`redis://:senha@host:port`) interpretam alguns chars como início de fragment. Já clientes que aceitam senha como parâmetro separado (`redis-py` puro) tratam o byte como literal. (Coisa para se lembrar em um HackTheBox)

Honcho usa URI-style. Outros consumidores no stack não. Solução foi expor **duas env vars** no compose:

```yaml
environment:
  REDIS_PASSWORD: ${REDIS_PASSWORD}              # raw, pra clients estilo redis-py
  REDIS_PASSWORD_URLENCODED: ${REDIS_PASSWORD_URLENCODED}  # URL encoded, o nome já é explicativo
```

E o `.env` carrega as duas, geradas em paralelo. Caro? Não. Honesto sobre o que tá rolando? Sim.

**Lição:** caractere especial em senha **vai** te morder em algum cliente. Se você quer paz, gere só `[A-Za-z0-9]` desde o começo. Se você já tem a senha gerada e não quer rotacionar, expõe as duas versões.

## 3. Cloudflare Access cobrindo demais

Eu queria expor o honcho publicamente via Cloudflare Tunnel, mas com proteção. Primeira config:

```
Cloudflare Access  →  *  (todo o domínio)
```

Resultado: para quem gosta do Claude Code, o plugin `claude-honcho` (que conecta o Claude Code via MCP) ficou autenticando contra Cloudflare em vez de contra o JWT do Honcho. E isso vai quebrar, obviamente...

A solução foi delimitar Access **só ao que precisa de proteção visual humana**:

| Path                               | Quem protege                                 |
| ---------------------------------- | -------------------------------------------- |
| `/docs`, `/redoc`, `/openapi.json` | Cloudflare Access (OAuth)                    |
| `/v3/*` (API)                      | JWT do próprio Honcho (`AUTH_USE_AUTH=true`) |
| `/health`                          | passa direto (pra health check)              |

JWT do Honcho ligado assim:

```yaml
environment:
  AUTH_USE_AUTH: "true"
  JWT_SECRET: ${JWT_SECRET}   # 32 bytes hex: openssl rand -hex 32
```

**Lição:** Cloudflare Access é navalha pra UI humana. Pra API que outros serviços consomem, prefere o auth nativo da aplicação. Misturar os dois funciona, mas você precisa decidir **qual cobre qual path**. Já fiz umas gambiarras com outras instâncias de serviços, vou cobrir isso em outro post.

## 4. Onde o stack vive (e por que importa)

Pequeno detalhe operacional: o repo do homelab fica clonado no host, e o **Portainer faz git pull** pra subir os stacks. Configs que precisam de path visível pelo host (mount, secrets, configs do nginx) usam **symlinks tipo stow** sob `/srv/ai/`, `/srv/data/`, `/srv/infra/`.

Isso parece bobagem até você ter o terceiro stack apontando pra um arquivo que sumiu porque você deu `git clean -fd` num momento de empolgação. Symlinks com nomes estáveis sob `/srv/` resolvem.

---

## Resumindo

O que parecia "subir um container" virou:

- Custom entrypoint pra remediar embedding dim
- Duas env vars pra mesma senha (raw + URL-encoded)
- Cloudflare Access escopado em paths específicos
- Layout de arquivos com symlinks pra sobreviver a `git pull` em outro host

Nada disso é exótico. É só **a lição de sempre**: ler antes de destruir, prestar atenção em encoding, e separar auth de UI de auth de API.

No [próximo post]({{< ref "homelab-ai-self-hosted-overview" >}}) eu abro a câmera pra mostrar o **stack inteiro de IA** onde o Honcho vive, e por que cada peça está onde está. Nos seguintes, o **LiteLLM** ganha post próprio, todo modelo passa por ele agora e isso destrava bastante coisa.
