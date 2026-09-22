# Feature Specification: Open-Source Repository Governance

**Feature Branch**: `002-opensource-repo-governance`

**Created**: 2026-09-22

**Status**: Ready for Plan

**Input**: User description: "vamos transformar esse repo em projeto opensource, bloquear branch main, criar CONTRIBUTING.md, criar regra do github pra sempre usar /feature, /fix, /refactor, para criar branchs, criar arquivo ISSUE.md para criar issues, use o mcp do github pra validar as infos, rodar tests e build ao criar a PR"

## Background (revalidated 2026-09-22 after visibility change)

Host facts were checked with the GitHub platform tools against `koller-nexus/vps-ops-mcp` (authenticated operator: `williamkoller`, admin on this repository):

- The project is **public**. Forking is **on**. There is still **no license** and **no description**.
- Default branch is `main`. Live branches: `main` (**protected**) and `feature/add-speckit` (unprotected).
- Default-branch protection now reads: one required review, required commit signatures, linear history, no force-push, no deletion, **branch lock on**, **admin enforcement off**, **no required status checks**.
- Repository rulesets are **empty**. Branch-name families are not enforced yet.
- There is still **no** contributor guide, **no** issue-filing guide, **no** license file, **no** issue templates, and **no** open issues.
- A change-request check already exists and runs the project test suite plus the project build, but merge is **not** gated on that check today.
- The maintainer flipped this same remote to public. That resolves the earlier plan block (protection and rulesets are available). A sanitizer pass was **not** recorded before the flip; leftover private host facts remain a live risk.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer prepares a public-ready contribution contract (Priority: P1)

A maintainer wants outsiders (and agents) to contribute without guessing process. They publish a contributor guide and an issue-filing guide, choose a license, and state that work lands only through change requests from named branch families.

**Why this priority**: Without a written contract, “open source” is only a visibility toggle. This is the minimum viable outcome.

**Independent Test**: A reviewer who has never seen the source tree can, from the published guides alone, file a complete issue and open a correctly named change request against the default branch.

**Acceptance Scenarios**:

1. **Given** a fresh checkout, **When** a newcomer looks for how to contribute, **Then** they find a root contributor guide that states branch prefixes, change-request-only delivery, verification expectations, and where to file issues.
2. **Given** the issue-filing guide, **When** a reporter opens a defect or a request, **Then** they are prompted for enough context (expected vs actual, reproduction or goal, environment) that a maintainer can act without a follow-up for missing basics.
3. **Given** the published license, **When** a user inspects the repository, **Then** they see the MIT license and know the reuse terms.

---

### User Story 2 - Default branch rejects direct work (Priority: P1)

A maintainer or agent tries to push or commit straight to the default branch. The host refuses. All production changes arrive as change requests that must pass the existing test-and-build verification before merge.

**Why this priority**: The constitution already forbids direct default-branch delivery. The host now marks `main` protected, but the gate is incomplete (no required checks, admins can bypass, and a full branch lock may also block legitimate merges).

**Independent Test**: Attempt a direct update to the default branch (as a non-admin if the plan allows admin bypass to be disabled) and confirm rejection; open a change request and confirm the test-and-build check is required.

**Acceptance Scenarios**:

1. **Given** the default branch is the integration line, **When** anyone attempts a direct push or a commit on that branch, **Then** the host rejects the update and tells them to use a change request.
2. **Given** a change request targeting the default branch, **When** the request is opened or updated, **Then** automated verification runs the project tests and the project build, and merge is blocked while those checks fail.
3. **Given** this remote is public and default-branch protection exists, **When** a change request is ready to merge, **Then** the host accepts the merge of a passing change request (a read-only lock that blocks all merges is a defect unless maintainers declare a freeze), requires the test-and-build check, and does not let an admin skip the rule.

---

### User Story 3 - New work uses only allowed branch families (Priority: P2)

A contributor starts work. They may create branches only under `feature/`, `fix/`, or `refactor/`. Other names, including `agent/`, are rejected by the host.

**Why this priority**: Consistent names make review and automation predictable. It is valuable only after the contribution contract exists.

**Independent Test**: Create one allowed branch and one disallowed branch (including `agent/…`); the allowed branch succeeds and the disallowed branch is rejected.

**Acceptance Scenarios**:

1. **Given** a contributor creating a branch, **When** the name starts with `feature/`, `fix/`, or `refactor/`, **Then** the host accepts the branch.
2. **Given** a contributor creating a branch, **When** the name uses another prefix (including `agent/`, a bare `main` topic branch, or an unmarked name), **Then** the host rejects it, and the contributor guide lists only those three families.
3. **Given** internal agent work, **When** an agent needs a branch, **Then** they use `feature/`, `fix/`, or `refactor/` according to the change type, not `agent/`.

---

### User Story 4 - Open-source visibility without leaking private host facts (Priority: P1)

A maintainer wants the project to be an open-source project. The public surface must carry a license, contribution rules, and no secrets or private host facts. Publication does not happen until sanitizer review passes and a human says yes.

**Why this priority**: Visibility without sanitization is a safety defect. The constitution and the open-source pipeline treat a sanitizer failure as a hard stop.

**Independent Test**: A reviewer can point to a sanitizer verdict of pass (or pass with warnings only) on the now-public tree. Example environment files list names and purpose, never values. A visitor who is not a collaborator can clone, read the license, and open an issue.

**Acceptance Scenarios**:

1. **Given** this remote is already public, **When** a reviewer inspects the published surface, **Then** secrets, private host addresses, and live credentials are absent, and example environment files contain names and purpose only.
2. **Given** a sanitizer verdict of fail, **When** critical findings remain, **Then** they are treated as an incident: the tree is cleaned, the sanitizer is re-run, and history that still contains secrets is handled before claiming the public surface is safe.
3. **Given** the maintainer chose this same remote as the public project, **When** an outsider visits, **Then** forking is allowed, a license is present, and they can file issues and change requests.

---

### Edge Cases

- A maintainer with admin rights can still push to `main` today because admin enforcement is off. The contributor guide must still forbid it; admin bypass MUST be turned off for the default branch.
- A full default-branch lock that blocks merging passing change requests is a defect unless maintainers declare an explicit freeze.
- Existing branch `feature/add-speckit` already matches an allowed prefix and MUST remain valid.
- Change requests from forks (once forking is enabled) MUST still run the same test-and-build verification.
- Opening a change request with failing tests or a failing build MUST block merge; skipping the check is a defect.
- An issue filed without the required sections from `ISSUE.md` MAY be closed or marked incomplete with a pointer back to the guide.
- Publication MUST NOT proceed if the example environment file still contains a real host, key path that identifies a private machine, or any secret value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST publish a root contributor guide that explains how to propose changes: allowed branch prefixes, change-request-only delivery to the default branch, Conventional Commits in English, required verification (tests and build), and a pointer to the issue-filing guide.
- **FR-002**: The repository MUST publish a root issue-filing guide (`ISSUE.md`) that a reporter can follow to open a complete issue (summary, type, expected vs actual or desired outcome, reproduction or acceptance notes, environment).
- **FR-003**: The project MUST carry the MIT license, identifiable as SPDX `MIT`.
- **FR-004**: Direct commits and direct pushes to the default branch MUST be forbidden in the contributor guide and enforced by the host, including for administrators.
- **FR-005**: New branches MUST use only `feature/`, `fix/`, or `refactor/`. The host MUST reject every other prefix, including `agent/`. The contributor guide MUST state this set. Agents MUST map constitution “agent work” onto one of those three prefixes.
- **FR-006**: Every change request targeting the default branch MUST run the project test suite and the project build. Merge MUST require those checks to pass.
- **FR-007**: The public surface MUST keep secrets and private host facts out. Example environment files MUST list variable names and purpose only.
- **FR-008**: Because this remote is already public, a sanitizer MUST still run on the published tree. A fail is an incident: critical findings MUST be fixed and the sanitizer re-run before claiming the public surface is safe.
- **FR-009**: When the project is open for outside contribution, forking MUST be allowed so external contributors can open change requests.
- **FR-010**: The repository MUST have a short public description so newcomers can tell what the operator does before cloning.
- **FR-011**: Host facts used to plan this work MUST be re-checked with the GitHub platform tools before claiming that protection, rules, license, or visibility are in place.

### Key Entities

- **Default branch**: The integration line (`main`). Source of production history. Not a working branch.
- **Contribution branch**: A short-lived line named with an allowed prefix, merged only by change request.
- **Change request**: The only path into the default branch. Must show passing tests and build.
- **Issue report**: A structured request or defect filed from `ISSUE.md`.
- **License grant**: MIT reuse terms attached to the public project.
- **Sanitizer verdict**: Pass, pass with warnings, or fail. Fail blocks publish.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time contributor can locate the contributor guide and the issue-filing guide and state the allowed branch prefixes and the default-branch rule in under five minutes.
- **SC-002**: 100% of recorded deliveries to the default branch after this feature is accepted arrive through a change request (zero new direct default-branch commits in the post-acceptance history, except an explicit documented emergency with a follow-up change request).
- **SC-003**: 100% of change requests targeting the default branch show a completed test run and a completed build run before merge; a failed run blocks merge.
- **SC-004**: After host rules are enabled, 100% of newly created branches match the approved prefixes; a disallowed name is rejected at creation time.
- **SC-005**: After the human-approved publish step, a visitor who is not a collaborator can read the license, file an issue from the published guide, and (via fork if they lack write access) open a change request.
- **SC-006**: A pre-publish review finds zero committed secrets and zero live private host facts in files intended for the public surface.

## Assumptions

- The in-scope host is `koller-nexus/vps-ops-mcp`, not the unrelated public namesakes found in search.
- “`/feature`, `/fix`, `/refactor`” means git prefixes `feature/`, `fix/`, and `refactor/` (not GitHub slash-commands).
- `ISSUE.md` is a root guide for humans and agents. Native issue templates may be added later if they help, but they are not required for v1 unless planning expands scope.
- The existing change-request verification that already runs tests and build is the intended gate; this feature requires it to stay mandatory, not a new parallel product.
- Internal construction rules (`AGENTS.md`, constitution) remain in force. This feature adds the public contribution surface; it does not weaken mutation safety, test-first delivery, or the sanitizer.
- `VERSION` does not change unless a human later asks for a version bump.
- English remains the language of commits, errors, and the new contribution documents.
- Direct commits to `develop` stay forbidden; this repository’s default integration branch is `main`.
- Open-source packaging extras (setup bootstrap script, extra marketing copy) are out of scope unless needed to satisfy the license, guides, or sanitizer.
- Q2 is resolved: the maintainer made `koller-nexus/vps-ops-mcp` itself public. Host protection and rulesets are available. Remaining host work is to complete the default-branch gate (required checks, admin enforcement, merge-safe lock) and to add branch-name rules for `feature/`, `fix/`, and `refactor/` only.
- License is MIT (maintainer choice 2026-09-22).
- Host-allowed prefixes are only `feature/`, `fix/`, and `refactor/`. The constitution’s `agent/` family is not a valid remote branch name; agents use one of the three prefixes.
- A sanitizer run is still required after the visibility flip; the flip itself does not count as a clean public release.
