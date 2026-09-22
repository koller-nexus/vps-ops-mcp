# Research: Open-Source Repository Governance

## 1. Deliverable shape

**Decision**: Ship root `CONTRIBUTING.md`, `ISSUE.md`, and `LICENSE` (MIT). Keep the existing pull-request workflow. Apply GitHub **repository rulesets** (not a second CI file) for default-branch merge gates and contribution-branch names. Set the public repository description. Sanitize example env and README defaults.

**Rationale**: The spec is contribution process and host policy. Constitution VI forbids extra surface. A change-request check already runs tests and build.

**Alternatives considered**:

- Classic branch-protection API only — rejected as the sole tool; it cannot express “only these prefixes” cleanly, and rulesets are available now that the repo is public.
- New workflow for lint or release — rejected; out of scope.
- GitHub issue templates in `.github/ISSUE_TEMPLATE/` — rejected for v1; spec says `ISSUE.md` is enough.

## 2. Default-branch gate

**Decision**: One active ruleset named `default-branch` targeting `~DEFAULT_BRANCH`:

- Require a pull request before merging (at least one approval, matching current protection).
- Require status checks to pass: exact name `Test and build` (workflow job `name` in `.github/workflows/pull_request.yml`).
- Require linear history.
- Block force-push and deletion.
- Do **not** enable “lock branch” (read-only). Lock blocks legitimate merges.
- Empty bypass actors so administrators cannot skip the ruleset.

Turn off or replace the current classic protection’s `lock_branch: true` and `enforce_admins: false` so the ruleset is the source of truth.

**Rationale**: GitHub docs: without required status checks, collaborators can merge regardless of workflow results. The check name for a workflow job is `<job name>`. Current protection has **no** required checks and **does not** enforce admins.

**Alternatives considered**:

- Keep classic protection and add only required checks — weaker for prefix rules; two systems drift.
- Require signed commits in the new ruleset — already on classic protection; keep if the host still has it, but do not invent a new signing program in this feature.

## 3. Branch-name families

**Decision**: Second active ruleset named `contribution-branch-names`:

- `conditions.ref_name.include`: `["~ALL"]`
- `conditions.ref_name.exclude`: `["~DEFAULT_BRANCH", "refs/heads/feature/*", "refs/heads/fix/*", "refs/heads/refactor/*"]`
- Rules: `creation` (restrict creations). Optionally `update` on those matching disallowed refs so they cannot be pushed after a bypass create.
- Empty bypass actors.

Fnmatch: `refs/heads/feature/*` matches one segment (`feature/add-speckit`). Nested names like `feature/foo/bar` are out of scope; contributors use a single segment after the prefix.

**Rationale**: GitHub `creation` only blocks refs that **match** the ruleset target. Targeting everything except default + the three prefixes means `agent/…`, `hotfix/…`, and unmarked names cannot be created.

**Alternatives considered**:

- Allow `agent/` to satisfy the constitution literally — rejected; maintainer chose three prefixes only.
- Client-side git hooks only — rejected; they do not bind forks or the website UI.
- `feature/**` recursive glob — unnecessary for v1; single segment is easier to teach.

## 4. License

**Decision**: Root `LICENSE` with the standard MIT text, copyright holder `koller-nexus` (or “William Koller / koller-nexus”) and year `2026`. GitHub license API should then report SPDX `MIT`.

**Rationale**: Maintainer choice. SPDX detection needs a conventional root license file.

**Alternatives considered**: LICENSE.md only, or SPDX in package.json only — rejected; GitHub license detection expects `LICENSE`.

## 5. Documents

**Decision**: English `CONTRIBUTING.md` and `ISSUE.md` at repo root. `README.md` links to both. `CONTRIBUTING.md` states: PR-only to `main`, prefixes, Conventional Commits, `bun test` + `bun run build`, pointer to `ISSUE.md`, no secrets, no live-host “tests”.

**Rationale**: FR-001 and FR-002. English matches constitution.

**Alternatives considered**: Portuguese guides — rejected; project documents are English. `docs/CONTRIBUTING.md` — rejected; newcomers look at root.

## 6. Sanitizer on an already-public tree

**Decision**: Treat leftover private facts as an incident, not a reason to flip the repo private again unless the sanitizer finds live secrets (keys, passphrases). Known finding: `VPS_HOST` default `64.181.163.182` in `.env.example` and README. Replace with a placeholder (`example.invalid` or empty-with-comment). Do not commit `.env`. Do not rewrite git history unless a **secret** (key material, token) is found; a public IP in history is documented as residual risk.

**Rationale**: The remote is already public. Constitution and `opensource-pipeline` still require a sanitizer pass before claiming the surface is safe. History rewrite is high-cost and needs an explicit human yes.

**Alternatives considered**:

- Full opensource-pipeline staging fork — rejected; maintainer published **this** remote.
- Immediate history purge for the IP — rejected unless the human asks; not a credential.

## 7. Proof split

**Decision**:

| Proof | Where |
|-------|--------|
| Documents exist and contain required tokens | `bun test` contract file |
| Workflow still has job `Test and build` and runs `bun test` then `bun run build` | Same contract test reads the workflow YAML |
| Rulesets, description, visibility, MIT detection | Operator session: GitHub MCP / `gh api` per [contracts/github-host.md](./contracts/github-host.md) |

**Rationale**: Automated CI MUST NOT depend on a live GitHub admin session. FR-011 still requires a human/agent revalidation before claiming host rules.

**Alternatives considered**: Integration test that creates a throwaway branch on the real repo — rejected; mutates the public host from CI.

## 8. Repository description

**Decision**: Set description to a short English line, e.g. “Stdio MCP server that inspects and (with confirmation) mutates one VPS over SSH.”

**Rationale**: FR-010. Current description is null.

**Alternatives considered**: Portuguese description — rejected for the public GitHub surface; README may stay bilingual later, out of scope.

## 9. Skill map for implement

| Work | Skill |
|------|--------|
| Host rules, workflow, rollout | `devops-engineer` |
| Sanitizer / public surface | `opensource-pipeline` |
| Document + test behavior | `test-driven-development` |
| Narrow file edits | `surgical-patch` / `lean-build` (no extra features) |
| Done claims | `verification-before-completion` |
