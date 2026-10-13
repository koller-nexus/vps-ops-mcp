#!/usr/bin/env bash
# Publish @koller-nexus/vps-ops-mcp to npm, then server.json to the MCP Registry.
# npm login and mcp-publisher login github are interactive. Do not put tokens here.

set -euo pipefail

usage() {
  echo "Usage: $0 [--yes]"
  echo "Log in to npm (if needed), publish the public package, then login and publish via mcp-publisher."
}

YES=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    -y|--yes)
      YES=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1. Install it, then retry." >&2
    exit 1
  fi
}

require_cmd npm
require_cmd mcp-publisher
require_cmd bun

if [ ! -f "$ROOT/package.json" ] || [ ! -f "$ROOT/server.json" ] || [ ! -f "$ROOT/VERSION" ]; then
  echo "Missing package.json, server.json, or VERSION in $ROOT." >&2
  exit 1
fi

PKG_NAME="$(bun -e 'console.log(require("./package.json").name)')"
PKG_VERSION="$(bun -e 'console.log(require("./package.json").version)')"
FILE_VERSION="$(tr -d '[:space:]' < VERSION)"
SERVER_VERSION="$(bun -e 'console.log(require("./server.json").version)')"
PACKAGE_VERSION="$(bun -e 'console.log(require("./server.json").packages[0].version)')"

if [ "$PKG_VERSION" != "$FILE_VERSION" ] || [ "$PKG_VERSION" != "$SERVER_VERSION" ] || [ "$PKG_VERSION" != "$PACKAGE_VERSION" ]; then
  echo "Version mismatch. Align VERSION, package.json, and server.json, then retry." >&2
  echo "  VERSION=$FILE_VERSION package.json=$PKG_VERSION server.json=$SERVER_VERSION packages[0]=$PACKAGE_VERSION" >&2
  exit 1
fi

if [ "$YES" -ne 1 ]; then
  printf "Publish %s@%s to npm and the MCP Registry? [y/N] " "$PKG_NAME" "$PKG_VERSION"
  read -r answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *)
      echo "Aborted. Re-run with --yes after explicit approval."
      exit 1
      ;;
  esac
fi

if ! npm whoami >/dev/null 2>&1; then
  echo "npm is not authenticated. Starting npm login..."
  npm login
fi

NPM_USER="$(npm whoami)"
echo "npm user: $NPM_USER"

npm publish --access public

echo "Logging in to the MCP Registry (GitHub device flow)..."
mcp-publisher login github
mcp-publisher publish

echo "Published $PKG_NAME@$PKG_VERSION to npm and the MCP Registry."
