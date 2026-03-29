import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TraefikClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const per_page = z.number().optional().describe("Results per page (max 100)");
const name = z.string().describe("Resource name (format: name@provider)");

export function registerHttpTools(server: McpServer, client: TraefikClient) {
  registerActionTool(server, client, "traefik_http", "Query Traefik HTTP routers, services, and middlewares", {
    list_routers: {
      description: "List all HTTP routers",
      params: { page, per_page },
      handler: async (client, p) => client.get("/http/routers", cleanParams(p)),
    },
    get_router: {
      description: "Get an HTTP router by name",
      params: { name },
      handler: async (client, p) => client.get(`/http/routers/${encodeURIComponent(p.name as string)}`),
    },
    list_services: {
      description: "List all HTTP services",
      params: { page, per_page },
      handler: async (client, p) => client.get("/http/services", cleanParams(p)),
    },
    get_service: {
      description: "Get an HTTP service by name",
      params: { name },
      handler: async (client, p) => client.get(`/http/services/${encodeURIComponent(p.name as string)}`),
    },
    list_middlewares: {
      description: "List all HTTP middlewares",
      params: { page, per_page },
      handler: async (client, p) => client.get("/http/middlewares", cleanParams(p)),
    },
    get_middleware: {
      description: "Get an HTTP middleware by name",
      params: { name },
      handler: async (client, p) => client.get(`/http/middlewares/${encodeURIComponent(p.name as string)}`),
    },
  });
}
