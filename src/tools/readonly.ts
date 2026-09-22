import { z } from "zod";
import type { VpsConfig } from "../config.js";
import { runSsh, shellQuote, type SshResult } from "../ssh.js";
import {
  assertComposeDir,
  assertContainerOrServiceName,
  assertJournalUnit,
  clampInt,
} from "../validate.js";

export type ToolHandler = (args: Record<string, unknown>) => Promise<SshResult>;

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: ToolHandler;
  mutation?: boolean;
}

function resolveComposeDir(config: VpsConfig, dir?: string): string {
  const raw = dir?.trim() || config.composeDir;
  if (!raw) {
    throw new Error(
      "compose dir required: pass `dir` or set VPS_COMPOSE_DIR to an absolute path on the VPS"
    );
  }
  return assertComposeDir(raw);
}

export function buildReadonlyTools(config: VpsConfig): ToolDef[] {
  return [
    {
      name: "vps_ping",
      description:
        "Health check: uname -a, uptime, and hostname on the VPS via SSH.",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "uname -a; echo '---'; uptime; echo '---'; hostname"
        ),
    },
    {
      name: "vps_resources",
      description: "Disk (df -h), memory (free -h), and load average.",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "df -h; echo '---'; free -h; echo '---'; cat /proc/loadavg"
        ),
    },
    {
      name: "vps_journal",
      description:
        "Read systemd journal for an allowlisted unit (or *.service). N <= 500.",
      inputSchema: z.object({
        unit: z.string().describe("systemd unit, e.g. docker.service or sshd"),
        n: z
          .number()
          .int()
          .optional()
          .describe("Number of lines (default 100, max 500)"),
      }),
      handler: async (args) => {
        const unit = assertJournalUnit(String(args.unit));
        const n = clampInt(Number(args.n ?? 100), 1, 500);
        return runSsh(
          config,
          `journalctl -u ${shellQuote(unit)} --no-pager -n ${n}`
        );
      },
    },
    {
      name: "docker_ps",
      description:
        "List all Docker containers as JSON lines (fallback to table).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "docker ps -a --format '{{json .}}' 2>/dev/null || docker ps -a"
        ),
    },
    {
      name: "docker_inspect",
      description: "docker inspect on a container/image name.",
      inputSchema: z.object({
        name: z.string().describe("Container or image name"),
      }),
      handler: async (args) => {
        const name = assertContainerOrServiceName(String(args.name));
        return runSsh(config, `docker inspect ${shellQuote(name)}`);
      },
    },
    {
      name: "docker_logs",
      description:
        "docker logs --tail N --timestamps. Optional since. N <= 1000.",
      inputSchema: z.object({
        name: z.string().describe("Container name"),
        n: z
          .number()
          .int()
          .optional()
          .describe("Tail lines (default 200, max 1000)"),
        since: z
          .string()
          .optional()
          .describe("Optional --since value, e.g. 1h or timestamp"),
      }),
      handler: async (args) => {
        const name = assertContainerOrServiceName(String(args.name));
        const n = clampInt(Number(args.n ?? 200), 1, 1000);
        let since = "";
        if (args.since !== undefined && args.since !== "") {
          const s = String(args.since);
          if (!/^[a-zA-Z0-9:T.+_-]+$/.test(s)) {
            throw new Error(
              'Invalid since; use alphanumerics and : T . + _ - only (e.g. "1h", "2024-01-01T00:00:00")'
            );
          }
          since = ` --since ${shellQuote(s)}`;
        }
        return runSsh(
          config,
          `docker logs --tail ${n} --timestamps${since} ${shellQuote(name)}`
        );
      },
    },
    {
      name: "docker_stats",
      description: "One-shot docker stats --no-stream.",
      inputSchema: z.object({}),
      handler: async () => runSsh(config, "docker stats --no-stream"),
    },
    {
      name: "docker_service_ls",
      description:
        "List Docker Swarm services as JSON lines (fallback to table).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "docker service ls --format '{{json .}}' 2>/dev/null || docker service ls"
        ),
    },
    {
      name: "docker_node_ls",
      description:
        "List Docker Swarm nodes as JSON lines (fallback to table).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "docker node ls --format '{{json .}}' 2>/dev/null || docker node ls"
        ),
    },
    {
      name: "compose_ps",
      description: "docker compose ps in dir (arg or VPS_COMPOSE_DIR).",
      inputSchema: z.object({
        dir: z
          .string()
          .optional()
          .describe("Absolute compose project dir on VPS"),
      }),
      handler: async (args) => {
        const dir = resolveComposeDir(
          config,
          args.dir !== undefined ? String(args.dir) : undefined
        );
        return runSsh(config, `cd ${shellQuote(dir)} && docker compose ps`);
      },
    },
    {
      name: "host_firewall",
      description: "ufw status verbose (sudo -n, then fallback without sudo).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "sudo -n ufw status verbose 2>/dev/null || ufw status verbose"
        ),
    },
    {
      name: "host_fail2ban",
      description:
        "fail2ban-client status; optional jail (default overall, or sshd).",
      inputSchema: z.object({
        jail: z
          .string()
          .optional()
          .describe('Optional jail name, e.g. "sshd"'),
      }),
      handler: async (args) => {
        let jailArg = "";
        if (args.jail !== undefined && args.jail !== "") {
          const jail = assertContainerOrServiceName(String(args.jail), "jail");
          jailArg = ` ${shellQuote(jail)}`;
        }
        return runSsh(
          config,
          `sudo -n fail2ban-client status${jailArg}`
        );
      },
    },
    {
      name: "host_listen",
      description:
        "Listening TCP/UDP sockets (ss -lntup). sudo -n, then fallback without sudo.",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(config, "sudo -n ss -lntup 2>/dev/null || ss -lntup"),
    },
    {
      name: "host_failed_units",
      description: "Failed systemd units (systemctl --failed --no-pager).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(config, "systemctl --failed --no-pager --full"),
    },
    {
      name: "host_top",
      description: "Top 30 processes by memory (ps aux --sort=-%mem).",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(config, "ps aux --sort=-%mem | head -n 31"),
    },
    {
      name: "host_dmesg",
      description:
        "Kernel log tail via dmesg -T. N <= 200. sudo -n, then fallback without sudo.",
      inputSchema: z.object({
        n: z
          .number()
          .int()
          .optional()
          .describe("Tail lines (default 100, max 200)"),
      }),
      handler: async (args) => {
        const n = clampInt(Number(args.n ?? 100), 1, 200);
        return runSsh(
          config,
          `(sudo -n dmesg -T 2>/dev/null || dmesg -T) | tail -n ${n}`
        );
      },
    },
    {
      name: "ssh_hardening_check",
      description:
        "Effective sshd settings: port, passwordauthentication, permitrootlogin, pubkeyauthentication.",
      inputSchema: z.object({}),
      handler: async () =>
        runSsh(
          config,
          "sudo -n sshd -T | egrep '^(port|passwordauthentication|permitrootlogin|pubkeyauthentication) '"
        ),
    },
  ];
}

export { resolveComposeDir };