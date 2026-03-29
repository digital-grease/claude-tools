#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GiteaClient } from "./client.js";
import { registerRepoTools } from "./tools/repos.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerPullTools } from "./tools/pulls.js";
import { registerUserTools } from "./tools/users.js";
import { registerOrgTools } from "./tools/orgs.js";
import { registerNotificationTools } from "./tools/notifications.js";
import { registerAdminTools } from "./tools/admin.js";

const baseUrl = process.env.GITEA_URL;
const token = process.env.GITEA_TOKEN;

if (!baseUrl || !token) {
  console.error(
    "Missing required environment variables: GITEA_URL, GITEA_TOKEN",
  );
  process.exit(1);
}

const client = new GiteaClient({ baseUrl, token });

const server = new McpServer({
  name: "gitea",
  version: "1.0.0",
});

// Register all tools
registerRepoTools(server, client);
registerIssueTools(server, client);
registerPullTools(server, client);
registerUserTools(server, client);
registerOrgTools(server, client);
registerNotificationTools(server, client);
registerAdminTools(server, client);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
