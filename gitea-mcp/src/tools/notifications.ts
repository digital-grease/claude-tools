import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerNotificationTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_notifications", "Manage Gitea notifications", {
    list: {
      description: "List notifications for the authenticated user",
      params: {
        status_types: z.string().optional().describe("Comma-separated status types: unread, read, pinned"),
        subject_type: z.string().optional().describe("Filter by subject: Issue, Pull, Commit, Repository"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, ...query } = p;
        return client.get("/notifications", query as Record<string, string>);
      },
    },
    list_repo: {
      description: "List notifications for a repository",
      params: {
        owner: z.string().describe("Repository owner"),
        repo: z.string().describe("Repository name"),
        status_types: z.string().optional().describe("Comma-separated status types"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/notifications`, query as Record<string, string>);
      },
    },
    mark_read: {
      description: "Mark all notifications as read",
      handler: async (client) => client.put("/notifications", { last_read_at: new Date().toISOString() }),
    },
    mark_repo_read: {
      description: "Mark all notifications in a repository as read",
      params: {
        owner: z.string().describe("Repository owner"),
        repo: z.string().describe("Repository name"),
      },
      handler: async (client, p) =>
        client.put(`/repos/${p.owner}/${p.repo}/notifications`, { last_read_at: new Date().toISOString() }),
    },
  });
}
