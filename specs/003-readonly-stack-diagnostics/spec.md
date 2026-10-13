# Feature Specification: Read-only Stack Diagnostics

**Feature Branch**: `feature/update-docs`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "implemente isso: O vps-ops só oferece ferramentas fixas e nenhuma executa comandos livres. Pelo MCP confirmei a conexão (vps_ping) e o compose (compose_ps respondeu com o erro típico do compose v2). O jq e a renderização do stack eu chequei por SSH, com a mesma chave e usuário do MCP, rodando só comandos de leitura e mostrando apenas os nomes das variáveis, nunca os valores."

## Context

The operator diagnosed a VPS stack partly through the MCP server and partly by
hand. Connectivity and compose status went through fixed MCP tools. Two checks
had to leave the MCP and run over a manual SSH session with the same key and
user: whether the host has the required dependencies (including `jq`), and
whether the stack renders, listing only variable names. The compose status
check also failed because the stack uses a non-default file name, which the
tool could not target.

This feature closes those gaps so the whole diagnosis runs through fixed,
read-only MCP tools. No tool accepts or runs free-form commands.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect stack variables without exposing secrets (Priority: P1)

An operator asks the agent to confirm that a stack renders and which
environment variables each service receives. The agent calls one fixed tool
and gets back, per service, the sorted list of variable names. Values never
appear in the response.

**Why this priority**: This was the riskiest manual step. Doing it by hand
relies on the operator remembering to strip values; a tool makes it impossible
to leak them.

**Independent Test**: Point the tool at a stack whose services define
variables with known secret values; the response lists every name and contains
none of the values.

**Acceptance Scenarios**:

1. **Given** a stack that renders successfully, **When** the operator requests
   its variables, **Then** the response maps each service to its sorted
   variable names and contains no values.
2. **Given** a stack that fails to render, **When** the operator requests its
   variables, **Then** the response reports the failure with the renderer's
   error message and returns no rendered content.
3. **Given** a rendered output larger than the configured output limit,
   **When** the operator requests its variables, **Then** the tool reports
   failure with guidance to raise the limit, instead of parsing a partial
   document.

---

### User Story 2 - Target a non-default stack file (Priority: P1)

An operator whose stack is defined in a file with a non-default name (for
example `stack.yml`) can point the compose status and variable tools at that
file, inside the allowed compose directory.

**Why this priority**: Without it, compose status returns the "no
configuration file" error the operator hit, and the variable check in Story 1
cannot reach the stack either.

**Independent Test**: Request compose status with a file name; the issued
command targets that file within the resolved directory.

**Acceptance Scenarios**:

1. **Given** a compose directory with `stack.yml`, **When** the operator
   requests compose status with that file name, **Then** status for that stack
   is returned.
2. **Given** no file name, **When** the operator requests compose status,
   **Then** behavior is unchanged from today (default file discovery).
3. **Given** a file name containing path separators, shell metacharacters, or
   other disallowed characters, **When** the request is made, **Then** it is
   rejected before anything runs on the host.

---

### User Story 3 - Check host dependencies (Priority: P2)

An operator asks which versions of the container engine, the compose plugin,
and `jq` are installed on the host. One fixed tool returns all three; a missing
tool is reported as not installed rather than failing the whole check.

**Why this priority**: Useful for diagnosis, but a missing dependency is
usually visible from other failures too.

**Independent Test**: Call the tool on a host without `jq`; the response still
shows the other versions and states `jq` is not installed.

**Acceptance Scenarios**:

1. **Given** all three are installed, **When** the operator checks
   dependencies, **Then** each version is reported.
2. **Given** `jq` is missing, **When** the operator checks dependencies,
   **Then** the response says `jq` is not installed and still reports the rest.

---

### Edge Cases

- A service defines no environment variables → it appears with an empty list.
- The rendered output is not valid structured data → the tool reports a parse
  failure and returns no raw content.
- The compose directory argument is missing and no default is configured → the
  request is rejected with the existing directory error.
- The file argument is an empty string → treated as absent.
- Variable names themselves never contain values; interpolated values are
  dropped even when the renderer substitutes them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT add any tool that accepts or executes
  free-form commands; every new capability is a fixed, read-only tool.
- **FR-002**: The system MUST provide a tool that renders a compose stack and
  returns, per service, only the sorted environment variable names.
- **FR-003**: The variable tool MUST NOT return variable values, raw rendered
  output, or partial output, on success or on any failure path.
- **FR-004**: The variable tool MUST report failure, without parsing, when the
  rendered output was truncated by the output limit.
- **FR-005**: The compose status and variable tools MUST accept an optional
  compose file name, validated with the same rules as container/service names,
  and resolved inside the allowed compose directory.
- **FR-006**: Omitting the file name MUST preserve the current compose status
  behavior.
- **FR-007**: The system MUST provide a tool that reports versions of the
  container engine, the compose plugin, and `jq`, reporting any missing one as
  not installed.
- **FR-008**: New tools MUST be registered as read-only (non-destructive,
  idempotent) and available without enabling mutations.
- **FR-009**: The README tool table MUST document the new tools and the new
  file argument.

### Key Entities

- **Stack variable report**: mapping of service name → sorted list of
  environment variable names. Contains no values.
- **Dependency report**: version line per dependency, or a "not installed"
  marker.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The full diagnosis from the operator's session (connectivity,
  compose status, dependencies, stack variables) completes using only MCP
  tools, with zero manual SSH steps.
- **SC-002**: In tests seeded with known secret values, 0 values appear in any
  variable tool response, across success, render failure, parse failure, and
  truncation paths.
- **SC-003**: 100% of disallowed file names in tests are rejected before any
  remote command is issued.
- **SC-004**: The read-only tool catalog grows by exactly the two new tools; the
  mutation catalog is unchanged.

## Assumptions

- The host runs compose v2 as a plugin of the container engine; v1 standalone
  compose is out of scope.
- The renderer can emit structured (JSON) output; `jq` is only checked for
  presence, not used by the server, so the variable report works even without it.
- File names are bare names inside the compose directory; nested paths are out
  of scope.
- The existing output size limit (`VPS_LOG_MAX_BYTES`) also bounds rendered
  stack output; no new setting is added.
- Implementation already exists as uncommitted work on `feature/update-docs`
  (`compose_config_vars`, `host_deps`, `file` arg); planning should verify it
  against this spec and fill test gaps rather than rebuild.
