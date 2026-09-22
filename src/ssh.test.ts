import { test, expect } from "bun:test";
import { shellQuote } from "./ssh.js";

test("quotes a simple token", () => {
  expect(shellQuote("nginx")).toBe("'nginx'");
});

test("escapes single quotes for POSIX shells", () => {
  expect(shellQuote("it's")).toBe(`'it'\\''s'`);
});
