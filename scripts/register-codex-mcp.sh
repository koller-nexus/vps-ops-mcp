#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${MCP_PROJECT_DIR:-$SCRIPT_DIR/..}" && pwd)"
ENTRY="$PROJECT_DIR/src/index.ts"
CODEX_CONFIG="${CODEX_CONFIG:-$HOME/.codex/config.toml}"
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
def toml_str(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'

text = path.read_text() if path.exists() else ""
text = re.sub(
    r"\n?\[mcp_servers\.vps-ops(?:\.env)?\][\s\S]*?(?=\n\[|\Z)",
    "\n",
    text,
).rstrip() + "\n\n"
env_lines = [
    f"VPS_HOST = {toml_str(host)}",
    f"VPS_USER = {toml_str(user)}",
    f"VPS_PORT = {toml_str(port)}",
    f"VPS_SSH_KEY_PATH = {toml_str(key)}",
    f"VPS_COMMAND_TIMEOUT_MS = {toml_str(timeout)}",
    f"VPS_LOG_MAX_BYTES = {toml_str(logmax)}",
    f"VPS_ALLOW_MUTATIONS = {toml_str(allow)}",
]
if compose:
    env_lines.append(f"VPS_COMPOSE_DIR = {toml_str(compose)}")
block = (
    "[mcp_servers.vps-ops]\n"
    'command = "bun"\n'
    f"args = [{toml_str(entry)}]\n\n"
    "[mcp_servers.vps-ops.env]\n" + "\n".join(env_lines) + "\n"
)
path.write_text(text + block)
print(f"OK: {path}")
PY