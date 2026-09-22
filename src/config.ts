import { accessSync, constants } from "node:fs";

export interface VpsConfig {
  host: string;
  user: string;
  port: number;
  sshKeyPath: string;
  sshKeyPassphrase?: string;
  composeDir?: string;
  commandTimeoutMs: number;
  logMaxBytes: number;
  allowMutations: boolean;
}

function envBool(name: string, defaultValue: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return defaultValue;
  return !["0", "false", "no", "off"].includes(v.toLowerCase());
}

function envInt(name: string, defaultValue: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") return defaultValue;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid ${name}=${v}; expected non-negative integer`);
  }
  return n;
}

export function loadConfig(): VpsConfig {
  const host = process.env.VPS_HOST?.trim() || "vps.example.invalid";
  const user = process.env.VPS_USER?.trim() || "ubuntu";
  const port = envInt("VPS_PORT", 22);
  const sshKeyPath = process.env.VPS_SSH_KEY_PATH?.trim();

  if (!sshKeyPath) {
    throw new Error(
      "VPS_SSH_KEY_PATH is required. Set it to the absolute path of your SSH private key."
    );
  }

  try {
    accessSync(sshKeyPath, constants.R_OK);
  } catch {
    throw new Error(
      `VPS_SSH_KEY_PATH is missing or unreadable: ${sshKeyPath}`
    );
  }

  const composeDir = process.env.VPS_COMPOSE_DIR?.trim() || undefined;
  const sshKeyPassphrase =
    process.env.VPS_SSH_KEY_PASSPHRASE?.trim() || undefined;

  return {
    host,
    user,
    port,
    sshKeyPath,
    sshKeyPassphrase,
    composeDir,
    commandTimeoutMs: envInt("VPS_COMMAND_TIMEOUT_MS", 30_000),
    logMaxBytes: envInt("VPS_LOG_MAX_BYTES", 200_000),
    allowMutations: envBool("VPS_ALLOW_MUTATIONS", true),
  };
}