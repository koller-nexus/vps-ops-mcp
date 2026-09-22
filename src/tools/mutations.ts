import { z } from "zod";
import type { VpsConfig } from "../config.js";
import { runSsh, shellQuote, type SshResult } from "../ssh.js";
import { assertContainerOrServiceName } from "../validate.js";
import { resolveComposeDir, type ToolDef } from "./readonly.js";

function requireConfirm(args: Record<string, unknown>): void {
  if (args.confirm !== true) {
    throw new Error(
      "Mutation refused: set confirm:true to proceed (and ensure VPS_ALLOW_MUTATIONS is not false)."
    );
  }
}

function requireMutationsAllowed(config: VpsConfig): void {
  if (!config.allowMutations) {
    throw new Error(
      "Mutations disabled: VPS_ALLOW_MUTATIONS=false. Only readonly tools are available."
    );
  }
}

async function gated(
  config: VpsConfig,
  args: Record<string, unknown>,
  fn: () => Promise<SshResult>
): Promise<SshResult> {
  requireMutationsAllowed(config);
  requireConfirm(args);
  return fn();
}

const confirmField = z
  .literal(true)
  .describe("Must be true to execute this mutation");

export function buildMutationTools(config: VpsConfig): ToolDef[] {
  return [
    {
      name: "docker_restart",
      description: "docker restart NAME. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({ name: z.string(), confirm: confirmField }),
      handler: async (args) =>
        gated(config, args, () => {
          const name = assertContainerOrServiceName(String(args.name));
          return runSsh(config, `docker restart ${shellQuote(name)}`);
        }),
    },
    {
      name: "docker_stop",
      description: "docker stop NAME. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({ name: z.string(), confirm: confirmField }),
      handler: async (args) =>
        gated(config, args, () => {
          const name = assertContainerOrServiceName(String(args.name));
          return runSsh(config, `docker stop ${shellQuote(name)}`);
        }),
    },
    {
      name: "docker_start",
      description: "docker start NAME. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({ name: z.string(), confirm: confirmField }),
      handler: async (args) =>
        gated(config, args, () => {
          const name = assertContainerOrServiceName(String(args.name));
          return runSsh(config, `docker start ${shellQuote(name)}`);
        }),
    },
    {
      name: "compose_up",
      description:
        "docker compose up -d [services…]. Requires confirm:true. dir or VPS_COMPOSE_DIR.",
      mutation: true,
      inputSchema: z.object({
        dir: z.string().optional(),
        services: z.array(z.string()).optional(),
        confirm: confirmField,
      }),
      handler: async (args) =>
        gated(config, args, () => {
          const dir = resolveComposeDir(
            config,
            args.dir !== undefined ? String(args.dir) : undefined
          );
          const services = Array.isArray(args.services)
            ? (args.services as string[]).map((s) =>
                assertContainerOrServiceName(s, "service")
              )
            : [];
          const svc =
            services.length > 0
              ? " " + services.map(shellQuote).join(" ")
              : "";
          return runSsh(
            config,
            `cd ${shellQuote(dir)} && docker compose up -d${svc}`
          );
        }),
    },
    {
      name: "compose_restart",
      description:
        "docker compose restart [services…]. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({
        dir: z.string().optional(),
        services: z.array(z.string()).optional(),
        confirm: confirmField,
      }),
      handler: async (args) =>
        gated(config, args, () => {
          const dir = resolveComposeDir(
            config,
            args.dir !== undefined ? String(args.dir) : undefined
          );
          const services = Array.isArray(args.services)
            ? (args.services as string[]).map((s) =>
                assertContainerOrServiceName(s, "service")
              )
            : [];
          const svc =
            services.length > 0
              ? " " + services.map(shellQuote).join(" ")
              : "";
          return runSsh(
            config,
            `cd ${shellQuote(dir)} && docker compose restart${svc}`
          );
        }),
    },
    {
      name: "compose_pull_up",
      description:
        "docker compose pull then up -d [services…]. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({
        dir: z.string().optional(),
        services: z.array(z.string()).optional(),
        confirm: confirmField,
      }),
      handler: async (args) =>
        gated(config, args, () => {
          const dir = resolveComposeDir(
            config,
            args.dir !== undefined ? String(args.dir) : undefined
          );
          const services = Array.isArray(args.services)
            ? (args.services as string[]).map((s) =>
                assertContainerOrServiceName(s, "service")
              )
            : [];
          const svc =
            services.length > 0
              ? " " + services.map(shellQuote).join(" ")
              : "";
          return runSsh(
            config,
            `cd ${shellQuote(dir)} && docker compose pull${svc} && docker compose up -d${svc}`
          );
        }),
    },
    {
      name: "docker_rm",
      description:
        "docker rm -f NAME. Requires confirm:true AND force_name === name.",
      mutation: true,
      inputSchema: z.object({
        name: z.string(),
        force_name: z
          .string()
          .describe("Must equal name exactly (double confirmation)"),
        confirm: confirmField,
      }),
      handler: async (args) =>
        gated(config, args, () => {
          const name = assertContainerOrServiceName(String(args.name));
          const forceName = String(args.force_name ?? "");
          if (forceName !== name) {
            throw new Error(
              `docker_rm refused: force_name ("${forceName}") must equal name ("${name}")`
            );
          }
          return runSsh(config, `docker rm -f ${shellQuote(name)}`);
        }),
    },
    {
      name: "disk_cleanup_docker",
      description:
        "docker system prune -f; volumes only if confirm_volumes:true. Requires confirm:true.",
      mutation: true,
      inputSchema: z.object({
        confirm: confirmField,
        confirm_volumes: z
          .boolean()
          .optional()
          .describe("If true, also prune unused volumes (--volumes)"),
      }),
      handler: async (args) =>
        gated(config, args, () => {
          const volumes =
            args.confirm_volumes === true ? " --volumes" : "";
          return runSsh(config, `docker system prune -f${volumes}`);
        }),
    },
  ];
}