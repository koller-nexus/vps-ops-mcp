import { expect, test } from "bun:test";
import { resolve } from "node:path";

const agentsPath = resolve(import.meta.dir, "..", "AGENTS.md");

const REQUIRED_HEADINGS = [
  "# VPS Ops MCP Agent Construction Guide",
  "## Purpose",
  "## Authority",
  "## Skill routing",
  "## Product shape",
  "## Operator capabilities",
  "## Proof",
  "## Delivery and operations",
  "## Public release",
  "## Construction sequence",
  "## Anti-patterns",
  "## Human setup",
] as const;

const US1_TOKENS = [
  "constitution wins",
  "mcp-builder",
  ".agents/skills/mcp-builder/SKILL.md",
  "devops-engineer",
  ".agents/skills/devops-engineer/SKILL.md",
  "opensource-pipeline",
  ".agents/skills/opensource-pipeline/SKILL.md",
  "speckit-",
  "test-driven-development",
  "verification-before-completion",
  "client-launched",
  "README.md",
] as const;

const US2_TOKENS = [
  "vps_",
  "confirm:true",
  "VPS_ALLOW_MUTATIONS",
  "readOnlyHint",
  "destructiveHint",
  "idempotentHint",
  "openWorldHint",
  "next corrective",
  "bun test",
  "timeout",
  "byte cap",
] as const;

const US3_TOKENS = [
  "explicit human approval",
  "rollback",
  "MUST NOT apply undocumented host",
] as const;

const US4_TOKENS = ["sanitizer", "staging", "MUST NOT commit secrets"] as const;

async function loadAgents(): Promise<string> {
  const file = Bun.file(agentsPath);
  if (!(await file.exists())) {
    throw new Error("AGENTS.md is missing");
  }
  return file.text();
}

function sectionBetween(text: string, start: string, end: string): string {
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  expect(from).toBeGreaterThan(-1);
  expect(to).toBeGreaterThan(from);
  return text.slice(from, to);
}

function expectTokens(text: string, tokens: readonly string[]): void {
  for (const token of tokens) {
    expect(text.includes(token), token).toBe(true);
  }
}

test("AGENTS.md exists", async () => {
  expect(await Bun.file(agentsPath).exists()).toBe(true);
});

test("AGENTS.md headings appear in contract order", async () => {
  const text = await loadAgents();
  let last = -1;
  for (const heading of REQUIRED_HEADINGS) {
    const idx = text.indexOf(heading);
    expect(idx).toBeGreaterThan(last);
    last = idx;
  }
});

test("AGENTS.md includes US1 construction tokens", async () => {
  expectTokens(await loadAgents(), US1_TOKENS);
});

test("AGENTS.md includes US2 operator and proof tokens", async () => {
  expectTokens(await loadAgents(), US2_TOKENS);
});

test("Proof section forbids a live host as automated proof", async () => {
  const proof = sectionBetween(
    await loadAgents(),
    "## Proof",
    "## Delivery and operations"
  );
  expect(proof.includes("MUST NOT")).toBe(true);
  expect(proof.includes("live host")).toBe(true);
});

test("AGENTS.md includes US3 delivery tokens", async () => {
  expectTokens(await loadAgents(), US3_TOKENS);
});

test("AGENTS.md includes US4 public-release tokens", async () => {
  expectTokens(await loadAgents(), US4_TOKENS);
});

test("AGENTS.md has no live secrets or host identity", async () => {
  const text = await loadAgents();
  expect(text).not.toMatch(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
  expect(text).not.toMatch(/\/Users\/\S+\.(pem|key)|BEGIN (OPENSSH |RSA )?PRIVATE KEY/i);
  expect(text).not.toMatch(/VPS_SSH_KEY_PASSPHRASE=\S+/);
});
