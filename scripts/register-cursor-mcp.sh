#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${MCP_PROJECT_DIR:-$SCRIPT_DIR/..}" && pwd)"
ENTRY="$PROJECT_DIR/src/index.ts"
MCP_JSON="${CURSOR_MCP_JSON:-$HOME/.cursor/mcp.json}"
VPS_HOST="${VPS_HOST:-vps.example.invalid}"
VPS_USER="${VPS_USER:-ubuntu}"
VPS_PORT="${VPS_PORT:-22}"
VPS_SSH_KEY_PATH="${VPS_SSH_KEY_PATH:-/absolute/path/to/your_private_key}"
VPS_COMPOSE_DIR="${VPS_COMPOSE_DIR:-}"
VPS_ALLOW_MUTATIONS="${VPS_ALLOW_MUTATIONS:-true}"
VPS_COMMAND_TIMEOUT_MS="${VPS_COMMAND_TIMEOUT_MS:-30000}"
VPS_LOG_MAX_BYTES="${VPS_LOG_MAX_BYTES:-200000}"
command -v bun >/dev/null || { echo "Instale bun: https://bun.sh" >&2; exit 1; }
[[ -f "$ENTRY" ]] || { echo "Falta $ENTRY" >&2; exit 1; }
VPS_SSH_KEY_PATH="${VPS_SSH_KEY_PATH/#\~/$HOME}"
mkdir -p "$(dirname "$MCP_JSON")"
[[ -f "$MCP_JSON" ]] && cp "$MCP_JSON" "$MCP_JSON.bak.$(date +%Y%m%d%H%M%S)" || echo '{}' > "$MCP_JSON"
export ENTRY VPS_HOST VPS_USER VPS_PORT VPS_SSH_KEY_PATH VPS_COMPOSE_DIR \
  VPS_ALLOW_MUTATIONS VPS_COMMAND_TIMEOUT_MS VPS_LOG_MAX_BYTES MCP_JSON
python3 - << 'PY'
import json, os, pathlib
path = pathlib.Path(os.environ["MCP_JSON"])
data = json.loads(path.read_text() or "{}")
servers = data.setdefault("mcpServers", {})
env = {
    "VPS_HOST": os.environ["VPS_HOST"],
    "VPS_USER": os.environ["VPS_USER"],
    "VPS_PORT": os.environ["VPS_PORT"],
    "VPS_SSH_KEY_PATH": os.environ["VPS_SSH_KEY_PATH"],
    "VPS_COMMAND_TIMEOUT_MS": os.environ["VPS_COMMAND_TIMEOUT_MS"],
    "VPS_LOG_MAX_BYTES": os.environ["VPS_LOG_MAX_BYTES"],
    "VPS_ALLOW_MUTATIONS": os.environ["VPS_ALLOW_MUTATIONS"],
}
if os.environ.get("VPS_COMPOSE_DIR", "").strip():
    env["VPS_COMPOSE_DIR"] = os.environ["VPS_COMPOSE_DIR"].strip()
servers["vps-ops"] = {"command": "bun", "args": [os.environ["ENTRY"]], "env": env}
path.write_text(json.dumps(data, indent=2) + "\n")
print(f"OK: {path}")
PY