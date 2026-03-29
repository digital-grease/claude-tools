#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TraefikClient } from "./client.js";
import { registerOverviewTools } from "./tools/overview.js";
import { registerHttpTools } from "./tools/http.js";
import { registerTcpTools } from "./tools/tcp.js";
import { registerUdpTools } from "./tools/udp.js";
import { registerEntrypointTools } from "./tools/entrypoints.js";

const baseUrl = process.env.TRAEFIK_URL;

if (!baseUrl) {
  console.error(
    "Missing required environment variable: TRAEFIK_URL",
  );
  process.exit(1);
}

const client = new TraefikClient({
  baseUrl,
  username: process.env.TRAEFIK_USER,
  password: process.env.TRAEFIK_PASSWORD,
});

const server = new McpServer({
  name: "traefik",
  version: "1.0.0",
});

// Register all tools
registerOverviewTools(server, client);
registerHttpTools(server, client);
registerTcpTools(server, client);
registerUdpTools(server, client);
registerEntrypointTools(server, client);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
