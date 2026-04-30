# Triage labels

## Canonical labels

| Label | Meaning |
|-------|---------|
| `needs-triage` | Maintainer needs to evaluate |
| `needs-info` | Waiting on reporter |
| `ready-for-agent` | Fully specified, AFK-ready |
| `ready-for-human` | Needs human implementation |
| `wontfix` | Will not be actioned |

## Local markdown usage

In local markdown issues, the label is stored in the frontmatter:

```yaml
---
triage-label: needs-triage
---
```

## Workflow

1. **New issue** → starts with `needs-triage`
2. **Needs more info** → change to `needs-info`
3. **Ready for agent** → change to `ready-for-agent` (when spec is complete)
4. **Needs human** → change to `ready-for-human`
5. **Won't fix** → change to `wontfix`