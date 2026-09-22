# Contract: Root `AGENTS.md`

This is the interface the construction guide exposes to agents and reviewers.
Implementation MUST satisfy every required heading and token below.

## Location

- Path: `AGENTS.md` (repository root)
- Format: Markdown, English
- Authority: Complements `.specify/memory/constitution.md`; constitution wins

## Required headings (exact)

The file MUST contain these headings, in this order:

1. `# VPS Ops MCP Agent Construction Guide`
2. `## Purpose`
3. `## Authority`
4. `## Skill routing`
5. `## Product shape`
6. `## Operator capabilities`
7. `## Proof`
8. `## Delivery and operations`
9. `## Public release`
10. `## Construction sequence`
11. `## Anti-patterns`
12. `## Human setup`

## Required tokens

The body MUST include each of the following strings (exact, case-sensitive where shown):

| Token | Maps to |
|-------|---------|
| `constitution wins` | FR-002 |
| `mcp-builder` | FR-003 |
| `.agents/skills/mcp-builder/SKILL.md` | FR-003 |
| `devops-engineer` | FR-004 |
| `.agents/skills/devops-engineer/SKILL.md` | FR-004 |
| `opensource-pipeline` | FR-005 |
| `.agents/skills/opensource-pipeline/SKILL.md` | FR-005 |
| `speckit-` | FR-006 |
| `test-driven-development` | FR-006, FR-012 |
| `verification-before-completion` | FR-006 |
| `client-launched` | FR-007 |
| `confirm:true` | FR-008 |
| `VPS_ALLOW_MUTATIONS` | FR-008 |
| `vps_` | FR-009 |
| `readOnlyHint` | FR-010 |
| `destructiveHint` | FR-010 |
| `idempotentHint` | FR-010 |
| `openWorldHint` | FR-010 |
| `next corrective` | FR-011 |
| `bun test` | FR-012 |
| `MUST NOT` and `live host` in the same Proof section | FR-012, SC-005 |
| `MUST NOT commit secrets` | FR-013 |
| `timeout` | FR-014 |
| `byte cap` | FR-014 |
| `explicit human approval` | FR-015 |
| `rollback` | FR-015 |
| `MUST NOT` undocumented host | FR-016 |
| `sanitizer` | FR-017 |
| `staging` | FR-017 |
| `README.md` | FR-020 |

## Forbidden content

- Live IP addresses, private key paths, passphrases, or `.env` values
- Instructions to commit secrets
- Instructions to use a production host as the automated test bed
- A full copy of `README.md` registration steps
- Weakening language that makes confirmation, the allow-switch, tests, or skills optional

## Review interface

A reviewer using only this file MUST be able to answer:

1. Which skills are mandatory for tools, delivery, and public release?
2. What makes a mutation legal?
3. What proof is required before claiming done?
4. What stops a public publish?
