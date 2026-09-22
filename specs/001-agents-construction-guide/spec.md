# Feature Specification: Construction Agents Guide

**Feature Branch**: `001-agents-construction-guide`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "crie o AGENTS.md para construção do vps-ops-mcp e use as skills de mcp-builder, devops-engineer e opensource-pipeline"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent finds a single construction contract (Priority: P1)

A contributing agent or maintainer opens the project to add or change host-operator capabilities. They read one construction guide at the repository root and immediately know: which project skills are mandatory, what a safe tool looks like, how to prove a change, and what they must never do to a live host.

**Why this priority**: Without a single contract, agents invent process, skip skills, and ship unsafe remote actions. This is the minimum viable outcome of the feature.

**Independent Test**: A reviewer who has not seen the source tree can list, from the guide alone, the mandatory skills, the read-only versus mutation boundary, and the proof required before claiming done.

**Acceptance Scenarios**:

1. **Given** a fresh checkout, **When** a contributor opens the root construction guide, **Then** they find an explicit purpose statement that this document governs how agents build and change the host-operator product.
2. **Given** the construction guide, **When** they look for skill routing, **Then** they see that `mcp-builder`, `devops-engineer`, and `opensource-pipeline` are mandatory for matching work, plus the constitution's other required skills.
3. **Given** the construction guide, **When** they look for stop conditions, **Then** they see that work stops after acceptance proof and that unverified completion claims are forbidden.

---

### User Story 2 - Agent builds operator tools the way MCP quality work demands (Priority: P1)

A contributor adds or revises an operator capability (inspect host health, inspect containers, or mutate a named service). The guide forces them through the MCP builder workflow: understand the protocol and tool design, name tools so another agent can discover them, describe them narrowly, annotate read-only versus destructive behavior, return focused results, and emit errors that tell the next step.

**Why this priority**: The product is only valuable if another agent can choose the right tool and not destroy the host. This is the core construction quality bar.

**Independent Test**: Using only the guide, a reviewer can score a proposed tool against a published checklist (name, description, annotations, pagination or size limits, actionable errors, evaluation coverage) and reject a tool that fails any item.

**Acceptance Scenarios**:

1. **Given** a new read-only capability, **When** the contributor follows the guide, **Then** the tool is named with a stable service prefix, described as read-only, and annotated as non-destructive.
2. **Given** a new mutating capability, **When** the contributor follows the guide, **Then** the tool requires explicit human confirmation, honors a global mutation-off switch, and is annotated as destructive.
3. **Given** a failed remote action, **When** the operator returns an error, **Then** the message is in English and tells the agent what to change next (missing confirmation, mutations disabled, invalid path, timeout, truncated output).
4. **Given** a completed tool set change, **When** the contributor checks the guide's evaluation rule, **Then** they know they must keep a small set of realistic, read-only, independently verifiable questions that prove another agent can use the tools.

---

### User Story 3 - Agent changes delivery and operations without unsafe rollout (Priority: P2)

A contributor needs to change how the product is built, tested, packaged, or released. The guide applies the DevOps engineer role: assess, design, implement, validate, plan rollout, obtain explicit approval before any production or customer-facing step, then verify and keep a rollback path.

**Why this priority**: Delivery mistakes can publish secrets or mutate a live host. The guide must make that path slower and explicit.

**Independent Test**: A reviewer can walk a fictional pipeline change using only the guide and produce a validation list, an approval gate, and a rollback description before any production action.

**Acceptance Scenarios**:

1. **Given** a proposed delivery change, **When** the contributor follows the guide, **Then** they validate with automated unit and integration proof and configuration lint before any rollout language.
2. **Given** a production or customer-facing publish or deploy, **When** the contributor reaches the approval step, **Then** they must stop and wait for explicit human approval, with a written rollback and verification plan.
3. **Given** secrets or host credentials, **When** the contributor reads the guide, **Then** they are forbidden from committing secrets, logging private keys, or copying passphrases into client registration by default.
4. **Given** infrastructure or environment drift, **When** the contributor proposes a change, **Then** the guide requires the change to be declared in versioned project files, not applied as an undocumented one-off on the host.

---

### User Story 4 - Maintainer can prepare a public copy without leaking the private host (Priority: P2)

A maintainer wants to publish or refresh a public copy of the project. The guide describes the open-source pipeline: fork into a staging area, strip secrets and private host facts, sanitize with a pass/fail gate, package contributor documents, and publish only after human approval.

**Why this priority**: The private tree contains host identity and key paths. Public release without this path is a security incident.

**Independent Test**: A reviewer can execute a tabletop of the published pipeline and confirm that a sanitizer failure blocks publish, and that `.env`, private keys, and live host defaults never appear in the public story.

**Acceptance Scenarios**:

1. **Given** a request to make the project public, **When** the maintainer follows the guide, **Then** they use a staging copy and never push the private working tree as-is.
2. **Given** a sanitizer failure (secrets, personal data, internal host references, or dangerous files), **When** the pipeline reports FAIL, **Then** publish is blocked until critical findings are fixed and the sanitizer is re-run.
3. **Given** a sanitizer pass, **When** packaging completes, **Then** the public copy has license, contribution rules, example environment names without values, and a bootstrap story that does not embed real credentials.
4. **Given** a ready public copy, **When** the maintainer is asked to create the remote repository, **Then** the guide forbids creation or push until the human says yes.

---

### Edge Cases

- The construction guide already exists or is only a pointer to another file: the feature replaces it with a complete contract, not a stub that defers all rules elsewhere.
- A skill path moves: the guide MUST name skills by stable skill name and relative project location so a missing file is an obvious defect.
- Constitution and construction guide disagree: the guide MUST state that the constitution wins, and the guide MUST NOT weaken safety, test-first, or skill-first rules.
- A contributor wants to test against a live host: the guide MUST forbid live-host dependence for automated proof and MUST treat live use as an operator session, not as a substitute for tests.
- Open-source packaging is requested without a license choice: the guide MUST require the human to choose a license before packaging completes.
- Delivery work looks like "just a small host tweak": the guide MUST classify it as an operations change and still require assessment, validation, and approval when the host is production.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a single root construction guide named `AGENTS.md` that agents read before building or changing the host-operator product.
- **FR-002**: The guide MUST state that it complements, and does not override, the project constitution.
- **FR-003**: The guide MUST require contributors to load and follow `mcp-builder` before adding or changing operator capabilities that another agent will call.
- **FR-004**: The guide MUST require contributors to load and follow `devops-engineer` before changing build, test, packaging, release, infrastructure, or incident-response assets.
- **FR-005**: The guide MUST require contributors to load and follow `opensource-pipeline` before preparing or publishing a public copy.
- **FR-006**: The guide MUST also route to the constitution's mandatory process skills for the matching work type (specification, lean feature work, narrow fixes, test-first implementation, and verification before completion).
- **FR-007**: The guide MUST define the product as a client-launched local operator that talks to a remote host, not as a long-lived public service that anyone may start by hand and leave running.
- **FR-008**: The guide MUST separate read-only inspection capabilities from mutating capabilities, and MUST require explicit confirmation plus a global mutation-off switch for every mutation.
- **FR-009**: The guide MUST require tool names to use a stable service prefix and an action-oriented phrase so another agent can discover them among other servers.
- **FR-010**: The guide MUST require each capability to declare whether it is read-only, destructive, idempotent, and open-world, and those declarations MUST match real behavior.
- **FR-011**: The guide MUST require errors, validation text, and completion claims to be in English, and errors MUST suggest the next corrective action.
- **FR-012**: The guide MUST require test-first unit proof and integration proof at the operator boundary, without depending on a production host or a live network session to pass automated checks.
- **FR-013**: The guide MUST forbid committing secrets, logging private keys or passphrases, and embedding live host credentials in example files. Example environment files MUST list names and purpose only.
- **FR-014**: The guide MUST require bounded remote work: every remote action has a time limit and a result-size limit, and overflow is visible to the caller.
- **FR-015**: The guide MUST require delivery changes to follow assess → design → implement → validate → plan rollout → explicit approval for production or customer-facing steps → verify, with a documented rollback before those steps run.
- **FR-016**: The guide MUST forbid undocumented one-off changes on the live host as a substitute for versioned project changes.
- **FR-017**: The guide MUST describe the public-release path as fork to staging, strip secrets and private host facts, sanitize (blocking on critical failure), package contributor documents, and publish only after human approval.
- **FR-018**: The guide MUST list anti-patterns: skipping sanitizer, pushing without approval, testing only on the live host, adding tools without annotations, claiming done without fresh proof, and growing extra surface that acceptance did not require.
- **FR-019**: The guide MUST include a short construction sequence an agent can follow from first read to verified change (read constitution and skills → specify when the change is a new capability or safety boundary → fail a test first → implement the minimum → verify → stop).
- **FR-020**: The guide MUST point to existing human-facing setup material for registration and environment names, and MUST NOT duplicate a full operator manual.

### Key Entities

- **Construction Guide**: The root agent contract. Attributes: purpose, skill routing, safety rules, delivery rules, public-release rules, anti-patterns, stop condition.
- **Operator Capability**: A single agent-callable action. Attributes: name, intent, read-only or mutating, confirmation need, annotations, error guidance, proof required.
- **Skill Route**: A named mandatory skill and when it applies. Attributes: skill name, location, triggering work type.
- **Delivery Change**: A change to how the product is built, proven, packaged, or released. Attributes: validation required, approval required, rollback required.
- **Public Release Candidate**: A staging copy prepared for publication. Attributes: sanitizer verdict, license choice, stripped secrets, human publish approval.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new contributor locates the mandatory skills, the mutation safety rules, and the definition of done in the construction guide in under five minutes, without opening application source.
- **SC-002**: A reviewer can score a proposed operator capability against the guide and reject it for any missing item among name prefix, matching safety annotations, confirmation rule (if mutating), and English next-step errors, with 100% of those items listed in the guide.
- **SC-003**: In a tabletop of a production or public publish, 100% of reviewers following the guide stop for explicit human approval and can state the rollback or sanitizer-block rule before any publish action.
- **SC-004**: After the guide exists, a first-time agent can complete the written construction sequence for a small documented change without asking where to find `mcp-builder`, `devops-engineer`, or `opensource-pipeline`.
- **SC-005**: The guide contains zero live credential values and zero instructions that tell an agent to commit secrets or to use a production host as the automated test bed.

## Assumptions

- Scope is the root construction guide and its alignment with the constitution. This feature does not implement new operator capabilities, does not run the public-release pipeline, and does not create a public repository.
- `AGENTS.md` is the required filename and lives at the repository root, matching common agent-loader convention.
- Existing human setup documentation remains the place for registration steps and environment tables; the construction guide references it rather than replacing it.
- The three named skills already live in the project's agent skill library and stay the source of detailed procedures; the guide routes to them instead of copying those procedures in full.
- License, public organization, and public repository name are chosen by a human at publish time, not fixed in this feature.
- English remains the language of the guide body, errors, and commits, consistent with project governance.
- `VERSION` still changes only when a human explicitly asks for that version change; the guide restates that rule rather than implying a bump.
- Default integration branch work still happens on a topic branch and a pull request; the guide restates that rule.
