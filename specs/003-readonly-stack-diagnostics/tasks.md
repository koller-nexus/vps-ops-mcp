---

description: "Tasks for Read-only Stack Diagnostics"
---

# Tasks: Read-only Stack Diagnostics

**Input**: Design documents from `specs/003-readonly-stack-diagnostics/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tools.md

**Tests**: Required. Constitution III says test first. Production code already
exists uncommitted, so every new test must be **seen failing** before it
counts. To do that, temporarily break or revert the guarded line in
`src/tools/readonly.ts`, run the test, then restore the line.

**Organization**: Grouped by user story. Nearly every task edits
`src/tools/readonly.test.ts` or `src/tools/readonly.ts`, so tasks run in order
and few are marked [P].

## Phase 1: Setup

- [X] T001 Run `bun test src/tools/readonly.test.ts` and `bunx tsc --noEmit` from repo root and record the baseline (both must pass on the current uncommitted code before new tests are added)

---

## Phase 2: Foundational

- [X] T002 Add `composeCmd` to the export list at the bottom of `src/tools/readonly.ts` (`export { resolveComposeDir, envNamesOnly, composeCmd };`) so command shape can be unit-tested without SSH (research R4.3)

**Checkpoint**: suite still green.

---

## Phase 3: User Story 1 - Stack variable names without values (P1) 🎯 MVP

**Goal**: `compose_config_vars` returns `{ service: sortedNames[] }` and never returns values, raw output, or partial output.

**Independent Test**: `bun test src/tools/readonly.test.ts -t "compose_config_vars"`. Every case has a seeded `s3cret` value that must never appear in stdout.

- [X] T003 [US1] Add test `compose_config_vars reports truncated output as failure without parsing` in `src/tools/readonly.test.ts`: call `envNamesOnly({ exit_code: 0, stdout: '{"services":{"api":{"environment":{"P":"s3cret"', stderr: "", duration_ms: 1, truncated: true })`, then expect `exit_code` 1, `stdout` `""`, and `stderr` exactly `Rendered config exceeded VPS_LOG_MAX_BYTES; raise it to inspect variables.` Prove it fails by temporarily removing the `if (result.truncated)` branch in `envNamesOnly`, then restore the branch
- [X] T004 [US1] Add test `compose_config_vars clears stdout when render fails` in `src/tools/readonly.test.ts`: input `{ exit_code: 14, stdout: "P=s3cret", stderr: "service api: invalid", duration_ms: 1, truncated: false }`, then expect `exit_code` 14, `stdout` `""`, and `stderr` `service api: invalid`. Prove it fails by temporarily changing the non-zero branch to `return result`, then restore it
- [X] T005 [US1] Add test `compose_config_vars returns empty map when stack has no services` in `src/tools/readonly.test.ts`: input stdout `"{}"` with exit 0, then expect `JSON.parse(stdout)` toEqual `{}` (data-model rule "A stack with no `services` returns `{}`")
- [X] T006 [US1] Split the existing test `compose_config_vars returns variable names and drops values` in `src/tools/readonly.test.ts` into two tests (constitution: no "and" in names). Keep the success case as `compose_config_vars returns sorted variable names per service`, and move the `PASS=s3cret` parse case into `compose_config_vars reports invalid JSON as failure`, which also asserts `stderr` is `Could not parse docker compose config JSON.`

**Checkpoint**: US1 is fully covered for success, render failure, truncation, and parse failure (SC-002).

---

## Phase 4: User Story 2 - Target a non-default stack file (P1)

**Goal**: An optional `file` arg adds `-f '<file>'`. Omitting it, or passing `""`, keeps today's command. Invalid names are rejected before SSH.

**Independent Test**: `bun test src/tools/readonly.test.ts -t "composeCmd|file"`.

- [X] T007 [US2] Add test `composeCmd keeps default discovery without file` in `src/tools/readonly.test.ts`: `composeCmd({ ...config, composeDir: "/opt/stack" }, {})` and `composeCmd(..., { file: "" })` both equal `cd '/opt/stack' && docker compose` (FR-006)
- [X] T008 [US2] Add test `composeCmd adds quoted -f for file` in `src/tools/readonly.test.ts`: `composeCmd({ ...config, composeDir: "/opt/stack" }, { file: "stack.yml" })` equals `cd '/opt/stack' && docker compose -f 'stack.yml'` (FR-005). Check the exact quoting against `shellQuote` in `src/ssh.ts` and adjust the expected string if it differs. Prove the test fails by temporarily dropping the `-f` concatenation
- [X] T009 [US2] Extend the existing test `compose tools reject unsafe file names before SSH` in `src/tools/readonly.test.ts` to also cover `compose_ps` and the names `"a/b.yml"` and `"$(id)"`. Every case must reject with `/Invalid file/` (validator regex `/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/`) (SC-003)

**Checkpoint**: compose_ps can target `stack.yml`, and default behavior is unchanged.

---

## Phase 5: User Story 3 - Host dependencies (P2)

**Goal**: `host_deps` reports docker, compose v2, and jq, and prints `jq: not installed` when jq is missing.

**Independent Test**: `bun test src/tools/readonly.test.ts -t "host_deps"`.

- [X] T010 [US3] Add test `host_deps is a readonly tool with no arguments` in `src/tools/readonly.test.ts`: find `host_deps` in `buildReadonlyTools(config)`, then expect `mutation` to be undefined and `inputSchema.parse({})` not to throw. The jq fallback string (`jq: not installed`) is checked through the contract in T011, because `runSsh` can't be injected (research R4.5). Name the remote command as a module constant `HOST_DEPS_CMD` in `src/tools/readonly.ts` and export it so the test can assert it contains `jq --version 2>&1 || echo 'jq: not installed'`
- [X] T011 [US3] Implement the `HOST_DEPS_CMD` constant and export from T010 in `src/tools/readonly.ts`, using it in the `host_deps` handler with the string unchanged: `docker --version; docker compose version; jq --version 2>&1 || echo 'jq: not installed'`

**Checkpoint**: all three stories are covered.

---

## Phase 6: Polish & Cross-Cutting

- [X] T012 Add test `readonly catalog includes stack diagnostics tools without mutation flag` in `src/tools/readonly.test.ts`: the names from `buildReadonlyTools(config)` include `compose_config_vars` and `host_deps`, and no read-only tool has `mutation: true` (FR-008, SC-004)
- [X] T013 [P] Check that the `README.md` tool table rows for `compose_ps`, `compose_config_vars`, and `host_deps` match `contracts/tools.md` (FR-009). Edit only if they differ
- [X] T014 Run `bun test` and `bunx tsc --noEmit` from repo root and paste the pass/fail output as evidence (constitution VII). If a gate is unavailable, report it as blocked
- [ ] T015 Optional, needs the operator: run the live steps in `specs/003-readonly-stack-diagnostics/quickstart.md` against the VPS (read-only tools only)

---

## Dependencies & Execution Order

- T001 → T002 → US1 (T003–T006) → US2 (T007–T009) → US3 (T010–T011) → T012 → T014.
- US1 and US2 could be done in either order (both P1). They share one test file, so run them one after the other.
- US3 depends on nothing except T001.
- T013 is parallel with everything because it only touches README.md.

## Parallel Opportunities

- T013 (README) alongside any test task.
- None inside a story, since all of a story's tasks edit `src/tools/readonly.test.ts`.

## Implementation Strategy

1. MVP: T001–T006. This proves values can't leak (US1), the highest-risk path.
2. Then US2, so `stack.yml` is reachable. This was the failure the operator hit.
3. Then US3 and the polish tasks. Stop after T014 is green (constitution VI).
