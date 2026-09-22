---
description: "Task list for Construction Agents Guide"
---

# Tasks: Construction Agents Guide

**Input**: Design documents from `/specs/001-agents-construction-guide/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agents-md.md, quickstart.md

**Tests**: Included. Plan and constitution require test-first proof via `src/agents-md.test.ts` against `contracts/agents-md.md`.

**Organization**: Tasks are grouped by user story. `AGENTS.md` is shared; stories fill different sections. Do not mark two incomplete tasks `[P]` if both write the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

- Guide: `AGENTS.md` at repository root
- Contract test: `src/agents-md.test.ts`
- Contract: `specs/001-agents-construction-guide/contracts/agents-md.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing package is the only target. Do not add apps, CI, or dependencies.

- [x] T001 Verify skill and constitution files exist at `.agents/skills/mcp-builder/SKILL.md`, `.agents/skills/devops-engineer/SKILL.md`, `.agents/skills/opensource-pipeline/SKILL.md`, and `.specify/memory/constitution.md`
- [x] T002 Confirm Bun test runner is already declared in `package.json` and do not add packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Red contract for file existence and required headings. Blocks all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Write failing existence and heading assertions in `src/agents-md.test.ts` for the twelve exact headings listed in `specs/001-agents-construction-guide/contracts/agents-md.md`
- [x] T004 Run `bun test src/agents-md.test.ts` and confirm RED because `AGENTS.md` is missing

**Checkpoint**: Foundation ready — heading contract fails for the right reason

---

## Phase 3: User Story 1 - Agent finds a single construction contract (Priority: P1) 🎯 MVP

**Goal**: Root `AGENTS.md` states purpose, authority, skill routing, product shape, construction sequence, and a pointer to human setup.

**Independent Test**: A reviewer who opens only `AGENTS.md` can list mandatory skills (with paths), that the constitution wins, that the product is client-launched, and that work stops after proof.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [US1] Extend token assertions in `src/agents-md.test.ts` for `constitution wins`, `mcp-builder`, `.agents/skills/mcp-builder/SKILL.md`, `devops-engineer`, `.agents/skills/devops-engineer/SKILL.md`, `opensource-pipeline`, `.agents/skills/opensource-pipeline/SKILL.md`, `speckit-`, `test-driven-development`, `verification-before-completion`, `client-launched`, and `README.md`
- [x] T006 [US1] Run `bun test src/agents-md.test.ts` and confirm the new US1 token assertions FAIL

### Implementation for User Story 1

- [x] T007 [US1] Create `AGENTS.md` with the twelve required headings in contract order from `specs/001-agents-construction-guide/contracts/agents-md.md`
- [x] T008 [US1] Fill Purpose, Authority, Skill routing, Product shape, Construction sequence, and Human setup in `AGENTS.md` so each Skill Route has name, relative path, and trigger; Construction Guide `constitution_relation` states constitution wins; path is repository-root `AGENTS.md`; language is English
- [x] T009 [US1] Run `bun test src/agents-md.test.ts` until heading checks and US1 tokens pass

**Checkpoint**: User Story 1 is independently reviewable (tabletop A in `specs/001-agents-construction-guide/quickstart.md`)

---

## Phase 4: User Story 2 - Agent builds operator tools the way MCP quality work demands (Priority: P1)

**Goal**: Operator capability and proof rules are in the guide so a reviewer can reject an unsafe tool.

**Independent Test**: Using only `AGENTS.md`, reject a tool named `restart` with no confirmation for missing `vps_` prefix, matching `destructiveHint`, `confirm:true`, and English next-step errors.

### Tests for User Story 2 ⚠️

- [x] T010 [US2] Extend token assertions in `src/agents-md.test.ts` for `vps_`, `confirm:true`, `VPS_ALLOW_MUTATIONS`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`, `next corrective`, `bun test`, `timeout`, `byte cap`, and Proof-section language that automated proof MUST NOT use a live host
- [x] T011 [US2] Run `bun test src/agents-md.test.ts` and confirm the new US2 assertions FAIL

### Implementation for User Story 2

- [x] T012 [US2] Fill Operator capabilities and Proof in `AGENTS.md` with Operator Capability Rule constraints from `specs/001-agents-construction-guide/data-model.md`: name_shape `vps_` + action + resource; catalog `readonly` or `mutation`; mutations require `confirm:true` and honor the mutation-off switch; annotations MUST match behavior; errors English with next corrective step; timeout and result-size limit with overflow visible; test-first unit proof plus integration proof when the operator seam changes; keep a small read-only evaluation set
- [x] T013 [US2] Run `bun test src/agents-md.test.ts` until US2 tokens pass

**Checkpoint**: User Story 2 independently satisfies tabletop B in `specs/001-agents-construction-guide/quickstart.md`

---

## Phase 5: User Story 3 - Agent changes delivery and operations without unsafe rollout (Priority: P2)

**Goal**: Delivery section encodes assess → verify, explicit production approval, rollback-before-approval, and no undocumented live-host edits.

**Independent Test**: A reviewer walking a fictional pipeline change from only `AGENTS.md` produces a validation list, an approval gate, and a rollback description before any production action.

### Tests for User Story 3 ⚠️

- [x] T014 [US3] Extend token assertions in `src/agents-md.test.ts` for `explicit human approval`, `rollback`, and a MUST NOT undocumented-host rule
- [x] T015 [US3] Run `bun test src/agents-md.test.ts` and confirm the new US3 assertions FAIL

### Implementation for User Story 3

- [x] T016 [US3] Fill Delivery and operations in `AGENTS.md` with Delivery Change Rule phases assess, design, implement, validate, plan_rollout, approve, verify; `production_or_public` requires explicit human approval; rollback is written before approval; host_edits are forbidden as a substitute for versioned project files; secrets MUST NOT be committed, logged, or copied into client registration by default
- [x] T017 [US3] Run `bun test src/agents-md.test.ts` until US3 tokens pass

**Checkpoint**: User Story 3 independently covers the delivery half of tabletop C

---

## Phase 6: User Story 4 - Maintainer can prepare a public copy without leaking the private host (Priority: P2)

**Goal**: Public release path and anti-patterns block publish on sanitizer FAIL and on missing human approval.

**Independent Test**: Tabletop of the published pipeline from only `AGENTS.md` shows staging (not the private tree), FAIL blocks publish, and `.env` / keys / live host defaults stay out of the public story.

### Tests for User Story 4 ⚠️

- [x] T018 [US4] Extend token and forbidden-content assertions in `src/agents-md.test.ts` for `sanitizer`, `staging`, `MUST NOT commit secrets`, and absence of live IP / private-key-path / passphrase values per `specs/001-agents-construction-guide/contracts/agents-md.md`
- [x] T019 [US4] Run `bun test src/agents-md.test.ts` and confirm the new US4 assertions FAIL

### Implementation for User Story 4

- [x] T020 [US4] Fill Public release in `AGENTS.md` with Public Release Candidate states private_tree → staged_fork → stripped → sanitized → (FAIL) blocked or (PASS / PASS_WITH_WARNINGS) packaged → wait_for_publish_approval → published; license is human-chosen before packaging completes; example env lists names only
- [x] T021 [US4] Fill Anti-patterns in `AGENTS.md` forbidding skip sanitizer, push without approval, live-host-only tests, tools without annotations, unverified done claims, and extra surface acceptance did not require
- [x] T022 [US4] Run `bun test src/agents-md.test.ts` until the full contract in `specs/001-agents-construction-guide/contracts/agents-md.md` passes

**Checkpoint**: User Story 4 independently satisfies the publish-stop half of tabletop C

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story verification. Do not add docs/, CI, tools, or a VERSION bump.

- [x] T023 Scan `AGENTS.md` for live host addresses, key paths, passphrases, and `.env` values and remove any match
- [x] T024 Walk tabletops A–C in `specs/001-agents-construction-guide/quickstart.md` using only `AGENTS.md`
- [x] T025 Confirm `AGENTS.md` points to `README.md` for registration and does not copy the full operator manual
- [x] T026 Run `bun test` from the repository root, report evidence, and stop without running the open-source pipeline and without changing `VERSION`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–6)**: Depend on Foundational; sequential on `AGENTS.md` and `src/agents-md.test.ts`
- **Polish (Phase 7)**: Depends on US1–US4 complete

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2. Creates `AGENTS.md` skeleton. MVP.
- **User Story 2 (P1)**: After US1 heading skeleton exists (same files). Independently testable via tabletop B.
- **User Story 3 (P2)**: After US1 skeleton. Independently testable via delivery tabletop.
- **User Story 4 (P2)**: After US1 skeleton. Independently testable via publish tabletop.
- Because both implementation files are shared, execute US2 → US3 → US4 sequentially after US1. Do not parallelize story implementation.

### Within Each User Story

- Tests MUST be written and FAIL before filling that story's sections in `AGENTS.md`
- Headings (T007) before section prose (T008)
- Story `bun test` green for that story's tokens before the next story

### Parallel Opportunities

- T001 and T002 are sequential reads of different files; T002 may start after T001 or in the same pass
- No `[P]` on story implementation: `AGENTS.md` and `src/agents-md.test.ts` are shared
- Reviewer tabletops A–C can be prepared in parallel after the matching story is green, but T024 waits until all stories are filled

---

## Parallel Example: User Story 1

```text
# Not parallel — same test file then same guide file:
Task: T005 extend tokens in src/agents-md.test.ts
Task: T006 confirm RED
Task: T007 create headings in AGENTS.md
Task: T008 fill US1 sections in AGENTS.md
Task: T009 confirm US1 tokens pass
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (RED headings)
3. Phase 3 User Story 1
4. **STOP and VALIDATE**: tabletop A
5. Demo the root contract

### Incremental Delivery

1. Setup + Foundational → RED contract
2. US1 → purpose and skill routing (MVP)
3. US2 → operator and proof rules
4. US3 → delivery gates
5. US4 → public release and anti-patterns
6. Polish → full `bun test` + tabletops A–C

### Parallel Team Strategy

One writer on the two shared files. A second person can only review tabletops after a story checkpoint, not edit `AGENTS.md` in parallel.

---

## Notes

- Tests are required for this feature (constitution III, plan Phase 1)
- Do not bump `VERSION`
- Do not run `opensource-pipeline`
- Do not add operator tools
- Commit only if the human asks
