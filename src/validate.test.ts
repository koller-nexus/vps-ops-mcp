import { test, expect } from "bun:test";
import {
  assertComposeDir,
  assertContainerOrServiceName,
  assertJournalUnit,
  clampInt,
} from "./validate.js";

test.each(["web", "nginx.1", "stack_svc-a"])(
  "accepts container or service name %s",
  (name) => {
    expect(assertContainerOrServiceName(name)).toBe(name);
  }
);

test.each(["", "-bad", "has space", "../etc", "a/b"])(
  "rejects container or service name %s",
  (name) => {
    expect(() => assertContainerOrServiceName(name)).toThrow(/Invalid name/);
  }
);

test("uses custom label in invalid name error", () => {
  expect(() => assertContainerOrServiceName("bad name", "jail")).toThrow(
    /Invalid jail/
  );
});

test("accepts absolute compose dir", () => {
  expect(assertComposeDir("/opt/stack")).toBe("/opt/stack");
});

test.each(["opt/stack", "/opt/stack with space", "/opt/$stack"])(
  "rejects compose dir %s",
  (path) => {
    expect(() => assertComposeDir(path)).toThrow(/Invalid compose dir/);
  }
);

test.each([
  "docker",
  "sshd.service",
  "fail2ban",
  "custom.service",
])("accepts journal unit %s", (unit) => {
  expect(assertJournalUnit(unit)).toBe(unit);
});

test.each(["nginx", "rm -rf", "docker.timer"])(
  "rejects journal unit %s",
  (unit) => {
    expect(() => assertJournalUnit(unit)).toThrow(/not allowed/);
  }
);

test("clampInt bounds and truncates", () => {
  expect(clampInt(50, 1, 200)).toBe(50);
  expect(clampInt(0, 1, 200)).toBe(1);
  expect(clampInt(999, 1, 200)).toBe(200);
  expect(clampInt(12.9, 1, 200)).toBe(12);
  expect(clampInt(Number.NaN, 1, 200)).toBe(1);
});
