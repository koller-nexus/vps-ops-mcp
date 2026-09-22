---
description: "Task list for Open-Source Repository Governance"
---

# Tasks: Open-Source Repository Governance

**Input**: Design documents from `/specs/002-opensource-repo-governance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. Constitution III and the plan require a failing-then-passing contract test in `src/opensource-governance.test.ts`. Host rulesets are proven in an operator session (`gh` / GitHub MCP), not in `bun test`.

**Organization**: Tasks are grouped by user story. Do not mark two incomplete tasks `[P]` if both write the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

- Guides: `CONTRIBUTING.md`, `ISSUE.md`, `LICENSE` at repository root
- Contract test: `src/opensource-governance.test.ts`
- Workflow: `.github/workflows/pull_request.yml`
- Host contract: `specs/002-opensource-repo-governance/contracts/github-host.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing repo is the only target. Do not add apps, packages, or a second workflow.

- [x] T001 Verify design files exist at `specs/002-opensource-repo-governance/plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and `contracts/{contributing,issue-md,license-mit,github-host}.md`
- [x] T002 Confirm Bun scripts `test` and `build` remain in `package.json` and that `.github/workflows/pull_request.yml` already has job display name `Test and build`; do not add packages or a second workflow
- [x] T003 Re-check with GitHub tools that `koller-nexus/vps-ops-mcp` is public and forking is on (FR-011 baseline); record visibility in the implement notes, do not claim rulesets yet

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Red contract for missing public-surface files and the in-tree workflow job. Blocks all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Write failing existence assertions in `src/opensource-governance.test.ts` that `CONTRIBUTING.md`, `ISSUE.md`, and `LICENSE` exist at the repository root
- [x] T005 Extend `src/opensource-governance.test.ts` to assert `.github/workflows/pull_request.yml` triggers on `pull_request`, job name is `Test and build`, and the file contains `bun test` then `bun run build` (tokens from `specs/002-opensource-repo-governance/contracts/github-host.md`)
- [x] T006 Run `bun test src/opensource-governance.test.ts` and confirm RED because the three root files are missing (workflow assertions may already pass)

**Checkpoint**: Foundation ready — document existence fails for the right reason

---

## Phase 3: User Story 1 - Maintainer prepares a public-ready contribution contract (Priority: P1) 🎯 MVP

**Goal**: Root `CONTRIBUTING.md`, `ISSUE.md`, and MIT `LICENSE` exist. A newcomer can file an issue and open a correctly named change request from the guides alone.

**Independent Test**: Open only `CONTRIBUTING.md` and `ISSUE.md`. State prefixes `feature/`, `fix/`, `refactor/`, PR-only delivery to `main`, and the `ISSUE.md` required sections, in under five minutes (quickstart tabletop A).

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [US1] Extend token and heading assertions in `src/opensource-governance.test.ts` for the exact headings and tokens in `specs/002-opensource-repo-governance/contracts/contributing.md` (`# Contributing`, `## Branch names`, `## Pull requests`, `## Verification`, `## Issues`, plus `feature/`, `fix/`, `refactor/`, `main`, `pull request`, `ISSUE.md`, `bun test`, `bun run build`, `Conventional Commits`)
- [x] T008 [US1] Extend token and heading assertions in `src/opensource-governance.test.ts` for `specs/002-opensource-repo-governance/contracts/issue-md.md` (`# Filing an issue`, `## Summary`, `## Type`, `## Expected versus actual`, `## Reproduction or acceptance`, `## Environment`, plus `bug`, `feature`, `CONTRIBUTING.md`)
- [x] T009 [US1] Extend token assertions in `src/opensource-governance.test.ts` for `specs/002-opensource-repo-governance/contracts/license-mit.md` (`MIT License`, `Permission is hereby granted, free of charge`, `2026`, `THE SOFTWARE IS PROVIDED "AS IS"`)
- [x] T010 [US1] Run `bun test src/opensource-governance.test.ts` and confirm the new US1 heading/token assertions FAIL

### Implementation for User Story 1

- [x] T011 [P] [US1] Create English `CONTRIBUTING.md` at repository root: allowed prefixes only `feature/`, `fix/`, `refactor/`; change requests only to `main`; Conventional Commits; verification `bun test` and `bun run build`; pointer to `ISSUE.md`; forbid direct push to `main` and forbid `agent/` as an allowed prefix; path and language per Contributor Guide in `specs/002-opensource-repo-governance/data-model.md`
- [x] T012 [P] [US1] Create English `ISSUE.md` at repository root with required sections summary, type, expected versus actual or desired outcome, reproduction or acceptance notes, environment (Issue Guide field `required_sections` in `specs/002-opensource-repo-governance/data-model.md`); do not ask for secrets
- [x] T013 [P] [US1] Create root `LICENSE` with standard MIT text, year `2026`, copyright `koller-nexus` / William Koller (License Grant `spdx` MUST be `MIT`)
- [x] T014 [US1] Add links from `README.md` to `CONTRIBUTING.md` and `ISSUE.md` without adding live host values
- [x] T015 [US1] Run `bun test src/opensource-governance.test.ts` until US1 heading and token assertions pass

**Checkpoint**: User Story 1 is independently reviewable (tabletop A)

---

## Phase 4: User Story 4 - Open-source visibility without leaking private host facts (Priority: P1)

**Goal**: Public surface has a description, forking stays on, example env lists names and purpose only, and the known live host IP is gone. Sanitizer fail is an incident.

**Independent Test**: Search `.env.example` and `README.md` for `64.181.163.182` (must be absent). Example env shows names and purpose only. GitHub description is a non-empty English sentence. Visitor can fork.

### Tests for User Story 4 ⚠️

- [x] T016 [US4] Extend `src/opensource-governance.test.ts` so `.env.example` and `README.md` MUST NOT contain `64.181.163.182` (Public Surface Fact `forbidden` in `specs/002-opensource-repo-governance/data-model.md`)
- [x] T017 [US4] Run `bun test src/opensource-governance.test.ts` and confirm the new IP assertions FAIL while the IP remains

### Implementation for User Story 4

- [x] T018 [US4] Replace the live host default in `.env.example` with a placeholder (name + purpose only; no live IP, key material, or passphrase)
- [x] T019 [US4] Replace the `VPS_HOST` default `64.181.163.182` in `README.md` with the same placeholder language
- [x] T020 [US4] Set the GitHub repository description on `koller-nexus/vps-ops-mcp` to a short English sentence (FR-010); confirm `allow_forking` is true (FR-009)
- [x] T021 [US4] Run a sanitizer pass on the intended public surface (root docs, `.env.example`, `README.md`) per `opensource-pipeline`; if FAIL, treat as incident, fix, and re-run; do not rewrite git history unless a human asks after a real secret
- [x] T022 [US4] Run `bun test src/opensource-governance.test.ts` until the IP assertions pass

**Checkpoint**: Public surface is clean enough to claim SC-006 for committed example/help files

---

## Phase 5: User Story 2 - Default branch rejects direct work (Priority: P1)

**Goal**: Host forbids direct commits/pushes to `main` including admins; merge requires a passing `Test and build` check; branch lock must not block legitimate merges.

**Independent Test**: Direct push to `main` is rejected. A change request cannot merge while `Test and build` fails. Admins cannot skip the ruleset. Quickstart host proof matches `contracts/github-host.md` ruleset `default-branch`.

### Tests for User Story 2 ⚠️

- [x] T023 [US2] Keep workflow assertions in `src/opensource-governance.test.ts` (from T005) green; do not add a live GitHub API call to the unit suite
- [x] T024 [US2] Operator-only: after T025, run the `gh api` commands in `specs/002-opensource-repo-governance/contracts/github-host.md` and fail the task if `default-branch` is missing, inactive, lacks required check `Test and build`, has lock on, or has bypass actors

### Implementation for User Story 2

- [x] T025 [US2] Create or replace the active repository ruleset `default-branch` on `koller-nexus/vps-ops-mcp` targeting `~DEFAULT_BRANCH`: require pull request, require status check `Test and build`, linear history, no force-push, no deletion, lock branch off, empty bypass actors (admins included) per `specs/002-opensource-repo-governance/research.md` and `contracts/github-host.md`
- [x] T026 [US2] Disable or align classic `main` protection so it does not keep `lock_branch: true` or `enforce_admins: false` as the source of truth (current dirty host state)
- [x] T027 [US2] Re-run T024 host proof and record the ruleset payload; do not claim FR-004/FR-006 host side without this evidence

**Checkpoint**: Default-branch gate is enforced on the host

---

## Phase 6: User Story 3 - New work uses only allowed branch families (Priority: P2)

**Goal**: New branches must be `feature/*`, `fix/*`, or `refactor/*`. `agent/` and unmarked names are rejected. Existing `feature/add-speckit` stays valid. One path segment after the prefix.

**Independent Test**: Create `fix/timeout-message` (accepted) and `agent/add-tool` (rejected). Contributor guide already lists only three families (US1).

### Implementation for User Story 3

- [x] T028 [US3] Create active ruleset `contribution-branch-names` on `koller-nexus/vps-ops-mcp`: include `~ALL`; exclude `~DEFAULT_BRANCH`, `refs/heads/feature/*`, `refs/heads/fix/*`, `refs/heads/refactor/*`; rule `creation`; empty bypass actors (Contribution Branch Policy `allowed_prefixes` / `denied_examples` / `segment` in `specs/002-opensource-repo-governance/data-model.md`)
- [x] T029 [US3] Operator-verify with GitHub tools that the ruleset matches `specs/002-opensource-repo-governance/contracts/github-host.md`; confirm `feature/add-speckit` still exists
- [x] T030 [US3] Confirm `CONTRIBUTING.md` still forbids `agent/` and lists only the three prefixes (no second edit unless T011 drifted)

**Checkpoint**: Prefix policy is enforced on the host

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full quickstart and no extra surface

- [x] T031 Run tabletop A and B in `specs/002-opensource-repo-governance/quickstart.md`
- [x] T032 Re-run `bun test src/opensource-governance.test.ts` and the two `gh api` commands in `contracts/github-host.md`; claim FR-003–FR-011 only with this session’s evidence
- [x] T033 Confirm `VERSION` was not changed unless a human asked; confirm no new operator tools, env vars, or workflows were added

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: After Foundational — MVP documents
- **US4 (Phase 4)**: After Foundational; can start after US1 if you want README links first, but sanitizer can run once files exist
- **US2 (Phase 5)**: After Foundational; host work independent of docs except CONTRIBUTING already forbids direct `main`
- **US3 (Phase 6)**: After Foundational; best after US1 so the guide matches the ruleset
- **Polish**: After the stories you intend to ship

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US4 (P1)**: Independent of US2/US3; shares `README.md` with US1 (do US1 T014 before US4 T019 if both edit README, or combine in one pass)
- **US2 (P1)**: Independent of US3; both touch GitHub settings — do not apply two rulesets in true parallel on the same API without sequencing
- **US3 (P2)**: Independent of US2 once `main` is excluded from the name ruleset

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Documents before host claims
- Story complete before the next priority unless staffed in parallel on different files

### Parallel Opportunities

- T011, T012, T013 write different root files and can run in parallel
- US2 and US3 host rulesets are different objects but share the GitHub admin session — sequence them
- Unit tests never call the live GitHub API

---

## Parallel Example: User Story 1

```text
Task: "Create CONTRIBUTING.md at repository root"
Task: "Create ISSUE.md at repository root"
Task: "Create LICENSE MIT at repository root"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (RED test)
3. Phase 3 US1 (guides + MIT)
4. STOP and run tabletop A

### Incremental Delivery

1. Setup + Foundational
2. US1 → documents MVP
3. US4 → public surface clean + description
4. US2 → `main` gate
5. US3 → prefix rules
6. Polish → quickstart + FR-011 revalidation

### Parallel Team Strategy

- A: US1 documents
- B: US4 sanitizer + description (after coordinating `README.md`)
- C: US2 then US3 host rulesets

---

## Notes

- [P] only when files differ and there is no unfinished dependency
- Do not put live GitHub mutations inside `bun test`
- Sanitizer FAIL blocks any “public surface is safe” claim
- Agents use `feature/`, `fix/`, or `refactor/` — never `agent/` on this host
