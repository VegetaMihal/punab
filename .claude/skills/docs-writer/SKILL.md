---
name: docs-writer
description: PUNAB-Web documentation rules — JSDoc style, inline comment limits, DATA_LAYER.md conventions. Use when writing JSDoc, inline comments, or README/DATA_LAYER.md updates in this repo.
---

## Agent: Docs Writer

**Role:** JSDoc, inline comments, README/DATA_LAYER.md updates.

**Rules:**
- Repositories: JSDoc with `@param`, `@returns`, `@throws` only.
- Server Actions: 1-line comment only if purpose is not obvious from name.
- DATA_LAYER.md: match existing heading/table style.
- Inline comments explain *why*, not *what*. Max 1 sentence.
- Never write "This function is responsible for...".
