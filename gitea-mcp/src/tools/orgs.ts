import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const org = z.string().describe("Organization name");
const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerOrgTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_orgs", "Manage Gitea organizations", {
    list_my: {
      description: "List organizations for the authenticated user",
      params: { page, limit },
      handler: async (client, p) => client.get("/user/orgs", cleanParams(p)),
    },
    get: {
      description: "Get an organization",
      params: { org },
      handler: async (client, p) => client.get(`/orgs/${p.org}`),
    },
    create: {
      description: "Create an organization",
      params: {
        username: z.string().describe("Organization username"),
        full_name: z.string().optional().describe("Display name"),
        description: z.string().optional().describe("Organization description"),
        visibility: z.string().optional().describe("Visibility: public, limited, private"),
      },
      handler: async (client, p) => {
        const { action, ...body } = p;
        return client.post("/orgs", body);
      },
    },
    update: {
      description: "Update an organization",
      params: {
        org,
        full_name: z.string().optional().describe("Display name"),
        description: z.string().optional().describe("Description"),
        visibility: z.string().optional().describe("Visibility: public, limited, private"),
      },
      handler: async (client, p) => {
        const { action, org, ...body } = p;
        return client.patch(`/orgs/${p.org}`, body);
      },
    },
    list_repos: {
      description: "List repos of an organization",
      params: { org, page, limit },
      handler: async (client, p) => {
        const { action, org, ...query } = p;
        return client.get(`/orgs/${p.org}/repos`, query as Record<string, string>);
      },
    },
    list_members: {
      description: "List members of an organization",
      params: { org, page, limit },
      handler: async (client, p) => {
        const { action, org, ...query } = p;
        return client.get(`/orgs/${p.org}/members`, query as Record<string, string>);
      },
    },
    list_teams: {
      description: "List teams of an organization",
      params: { org, page, limit },
      handler: async (client, p) => {
        const { action, org, ...query } = p;
        return client.get(`/orgs/${p.org}/teams`, query as Record<string, string>);
      },
    },
    list_labels: {
      description: "List labels of an organization",
      params: { org, page, limit },
      handler: async (client, p) => {
        const { action, org, ...query } = p;
        return client.get(`/orgs/${p.org}/labels`, query as Record<string, string>);
      },
    },
    list_hooks: {
      description: "List webhooks of an organization",
      params: { org, page, limit },
      handler: async (client, p) => {
        const { action, org, ...query } = p;
        return client.get(`/orgs/${p.org}/hooks`, query as Record<string, string>);
      },
    },
  });
}
