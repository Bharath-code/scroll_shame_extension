# Domain docs

## Layout: Single-context

This repo has one global context at the root:

```
<repo-root>/
├── CONTEXT.md          # Domain language and project overview
├── docs/
│   └── adr/             # Architectural decision records
│       └── 0001-*.md
```

## Consumer rules

Skills that read these files:

- **improve-codebase-architecture** — reads `CONTEXT.md` to understand domain language, `docs/adr/` for past decisions
- **diagnose** — reads `CONTEXT.md` to understand the system
- **tdd** — reads `CONTEXT.md` to understand domain models

## How to use

1. Create `CONTEXT.md` at repo root to document the domain
2. Add ADRs in `docs/adr/` using the format `000X-description.md`
3. Skills will automatically find these files