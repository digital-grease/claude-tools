import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TraefikClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const per_page = z.number().optional().describe("Results per page (max 100)");
const name = z.string().describe("Resource name (format: name@provider)");

export function registerTcpTools(server: McpServer, client: TraefikClient) {
  registerActionTool(server, client, "traefik_tcp", "Query Traefik TCP routers, services, and middlewares", {
    list_routers: {
      description: "List all TCP routers",
      params: { page, per_page },
      handler: async (client, p) => client.get("/tcp/routers", cleanParams(p)),
    },
    get_router: {
      description: "Get a TCP router by name",
      params: { name },
      handler: async (client, p) => client.get(`/tcp/routers/${encodeURIComponent(p.name as string)}`),
    },
    list_services: {
      description: "List all TCP services",
      params: { page, per_page },
      handler: async (client, p) => client.get("/tcp/services", cleanParams(p)),
    },
    get_service: {
      description: "Get a TCP service by name",
      params: { name },
      handler: async (client, p) => client.get(`/tcp/services/${encodeURIComponent(p.name as string)}`),
    },
    list_middlewares: {
      description: "List all TCP middlewares",
      params: { page, per_page },
      handler: async (client, p) => client.get("/tcp/middlewares", cleanParams(p)),
    },
    get_middleware: {
      description: "Get a TCP middleware by name",
      params: { name },
      handler: async (client, p) => client.get(`/tcp/middlewares/${encodeURIComponent(p.name as string)}`),
    },
  });
}
