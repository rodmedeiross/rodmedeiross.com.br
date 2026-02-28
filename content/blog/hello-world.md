---
title: "Hello World"
date: 2026-02-28
tags:
  - meta
  - blog
draft: false
---

This is the first post. A fresh start.

<!--more-->

After years running a Gatsby-based site with outdated dependencies and way too much complexity for a personal blog, I decided to start over with something simpler.

## Why Hugo + Hextra?

- **No Node.js** — Hugo is a single Go binary. No `node_modules`, no dependency hell.
- **Markdown first** — Just write `.md` files, commit, and push.
- **Dark mode** — Built-in, toggleable, respects system preference.
- **GitHub Pages** — Free hosting, automatic deploys via GitHub Actions.
- **Full-text search** — Offline, powered by FlexSearch. No external services.

## How it works

```bash
# Write a new post
hugo new content/blog/my-new-post.md

# Preview locally
hugo server --buildDrafts

# Publish
git add . && git commit -m "new post" && git push
```

That's it. Simple enough to maintain. Simple enough to actually write.

