# Data Model: Open-Source Repository Governance

This feature has no application database. Entities are documents and host-policy records.

## Contributor Guide

Root document humans and agents read before changing the project.

| Field | Rule |
|-------|------|
| path | `CONTRIBUTING.md` at repository root |
| language | English |
| prefixes | MUST list exactly `feature/`, `fix/`, `refactor/` |
| default_branch | Work lands on `main` only through a change request |
| verification | MUST name project tests and project build |
| issues | MUST point at `ISSUE.md` |
| secrets | MUST contain zero live credential or host values |

Relationships: references Issue Guide; restates Default Branch Policy and Contribution Branch Policy.

## Issue Guide

Root form for filing a complete issue.

| Field | Rule |
|-------|------|
| path | `ISSUE.md` at repository root |
| language | English |
| required_sections | summary, type, expected vs actual or desired outcome, reproduction or acceptance notes, environment |

State: an issue filed without these sections is **incomplete**.

## License Grant

| Field | Rule |
|-------|------|
| path | `LICENSE` at repository root |
| spdx | `MIT` |
| year | `2026` |
| copyright | Project owner (`koller-nexus` / William Koller) |

Detected by the host as SPDX MIT when the file is conventional.

## Default Branch Policy

Host record on the integration line.

| Field | Rule |
|-------|------|
| ref | Default branch (`main`) |
| direct_push | Forbidden, including administrators |
| merge_path | Change request only |
| required_checks | Must include `Test and build` |
| lock | MUST NOT be a full read-only lock while the project accepts merges |
| force_push | Forbidden |
| deletion | Forbidden |

State: **incomplete** (today: lock on, no required checks, admin bypass) → **enforced**.

## Contribution Branch Policy

Host record for new refs.

| Field | Rule |
|-------|------|
| allowed_prefixes | `feature/`, `fix/`, `refactor/` only |
| denied_examples | `agent/`, unmarked names, `hotfix/` |
| existing_ok | `feature/add-speckit` remains valid |
| segment | One path segment after the prefix (`feature/name`) |

State: **empty rulesets** → **enforced**.

## Change Request Gate

| Field | Rule |
|-------|------|
| trigger | Open or update of a change request targeting the default branch |
| steps | Project tests, then project build |
| merge | Blocked while either step fails |

## Public Surface Fact

A string that may appear in committed example or help text.

| Field | Rule |
|-------|------|
| kind | env name, purpose, placeholder value |
| forbidden | live IPs, key material, passphrases, private host names that identify a real machine |

State: **dirty** (known `64.181.163.182`) → **clean** after placeholder replacement and sanitizer pass or pass-with-warnings.

## Sanitizer Verdict

| Value | Meaning |
|-------|---------|
| pass | No critical secrets or private facts in the intended public surface |
| pass_with_warnings | Non-critical leftovers documented |
| fail | Critical findings; incident until fixed and re-run |

## Repository Description

| Field | Rule |
|-------|------|
| host | `koller-nexus/vps-ops-mcp` |
| visibility | public |
| forking | allowed |
| description | Non-empty short English summary |
