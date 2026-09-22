# Contract: GitHub host `koller-nexus/vps-ops-mcp`

Operator-verified. Do not call this API from `bun test`.

## Repository

| Field | Required value |
|-------|----------------|
| visibility | `public` |
| allow_forking | `true` |
| default_branch | `main` |
| license SPDX | `MIT` |
| description | non-empty English sentence |

## Ruleset `default-branch`

| Field | Required value |
|-------|----------------|
| enforcement | `active` |
| target | branch |
| include | `~DEFAULT_BRANCH` |
| pull request required | yes |
| required check | `Test and build` |
| linear history | yes |
| lock branch | no |
| bypass actors | none (admins included) |

## Ruleset `contribution-branch-names`

| Field | Required value |
|-------|----------------|
| enforcement | `active` |
| include | `~ALL` |
| exclude | `~DEFAULT_BRANCH`, `refs/heads/feature/*`, `refs/heads/fix/*`, `refs/heads/refactor/*` |
| rule | `creation` (restrict creations) |
| bypass actors | none |

## Workflow (in-tree, also asserted by `bun test`)

File: `.github/workflows/pull_request.yml`

| Field | Required value |
|-------|----------------|
| trigger | `pull_request` |
| job name | `Test and build` |
| steps | `bun test` then `bun run build` |

## Revalidation commands

```bash
gh api repos/koller-nexus/vps-ops-mcp --jq '{visibility,license:.license.spdx_id,description,allow_forking,default_branch}'
gh api repos/koller-nexus/vps-ops-mcp/rulesets
```

Claim FR-004, FR-005, FR-006 (host side), FR-009, FR-010, FR-011 only after these return the table above.
