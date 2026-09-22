# Contract: Root `ISSUE.md`

Interface for filing a complete issue.

## Location

- Path: `ISSUE.md` (repository root)
- Format: Markdown, English

## Required headings (exact)

1. `# Filing an issue`
2. `## Summary`
3. `## Type`
4. `## Expected versus actual`
5. `## Reproduction or acceptance`
6. `## Environment`

## Required tokens

| Token | Maps to |
|-------|---------|
| `bug` | FR-002 (type hint) |
| `feature` | FR-002 (type hint) |
| `CONTRIBUTING.md` | pointer back to contribution rules |

## Forbidden

- Live host addresses or key paths
- Required fields that ask for secrets
