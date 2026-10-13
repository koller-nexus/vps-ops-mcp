# Data Model: Read-only Stack Diagnostics

All tools return the existing `SshResult`:
`{ exit_code, stdout, stderr, duration_ms, truncated }`.

## Stack variable report (`compose_config_vars` stdout on success)

JSON object: service name → sorted array of environment variable names.

```json
{ "api": ["A", "DB_PASS"], "web": [] }
```

Rules:
- Values are never present.
- A service with no `environment` maps to `[]`.
- A stack with no `services` returns `{}`.

| Input state | exit_code | stdout | stderr |
|-------------|-----------|--------|--------|
| render ok, parse ok | 0 | report | passthrough |
| render failed (exit ≠ 0) | original | `""` | compose stderr |
| truncated | 1 | `""` | `Rendered config exceeded VPS_LOG_MAX_BYTES; raise it to inspect variables.` |
| invalid JSON | 1 | `""` | `Could not parse docker compose config JSON.` |

## Dependency report (`host_deps` stdout)

Plain text, one line per tool: `docker --version`, `docker compose version`,
`jq --version`, or `jq: not installed`.
