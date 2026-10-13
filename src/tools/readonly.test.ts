import { test, expect } from "bun:test";
import type { VpsConfig } from "../config.js";
import {
  HOST_DEPS_CMD,
  buildReadonlyTools,
  composeCmd,
  envNamesOnly,
  resolveComposeDir,
} from "./readonly.js";

const config: VpsConfig = {
  host: "127.0.0.1",
  user: "ubuntu",
  port: 22,
  sshKeyPath: "/tmp/unused-key",
  commandTimeoutMs: 30_000,
  logMaxBytes: 200_000,
  allowMutations: false,
};

test("exposes docker_service_ls as a readonly swarm service list", () => {
  const tool = buildReadonlyTools(config).find((t) => t.name === "docker_service_ls");
  expect(tool).toBeDefined();
  expect(tool?.mutation).toBeFalsy();
  expect(tool?.inputSchema.parse({})).toEqual({});
});

const dailyDebugTools = [
  "host_listen",
  "host_failed_units",
  "host_top",
  "host_dmesg",
  "docker_node_ls",
] as const;

test.each([...dailyDebugTools])("exposes readonly debug tool %s", (name) => {
  const tool = buildReadonlyTools(config).find((t) => t.name === name);
  expect(tool).toBeDefined();
  expect(tool?.mutation).toBeFalsy();
});

test("host_dmesg accepts optional n", () => {
  const tool = buildReadonlyTools(config).find((t) => t.name === "host_dmesg");
  expect(tool?.inputSchema.parse({})).toEqual({});
  expect(tool?.inputSchema.parse({ n: 50 })).toEqual({ n: 50 });
});

test("resolveComposeDir uses argument or config and rejects missing dir", () => {
  expect(resolveComposeDir({ ...config, composeDir: "/opt/stack" })).toBe(
    "/opt/stack"
  );
  expect(resolveComposeDir(config, "/srv/app")).toBe("/srv/app");
  expect(() => resolveComposeDir(config)).toThrow(/compose dir required/);
});

test("vps_journal rejects units outside the allowlist before SSH", async () => {
  const tool = buildReadonlyTools(config).find((t) => t.name === "vps_journal");
  await expect(tool!.handler({ unit: "nginx" })).rejects.toThrow(/not allowed/);
});

test("docker_logs rejects unsafe since values before SSH", async () => {
  const tool = buildReadonlyTools(config).find((t) => t.name === "docker_logs");
  await expect(
    tool!.handler({ name: "web", since: "1h; cat /etc/shadow" })
  ).rejects.toThrow(/Invalid since/);
});

const ok = { exit_code: 0, stderr: "", duration_ms: 1, truncated: false };

test("compose_config_vars returns sorted variable names per service", () => {
  const stdout = JSON.stringify({
    services: { api: { environment: { DB_PASS: "s3cret", A: null } }, web: {} },
  });
  const out = envNamesOnly({ ...ok, stdout });
  expect(JSON.parse(out.stdout)).toEqual({ api: ["A", "DB_PASS"], web: [] });
  expect(out.stdout).not.toContain("s3cret");
});

test("compose_config_vars reports invalid JSON as failure", () => {
  const out = envNamesOnly({ ...ok, stdout: "PASS=s3cret" });
  expect(out.exit_code).toBe(1);
  expect(out.stdout).toBe("");
  expect(out.stderr).toBe("Could not parse docker compose config JSON.");
});

test("compose_config_vars reports truncated output as failure without parsing", () => {
  const out = envNamesOnly({
    ...ok,
    stdout: '{"services":{"api":{"environment":{"P":"s3cret"',
    truncated: true,
  });
  expect(out.exit_code).toBe(1);
  expect(out.stdout).toBe("");
  expect(out.stderr).toBe(
    "Rendered config exceeded VPS_LOG_MAX_BYTES; raise it to inspect variables."
  );
});

test("compose_config_vars clears stdout when render fails", () => {
  const out = envNamesOnly({
    ...ok,
    exit_code: 14,
    stdout: "P=s3cret",
    stderr: "service api: invalid",
  });
  expect(out.exit_code).toBe(14);
  expect(out.stdout).toBe("");
  expect(out.stderr).toBe("service api: invalid");
});

test("compose_config_vars returns empty map when stack has no services", () => {
  expect(JSON.parse(envNamesOnly({ ...ok, stdout: "{}" }).stdout)).toEqual({});
});

const stackConfig = { ...config, composeDir: "/opt/stack" };

test("composeCmd keeps default discovery without file", () => {
  expect(composeCmd(stackConfig, {})).toBe("cd '/opt/stack' && docker compose");
  expect(composeCmd(stackConfig, { file: "" })).toBe("cd '/opt/stack' && docker compose");
});

test("composeCmd adds quoted -f for file", () => {
  expect(composeCmd(stackConfig, { file: "stack.yml" })).toBe(
    "cd '/opt/stack' && docker compose -f 'stack.yml'"
  );
});

test("compose tools reject unsafe file names before SSH", async () => {
  const tools = buildReadonlyTools(stackConfig);
  for (const name of ["compose_config_vars", "compose_ps"]) {
    const tool = tools.find((t) => t.name === name)!;
    for (const file of ["../etc/x; id", "a/b.yml", "$(id)"]) {
      await expect(tool.handler({ file })).rejects.toThrow(/Invalid file/);
    }
  }
});

test("host_deps is a readonly tool with no arguments", () => {
  const tool = buildReadonlyTools(config).find((t) => t.name === "host_deps");
  expect(tool?.mutation).toBeFalsy();
  expect(() => tool!.inputSchema.parse({})).not.toThrow();
  expect(HOST_DEPS_CMD).toContain("jq --version 2>&1 || echo 'jq: not installed'");
});

test("readonly catalog includes stack diagnostics tools without mutation flag", () => {
  const tools = buildReadonlyTools(config);
  const names = tools.map((t) => t.name);
  expect(names).toContain("compose_config_vars");
  expect(names).toContain("host_deps");
  expect(tools.some((t) => t.mutation)).toBe(false);
});
