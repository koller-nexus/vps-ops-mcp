import { expect, test } from "bun:test";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const packagePath = resolve(root, "package.json");
const serverJsonPath = resolve(root, "server.json");
const versionPath = resolve(root, "VERSION");

const NPM_NAME = "@koller-nexus/vps-ops-mcp";
const MCP_NAME = "io.github.koller-nexus/vps-ops-mcp";
const REPO_URL = "https://github.com/koller-nexus/vps-ops-mcp";

const REQUIRED_ENV = [
  "VPS_SSH_KEY_PATH",
  "VPS_HOST",
  "VPS_USER",
  "VPS_PORT",
  "VPS_ALLOW_MUTATIONS",
] as const;

test("package.json is a public npm package with matching mcpName", async () => {
  const pkg = await Bun.file(packagePath).json();
  const version = (await Bun.file(versionPath).text()).trim();

  expect(pkg.private).toBeUndefined();
  expect(pkg.name).toBe(NPM_NAME);
  expect(pkg.mcpName).toBe(MCP_NAME);
  expect(pkg.version).toBe(version);
  expect(pkg.repository?.url).toContain(REPO_URL);
  expect(pkg.bin?.["vps-ops-mcp"]).toBe("src/index.ts");
  expect(pkg.publishConfig?.access).toBe("public");
});

test("server.json matches package.json and lists required env names", async () => {
  const pkg = await Bun.file(packagePath).json();
  const server = await Bun.file(serverJsonPath).json();

  expect(await Bun.file(serverJsonPath).exists()).toBe(true);
  expect(server.name).toBe(pkg.mcpName);
  expect(server.version).toBe(pkg.version);
  expect(server.description.length).toBeLessThanOrEqual(100);

  const npm = server.packages?.[0];
  expect(npm.registryType).toBe("npm");
  expect(npm.identifier).toBe(pkg.name);
  expect(npm.version).toBe(pkg.version);
  expect(npm.transport?.type).toBe("stdio");
  expect(npm.runtimeHint).toBe("bunx");

  const envNames = (npm.environmentVariables ?? []).map((e: { name: string }) => e.name);
  for (const name of REQUIRED_ENV) {
    expect(envNames).toContain(name);
  }

  const keyPath = npm.environmentVariables.find((e: { name: string }) => e.name === "VPS_SSH_KEY_PATH");
  expect(keyPath.isRequired).toBe(true);
  expect(keyPath.isSecret).toBe(true);
});
