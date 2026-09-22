#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { buildReadonlyTools, type ToolDef } from "./tools/readonly.js";
import { buildMutationTools } from "./tools/mutations.js";
import type { SshResult } from "./ssh.js";

function resultToText(result: SshResult): string {
  return JSON.stringify(result, null, 2);
}

function registerAll(server: McpServer, tools: ToolDef[]): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: unknown) => {
        try {
          const parsed = tool.inputSchema.parse(args ?? {});
          const result = await tool.handler(parsed as Record<string, unknown>);
          return {
            content: [{ type: "text" as const, text: resultToText(result) }],
            isError: result.exit_code !== 0,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const failed: SshResult = {
            exit_code: 1,
            stdout: "",
            stderr: msg,
            duration_ms: 0,
            truncated: false,
          };
          return {
            content: [{ type: "text" as const, text: resultToText(failed) }],
            isError: true,
          };
        }
      }
    );
  }
}

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[vps-ops] Fatal config error: ${msg}`);
    process.exit(1);
  }

  const tools: ToolDef[] = [
    ...buildReadonlyTools(config),
    ...buildMutationTools(config),
  ];

  const server = new McpServer({ name: "vps-ops", version: "0.1.0" });
  registerAll(server, tools);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[vps-ops] Unhandled error:", err);
  process.exit(1);
});