import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner");
const repo = z.string().describe("Repository name");
const index = z.number().describe("Pull request number");
const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerPullTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_pulls", "Manage Gitea pull requests", {
    list: {
      description: "List pull requests for a repository",
      params: {
        owner, repo,
        state: z.string().optional().describe("Filter by state: open, closed, all"),
        sort: z.string().optional().describe("Sort by: oldest, recentupdate, leastupdate, mostcomment, leastcomment, priority"),
        labels: z.string().optional().describe("Comma-separated label IDs"),
        milestone: z.number().optional().describe("Milestone ID"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/pulls`, query as Record<string, string>);
      },
    },
    get: {
      description: "Get a single pull request",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}`),
    },
    create: {
      description: "Create a pull request",
      params: {
        owner, repo,
        title: z.string().describe("PR title"),
        head: z.string().describe("Source branch"),
        base: z.string().describe("Target branch"),
        body: z.string().optional().describe("PR description"),
        assignees: z.string().optional().describe("Comma-separated assignee usernames"),
        labels: z.string().optional().describe("Comma-separated label IDs"),
        milestone: z.number().optional().describe("Milestone ID"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {
          title: p.title,
          head: p.head,
          base: p.base,
        };
        if (p.body) body.body = p.body;
        if (p.assignees) body.assignees = (p.assignees as string).split(",").map(s => s.trim());
        if (p.labels) body.labels = (p.labels as string).split(",").map(s => Number(s.trim()));
        if (p.milestone) body.milestone = p.milestone;
        return client.post(`/repos/${p.owner}/${p.repo}/pulls`, body);
      },
    },
    update: {
      description: "Update a pull request",
      params: {
        owner, repo, index,
        title: z.string().optional().describe("New title"),
        body: z.string().optional().describe("New description"),
        state: z.string().optional().describe("New state: open or closed"),
        assignees: z.string().optional().describe("Comma-separated assignee usernames"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.title) body.title = p.title;
        if (p.body) body.body = p.body;
        if (p.state) body.state = p.state;
        if (p.assignees) body.assignees = (p.assignees as string).split(",").map(s => s.trim());
        return client.patch(`/repos/${p.owner}/${p.repo}/pulls/${p.index}`, body);
      },
    },
    merge: {
      description: "Merge a pull request",
      params: {
        owner, repo, index,
        Do: z.string().optional().describe("Merge method: merge, rebase, rebase-merge, squash, fast-forward-only"),
        merge_message_field: z.string().optional().describe("Merge commit message"),
        delete_branch_after_merge: z.boolean().optional().describe("Delete source branch after merge"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {
          Do: p.Do ?? "merge",
        };
        if (p.merge_message_field) body.merge_message_field = p.merge_message_field;
        if (p.delete_branch_after_merge !== undefined) body.delete_branch_after_merge = p.delete_branch_after_merge;
        return client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/merge`, body);
      },
    },
    list_reviews: {
      description: "List reviews on a pull request",
      params: { owner, repo, index, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews`, cleanParams(p)),
    },
    create_review: {
      description: "Create a review on a pull request",
      params: {
        owner, repo, index,
        event: z.string().describe("Review event: APPROVED, REQUEST_CHANGES, COMMENT"),
        body: z.string().optional().describe("Review body/comment"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { event: p.event };
        if (p.body) body.body = p.body;
        return client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews`, body);
      },
    },
    get_diff: {
      description: "Get the diff of a pull request",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}.diff`),
    },
    list_files: {
      description: "List files changed in a pull request",
      params: { owner, repo, index, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/files`, cleanParams(p)),
    },
    list_commits: {
      description: "List commits in a pull request",
      params: { owner, repo, index, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/commits`, cleanParams(p)),
    },
  });
}
