import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TraefikClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const per_page = z.number().optional().describe("Results per page (max 100)");
const name = z.string().describe("Resource name (format: name@provider)");

export function registerUdpTools(server: McpServer, client: TraefikClient) {
  registerActionTool(server, client, "traefik_udp", "Query Traefik UDP routers and services", {
    list_routers: {
      description: "List all UDP routers",
      params: { page, per_page },
      handler: async (client, p) => client.get("/udp/routers", cleanParams(p)),
    },
    get_router: {
      description: "Get a UDP router by name",
      params: { name },
      handler: async (client, p) => client.get(`/udp/routers/${encodeURIComponent(p.name as string)}`),
    },
    list_services: {
      description: "List all UDP services",
      params: { page, per_page },
      handler: async (client, p) => client.get("/udp/services", cleanParams(p)),
    },
    get_service: {
      description: "Get a UDP service by name",
      params: { name },
      handler: async (client, p) => client.get(`/udp/services/${encodeURIComponent(p.name as string)}`),
    },
  });
}
