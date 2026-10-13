# MCP Tool Contracts

All tools are read-only, always registered, and take no free-form commands.

## compose_ps

| Arg | Type | Rule |
|-----|------|------|
| `dir` | string? | absolute; falls back to `VPS_COMPOSE_DIR`; else error |
| `file` | string? | `/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/`; `""` = absent |

Remote: `cd '<dir>' && docker compose [-f '<file>'] ps`

## compose_config_vars

Args: same as `compose_ps`.

Remote: `cd '<dir>' && docker compose [-f '<file>'] config --format json`

Output: see [data-model.md](../data-model.md#stack-variable-report-compose_config_vars-stdout-on-success).

## host_deps

Args: none.

Remote: `docker --version; docker compose version; jq --version 2>&1 || echo 'jq: not installed'`

## Errors

- Invalid `file` → `Invalid file "<value>". Must match /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/`,
  thrown before SSH.
- Missing dir → existing `resolveComposeDir` error, thrown before SSH.
