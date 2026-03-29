import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TraefikClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const per_page = z.number().optional().describe("Results per page (max 100)");

export function registerEntrypointTools(server: McpServer, client: TraefikClient) {
  registerActionTool(server, client, "traefik_entrypoints", "Query Traefik entrypoints", {
    list: {
      description: "List all configured entrypoints",
      params: { page, per_page },
      handler: async (client, p) => client.get("/entrypoints", cleanParams(p)),
    },
    get: {
      description: "Get a specific entrypoint by name",
      params: { name: z.string().describe("Entrypoint name") },
      handler: async (client, p) => client.get(`/entrypoints/${encodeURIComponent(p.name as string)}`),
    },
  });
}
