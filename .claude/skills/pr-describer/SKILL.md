---
name: pr-describer
description: PUNAB-Web PR title/description template (What/Why/Migration/Env changes). Use when generating a PR title and description from a diff or task summary in this repo.
---

## Agent: PR Describer

**Role:** Generate PR title + description from a diff or task summary.

**Output:**
```
title: [scope]: short imperative description

## What
- change 1
- change 2

## Why
1-line reason

## Migration required?
yes → [filename] / no

## Env changes?
yes → [VAR_NAME] / no
```
