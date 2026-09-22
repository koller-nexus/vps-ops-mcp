import { afterEach, test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "./config.js";

const KEYS = [
  "VPS_HOST",
  "VPS_USER",
  "VPS_PORT",
  "VPS_SSH_KEY_PATH",
  "VPS_COMPOSE_DIR",
  "VPS_SSH_KEY_PASSPHRASE",
  "VPS_COMMAND_TIMEOUT_MS",
  "VPS_LOG_MAX_BYTES",
  "VPS_ALLOW_MUTATIONS",
] as const;

const saved = new Map<string, string | undefined>();

function snapshotEnv(): void {
  for (const key of KEYS) {
    saved.set(key, process.env[key]);
    delete process.env[key];
  }
}

function restoreEnv(): void {
  for (const key of KEYS) {
    const value = saved.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function writeKeyFile(): string {
  const dir = mkdtempSync(join(tmpdir(), "vps-ops-"));
  const path = join(dir, "id_test");
  writeFileSync(path, "dummy-key\n", { mode: 0o600 });
  return path;
}

afterEach(() => {
  restoreEnv();
});

test("requires VPS_SSH_KEY_PATH", () => {
  snapshotEnv();
  expect(() => loadConfig()).toThrow(/VPS_SSH_KEY_PATH is required/);
});

test("rejects unreadable SSH key path", () => {
  snapshotEnv();
  process.env.VPS_SSH_KEY_PATH = "/tmp/vps-ops-missing-key";
  expect(() => loadConfig()).toThrow(/missing or unreadable/);
});

test("loads defaults when only the key path is set", () => {
  snapshotEnv();
  const keyPath = writeKeyFile();
  process.env.VPS_SSH_KEY_PATH = keyPath;

  const config = loadConfig();
  expect(config.host).toBe("64.181.163.182");
  expect(config.user).toBe("ubuntu");
  expect(config.port).toBe(22);
  expect(config.sshKeyPath).toBe(keyPath);
  expect(config.commandTimeoutMs).toBe(30_000);
  expect(config.logMaxBytes).toBe(200_000);
  expect(config.allowMutations).toBe(true);
  expect(config.composeDir).toBeUndefined();
});

test("honors overrides and treats off as mutations disabled", () => {
  snapshotEnv();
  const keyPath = writeKeyFile();
  process.env.VPS_SSH_KEY_PATH = keyPath;
  process.env.VPS_HOST = "10.0.0.8";
  process.env.VPS_USER = "ops";
  process.env.VPS_PORT = "2222";
  process.env.VPS_COMPOSE_DIR = "/opt/stack";
  process.env.VPS_COMMAND_TIMEOUT_MS = "5000";
  process.env.VPS_LOG_MAX_BYTES = "1000";
  process.env.VPS_ALLOW_MUTATIONS = "off";

  const config = loadConfig();
  expect(config.host).toBe("10.0.0.8");
  expect(config.user).toBe("ops");
  expect(config.port).toBe(2222);
  expect(config.composeDir).toBe("/opt/stack");
  expect(config.commandTimeoutMs).toBe(5000);
  expect(config.logMaxBytes).toBe(1000);
  expect(config.allowMutations).toBe(false);
});

test("rejects invalid integer env", () => {
  snapshotEnv();
  process.env.VPS_SSH_KEY_PATH = writeKeyFile();
  process.env.VPS_PORT = "-1";
  expect(() => loadConfig()).toThrow(/Invalid VPS_PORT/);
});
