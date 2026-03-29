import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerUserTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_users", "Query Gitea users and the authenticated user", {
    me: {
      description: "Get the authenticated user",
      handler: async (client) => client.get("/user"),
    },
    get: {
      description: "Get a user by username",
      params: { username: z.string().describe("Username") },
      handler: async (client, p) => client.get(`/users/${p.username}`),
    },
    search: {
      description: "Search users",
      params: {
        q: z.string().optional().describe("Search query"),
        page, limit,
      },
      handler: async (client, p) => client.get("/users/search", cleanParams(p)),
    },
    list_repos: {
      description: "List a user's repositories",
      params: {
        username: z.string().describe("Username"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, username, ...query } = p;
        return client.get(`/users/${p.username}/repos`, query as Record<string, string>);
      },
    },
    list_my_repos: {
      description: "List repositories for the authenticated user",
      params: { page, limit },
      handler: async (client, p) => client.get("/user/repos", cleanParams(p)),
    },
    list_starred: {
      description: "List repositories starred by a user",
      params: {
        username: z.string().describe("Username"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, username, ...query } = p;
        return client.get(`/users/${p.username}/starred`, query as Record<string, string>);
      },
    },
    list_my_starred: {
      description: "List repositories starred by the authenticated user",
      params: { page, limit },
      handler: async (client, p) => client.get("/user/starred", cleanParams(p)),
    },
    list_followers: {
      description: "List a user's followers",
      params: {
        username: z.string().describe("Username"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, username, ...query } = p;
        return client.get(`/users/${p.username}/followers`, query as Record<string, string>);
      },
    },
    list_following: {
      description: "List users that a user is following",
      params: {
        username: z.string().describe("Username"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, username, ...query } = p;
        return client.get(`/users/${p.username}/following`, query as Record<string, string>);
      },
    },
  });
}
