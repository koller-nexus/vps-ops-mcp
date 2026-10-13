# Implementation Plan: Read-only Stack Diagnostics

**Branch**: `feature/update-docs` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-readonly-stack-diagnostics/spec.md`

## Summary

Replace the operator's manual SSH checks with fixed read-only MCP tools:
`compose_config_vars` (render stack, names only), `host_deps` (docker, compose
v2, jq versions), and an optional `file` arg on `compose_ps` /
`compose_config_vars`. The production code already exists uncommitted in
`src/tools/readonly.ts`; this plan closes the test gaps against the spec, then
verifies. No new modules, env vars, or dependencies.

## Technical Context

**Language/Version**: TypeScript on Bun

**Primary Dependencies**: `@modelcontextprotocol/sdk`, `zod`, `ssh2` (existing)

**Storage**: N/A

**Testing**: `bun test` (colocated `*.test.ts`), `bunx tsc --noEmit`

**Target Platform**: MCP stdio server; remote Linux VPS with docker + compose v2 plugin

**Project Type**: MCP server (single project)

**Performance Goals**: N/A (one SSH command per tool call, existing timeout)

**Constraints**: output bounded by `VPS_LOG_MAX_BYTES`; values never leave the process

**Scale/Scope**: +2 read-only tools, +1 optional arg on 2 tools

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. Clean Code | PASS | Helpers (`composeCmd`, `envNamesOnly`) stay in the read-only tools module. |
| II. Skill-First | PASS | Spec Kit skills in use; implement with surgical-patch + TDD. |
| III. Test-First | ATTENTION | Code was written before some tests. Missing tests (see research R4) must be written and seen failing (temporarily revert the guarded branch) before marking done. |
| IV. Integration Testing | PASS w/ tasks | Command shape changed → add command-string and catalog tests. |
| V. Safe Remote Ops | PASS | Read-only commands only; `file` validated by `assertContainerOrServiceName`; values stripped in-process. |
| VI. Lean Scope | PASS | Exactly the surface the spec requires; no new env vars. |
| VII. Verification | Pending | `bun test` + `bunx tsc --noEmit` evidence required at the end. |

Post-design re-check: unchanged, no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-readonly-stack-diagnostics/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/tools.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── tools/
│   ├── readonly.ts        # composeCmd, envNamesOnly, compose_ps, compose_config_vars, host_deps
│   └── readonly.test.ts   # new tests for gaps in research R4
└── validate.ts            # assertContainerOrServiceName (reused, unchanged)
README.md                  # tool table (already updated)
```

**Structure Decision**: Single project; all changes in the existing read-only
tools module and its test file.

## Complexity Tracking

None.
