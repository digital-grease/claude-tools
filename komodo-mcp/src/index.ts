#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KomodoClient } from "./client.js";
import { registerCoreReadTools } from "./tools/read-core.js";
import { registerDockerReadTools } from "./tools/read-docker.js";
import { registerOpsReadTools } from "./tools/read-ops.js";
import { registerAdminReadTools } from "./tools/read-admin.js";
import { registerWriteTools } from "./tools/write.js";
import { registerExecuteTools } from "./tools/execute.js";

const baseUrl = process.env.KOMODO_URL;
const apiKey = process.env.KOMODO_API_KEY;
const apiSecret = process.env.KOMODO_API_SECRET;

if (!baseUrl || !apiKey || !apiSecret) {
  console.error(
    "Missing required environment variables: KOMODO_URL, KOMODO_API_KEY, KOMODO_API_SECRET",
  );
  process.exit(1);
}

const client = new KomodoClient({ baseUrl, apiKey, apiSecret });

const server = new McpServer({
  name: "komodo",
  version: "1.0.0",
});

// Register all tools
registerCoreReadTools(server, client);
registerDockerReadTools(server, client);
registerOpsReadTools(server, client);
registerAdminReadTools(server, client);
registerWriteTools(server, client);
registerExecuteTools(server, client);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
