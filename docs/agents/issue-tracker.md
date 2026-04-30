# Issue tracker — Local markdown

## Overview

Issues are stored as markdown files in the local repository under `.scratch/`.

## File structure

```
<repo-root>/
├── .scratch/
│   └── <feature-name>/
│       ├── issue-001.md
│       └── issue-002.md
```

## Read workflow

To list all open issues:
```bash
ls -la .scratch/*/
```

## Write workflow

To create a new issue:
1. Pick or create a feature folder under `.scratch/`
2. Create a numbered markdown file: `issue-XXX.md`
3. Use the template below

## Issue template

```markdown
---
title: <short title>
triage-label: needs-triage
created: <YYYY-MM-DD>
---

## Description

<What needs to be done>

## Acceptance criteria

- [ ]
```

## Commands used

- `ls` — list issues
- `mkdir` — create feature folders