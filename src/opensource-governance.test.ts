import { expect, test } from "bun:test";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const contributingPath = resolve(root, "CONTRIBUTING.md");
const issuePath = resolve(root, "ISSUE.md");
const licensePath = resolve(root, "LICENSE");
const workflowPath = resolve(root, ".github", "workflows", "pull_request.yml");
const envExamplePath = resolve(root, ".env.example");
const readmePath = resolve(root, "README.md");

const CONTRIBUTING_HEADINGS = [
  "# Contributing",
  "## Branch names",
  "## Pull requests",
  "## Verification",
  "## Issues",
] as const;

const CONTRIBUTING_TOKENS = [
  "feature/",
  "fix/",
  "refactor/",
  "main",
  "pull request",
  "ISSUE.md",
  "bun test",
  "bun run build",
  "Conventional Commits",
] as const;

const ISSUE_HEADINGS = [
  "# Filing an issue",
  "## Summary",
  "## Type",
  "## Expected versus actual",
  "## Reproduction or acceptance",
  "## Environment",
] as const;

const ISSUE_TOKENS = ["bug", "feature", "CONTRIBUTING.md"] as const;

const LICENSE_TOKENS = [
  "MIT License",
  "Permission is hereby granted, free of charge",
  "2026",
  'THE SOFTWARE IS PROVIDED "AS IS"',
] as const;

const LIVE_HOST = "64.181.163.182";

async function loadRequired(path: string, label: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`${label} is missing`);
  }
  return file.text();
}

function expectHeadings(text: string, headings: readonly string[]): void {
  let cursor = -1;
  for (const heading of headings) {
    const at = text.indexOf(heading);
    expect(at, heading).toBeGreaterThan(cursor);
    cursor = at;
  }
}

function expectTokens(text: string, tokens: readonly string[]): void {
  for (const token of tokens) {
    expect(text.includes(token), token).toBe(true);
  }
}

test("root contribution files exist", async () => {
  expect(await Bun.file(contributingPath).exists()).toBe(true);
  expect(await Bun.file(issuePath).exists()).toBe(true);
  expect(await Bun.file(licensePath).exists()).toBe(true);
});

test("pull request workflow runs test then build", async () => {
  const workflow = await loadRequired(workflowPath, "pull_request.yml");
  expect(workflow).toContain("pull_request");
  expect(workflow).toContain("Test and build");
  const testAt = workflow.indexOf("bun test");
  const buildAt = workflow.indexOf("bun run build");
  expect(testAt).toBeGreaterThan(-1);
  expect(buildAt).toBeGreaterThan(testAt);
});

test("CONTRIBUTING.md matches the contribution contract", async () => {
  const text = await loadRequired(contributingPath, "CONTRIBUTING.md");
  expectHeadings(text, CONTRIBUTING_HEADINGS);
  expectTokens(text, CONTRIBUTING_TOKENS);
});

test("ISSUE.md matches the issue-filing contract", async () => {
  const text = await loadRequired(issuePath, "ISSUE.md");
  expectHeadings(text, ISSUE_HEADINGS);
  expectTokens(text, ISSUE_TOKENS);
});

test("LICENSE is MIT", async () => {
  const text = await loadRequired(licensePath, "LICENSE");
  expectTokens(text, LICENSE_TOKENS);
});

test("example env and README omit the live host address", async () => {
  const envExample = await loadRequired(envExamplePath, ".env.example");
  const readme = await loadRequired(readmePath, "README.md");
  expect(envExample.includes(LIVE_HOST)).toBe(false);
  expect(readme.includes(LIVE_HOST)).toBe(false);
});
