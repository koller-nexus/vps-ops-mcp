import { test, expect } from "bun:test";
import type { VpsConfig } from "../config.js";
import { buildMutationTools } from "./mutations.js";

const disabled: VpsConfig = {
  host: "127.0.0.1",
  user: "ubuntu",
  port: 22,
  sshKeyPath: "/tmp/unused-key",
  commandTimeoutMs: 30_000,
  logMaxBytes: 200_000,
  allowMutations: false,
};

const enabled: VpsConfig = { ...disabled, allowMutations: true };

const mutationNames = [
  "docker_restart",
  "docker_stop",
  "docker_start",
  "compose_up",
  "compose_restart",
  "compose_pull_up",
  "docker_rm",
  "disk_cleanup_docker",
] as const;

test.each([...mutationNames])("exposes mutation tool %s", (name) => {
  const tool = buildMutationTools(enabled).find((t) => t.name === name);
  expect(tool).toBeDefined();
  expect(tool?.mutation).toBe(true);
});

test("refuses mutations when VPS_ALLOW_MUTATIONS is false", async () => {
  const tool = buildMutationTools(disabled).find((t) => t.name === "docker_restart");
  await expect(tool!.handler({ name: "web", confirm: true })).rejects.toThrow(
    /Mutations disabled/
  );
});

test("refuses mutations without confirm:true", async () => {
  const tool = buildMutationTools(enabled).find((t) => t.name === "docker_stop");
  await expect(tool!.handler({ name: "web", confirm: false })).rejects.toThrow(
    /Mutation refused/
  );
});

test("docker_rm requires force_name to match name", async () => {
  const tool = buildMutationTools(enabled).find((t) => t.name === "docker_rm");
  await expect(
    tool!.handler({ name: "web", force_name: "other", confirm: true })
  ).rejects.toThrow(/force_name/);
});

test("rejects unsafe docker mutation names before SSH", async () => {
  const tool = buildMutationTools(enabled).find((t) => t.name === "docker_start");
  await expect(
    tool!.handler({ name: "web; rm -rf /", confirm: true })
  ).rejects.toThrow(/Invalid name/);
});
