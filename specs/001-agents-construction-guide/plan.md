# Implementation Plan: Construction Agents Guide

**Branch**: `001-agents-construction-guide` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-agents-construction-guide/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Ship a single root `AGENTS.md` that tells agents how to build and change vps-ops-mcp. The file routes to `mcp-builder`, `devops-engineer`, `opensource-pipeline`, and the constitution's process skills; restates mutation safety, test-first proof, delivery approval, and the public-release sanitizer gate; and points at `README.md` for human setup. No new operator tools, no live publish. A focused `bun test` asserts the contract headings and tokens.

## Technical Context

**Language/Version**: Markdown (guide) and TypeScript under Bun (contract test only)

**Primary Dependencies**: Existing project skills in `.agents/skills/`; constitution at `.specify/memory/constitution.md`; Bun test runner already in repo

**Storage**: N/A (static files)

**Testing**: `bun test` on `src/agents-md.test.ts` reading `AGENTS.md` against [contracts/agents-md.md](./contracts/agents-md.md); reviewer tabletops in [quickstart.md](./quickstart.md)

**Target Platform**: Repository root consumed by Cursor / Codex / other agent loaders

**Project Type**: Agent construction contract (documentation + one contract test)

**Performance Goals**: Reviewer locates skills, mutation rules, and definition of done in under five minutes (SC-001)

**Constraints**: Constitution I–VII; English-only guide; zero live secrets; no Bun/Node stack change; `VERSION` unchanged unless a human asks; no production host as test bed

**Scale/Scope**: One `AGENTS.md`, one contract test, existing spec artifacts; approximately 20 functional requirements restated as headings and tokens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Phase 0 | Phase 1 (post-design) |
|-----------|---------|------------------------|
| I. Clean Code | Pass — no new application layers | Pass — guide is sectioned by concern; test only asserts the file |
| II. Skill-First | Pass — plan mandates the three named skills plus Spec Kit / TDD / verify | Pass — [research.md](./research.md) skill map and contract tokens require those names and paths |
| III. Test-First | Pass — contract test is the behavior; write it red before the guide if implementing | Pass — [quickstart.md](./quickstart.md) names `src/agents-md.test.ts` as the failing-then-passing proof |
| IV. Integration Testing | Pass — no operator-seam change | Pass — out of scope; guide forbids live-host CI |
| V. Safe Remote Operations | Pass — guide restates confirm, allow-switch, bounds, secrets | Pass — contract tokens include `confirm:true`, `VPS_ALLOW_MUTATIONS`, timeout, byte cap, no-secrets |
| VI. Lean Scope | Pass — one file + one test | Pass — no CI/K8s/Docker/public-repo work; skills referenced not copied |
| VII. Verification Before Completion | Pass — quickstart tabletops + `bun test` | Pass — completion requires those commands, not memory |

No unjustified violations. Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-agents-construction-guide/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── agents-md.md
└── spec.md
```

### Source Code (repository root)

```text
AGENTS.md                      # construction contract (created at implement)
src/
├── agents-md.test.ts          # contract test (created at implement)
├── index.ts                   # unchanged
├── config.ts
├── ssh.ts
├── validate.ts
└── tools/
    ├── readonly.ts
    └── mutations.ts
README.md                      # human setup; guide links here
.specify/memory/constitution.md
.agents/skills/
├── mcp-builder/SKILL.md
├── devops-engineer/SKILL.md
└── opensource-pipeline/SKILL.md
```

**Structure Decision**: Keep the existing single TypeScript package. This feature adds only the root guide and a sibling contract test under `src/`. Do not add `docs/`, CI workflows, or new tool modules.

## Phase 0

Completed: [research.md](./research.md). No remaining NEEDS CLARIFICATION.

## Phase 1

Completed:

- [data-model.md](./data-model.md)
- [contracts/agents-md.md](./contracts/agents-md.md)
- [quickstart.md](./quickstart.md)

Implementation (not this command) MUST:

1. Add `src/agents-md.test.ts` that fails because `AGENTS.md` is missing or incomplete.
2. Write `AGENTS.md` to satisfy the contract headings and tokens.
3. Re-run `bun test src/agents-md.test.ts` and the quickstart tabletops.
4. Stop. Do not bump `VERSION`. Do not run the open-source pipeline.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
