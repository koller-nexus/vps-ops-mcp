# Contract: Root `CONTRIBUTING.md`

Interface for humans and agents who propose changes.

## Location

- Path: `CONTRIBUTING.md` (repository root)
- Format: Markdown, English

## Required headings (exact)

1. `# Contributing`
2. `## Branch names`
3. `## Pull requests`
4. `## Verification`
5. `## Issues`

## Required tokens

| Token | Maps to |
|-------|---------|
| `feature/` | FR-005 |
| `fix/` | FR-005 |
| `refactor/` | FR-005 |
| `main` | FR-004 |
| `pull request` | FR-001, FR-004 |
| `ISSUE.md` | FR-001, FR-002 |
| `bun test` | FR-006 |
| `bun run build` | FR-006 |
| `Conventional Commits` | FR-001 |

## Forbidden

- Live host addresses or key paths
- Permission to push directly to `main`
- `agent/` as an allowed prefix
