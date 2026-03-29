import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerAdminTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_admin", "Gitea admin and miscellaneous operations (requires admin token)", {
    list_users: {
      description: "List all users (admin only)",
      params: { page, limit },
      handler: async (client, p) => client.get("/admin/users", cleanParams(p)),
    },
    create_user: {
      description: "Create a user (admin only)",
      params: {
        username: z.string().describe("Username"),
        email: z.string().describe("Email address"),
        password: z.string().describe("Password"),
        must_change_password: z.boolean().optional().describe("Must change password on first login"),
        visibility: z.string().optional().describe("Visibility: public, limited, private"),
      },
      handler: async (client, p) => {
        const { action, ...body } = p;
        return client.post("/admin/users", body);
      },
    },
    delete_user: {
      description: "Delete a user (admin only)",
      params: { username: z.string().describe("Username") },
      handler: async (client, p) => client.delete(`/admin/users/${p.username}`),
    },
    list_orgs: {
      description: "List all organizations (admin only)",
      params: { page, limit },
      handler: async (client, p) => client.get("/admin/orgs", cleanParams(p)),
    },
    list_cron_tasks: {
      description: "List cron tasks (admin only)",
      params: { page, limit },
      handler: async (client, p) => client.get("/admin/cron", cleanParams(p)),
    },
    run_cron_task: {
      description: "Run a cron task (admin only)",
      params: { task: z.string().describe("Cron task name") },
      handler: async (client, p) => client.post(`/admin/cron/${p.task}`),
    },
    version: {
      description: "Get Gitea version",
      handler: async (client) => client.get("/version"),
    },
    settings: {
      description: "Get instance settings",
      handler: async (client) => client.get("/settings/api"),
    },
    gitignore_templates: {
      description: "List available gitignore templates",
      handler: async (client) => client.get("/gitignore/templates"),
    },
    license_templates: {
      description: "List available license templates",
      handler: async (client) => client.get("/licenses"),
    },
    render_markdown: {
      description: "Render markdown text",
      params: {
        text: z.string().describe("Markdown text to render"),
        mode: z.string().optional().describe("Render mode: markdown, gfm, comment"),
        context: z.string().optional().describe("Context for relative links (owner/repo)"),
      },
      handler: async (client, p) => {
        const { action, ...body } = p;
        return client.post("/markdown", body);
      },
    },
  });
}
