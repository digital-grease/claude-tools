import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ForgejoClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner");
const repo = z.string().describe("Repository name");
const index = z.number().describe("Pull request number");
const page = z.number().optional().describe("Page number");
const limit = z.number().optional().describe("Items per page");

export function registerPullTools(server: McpServer, client: ForgejoClient) {
  registerActionTool(server, client, "forgejo_pulls", "Manage Forgejo pull requests", {
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
        Do: z.string().optional().describe("Merge method: merge, rebase, rebase-merge, squash, manually-merged, fast-forward-only"),
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
    get_by_base_head: {
      description: "Find an existing PR by its base and head branches",
      params: {
        owner, repo,
        base: z.string().describe("Base branch name"),
        head: z.string().describe("Head branch name (use owner:branch for cross-repo)"),
      },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.base}/${p.head}`),
    },
    is_merged: {
      description: "Check whether a pull request has been merged (returns success if merged, errors 404 if not)",
      params: { owner, repo, index },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/merge`),
    },
    update_branch: {
      description: "Merge the latest changes from the base branch into the PR's head branch",
      params: {
        owner, repo, index,
        style: z.string().optional().describe("Update style: merge (default) or rebase"),
      },
      handler: async (client, p) =>
        client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/update${p.style ? `?style=${p.style}` : ""}`),
    },

    // --- Reviews ---
    get_review: {
      description: "Get a single review on a pull request",
      params: { owner, repo, index, review_id: z.number().describe("Review ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}`),
    },
    list_review_comments: {
      description: "List the comments belonging to a pull request review",
      params: { owner, repo, index, review_id: z.number().describe("Review ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}/comments`),
    },
    submit_review: {
      description: "Submit a pending pull request review",
      params: {
        owner, repo, index,
        review_id: z.number().describe("Review ID (the pending review to submit)"),
        event: z.string().describe("Review event: APPROVED, REQUEST_CHANGES, or COMMENT"),
        body: z.string().optional().describe("Review summary body"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { event: p.event };
        if (p.body) body.body = p.body;
        return client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}`, body);
      },
    },
    delete_review: {
      description: "Delete a pull request review",
      params: { owner, repo, index, review_id: z.number().describe("Review ID") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}`),
    },
    dismiss_review: {
      description: "Dismiss a pull request review",
      params: {
        owner, repo, index,
        review_id: z.number().describe("Review ID"),
        message: z.string().optional().describe("Dismissal message"),
        priors: z.boolean().optional().describe("Also dismiss prior reviews by the same user"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.message !== undefined) body.message = p.message;
        if (p.priors !== undefined) body.priors = p.priors;
        return client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}/dismissals`, body);
      },
    },
    undismiss_review: {
      description: "Undismiss a previously dismissed pull request review",
      params: { owner, repo, index, review_id: z.number().describe("Review ID") },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/reviews/${p.review_id}/undismissals`),
    },

    // --- Requested reviewers ---
    request_reviewers: {
      description: "Request reviews from users and/or teams on a pull request",
      params: {
        owner, repo, index,
        reviewers: z.string().optional().describe("Comma-separated reviewer usernames"),
        team_reviewers: z.string().optional().describe("Comma-separated team names"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.reviewers) body.reviewers = (p.reviewers as string).split(",").map(s => s.trim());
        if (p.team_reviewers) body.team_reviewers = (p.team_reviewers as string).split(",").map(s => s.trim());
        return client.post(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/requested_reviewers`, body);
      },
    },
    unrequest_reviewers: {
      description: "Cancel requested reviews from users and/or teams on a pull request",
      params: {
        owner, repo, index,
        reviewers: z.string().optional().describe("Comma-separated reviewer usernames"),
        team_reviewers: z.string().optional().describe("Comma-separated team names"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.reviewers) body.reviewers = (p.reviewers as string).split(",").map(s => s.trim());
        if (p.team_reviewers) body.team_reviewers = (p.team_reviewers as string).split(",").map(s => s.trim());
        return client.delete(`/repos/${p.owner}/${p.repo}/pulls/${p.index}/requested_reviewers`, body);
      },
    },
  });
}
