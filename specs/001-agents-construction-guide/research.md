# Research: Construction Agents Guide

## 1. Deliverable shape

**Decision**: One root Markdown file named `AGENTS.md`. No new application modules, tools, env vars, or transports.

**Rationale**: The spec's scope is the construction contract. Constitution principle VI forbids extra surface. Agent loaders already look for root `AGENTS.md`.

**Alternatives considered**:
- Fold everything into `CLAUDE.md` — rejected; `CLAUDE.md` is Bun runtime guidance and would bury construction rules.
- Split into several files under `docs/agents/` — rejected; FR-001 requires a single root contract.
- Generate `AGENTS.md` from a template script — rejected; overbuild for a static contract.

## 2. Relationship to constitution and skills

**Decision**: `AGENTS.md` restates non-negotiable gates in short form and links to `.specify/memory/constitution.md` as the winning document. Detailed procedures stay in skills. The guide lists skill name plus relative path.

**Rationale**: FR-002 and constitution governance say runtime guidance MUST NOT weaken the constitution. FR-003–FR-006 require routing, not a full copy of each skill.

**Alternatives considered**:
- Inline full skill text — rejected; drifts on skill updates.
- Name skills without paths — rejected; a missing file must be an obvious defect.

## 3. Skill map

**Decision**: Mandatory routes:

| Work type | Skill name | Path |
|-----------|------------|------|
| New or changed operator capability | `mcp-builder` | `.agents/skills/mcp-builder/SKILL.md` |
| Build, test, package, release, infra, incidents | `devops-engineer` | `.agents/skills/devops-engineer/SKILL.md` |
| Public copy or publish | `opensource-pipeline` | `.agents/skills/opensource-pipeline/SKILL.md` |
| Spec / plan / tasks / implement | matching `speckit-*` | `.cursor/skills/speckit-*/SKILL.md` |
| Overbuilding-risk feature work | `lean-build` | agent skill library |
| Narrow bug or behavior fix | `surgical-patch` | agent skill library |
| Any production behavior change | `test-driven-development` | agent skill library |
| Completion claims | `verification-before-completion`, `verify-and-stop` | agent skill library |

**Rationale**: Matches FR-003–FR-006 and constitution principle II. Project-local copies of the three named skills already exist.

**Alternatives considered**: Only the three user-named skills — rejected; constitution also mandates Spec Kit, TDD, and verification skills.

## 4. MCP construction rules to restate

**Decision**: Restate, in agent-facing language, the project-specific overlay on `mcp-builder`:

- Stable prefix `vps_` plus action and resource (`vps_docker_restart`, not `restart`).
- Read-only catalog vs mutation catalog; mutations require `confirm:true` and honor `VPS_ALLOW_MUTATIONS=false`.
- Annotations MUST match behavior (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).
- Errors in English with the next corrective step.
- Remote work has timeout and byte cap; truncation is visible.
- Keep a small read-only evaluation set for agent usability; do not depend on a live host for automated proof.

**Rationale**: Existing mutation handlers already enforce confirm and the allow-flag. The guide must make that the construction rule, not tribal knowledge.

**Alternatives considered**: Point only at `mcp-builder` with no overlay — rejected; generic MCP guidance does not encode this product's mutation gate.

## 5. DevOps overlay

**Decision**: Restate the `devops-engineer` workflow (assess → design → implement → validate → plan rollout → explicit approval for production or customer-facing steps → verify) and forbid undocumented live-host edits. Validation for this repo is `bun test` plus any config lint already in tree. Rollback is written before approval, not after.

**Rationale**: FR-015 and FR-016. The skill's Kubernetes/Terraform examples are optional references, not new deliverables of this feature.

**Alternatives considered**: Add CI, Docker, or Kubernetes files now — rejected; out of spec scope and principle VI.

## 6. Open-source overlay

**Decision**: Document the pipeline as fork-to-staging → strip secrets and private host facts → sanitizer (FAIL blocks) → package → publish only after human yes. License is chosen at publish time. Do not run the pipeline in this feature.

**Rationale**: FR-017 and spec assumptions. Private tree has host identity and key paths.

**Alternatives considered**: Execute `/opensource fork` now — rejected; spec says this feature does not publish.

## 7. Proof for a documentation feature

**Decision**: Treat required headings and MUST phrases as a contract. Implementation later adds a focused `bun test` that reads `AGENTS.md` and asserts the contract file's required tokens. Reviewers also walk `quickstart.md` tabletops.

**Rationale**: Constitution III and VII still apply. A guide with no failing-then-passing check can rot. A single file-existence and heading test is the minimum behavior proof.

**Alternatives considered**:
- Review-only, no test — weaker; headings can vanish unnoticed.
- Full Markdown linter/CI job — extra surface not required by the spec.

## 8. Language and secrets

**Decision**: Guide body in English. No live host addresses, key paths, or credential values. Point to `README.md` and `.env.example` for human setup names.

**Rationale**: SC-005, FR-013, FR-020, constitution English rule.

**Alternatives considered**: Portuguese guide — rejected; project documentation language is English.
