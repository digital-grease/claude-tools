import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ForgejoClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner");
const repo = z.string().describe("Repository name");
const index = z.number().describe("Issue number");
const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerIssueTools(server: McpServer, client: ForgejoClient) {
  registerActionTool(server, client, "forgejo_issues", "Manage Forgejo issues", {
    list: {
      description: "List issues for a repository",
      params: {
        owner, repo,
        state: z.string().optional().describe("Filter by state: open, closed, all"),
        type: z.string().optional().describe("Filter by type: issues, pulls"),
        labels: z.string().optional().describe("Comma-separated label names"),
        milestones: z.string().optional().describe("Comma-separated milestone names"),
        sort: z.string().optional().describe("Sort by: oldest, recentupdate, leastupdate, mostcomment, leastcomment, priority"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/issues`, query as Record<string, string>);
      },
    },
    get: {
      description: "Get a single issue",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/${p.index}`),
    },
    create: {
      description: "Create an issue",
      params: {
        owner, repo,
        title: z.string().describe("Issue title"),
        body: z.string().optional().describe("Issue body"),
        assignees: z.string().optional().describe("Comma-separated assignee usernames"),
        labels: z.string().optional().describe("Comma-separated label IDs"),
        milestone: z.number().optional().describe("Milestone ID"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { title: p.title };
        if (p.body) body.body = p.body;
        if (p.assignees) body.assignees = (p.assignees as string).split(",").map(s => s.trim());
        if (p.labels) body.labels = (p.labels as string).split(",").map(s => Number(s.trim()));
        if (p.milestone) body.milestone = p.milestone;
        return client.post(`/repos/${p.owner}/${p.repo}/issues`, body);
      },
    },
    update: {
      description: "Update an issue",
      params: {
        owner, repo, index,
        title: z.string().optional().describe("New title"),
        body: z.string().optional().describe("New body"),
        state: z.string().optional().describe("New state: open or closed"),
        assignees: z.string().optional().describe("Comma-separated assignee usernames"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.title) body.title = p.title;
        if (p.body) body.body = p.body;
        if (p.state) body.state = p.state;
        if (p.assignees) body.assignees = (p.assignees as string).split(",").map(s => s.trim());
        return client.patch(`/repos/${p.owner}/${p.repo}/issues/${p.index}`, body);
      },
    },
    list_comments: {
      description: "List comments on an issue",
      params: { owner, repo, index, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/${p.index}/comments`, cleanParams(p)),
    },
    create_comment: {
      description: "Create a comment on an issue",
      params: {
        owner, repo, index,
        body: z.string().describe("Comment body"),
      },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/issues/${p.index}/comments`, { body: p.body }),
    },
    list_labels: {
      description: "List labels on an issue",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/${p.index}/labels`),
    },
    add_labels: {
      description: "Add labels to an issue",
      params: {
        owner, repo, index,
        labels: z.string().describe("Comma-separated label IDs"),
      },
      handler: async (client, p) => {
        const labelIds = (p.labels as string).split(",").map(s => Number(s.trim()));
        return client.post(`/repos/${p.owner}/${p.repo}/issues/${p.index}/labels`, { labels: labelIds });
      },
    },
    list_milestones: {
      description: "List milestones for a repository",
      params: {
        owner, repo,
        state: z.string().optional().describe("Filter by state: open, closed, all"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/milestones`, query as Record<string, string>);
      },
    },
    create_milestone: {
      description: "Create a milestone",
      params: {
        owner, repo,
        title: z.string().describe("Milestone title"),
        description: z.string().optional().describe("Milestone description"),
        due_on: z.string().optional().describe("Due date (ISO 8601 format)"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...body } = p;
        return client.post(`/repos/${p.owner}/${p.repo}/milestones`, body);
      },
    },
    list_repo_labels: {
      description: "List labels for a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/labels`, cleanParams(p)),
    },
    create_repo_label: {
      description: "Create a label for a repository",
      params: {
        owner, repo,
        name: z.string().describe("Label name"),
        color: z.string().describe("Label color (hex, e.g. #00aabb)"),
        description: z.string().optional().describe("Label description"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...body } = p;
        return client.post(`/repos/${p.owner}/${p.repo}/labels`, body);
      },
    },

    // --- Comment editing ---
    get_comment: {
      description: "Get a single issue/PR comment by id",
      params: { owner, repo, comment_id: z.number().describe("Comment ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}`),
    },
    edit_comment: {
      description: "Edit an issue/PR comment",
      params: {
        owner, repo,
        comment_id: z.number().describe("Comment ID"),
        body: z.string().describe("New comment body"),
      },
      handler: async (client, p) =>
        client.patch(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}`, { body: p.body }),
    },
    delete_comment: {
      description: "Delete an issue/PR comment",
      params: { owner, repo, comment_id: z.number().describe("Comment ID") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}`),
    },

    // --- Reactions (content: +1, -1, laugh, confused, heart, hooray, rocket, eyes) ---
    list_issue_reactions: {
      description: "List reactions on an issue/PR",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/${p.index}/reactions`),
    },
    add_issue_reaction: {
      description: "Add a reaction to an issue/PR",
      params: { owner, repo, index, content: z.string().describe("Reaction: +1, -1, laugh, confused, heart, hooray, rocket, eyes") },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/issues/${p.index}/reactions`, { content: p.content }),
    },
    remove_issue_reaction: {
      description: "Remove a reaction from an issue/PR",
      params: { owner, repo, index, content: z.string().describe("Reaction to remove") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/issues/${p.index}/reactions`, { content: p.content }),
    },
    list_comment_reactions: {
      description: "List reactions on a comment",
      params: { owner, repo, comment_id: z.number().describe("Comment ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}/reactions`),
    },
    add_comment_reaction: {
      description: "Add a reaction to a comment",
      params: { owner, repo, comment_id: z.number().describe("Comment ID"), content: z.string().describe("Reaction: +1, -1, laugh, confused, heart, hooray, rocket, eyes") },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}/reactions`, { content: p.content }),
    },
    remove_comment_reaction: {
      description: "Remove a reaction from a comment",
      params: { owner, repo, comment_id: z.number().describe("Comment ID"), content: z.string().describe("Reaction to remove") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/issues/comments/${p.comment_id}/reactions`, { content: p.content }),
    },

    // --- Issue label management ---
    replace_labels: {
      description: "Replace all labels on an issue (overwrites the existing set)",
      params: { owner, repo, index, labels: z.string().describe("Comma-separated label IDs") },
      handler: async (client, p) => {
        const labelIds = (p.labels as string).split(",").map(s => Number(s.trim()));
        return client.put(`/repos/${p.owner}/${p.repo}/issues/${p.index}/labels`, { labels: labelIds });
      },
    },
    remove_label: {
      description: "Remove a single label from an issue",
      params: { owner, repo, index, label_id: z.number().describe("Label ID to remove") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/issues/${p.index}/labels/${p.label_id}`),
    },
    clear_labels: {
      description: "Remove all labels from an issue",
      params: { owner, repo, index },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/issues/${p.index}/labels`),
    },

    // --- Repo label / milestone editing ---
    get_repo_label: {
      description: "Get a repository label by id",
      params: { owner, repo, label_id: z.number().describe("Label ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/labels/${p.label_id}`),
    },
    edit_repo_label: {
      description: "Edit a repository label",
      params: {
        owner, repo,
        label_id: z.number().describe("Label ID"),
        name: z.string().optional().describe("New name"),
        color: z.string().optional().describe("New color (hex, e.g. #00aabb)"),
        description: z.string().optional().describe("New description"),
        exclusive: z.boolean().optional().describe("Whether the label is exclusive within its scope"),
        is_archived: z.boolean().optional().describe("Whether the label is archived"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.name !== undefined) body.name = p.name;
        if (p.color !== undefined) body.color = p.color;
        if (p.description !== undefined) body.description = p.description;
        if (p.exclusive !== undefined) body.exclusive = p.exclusive;
        if (p.is_archived !== undefined) body.is_archived = p.is_archived;
        return client.patch(`/repos/${p.owner}/${p.repo}/labels/${p.label_id}`, body);
      },
    },
    delete_repo_label: {
      description: "Delete a repository label",
      params: { owner, repo, label_id: z.number().describe("Label ID") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/labels/${p.label_id}`),
    },
    get_milestone: {
      description: "Get a milestone by id",
      params: { owner, repo, milestone_id: z.number().describe("Milestone ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/milestones/${p.milestone_id}`),
    },
    edit_milestone: {
      description: "Edit a milestone",
      params: {
        owner, repo,
        milestone_id: z.number().describe("Milestone ID"),
        title: z.string().optional().describe("New title"),
        description: z.string().optional().describe("New description"),
        state: z.string().optional().describe("New state: open or closed"),
        due_on: z.string().optional().describe("Due date (ISO 8601)"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.title !== undefined) body.title = p.title;
        if (p.description !== undefined) body.description = p.description;
        if (p.state !== undefined) body.state = p.state;
        if (p.due_on !== undefined) body.due_on = p.due_on;
        return client.patch(`/repos/${p.owner}/${p.repo}/milestones/${p.milestone_id}`, body);
      },
    },
    delete_milestone: {
      description: "Delete a milestone",
      params: { owner, repo, milestone_id: z.number().describe("Milestone ID") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/milestones/${p.milestone_id}`),
    },
  });
}
