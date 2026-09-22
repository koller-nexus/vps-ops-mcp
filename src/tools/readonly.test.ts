import { test, expect } from "bun:test";
import type { VpsConfig } from "../config.js";
import { buildReadonlyTools, resolveComposeDir } from "./readonly.js";

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
