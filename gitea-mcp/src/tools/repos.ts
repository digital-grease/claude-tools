import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GiteaClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner (user or org)");
const repo = z.string().describe("Repository name");
const page = z.number().optional().describe("Page number (default: 1)");
const limit = z.number().optional().describe("Items per page (default: 50)");

export function registerRepoTools(server: McpServer, client: GiteaClient) {
  registerActionTool(server, client, "gitea_repos", "Manage Gitea repositories", {
    search: {
      description: "Search repositories",
      params: {
        q: z.string().optional().describe("Search query"),
        sort: z.string().optional().describe("Sort by: alpha, created, updated, size, stars, forks, id"),
        order: z.string().optional().describe("Sort order: asc or desc"),
        page,
        limit,
      },
      handler: async (client, p) => client.get("/repos/search", cleanParams(p)),
    },
    get: {
      description: "Get a repository by owner/name",
      params: { owner, repo },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}`),
    },
    create_user: {
      description: "Create a repository for the authenticated user",
      params: {
        name: z.string().describe("Repository name"),
        description: z.string().optional().describe("Repository description"),
        private: z.boolean().optional().describe("Whether the repo is private"),
        auto_init: z.boolean().optional().describe("Initialize with README"),
        default_branch: z.string().optional().describe("Default branch name"),
        gitignores: z.string().optional().describe("Gitignore template"),
        license: z.string().optional().describe("License template"),
      },
      handler: async (client, p) => {
        const { action, ...body } = p;
        return client.post("/user/repos", body);
      },
    },
    create_org: {
      description: "Create a repository for an organization",
      params: {
        org: z.string().describe("Organization name"),
        name: z.string().describe("Repository name"),
        description: z.string().optional().describe("Repository description"),
        private: z.boolean().optional().describe("Whether the repo is private"),
        auto_init: z.boolean().optional().describe("Initialize with README"),
      },
      handler: async (client, p) => {
        const { action, org, ...body } = p;
        return client.post(`/orgs/${p.org}/repos`, body);
      },
    },
    delete: {
      description: "Delete a repository",
      params: { owner, repo },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}`),
    },
    list_branches: {
      description: "List branches of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/branches`, cleanParams(p)),
    },
    get_branch: {
      description: "Get a branch",
      params: { owner, repo, branch: z.string().describe("Branch name") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/branches/${p.branch}`),
    },
    create_branch: {
      description: "Create a branch",
      params: {
        owner, repo,
        new_branch_name: z.string().describe("New branch name"),
        old_branch_name: z.string().optional().describe("Branch to create from"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...body } = p;
        return client.post(`/repos/${p.owner}/${p.repo}/branches`, body);
      },
    },
    list_tags: {
      description: "List tags of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/tags`, cleanParams(p)),
    },
    list_commits: {
      description: "List commits of a repository",
      params: {
        owner, repo,
        sha: z.string().optional().describe("Branch or commit SHA to list from"),
        path: z.string().optional().describe("Filter by file path"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/git/commits`, query as Record<string, string>);
      },
    },
    get_contents: {
      description: "Get file or directory contents from a repository",
      params: {
        owner, repo,
        filepath: z.string().describe("Path to file or directory"),
        ref: z.string().optional().describe("Branch, tag, or commit to get contents from"),
      },
      handler: async (client, p) =>
        client.get(`/repos/${p.owner}/${p.repo}/contents/${p.filepath}`, { ref: p.ref as string | undefined }),
    },
    create_file: {
      description: "Create a file in a repository",
      params: {
        owner, repo,
        filepath: z.string().describe("Path to file"),
        content: z.string().describe("File content (base64 encoded)"),
        message: z.string().optional().describe("Commit message"),
        branch: z.string().optional().describe("Branch name"),
      },
      handler: async (client, p) => {
        const body = {
          content: p.content,
          message: p.message ?? `Create ${p.filepath}`,
          branch: p.branch,
        };
        return client.post(`/repos/${p.owner}/${p.repo}/contents/${p.filepath}`, body);
      },
    },
    update_file: {
      description: "Update a file in a repository",
      params: {
        owner, repo,
        filepath: z.string().describe("Path to file"),
        content: z.string().describe("New file content (base64 encoded)"),
        sha: z.string().describe("SHA of the file being replaced"),
        message: z.string().optional().describe("Commit message"),
        branch: z.string().optional().describe("Branch name"),
      },
      handler: async (client, p) => {
        const body = {
          content: p.content,
          sha: p.sha,
          message: p.message ?? `Update ${p.filepath}`,
          branch: p.branch,
        };
        return client.put(`/repos/${p.owner}/${p.repo}/contents/${p.filepath}`, body);
      },
    },
    delete_file: {
      description: "Delete a file from a repository",
      params: {
        owner, repo,
        filepath: z.string().describe("Path to file"),
        sha: z.string().describe("SHA of the file being deleted"),
        message: z.string().optional().describe("Commit message"),
        branch: z.string().optional().describe("Branch name"),
      },
      handler: async (client, p) => {
        const body = {
          sha: p.sha,
          message: p.message ?? `Delete ${p.filepath}`,
          branch: p.branch,
        };
        return client.delete(`/repos/${p.owner}/${p.repo}/contents/${p.filepath}`, body);
      },
    },
    list_releases: {
      description: "List releases of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/releases`, cleanParams(p)),
    },
    create_release: {
      description: "Create a release",
      params: {
        owner, repo,
        tag_name: z.string().describe("Tag name"),
        name: z.string().optional().describe("Release title"),
        body: z.string().optional().describe("Release description"),
        draft: z.boolean().optional().describe("Is draft"),
        prerelease: z.boolean().optional().describe("Is prerelease"),
        target_commitish: z.string().optional().describe("Target branch or commit"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...releaseBody } = p;
        return client.post(`/repos/${p.owner}/${p.repo}/releases`, releaseBody);
      },
    },
    list_forks: {
      description: "List forks of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/forks`, cleanParams(p)),
    },
    create_fork: {
      description: "Fork a repository",
      params: {
        owner, repo,
        organization: z.string().optional().describe("Fork to this organization"),
        name: z.string().optional().describe("Name for the forked repo"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.organization) body.organization = p.organization;
        if (p.name) body.name = p.name;
        return client.post(`/repos/${p.owner}/${p.repo}/forks`, body);
      },
    },
    list_topics: {
      description: "List topics of a repository",
      params: { owner, repo },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/topics`),
    },
    list_collaborators: {
      description: "List collaborators of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/collaborators`, cleanParams(p)),
    },
    list_hooks: {
      description: "List webhooks of a repository",
      params: { owner, repo, page, limit },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/hooks`, cleanParams(p)),
    },
    create_hook: {
      description: "Create a webhook on a repository",
      params: {
        owner, repo,
        hook_type: z.string().describe("Hook type (e.g. 'gitea', 'slack', 'discord', 'dingtalk')"),
        hook_url: z.string().describe("Target URL for the webhook"),
        hook_content_type: z.enum(["json", "form"]).optional().describe("Content type: json or form (default: json)"),
        hook_secret: z.string().optional().describe("Secret for the webhook"),
        hook_events: z.array(z.string()).optional().describe("Events to trigger on (e.g. ['push', 'pull_request'])"),
        hook_active: z.boolean().optional().describe("Whether the hook is active (default: true)"),
        branch_filter: z.string().optional().describe("Branch filter pattern"),
      },
      handler: async (client, p) => {
        const config: Record<string, unknown> = {
          url: p.hook_url,
          content_type: p.hook_content_type ?? "json",
        };
        if (p.hook_secret) config.secret = p.hook_secret;
        const body: Record<string, unknown> = {
          type: p.hook_type,
          config,
          events: p.hook_events ?? ["push"],
          active: p.hook_active ?? true,
        };
        if (p.branch_filter) body.branch_filter = p.branch_filter;
        return client.post(`/repos/${p.owner}/${p.repo}/hooks`, body);
      },
    },
    update_hook: {
      description: "Update a webhook on a repository",
      params: {
        owner, repo,
        hook_id: z.number().describe("Hook ID to update"),
        hook_url: z.string().optional().describe("New target URL"),
        hook_content_type: z.enum(["json", "form"]).optional().describe("Content type: json or form"),
        hook_secret: z.string().optional().describe("New secret"),
        hook_events: z.array(z.string()).optional().describe("Events to trigger on"),
        hook_active: z.boolean().optional().describe("Whether the hook is active"),
        branch_filter: z.string().optional().describe("Branch filter pattern"),
      },
      handler: async (client, p) => {
        const config: Record<string, unknown> = {};
        if (p.hook_url) config.url = p.hook_url;
        if (p.hook_content_type) config.content_type = p.hook_content_type;
        if (p.hook_secret) config.secret = p.hook_secret;
        const body: Record<string, unknown> = {};
        if (Object.keys(config).length > 0) body.config = config;
        if (p.hook_events) body.events = p.hook_events;
        if (p.hook_active !== undefined) body.active = p.hook_active;
        if (p.branch_filter !== undefined) body.branch_filter = p.branch_filter;
        return client.patch(`/repos/${p.owner}/${p.repo}/hooks/${p.hook_id}`, body);
      },
    },
    delete_hook: {
      description: "Delete a webhook from a repository",
      params: {
        owner, repo,
        hook_id: z.number().describe("Hook ID to delete"),
      },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/hooks/${p.hook_id}`),
    },
  });
}
