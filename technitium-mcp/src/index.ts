#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TechnitiumClient } from "./client.js";
import { registerZoneTools } from "./tools/zones.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerAdminTools } from "./tools/admin.js";
import { registerDhcpTools } from "./tools/dhcp.js";
import { registerAppsTools } from "./tools/apps.js";

const baseUrl = process.env.TECHNITIUM_URL;
const token = process.env.TECHNITIUM_TOKEN;

if (!baseUrl || !token) {
  console.error(
    "Missing required environment variables: TECHNITIUM_URL, TECHNITIUM_TOKEN",
  );
  process.exit(1);
}

const client = new TechnitiumClient({ baseUrl, token });

const server = new McpServer({
  name: "technitium",
  version: "1.0.0",
});

// Register all tools
registerZoneTools(server, client);
registerDnsTools(server, client);
registerAdminTools(server, client);
registerDhcpTools(server, client);
registerAppsTools(server, client);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
