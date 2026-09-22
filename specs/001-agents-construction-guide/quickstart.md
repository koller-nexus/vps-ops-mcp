# Quickstart: Validate the Construction Guide

Use this after `AGENTS.md` exists. Do not implement operator tools or run a public release.

## Prerequisites

- Repository root checkout
- Contract: [contracts/agents-md.md](./contracts/agents-md.md)
- Data model: [data-model.md](./data-model.md)

## Setup

No install beyond the repo's existing toolchain. The guide is a root Markdown file.

## Proof commands

From the repository root:

```bash
test -f AGENTS.md
bun test src/agents-md.test.ts
```

Expected: `AGENTS.md` exists; the contract test passes (required headings and tokens present; forbidden live-secret patterns absent).

If `src/agents-md.test.ts` is not yet in the tree, stop at **blocked** for that command and finish the heading/token review below before claiming the guide is complete.

## Tabletop A — five-minute locate (SC-001)

Open only `AGENTS.md`. Time yourself.

You MUST find, without opening `src/`:

- Skill routes for `mcp-builder`, `devops-engineer`, and `opensource-pipeline`
- Mutation rules (`confirm:true` and `VPS_ALLOW_MUTATIONS`)
- Definition of done (fresh `bun test` evidence; no unverified claims)

Pass if all three are found in under five minutes.

## Tabletop B — score a proposed tool (SC-002)

Invent a mutating capability named `restart` with no confirmation.

Using only the guide, reject it for all of:

- Missing `vps_` prefix
- Missing matching `destructiveHint`
- Missing `confirm:true`
- Missing English next-step error if confirmation is absent

Pass if the guide lists every rejection reason.

## Tabletop C — publish stop (SC-003)

Walk a public publish using the Public release section.

Pass if you stop for explicit human approval and can state that a sanitizer `FAIL` blocks publish.

## Expected outcomes

| Check | Pass |
|-------|------|
| File exists at root | `AGENTS.md` present |
| Contract test | All required headings and tokens |
| Secrets | Zero live credentials in the guide |
| Tabletops A–C | Reviewer can complete without source |
| Scope | No new MCP tools and no public repo created |

## Stop

When the checks above pass, the feature is verified. Do not add extra docs, CI jobs, or tools.
