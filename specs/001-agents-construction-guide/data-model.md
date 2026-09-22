# Data Model: Construction Agents Guide

This feature has no runtime database. Entities are sections and rules inside `AGENTS.md`.

## Construction Guide

The root document agents load before building or changing the product.

| Field | Rule |
|-------|------|
| path | MUST be `AGENTS.md` at repository root |
| language | English |
| constitution_relation | Complements; constitution wins on conflict |
| purpose | How agents build and change the host-operator product |
| secrets | MUST contain zero live credential values |

Relationships: contains many Skill Routes, many Operator Capability Rules, Delivery Change Rules, and one Public Release Path.

## Skill Route

A mandatory skill and when it applies.

| Field | Rule |
|-------|------|
| name | Stable skill id (`mcp-builder`, `devops-engineer`, `opensource-pipeline`, plus constitution process skills) |
| path | Relative path from repo root to `SKILL.md` when the skill is in this repo |
| trigger | Work type that makes the skill mandatory |
| duty | Load and follow before matching work; skipping is a governance violation |

Validation: every named project skill MUST have a path that a reviewer can open. A missing file is a defect.

## Operator Capability Rule

Rules that apply to one agent-callable action.

| Field | Rule |
|-------|------|
| name_shape | Service prefix `vps_` + action + resource |
| catalog | `readonly` or `mutation` |
| confirmation | Mutations MUST require explicit `confirm:true` |
| allow_switch | Mutations MUST honor the global mutation-off switch |
| annotations | `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` MUST match behavior |
| errors | English, next corrective step |
| bounds | Timeout and result-size limit; overflow visible |
| proof | Test-first unit test; integration test when the operator seam changes |
| evaluation | Read-only, independent questions remain after tool-set changes |

State: a capability is **draft** until annotations, gates, and failing-then-passing tests exist; then **accepted**.

## Delivery Change Rule

Rules for build, proof, package, release, or incident assets.

| Field | Allowed values |
|-------|----------------|
| phase | assess, design, implement, validate, plan_rollout, approve, verify |
| production_or_public | requires explicit human approval |
| rollback | written before approval |
| host_edits | forbidden as a substitute for versioned project files |

State transitions:

```text
assess → design → implement → validate → plan_rollout
  → (if production or customer-facing) wait_for_approval
  → verify
```

`wait_for_approval` MUST NOT proceed on silence. Withheld approval is **blocked**.

## Public Release Candidate

A staging copy prepared for publication. Not created by this feature; the guide describes the entity.

| Field | Rule |
|-------|------|
| location | Staging directory, never the private working tree pushed as-is |
| sanitizer_verdict | `PASS`, `PASS_WITH_WARNINGS`, or `FAIL` |
| license | Human-chosen before packaging completes |
| secrets | Stripped; example env lists names only |
| publish | Forbidden until human yes |

State transitions:

```text
private_tree → staged_fork → stripped → sanitized
  → (FAIL) blocked
  → (PASS or PASS_WITH_WARNINGS) packaged → wait_for_publish_approval → published
```

## Validation rules shared by all entities

- No live host identity, private key paths, or passphrases in the guide.
- No instruction to use a production host as the automated test bed.
- Anti-patterns MUST be listed as forbidden, not optional advice.
