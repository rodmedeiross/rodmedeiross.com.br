# rodmedeiross.com.br

My personal site and public documentation — a brain dump about homelab, infrastructure, and self-hosted AI. Bilingual (Portuguese-first, English translated).

🔗 **Live:** https://rodmedeiross.com.br

[![Deploy](https://github.com/rodmedeiross/rodmedeiross.com.br/actions/workflows/pages.yaml/badge.svg)](https://github.com/rodmedeiross/rodmedeiross.com.br/actions/workflows/pages.yaml)
[![OPSEC guard](https://github.com/rodmedeiross/rodmedeiross.com.br/actions/workflows/opsec.yml/badge.svg)](https://github.com/rodmedeiross/rodmedeiross.com.br/actions/workflows/opsec.yml)
[![Built with Hugo](https://img.shields.io/badge/built%20with-Hugo-ff4088?logo=hugo&logoColor=white)](https://gohugo.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Stack

- **[Hugo](https://gohugo.io)** (extended) static site generator
- **[Hextra](https://github.com/imfing/hextra)** theme, pulled in as a Hugo Module (no vendored theme, no `themes/`)
- **Multilingual** (PT / EN) via filename suffixes
- **GitHub Pages** for hosting, with a custom domain
- Offline search (FlexSearch), Mermaid diagrams, RSS

## Local development

Requires **Hugo extended** and **Go** (Hextra is a Hugo Module, so Go fetches it at build time). Versions are pinned in CI: Hugo `0.147.7`, Go `1.26`.

```bash
hugo server --buildDrafts          # dev server with drafts → http://localhost:1313
hugo server                        # dev server, published content only
hugo new content/blog/<slug>.pt.md # scaffold a post (PT); add a matching .en.md
hugo --gc --minify                 # production build into ./public (mirrors CI)
hugo mod get -u                    # bump Hextra (and other modules)
```

## Project structure

```
content/                     # posts & pages, split by language suffix (.pt.md / .en.md)
  _index.{pt,en}.md          #   homepage body
  about.{pt,en}.md           #   about page
  blog/                      #   the homelab series + drafts
layouts/                     # template overrides that shadow the theme
  home.html                  #   article-style homepage
  robots.txt                 #   allow search engines, block AI crawlers, expose sitemap
  _partials/scripts/mermaid.html   # hand-drawn Mermaid (Excalifont) + per-diagram zoom
  shortcodes/recent-posts.html     # homepage post list
  shortcodes/dino.html             # easter egg (see below)
assets/css/custom.css        # custom styles (self-hosted font, mermaid zoom)
static/                      # copied verbatim → CNAME (custom domain), fonts/
.github/workflows/           # pages.yaml (deploy), opsec.yml (content guard)
scripts/opsec-scan.sh        # the OPSEC scanner (runnable locally)
hugo.yaml                    # site config (menu, search, i18n, params)
go.mod                       # Hugo Module imports (Hextra)
```

## Content & authoring

- **Portuguese is authored first**; the matching `.en.md` is a faithful translation kept in sync.
- `defaultContentLanguage: en` — English serves at the site root, Portuguese under `/pt/`.
- Cross-references use `{{< ref "slug" >}}` (no language suffix); Hugo resolves to the current language.
- Use `<!--more-->` to mark the post summary cut-off.

## CI / security

Two GitHub Actions workflows:

- **`pages.yaml`** — builds with Hugo and deploys to GitHub Pages on push to `main`.
- **`opsec.yml`** — an **OPSEC content guard** that runs on every PR (and as a step before the build): it fails if published content leaks internal IPs, internal domains, or secrets. It's also wired into the deploy, so a leak blocks publishing. See [`scripts/opsec-scan.sh`](scripts/opsec-scan.sh).

```bash
bash scripts/opsec-scan.sh content   # run the guard locally
```

## Easter egg

The [About page](https://rodmedeiross.com.br/about/) has a self-playing pixel T-Rex runner (vanilla `<canvas>`, theme-aware, pauses off-screen, respects `prefers-reduced-motion`). Press space or tap to take control. 🦖

## License

[MIT](LICENSE).
