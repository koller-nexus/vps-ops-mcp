# VPS Ops MCP Agent Construction Guide

## Purpose

This document is the construction contract for agents that build or change
vps-ops-mcp. Read it before adding operator capabilities, delivery assets, or
a public copy. It states which skills are mandatory, what a safe tool looks
like, how to prove a change, and what MUST never be done to a live host.

## Authority

This guide complements `.specify/memory/constitution.md`. When the two
disagree, the constitution wins. Skills set method. The constitution and this
guide set non-negotiable gates. Runtime notes in `CLAUDE.md` MUST NOT weaken
either document.

## Skill routing

Load and follow the matching skill before the work. Skipping a relevant skill
is a governance violation.

| Trigger | Skill | Location |
|---------|-------|----------|
| New or changed operator capability | mcp-builder | `.agents/skills/mcp-builder/SKILL.md` |
| Build, test, package, release, infra, or incidents | devops-engineer | `.agents/skills/devops-engineer/SKILL.md` |
| Public copy or publish | opensource-pipeline | `.agents/skills/opensource-pipeline/SKILL.md` |
| Specify, plan, tasks, or implement | speckit-* | `.cursor/skills/speckit-*/SKILL.md` |
| Overbuilding-risk feature work | lean-build | agent skill library |
| Narrow bug or behavior fix | surgical-patch | agent skill library |
| Any production behavior change | test-driven-development | agent skill library |
| Completion claims | verification-before-completion and verify-and-stop | agent skill library |

## Product shape

The product is a client-launched local operator. The editor or CLI starts the
process over stdio. Do not leave it running as a long-lived public service.
It talks to one remote host. Read-only inspection and mutation are separate
catalogs. Extra transports, flags, or tools MUST NOT ship unless an accepted
spec requires them. `VERSION` changes only when a human explicitly asks.

## Operator capabilities

Name every tool `vps_` plus an action and a resource (example:
`vps_docker_restart`, never `restart`). Descriptions MUST be narrow and match
behavior.

Catalog is `readonly` or `mutation`.

- Read-only tools MUST NOT change host or container state. Set `readOnlyHint`
  true and `destructiveHint` false.
- Mutation tools MUST require `confirm:true`, MUST honor
  `VPS_ALLOW_MUTATIONS` when it is false, and MUST set `destructiveHint` true
  and `readOnlyHint` false.
- Set `idempotentHint` and `openWorldHint` to match real behavior. Mismatched
  annotations are a defect.

Errors MUST be English and MUST name the next corrective step (missing
`confirm:true`, mutations disabled, invalid name or path, timeout, truncated
output). Every remote action has a timeout and a stdout/stderr byte cap.
Overflow MUST be visible to the caller. Destructive work MUST name the exact
target. Do not interpolate unvalidated paths or commands.

After a tool-set change, keep a small set of realistic, read-only, independent
evaluation questions that prove another agent can use the tools.

## Proof

No production behavior MAY land without a unit test that failed first for the
right reason (Red, then Green, then Refactor). When a tool contract, env
schema, or remote command shape changes, add or update an integration test in
the same change. Default proof is `bun test` for the touched files plus the
nearest lint or typecheck already in the repo. Automated proof MUST NOT use a
live host or a production network session. Live use is an operator session,
not a test bed. Do not claim done, fixed, or passing without fresh command
evidence from this session.

## Delivery and operations

Follow devops-engineer: assess, design, implement, validate, plan rollout,
approve, verify. Validate with `bun test` and any config lint in the tree
before rollout language. Production or customer-facing publish or deploy
requires explicit human approval, a written rollback, and a verification plan
before those commands run. Withheld approval is blocked. You MUST NOT apply undocumented host edits as a substitute for versioned project files. MUST NOT commit secrets. Do not log private keys or passphrases. Do not copy
passphrases into client registration by default. Feature work lands on
`feature/*`, `fix/*`, or `agent/*` and merges by pull request.

## Public release

Do not push the private working tree. Follow opensource-pipeline: copy to
staging, strip secrets and private host facts, run the sanitizer, package,
then wait for a human yes.

States: private_tree → staged_fork → stripped → sanitized → blocked on
sanitizer FAIL, or packaged on PASS / PASS_WITH_WARNINGS →
wait_for_publish_approval → published.

The human chooses the license before packaging completes. Example environment
files list names and purpose only, never values. A sanitizer FAIL blocks
publish until critical findings are fixed and the sanitizer is re-run. Never
create or push the public remote until the human says yes.

## Construction sequence

1. Read this guide and the constitution. Load the matching skills.
2. Specify or plan when the change is a new capability, a contract change, or
   a safety-affecting mutation (`speckit-specify` / `speckit-plan`).
3. Write the failing unit test (and integration test when a seam is involved).
   Run it. Confirm the failure reason.
4. Implement the minimum change. Keep mutations behind `confirm:true` and the
   allow-switch.
5. Refactor only while green. Do not expand scope.
6. Run `bun test`. Report evidence. Stop.

## Anti-patterns

- Skipping the sanitizer or treating FAIL as a warning
- Pushing a public copy or deploying production without approval
- Testing only on a live host
- Adding tools without matching annotations
- Claiming done without fresh `bun test` evidence
- Growing extra surface that acceptance did not require
- Weakening confirmation, the allow-switch, tests, or skills to "optional"

## Human setup

Registration steps, environment names, and operator how-to live in
`README.md` and `.env.example`. Do not copy that manual here. Agents use this
file for construction rules; humans use those files to register the client.
