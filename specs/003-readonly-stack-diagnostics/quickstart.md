# Quickstart: Validate Read-only Stack Diagnostics

## Offline (CI gate)

```sh
bun test src/tools/readonly.test.ts
bun test
bunx tsc --noEmit
```

Expected: all pass. The tests from [research.md R4](./research.md) exist and cover
the truncation, render failure, command shape, catalog, and jq fallback cases.

## Live (manual, optional, read-only)

Prerequisites: MCP client configured with `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY_PATH`.
A compose dir on the VPS containing `stack.yml`.

1. `vps_ping` → exit 0.
2. `host_deps` → three lines; missing jq shows `jq: not installed`.
3. `compose_ps { dir: "/opt/stack", file: "stack.yml" }` → service status, not
   "no configuration file provided".
4. `compose_config_vars { dir: "/opt/stack", file: "stack.yml" }` → JSON of
   names per service; grep the response for a known secret value → no match.
5. `compose_config_vars { file: "../x" }` → `Invalid file` error, no SSH call.

Contracts: [contracts/tools.md](./contracts/tools.md).
