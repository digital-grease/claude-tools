import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TraefikClient } from "../client.js";
import { registerActionTool } from "../helpers.js";

export function registerOverviewTools(server: McpServer, client: TraefikClient) {
  registerActionTool(server, client, "traefik_overview", "Traefik instance overview, version, and raw configuration", {
    overview: {
      description: "Get current overview (stats, features, providers)",
      handler: async (client) => client.get("/overview"),
    },
    version: {
      description: "Get Traefik version information",
      handler: async (client) => client.get("/version"),
    },
    rawdata: {
      description: "Get full dynamic configuration with status and errors",
      handler: async (client) => client.get("/rawdata"),
    },
  });
}
