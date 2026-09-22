# vps-ops-mcp

A stdio [MCP](https://modelcontextprotocol.io) server that operates one VPS over SSH. Cursor and Codex start the process with `bun` and call read-only tools (host health, Unix debug, Docker, Compose, Swarm, firewall) plus mutation tools (restart, stop, start, prune). Mutations require an explicit confirmation.

Transport is stdio. Do not start the server as a long-lived process by hand: the client (Cursor or Codex) launches it.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) (branches, pull requests, verification) and [ISSUE.md](./ISSUE.md) (how to file an issue).

## Requirements

- [Bun](https://bun.sh)
- Python 3 (used by the registration scripts)
- OpenSSH client (`ssh` on `PATH`)
- A readable SSH private key with access to the remote user
- On the remote host: Docker (and passwordless `sudo -n` for `ufw`, `fail2ban`, `sshd -T`, `ss`, and `dmesg` if you use those tools)

## Configuration

```bash
cp .env.example .env
```

Edit `.env`. The file is gitignored.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VPS_SSH_KEY_PATH` | yes | — | Absolute path to the private key. The process refuses to start if the file is missing or unreadable. |
| `VPS_HOST` | no | `vps.example.invalid` | SSH host (placeholder; set your own host). |
| `VPS_USER` | no | `ubuntu` | SSH user. |
| `VPS_PORT` | no | `22` | SSH port. |
| `VPS_COMPOSE_DIR` | no | — | Absolute Compose directory **on the VPS**. Without it, Compose tools require the `dir` argument. |
| `VPS_COMMAND_TIMEOUT_MS` | no | `30000` | Remote command timeout. Expiry returns `exit_code` 124. |
| `VPS_LOG_MAX_BYTES` | no | `200000` | Cap for `stdout`/`stderr`. Overflow is cut and `truncated` is `true`. |
| `VPS_ALLOW_MUTATIONS` | no | `true` | `false`, `0`, `no`, or `off` disables every mutation. |
| `VPS_SSH_KEY_PASSPHRASE` | no | — | Avoid. Prefer `ssh-agent`. Registration scripts **do not** copy this variable into the client. |

`VPS_COMPOSE_DIR` must be absolute and match `/^[a-zA-Z0-9/_.-]+$/` (it must start with `/`).

## Installation

```bash
bun install
```

npm package (requires [Bun](https://bun.sh); the MCP Registry points at this artifact):

```bash
bunx @koller-nexus/vps-ops-mcp
```

MCP Registry name: `io.github.koller-nexus/vps-ops-mcp`. The registry publishes metadata only after the package exists on public npm.

## Register with clients

The scripts write MCP config from variables **already exported in the shell**. They do not load `.env` themselves. If you skip the export, the scripts fall back to their defaults (host, user, port, and a local key path).

Do this once at the repository root before each script:

```bash
set -a
source .env
set +a
```

Each run backs up the destination file (`*.bak.YYYYMMDDHHMMSS`) and replaces only the `vps-ops` server. Other MCP servers stay in place.

Optional script variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `MCP_PROJECT_DIR` | this repository root | Source of the `src/index.ts` path. |
| `CURSOR_MCP_JSON` | `~/.cursor/mcp.json` | Cursor file to update. |
| `CODEX_CONFIG` | `~/.codex/config.toml` | Codex file to update. |

`VPS_COMPOSE_DIR` is written into the client config only when it is set and non-empty.

### Cursor

Global registration (applies in every workspace):

```bash
./scripts/register-cursor-mcp.sh
```

The script writes `~/.cursor/mcp.json` in this shape:

```json
{
  "mcpServers": {
    "vps-ops": {
      "command": "bun",
      "args": ["/absolute/path/vps-ops-mcp/src/index.ts"],
      "env": {
        "VPS_HOST": "your.host",
        "VPS_USER": "ubuntu",
        "VPS_PORT": "22",
        "VPS_SSH_KEY_PATH": "/absolute/path/to/key",
        "VPS_COMMAND_TIMEOUT_MS": "30000",
        "VPS_LOG_MAX_BYTES": "200000",
        "VPS_ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

To scope it to one project, point the script at that project's `mcp.json`:

```bash
CURSOR_MCP_JSON="/absolute/path/to/project/.cursor/mcp.json" ./scripts/register-cursor-mcp.sh
```

Then reload the Cursor window (Command Palette → **Developer: Reload Window**) or restart the server under **Settings → MCP**. The server appears as `vps-ops`.

### Codex

```bash
./scripts/register-codex-mcp.sh
```

The script writes `~/.codex/config.toml`:

```toml
[mcp_servers.vps-ops]
command = "bun"
args = ["/absolute/path/vps-ops-mcp/src/index.ts"]

[mcp_servers.vps-ops.env]
VPS_HOST = "your.host"
VPS_USER = "ubuntu"
VPS_PORT = "22"
VPS_SSH_KEY_PATH = "/absolute/path/to/key"
VPS_COMMAND_TIMEOUT_MS = "30000"
VPS_LOG_MAX_BYTES = "200000"
VPS_ALLOW_MUTATIONS = "true"
```

Close and reopen the Codex session so it rereads `config.toml`. If the CLI is on `PATH`, `codex mcp list` should show `vps-ops`.

## Verify

Test SSH outside MCP with the same flags the server uses:

```bash
ssh -i "$VPS_SSH_KEY_PATH" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=accept-new \
  -p "${VPS_PORT:-22}" \
  "${VPS_USER}@${VPS_HOST}" \
  'uname -a'
```

In Cursor or Codex, ask the client to call `vps_ping`. The response is JSON:

```json
{
  "exit_code": 0,
  "stdout": "...",
  "stderr": "",
  "duration_ms": 0,
  "truncated": false
}
```

A non-zero `exit_code` is an MCP error. If the process exits immediately with `VPS_SSH_KEY_PATH is required` or `missing or unreadable`, the variable never reached the client `env` — rerun the registration script with `.env` exported.

## Tools

Every call returns `exit_code`, `stdout`, `stderr`, `duration_ms`, and `truncated`.

### Read-only

| Tool | Arguments | What it does |
| --- | --- | --- |
| `vps_ping` | — | `uname -a`, `uptime`, `hostname`. |
| `vps_resources` | — | `df -h`, `free -h`, load average. |
| `vps_journal` | `unit`, `n?` (1–500, default 100) | `journalctl -u`. Unit from the allowlist (`docker`, `sshd`, `fail2ban`, `ufw`, `cron`, with or without `.service`) or a safe name ending in `.service`. |
| `docker_ps` | — | `docker ps -a` as JSON lines. |
| `docker_inspect` | `name` | `docker inspect`. |
| `docker_logs` | `name`, `n?` (1–1000, default 200), `since?` | `docker logs --tail --timestamps`. |
| `docker_stats` | — | `docker stats --no-stream`. |
| `docker_service_ls` | — | `docker service ls` as JSON lines (Swarm). |
| `docker_node_ls` | — | `docker node ls` as JSON lines (Swarm). |
| `compose_ps` | `dir?` | `docker compose ps` in `dir` or `VPS_COMPOSE_DIR`. |
| `host_listen` | — | `ss -lntup` (`sudo -n`, otherwise without sudo). |
| `host_failed_units` | — | `systemctl --failed --no-pager --full`. |
| `host_top` | — | Top 30 processes by memory (`ps aux --sort=-%mem`). |
| `host_dmesg` | `n?` (1–200, default 100) | `dmesg -T` + `tail` (`sudo -n`, otherwise without sudo). |
| `host_firewall` | — | `ufw status verbose` (`sudo -n`, otherwise without sudo). |
| `host_fail2ban` | `jail?` | `fail2ban-client status` (`sudo -n`). |
| `ssh_hardening_check` | — | Filtered `sshd -T`: port, password, root login, pubkey. |

Container, service, image, and jail names must match `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`.

### Mutation

These require `confirm: true`. With `VPS_ALLOW_MUTATIONS=false`, all of them are rejected.

| Tool | Extra arguments | Remote command |
| --- | --- | --- |
| `docker_restart` | `name` | `docker restart` |
| `docker_stop` | `name` | `docker stop` |
| `docker_start` | `name` | `docker start` |
| `compose_up` | `dir?`, `services?` | `docker compose up -d` |
| `compose_restart` | `dir?`, `services?` | `docker compose restart` |
| `compose_pull_up` | `dir?`, `services?` | `docker compose pull` then `up -d` |
| `docker_rm` | `name`, `force_name` | `docker rm -f`. `force_name` must equal `name`. |
| `disk_cleanup_docker` | `confirm_volumes?` | `docker system prune -f`. Volumes only with `confirm_volumes: true`. |

## Security

- Remote commands are fixed. There is no free-form shell tool.
- Name and path arguments go through an allowlist and are quoted in the shell.
- SSH uses `BatchMode=yes`, `IdentitiesOnly=yes`, and `StrictHostKeyChecking=accept-new`.
- A mutation without `confirm: true` is rejected. `docker_rm` asks for the name twice. Volume prune requires `confirm_volumes: true`.
- For a read-only client, register with `VPS_ALLOW_MUTATIONS=false`.
