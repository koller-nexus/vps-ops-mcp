# Quickstart: Validate Open-Source Repository Governance

Use this after the documents exist and host rules are applied. Do not add operator tools.

## Prerequisites

- Repository root checkout
- Contracts in [contracts/](./contracts/)
- Data model: [data-model.md](./data-model.md)
- `gh` authenticated as an admin of `koller-nexus/vps-ops-mcp` (for host checks only)

## Setup

No new runtime. Existing Bun toolchain.

## Local proof

From the repository root:

```bash
test -f CONTRIBUTING.md && test -f ISSUE.md && test -f LICENSE
bun test src/opensource-governance.test.ts
```

Expected: files exist; contract test passes (headings and tokens; workflow job `Test and build`; no live IP `64.181.163.182` in `.env.example` or README defaults).

If the test file is not in the tree yet, report **blocked** for that command.

## Tabletop A — five-minute locate (SC-001)

Open only `CONTRIBUTING.md` and `ISSUE.md`. Time yourself.

You MUST find:

- Allowed prefixes `feature/`, `fix/`, `refactor/`
- Change-request-only delivery to `main`
- How to file an issue (`ISSUE.md` sections)

Pass if all three are found in under five minutes.

## Tabletop B — reject a bad branch (SC-004)

Using only `CONTRIBUTING.md`, reject a branch named `agent/add-tool` and accept `fix/timeout-message`.

## Host proof (FR-011)

```bash
gh api repos/koller-nexus/vps-ops-mcp --jq '{visibility,license:.license.spdx_id,description,allow_forking}'
gh api repos/koller-nexus/vps-ops-mcp/rulesets
```

Pass only if the payload matches [contracts/github-host.md](./contracts/github-host.md).

Do not claim default-branch or prefix enforcement from memory or from an older private-repo 403.

## Sanitizer proof (SC-006)

Search the intended public surface (root docs, `.env.example`, README) for live host facts and secrets. Known dirty value to be gone: `64.181.163.182`.

Pass: zero committed secrets; example env lists names and purpose only.

A sanitizer fail is an incident, not a warning.
