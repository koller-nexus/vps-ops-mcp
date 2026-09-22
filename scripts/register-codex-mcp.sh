#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${MCP_PROJECT_DIR:-$SCRIPT_DIR/..}" && pwd)"
ENTRY="$PROJECT_DIR/src/index.ts"
CODEX_CONFIG="${CODEX_CONFIG:-$HOME/.codex/config.toml}"
VPS_HOST="${VPS_HOST:-64.181.163.182}"
VPS_USER="${VPS_USER:-ubuntu}"
VPS_PORT="${VPS_PORT:-22}"
VPS_SSH_KEY_PATH="${VPS_SSH_KEY_PATH:-$HOME/Projects/oracle-keys/ssh-oracle.key}"
VPS_COMPOSE_DIR="${VPS_COMPOSE_DIR:-}"
VPS_ALLOW_MUTATIONS="${VPS_ALLOW_MUTATIONS:-true}"
VPS_COMMAND_TIMEOUT_MS="${VPS_COMMAND_TIMEOUT_MS:-30000}"
VPS_LOG_MAX_BYTES="${VPS_LOG_MAX_BYTES:-200000}"
command -v bun >/dev/null || { echo "Instale bun: https://bun.sh" >&2; exit 1; }
[[ -f "$ENTRY" ]] || { echo "Falta $ENTRY" >&2; exit 1; }
VPS_SSH_KEY_PATH="${VPS_SSH_KEY_PATH/#\~/$HOME}"
mkdir -p "$(dirname "$CODEX_CONFIG")"
[[ -f "$CODEX_CONFIG" ]] && cp "$CODEX_CONFIG" "$CODEX_CONFIG.bak.$(date +%Y%m%d%H%M%S)"
export ENTRY CODEX_CONFIG VPS_HOST VPS_USER VPS_PORT VPS_SSH_KEY_PATH \
  VPS_COMPOSE_DIR VPS_ALLOW_MUTATIONS VPS_COMMAND_TIMEOUT_MS VPS_LOG_MAX_BYTES
python3 - << 'PY'
from pathlib import Path
import os, re
path = Path(os.environ["CODEX_CONFIG"])
entry, host, user, port, key = (os.environ[k] for k in
    ("ENTRY","VPS_HOST","VPS_USER","VPS_PORT","VPS_SSH_KEY_PATH"))
compose = os.environ.get("VPS_COMPOSE_DIR","").strip()
allow, timeout, logmax = (os.environ[k] for k in
    ("VPS_ALLOW_MUTATIONS","VPS_COMMAND_TIMEOUT_MS","VPS_LOG_MAX_BYTES"))
text = path.read_text() if path.exists() else ""
text = re.sub(r"\n?\[mcp_servers\.vps-ops\][\s\S]*?(?=\n\[|\Z)", "\n", text).rstrip() + "

"
env_lines = [
    f'VPS_HOST = "{host}"', f'VPS_USER = "{user}"', f'VPS_PORT = "{port}"',
    f'VPS_SSH_KEY_PATH = "{key}"', f'VPS_COMMAND_TIMEOUT_MS = "{timeout}"',
    f'VPS_LOG_MAX_BYTES = "{logmax}"', f'VPS_ALLOW_MUTATIONS = "{allow}"',
]
if compose: env_lines.append(f'VPS_COMPOSE_DIR = "{compose}"')
block = (
    "[mcp_servers.vps-ops]\n"
    'command = "bun"\n'
    f'args = ["{entry}"]

'
    "[mcp_servers.vps-ops.env]\n" + "\n".join(env_lines) + "\n"
)
path.write_text(text + block)
print(f"OK: {path}")
PY