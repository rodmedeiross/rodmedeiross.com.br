---
title: "Running Honcho self-hosted — the gotchas that cost me hours"
date: 2026-05-25
tags:
  - homelab
  - honcho
  - self-hosted
  - postgres
  - cloudflare
draft: false
---

Bringing up [Honcho](https://github.com/plastic-labs/honcho) in the homelab looked like it would be a `docker compose up`. It wasn't. Not for the obvious reasons — the stack is solid — but because of the corners where the docs assume defaults that aren't mine. A few changes were needed to make it work my way, and this post is what I wish I'd read first.

<!--more-->

## Quick context

[Honcho](https://github.com/plastic-labs/honcho) is a memory layer for agents. I send messages, interact with an agent, set up a hook or use an MCP, and it extracts facts via an LLM, indexes them via embedding in a vector store, and gives back relevant context later. I used the `ghcr.io/plastic-labs/honcho:latest` image, running as a service inside my `ai-core` stack on the homelab (I detailed the ground floor of this setup in the [previous post]({{< ref "montando-o-homelab" >}})).

This stack needs a GPU to run local embeddings (`nomic-embed-text` via Ollama), so it lives on a VM with **GPU passthrough via VFIO**. And that's already the first pain that never shows up in Honcho's READMEs: getting VFIO right (isolating IOMMU groups, making sure the card leaves the host cleanly without the kernel complaining, dealing with contention when another VM wants the same GPU) cost me hours before the first Honcho container even came up. It's becoming its own post in this series, because the topic deserves a whole article. Here I just note that this step exists.

The idea with this post is to record these lessons. I'll forget them at some point and, even with memory in my context and in my agents, it's good to have this public, explanatory backup.

I'm kicking off this blog by writing down how I solved a problem that bugged me: privacy and convenience when dealing with multiple models and agents.

---

## 1. 768d embeddings when the default is 1536d

Honcho assumes 1536-dimension embeddings (OpenAI's `text-embedding-3-small` scale). I use `nomic-embed-text` locally via LiteLLM, which spits out **768d**. Honcho's Alembic migrations **hardcode 1536** when creating the tables. That cost me a few debugging rounds and failed container starts before I understood the problem.

But I'd already brought the stack up using the defaults...

First instinct (wrong): "let me just drop the DB and recreate it with the right column." I looked at the repo before doing that. There's a script:

```bash
scripts/configure_embeddings.py
```

It runs `ALTER TABLE` on the vector column, rebuilds the HNSW index, and is **idempotent**. Meaning: the correct "workaround" was never to destroy data — it was to run the script.

Because I wanted this automatic on every provision, my compose's custom entrypoint became:

```yaml
entrypoint:
  - /bin/sh
  - -c
  - |
    python scripts/provision_db.py
    python scripts/configure_embeddings.py --yes
    fastapi run
```

The first lesson learned: **before suggesting a wipe, read `scripts/`, `docs/`, and the whole error message**. Which, out of a little anxiety and procrastination, I didn't do.

## 2. REDIS_PASSWORD with a special character

I generated a strong password for Redis. As in, not the famous 'MyStrongPassword'. It worked in half the clients and broke in the other half. (Strong passwords don't always solve everything.)

Cause: clients that connect via a **URI string** (`redis://:password@host:port`) interpret some chars as the start of a fragment. Clients that take the password as a separate parameter (raw `redis-py`) treat the byte literally. (Something to remember on a HackTheBox box.)

Honcho uses URI-style. Other consumers in the stack don't. The solution was exposing **two env vars** in compose:

```yaml
environment:
  REDIS_PASSWORD: ${REDIS_PASSWORD}              # raw, for redis-py-style clients
  REDIS_PASSWORD_URLENCODED: ${REDIS_PASSWORD_URLENCODED}  # URL encoded, the name says it all
```

And the `.env` loads both, generated in parallel. Expensive? No. Honest about what's going on? Yes.

**Lesson:** a special character in a password **will** bite you in some client. If you want peace, generate `[A-Za-z0-9]` only from the start. If you already have the password and don't want to rotate it, expose both versions.

## 3. Cloudflare Access covering too much

I wanted to expose Honcho publicly via Cloudflare Tunnel, but with protection. First config:

```
Cloudflare Access  →  *  (whole domain)
```

Result: for those of us who like Claude Code, the `claude-honcho` plugin (which connects Claude Code via MCP) ended up authenticating against Cloudflare instead of against Honcho's JWT. And that breaks, obviously...

The fix was scoping Access **only to what needs human-visible protection**:

| Path                               | Who protects it                              |
| ---------------------------------- | -------------------------------------------- |
| `/docs`, `/redoc`, `/openapi.json` | Cloudflare Access (OAuth)                    |
| `/v3/*` (API)                      | Honcho's own JWT (`AUTH_USE_AUTH=true`)      |
| `/health`                          | passes through (for health checks)           |

Honcho JWT wired up like this:

```yaml
environment:
  AUTH_USE_AUTH: "true"
  JWT_SECRET: ${JWT_SECRET}   # 32 bytes hex: openssl rand -hex 32
```

**Lesson:** Cloudflare Access is a razor for human UIs. For an API that other services consume, prefer the application's native auth. Mixing the two works, but you have to decide **which one covers which path**. I've pulled off a few hacks with other service instances — I'll cover that in another post.

## 4. Where the stack lives (and why it matters)

Small operational detail: the homelab repo lives cloned on the host, and **Portainer pulls from git** to bring the stacks up. Configs that need host-visible paths (mounts, secrets, nginx configs) use **stow-like symlinks** under `/srv/ai/`, `/srv/data/`, `/srv/infra/`.

This sounds trivial until you have a third stack pointing at a file that vanished because you ran `git clean -fd` in a moment of enthusiasm. Symlinks with stable names under `/srv/` solve it.

---

## Wrapping up

What looked like "spin up a container" turned into:

- A custom entrypoint to remediate the embedding dimension
- Two env vars for the same password (raw + URL-encoded)
- Cloudflare Access scoped to specific paths
- A file layout with symlinks to survive `git pull` on another host

None of this is exotic. It's just **the usual lesson**: read before you destroy, pay attention to encoding, and separate UI auth from API auth.

In the [next post]({{< ref "homelab-ai-self-hosted-overview" >}}) I open the lens to show the **whole AI stack** where Honcho lives, and why each piece sits where it does. In the ones after that, **LiteLLM** gets its own post — every model goes through it now, and that unlocks a lot.
