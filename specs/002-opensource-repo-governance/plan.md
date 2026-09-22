# Implementation Plan: Open-Source Repository Governance

**Branch**: `002-opensource-repo-governance` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-opensource-repo-governance/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Make `koller-nexus/vps-ops-mcp` a usable public project: MIT license, `CONTRIBUTING.md`, `ISSUE.md`, a short repository description, sanitizer cleanup of live host facts, and host rules that (1) block direct work on `main` including admins, (2) require the existing “Test and build” check before merge, and (3) allow new branches only under `feature/`, `fix/`, and `refactor/`. Proof is a `bun test` contract on the documents plus a GitHub-tool revalidation in [quickstart.md](./quickstart.md). No new operator tools. `VERSION` unchanged unless a human asks.

## Technical Context

**Language/Version**: Markdown (guides, MIT license text) and TypeScript under Bun (document contract tests only)

**Primary Dependencies**: Existing `.github/workflows/pull_request.yml` (job display name `Test and build`); GitHub repository rulesets REST API; constitution; `opensource-pipeline` sanitizer rules; GitHub MCP / `gh` for host verification

**Storage**: GitHub repository settings (rulesets, description, license detection) plus root files. No application database.

**Testing**: `bun test` on a new contract test that reads `CONTRIBUTING.md`, `ISSUE.md`, and `LICENSE`. Host rules are **not** unit-tested against the live API (constitution: automated proof MUST NOT use a production network session). Operator verification is [quickstart.md](./quickstart.md) via GitHub tools.

**Target Platform**: Public GitHub repository `koller-nexus/vps-ops-mcp` plus the git working tree

**Project Type**: Repository governance (documents + host policy + sanitizer pass)

**Performance Goals**: Newcomer finds prefixes and the default-branch rule in under five minutes (SC-001)

**Constraints**: Constitution I–VII; English documents and commits; MIT only; prefixes `feature/` `fix/` `refactor/` only; no extra CI workflow; no live VPS as a test bed; sanitizer FAIL is an incident; do not weaken mutation safety

**Scale/Scope**: Three root documents, one license file, example-env and README placeholder cleanup, two repository rulesets (or equivalent host rules), repository description, one contract test file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Phase 0 | Phase 1 (post-design) |
|-----------|---------|------------------------|
| I. Clean Code | Pass — no new operator layers | Pass — files have one job each (guide, issue form, license, host policy, contract test) |
| II. Skill-First | Pass — `devops-engineer` for CI/host rules; `opensource-pipeline` for sanitizer; Spec Kit for this plan; TDD + verify on implement | Pass — [research.md](./research.md) names those skills; contracts do not skip sanitizer |
| III. Test-First | Pass — document contract test is the local behavior | Pass — [quickstart.md](./quickstart.md) writes the test red before documents if implementing |
| IV. Integration Testing | Pass — no SSH/tool-catalog change | Pass — host checks stay operator-session, not CI against live GitHub as a unit suite |
| V. Safe Remote Operations | Pass — sanitizer on already-public tree | Pass — [data-model.md](./data-model.md) forbids live host values in example env and README defaults |
| VI. Lean Scope | Pass — reuse existing PR workflow; no issue-template pack; no second CI | Pass — two rulesets + three docs + MIT + placeholders + one test |
| VII. Verification Before Completion | Pass — `bun test` + GitHub revalidation | Pass — completion blocked without fresh evidence from those commands |

No unjustified violations. Complexity Tracking left empty.

Note: constitution lists `agent/` as a delivery prefix. The accepted spec **overrides the public host** to three prefixes only. Agents map “agent work” onto `feature/`, `fix/`, or `refactor/`. That is an explicit product decision, not a silent constitution edit.

## Project Structure

### Documentation (this feature)

```text
specs/002-opensource-repo-governance/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── contributing.md
│   ├── issue-md.md
│   ├── license-mit.md
│   └── github-host.md
└── spec.md
```

### Source Code (repository root)

```text
CONTRIBUTING.md                 # created at implement
ISSUE.md                        # created at implement
LICENSE                         # MIT text, created at implement
.env.example                    # strip live host default
README.md                       # placeholder defaults; link to CONTRIBUTING.md
.github/workflows/pull_request.yml   # keep; require job name "Test and build"
src/
└── opensource-governance.test.ts    # contract test (created at implement)
# unchanged operator code
src/index.ts
src/config.ts
src/ssh.ts
src/validate.ts
src/tools/
```

**Structure Decision**: Single repository. Governance lives at the root and in GitHub repository settings. Do not add `src/` modules for host policy. Do not add a second workflow.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
