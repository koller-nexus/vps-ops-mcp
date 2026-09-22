import { spawn } from "node:child_process";
import type { VpsConfig } from "./config.js";

export interface SshResult {
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  truncated: boolean;
}

function truncate(text: string, maxBytes: number): { text: string; truncated: boolean } {
  const buf = Buffer.from(text, "utf8");
  if (buf.length <= maxBytes) return { text, truncated: false };
  const sliced = buf.subarray(0, maxBytes).toString("utf8");
  return {
    text: sliced + `\n…[truncated ${buf.length - maxBytes} bytes]`,
    truncated: true,
  };
}

export function runSsh(
  config: VpsConfig,
  remoteCommand: string,
  timeoutMs?: number
): Promise<SshResult> {
  const timeout = timeoutMs ?? config.commandTimeoutMs;
  const started = Date.now();

  const args = [
    "-i",
    config.sshKeyPath,
    "-o",
    "BatchMode=yes",
    "-o",
    "IdentitiesOnly=yes",
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-p",
    String(config.port),
    `${config.user}@${config.host}`,
    "--",
    remoteCommand,
  ];

  return new Promise((resolve) => {
    const child = spawn("ssh", args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, timeout);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      const duration_ms = Date.now() - started;
      const out = truncate(stdout, config.logMaxBytes);
      const errT = truncate(
        stderr + (stderr ? "\n" : "") + String(err),
        config.logMaxBytes
      );
      resolve({
        exit_code: 127,
        stdout: out.text,
        stderr: errT.text,
        duration_ms,
        truncated: out.truncated || errT.truncated,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const duration_ms = Date.now() - started;
      if (killed) {
        stderr +=
          (stderr ? "\n" : "") +
          `Command timed out after ${timeout}ms and was killed.`;
      }
      const out = truncate(stdout, config.logMaxBytes);
      const errT = truncate(stderr, config.logMaxBytes);
      resolve({
        exit_code: killed ? 124 : code ?? 1,
        stdout: out.text,
        stderr: errT.text,
        duration_ms,
        truncated: out.truncated || errT.truncated,
      });
    });
  });
}

export function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}