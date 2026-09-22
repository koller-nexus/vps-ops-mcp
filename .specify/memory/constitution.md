<!--
Sync Impact Report
- Version change: (unratified template) → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → I. Clean Code
  - [PRINCIPLE_2_NAME] → II. Skill-First Practice
  - [PRINCIPLE_3_NAME] → III. Test-First Unit Tests (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Integration Testing
  - [PRINCIPLE_5_NAME] → V. Safe Remote Operations
- Added sections:
  - VI. Lean Scope and Simplicity (Core Principles)
  - VII. Verification Before Completion (Core Principles)
  - Safety and Stack Constraints
  - Development Workflow
- Removed sections: none (placeholders replaced)
- Follow-up TODOs: none
-->

# VPS Ops MCP Constitution

## Core Principles

### I. Clean Code

Production TypeScript MUST stay small, named for intent, and owned by one layer.
A function MUST do one job. A module MUST own one concern (config, SSH, validation,
read-only tools, or mutations). Public functions MUST talk to interfaces or narrow
injected ports, not hidden globals. Errors MUST be checked and wrapped with context
in English. Shared state MUST be avoided; construct dependencies explicitly.
Names MUST describe behavior, not implementation trivia. Duplication that hides
ownership MUST be removed; speculative abstraction MUST NOT be added.

Rationale: the server is an SSH operator in the agent path. Unclear code becomes
an unsafe remote command.

### II. Skill-First Practice

Before implementing, debugging, specifying, or completing work, agents and
contributors MUST load and follow the applicable project or agent skills.
Spec Kit work MUST use the matching `.cursor/skills/speckit-*` skill.
Feature or integration work with overbuilding risk MUST follow lean-build.
Bug or narrow behavior fixes MUST follow surgical-patch.
Any feature or bugfix MUST follow test-driven-development before production code.
Claims of done, passing, or fixed MUST follow verification-before-completion
and verify-and-stop. MCP surface changes MUST consult `.agents/skills/mcp-builder`.
If a skill applies, following it is mandatory. Skipping a relevant skill is a
governance violation, not an optimization.

Rationale: skills encode the project's tested workflow. Ad-hoc process produces
drift, overbuild, and unverified claims.

### III. Test-First Unit Tests (NON-NEGOTIABLE)

No production behavior MAY land without a unit test that failed first for the
right reason. The cycle MUST be Red (write one behavior test) → verify the
failure → Green (minimal code) → verify the suite → Refactor without new
behavior. Tests MUST assert observable behavior, not mock choreography.
Mocks MAY be used only when the real dependency is unavailable or unsafe
(network, live SSH, filesystem secrets). A test name MUST describe the
behavior; a name containing "and" MUST be split. Bug fixes MUST start with a
failing reproduction test. Exceptions (throwaway prototypes, generated files,
pure config) require an explicit human waiver.

Rationale: tests written after the code prove memory, not the contract. This
server's contracts are command construction, validation, and mutation gates.

### IV. Integration Testing

Integration tests MUST cover seams that unit tests cannot prove alone:

- SSH client construction, timeouts, truncation, and exit-code mapping
- Read-only tool catalog versus mutation tool catalog
- `VPS_ALLOW_MUTATIONS` and explicit confirmation gates
- Config load and refusal when the SSH key is missing or unreadable
- Compose path validation and required-argument rules
- MCP tool registration, input schemas, and annotations
  (`readOnlyHint`, `destructiveHint`, `idempotentHint`)

Integration tests MUST use fixtures, fakes, or recorded command results.
They MUST NOT target a production VPS and MUST NOT require a live host to
pass in CI. A change that alters a tool contract, env schema, or remote
command shape MUST add or update an integration test in the same change.

Rationale: unit tests protect functions; integration tests protect the
operator boundary the agent actually calls.

### V. Safe Remote Operations

Every remote action MUST be least-privilege, bounded, and explicit. Read-only
tools MUST NOT mutate host or Docker state. Mutation tools MUST require
explicit confirmation and MUST honor `VPS_ALLOW_MUTATIONS=false` as a hard
off switch. Commands MUST run with a timeout and a stdout/stderr byte cap.
Secrets (private keys, passphrases) MUST stay in environment or agent
storage; they MUST NOT be logged, copied into client config by default, or
committed. Destructive Docker or disk operations MUST name the exact target
and MUST NOT accept unvalidated path or command interpolation.

Rationale: a coding agent invoking this server can damage a live VPS. Safety
is a product invariant, not a later hardening pass.

### VI. Lean Scope and Simplicity

Work MUST deliver the narrowest end-to-end path that satisfies acceptance.
New tools, env vars, transports, providers, or config flags MUST NOT ship
unless the accepted spec requires them. YAGNI applies: unused generality is
a defect. When a local patch would duplicate behavior or hide the owning
layer, the change MUST move to that layer instead of growing a shortcut.
After acceptance proof passes, work MUST stop. Polish, extra modes, and
drive-by refactors are out of scope unless they are required to keep tests
green or restore an invariant.

Rationale: extra surface on an ops MCP is extra blast radius.

### VII. Verification Before Completion

No one MAY claim complete, fixed, or passing without fresh command evidence
from this session. The default proof set is `bun test` for the touched
packages plus the nearest lint or typecheck already used by the repo. Partial
logs, prior runs, and "should pass" are not evidence. If a gate is
unavailable, the report MUST say blocked, not success.

Rationale: unverified agent claims are how broken mutation paths reach a VPS.

## Safety and Stack Constraints

- Runtime and package manager MUST be Bun. Node, npm, pnpm, yarn, vite,
  express, and parallel HTTP servers MUST NOT be introduced for this process.
- Transport MUST remain MCP stdio. The server MUST be client-launched, not
  left as a long-lived manual daemon.
- Application code MUST live in TypeScript under `src/`, with tests beside
  the unit (`*.test.ts`) or under an explicit integration suite.
- API, validation, and log error text MUST be English.
- Git commits MUST be English Conventional Commits. Feature work MUST land
  on `feature/*`, `fix/*`, or `agent/*` and merge by pull request. Direct
  commits to `develop` are forbidden. `main` follows the same PR rule when
  it is the default integration branch.
- `VERSION` MUST change only when a human explicitly requests that version
  change. Feature work MUST NOT infer permission to bump it.

## Development Workflow

1. Read the applicable skills, then this constitution. Skills set the
   method; this document sets the non-negotiable rules.
2. Specify or plan before building when the change is a new tool, a
   contract change, or a safety-affecting mutation.
3. Write the failing unit test (and integration test when a seam is
   involved). Run it. Confirm the failure reason.
4. Implement the minimum production change. Keep mutations behind
   confirmation and the allow-flag.
5. Refactor only while green. Do not expand scope.
6. Run verification. Report evidence. Stop.

Reviews MUST reject: production code without a prior failing test, mutation
tools without confirmation and allow-flag coverage, live-VPS-only tests,
skill-skipping process, and unexplained new surface.

## Governance

This constitution supersedes informal habit and ad-hoc agent practice.
Amendments MUST update `.specify/memory/constitution.md`, bump
`CONSTITUTION_VERSION` (MAJOR for removed or incompatible principles, MINOR
for new or materially expanded principles, PATCH for clarification), set
`Last Amended` to the change date, and refresh the Sync Impact Report.
PRs and reviews MUST check compliance with principles I–VII and the stack
constraints. Complexity or extra surface MUST be justified against principle
VI. Runtime guidance for agents remains in `CLAUDE.md`, `AGENTS.md`, and
project skills; those files MUST NOT weaken this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
