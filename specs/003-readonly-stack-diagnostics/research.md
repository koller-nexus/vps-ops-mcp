# Research: Read-only Stack Diagnostics

## R1. How to strip values from the rendered stack

- **Decision**: Run `docker compose config --format json` and parse it in the
  server; return `Object.keys(service.environment)` sorted per service.
- **Rationale**: Compose v2 normalizes `environment` and `env_file` into a map
  in JSON output, so keys are the full set of names. Parsing in-process means
  values never reach the MCP response; no host-side `jq` dependency.
- **Alternatives**: Pipe through `jq` on the host (rejected: depends on jq being
  present, and a jq failure could fall back to raw output); `--no-interpolate`
  (rejected: still emits literal values from the file).

## R2. Failure paths must not leak

- **Decision**: On non-zero exit, return stderr only with stdout cleared. On
  truncation or parse failure, return exit 1, empty stdout, and a fixed English
  message.
- **Rationale**: A truncated JSON document can't be parsed safely, and raw
  stdout may contain values.
- **Accepted risk**: compose's own stderr (e.g., YAML syntax errors) is passed
  through for diagnosis. Compose errors name keys and line numbers, not
  resolved values. Revisit if a leak is observed.

## R3. Targeting `stack.yml`

- **Decision**: Optional `file` arg → `-f <quoted name>`, validated with the
  existing `assertContainerOrServiceName` (no `/`, no shell metacharacters), and
  run after `cd` into the validated compose dir.
- **Rationale**: Reuses an existing validator; a bare name stays inside the
  allowed dir. Empty string = absent, so default discovery is preserved.
- **Alternatives**: New path validator (rejected: more surface for no need).

## R4. Test gaps against the spec

Already covered: names-only success, parse failure, invalid `file` rejected.
Missing:

1. Truncated output → exit 1, empty stdout, guidance message (FR-004).
2. Non-zero exit → stdout cleared, stderr kept (FR-003).
3. `composeCmd` without `file` = today's `cd '<dir>' && docker compose` (FR-006); with
   `file` adds `-f 'stack.yml'` (FR-005). Export `composeCmd` for a pure test;
   `runSsh` isn't injectable and adding a port is out of scope.
4. Read-only catalog includes `compose_config_vars` and `host_deps`, neither
   flagged `mutation`; mutation catalog unchanged (FR-008, SC-004).
5. `host_deps` command contains the jq "not installed" fallback (FR-007).

## R5. "Read-only" registration

- **Decision**: In this codebase, read-only means a tool from
  `buildReadonlyTools` with no `mutation` flag, always registered regardless of
  `VPS_ALLOW_MUTATIONS`.
- **Note**: MCP annotations (`readOnlyHint`, etc.) aren't registered for any
  tool today. That's an existing gap and out of scope here (principle VI).
