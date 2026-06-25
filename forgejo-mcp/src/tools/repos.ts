import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ForgejoClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner (user or org)");
const repo = z.string().describe("Repository name");
const page = z.number().optional().describe("Page number (default: 1)");
const limit = z.number().optional().describe("Items per page (default: 50)");

export function registerRepoTools(server: McpServer, client: ForgejoClient) {
  registerActionTool(server, client, "forgejo_repos", "Manage Forgejo repositories", {
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
        hook_type: z.string().describe("Hook type: forgejo (native default), gitea, gogs, slack, discord, dingtalk, telegram, msteams, feishu, matrix, wechatwork, packagist, sourcehut_builds"),
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

    // --- Repository settings / lifecycle ---
    edit: {
      description: "Edit repository settings",
      params: {
        owner, repo,
        name: z.string().optional().describe("New repository name"),
        description: z.string().optional().describe("New description"),
        website: z.string().optional().describe("Project website URL"),
        private: z.boolean().optional().describe("Whether the repo is private"),
        default_branch: z.string().optional().describe("Default branch name"),
        archived: z.boolean().optional().describe("Whether the repo is archived"),
        has_issues: z.boolean().optional().describe("Enable the issue tracker"),
        has_wiki: z.boolean().optional().describe("Enable the wiki"),
        has_pull_requests: z.boolean().optional().describe("Enable pull requests"),
        has_actions: z.boolean().optional().describe("Enable Actions (CI/CD)"),
        has_releases: z.boolean().optional().describe("Enable releases"),
        default_merge_style: z.string().optional().describe("Default merge style: merge, rebase, rebase-merge, squash, fast-forward-only"),
        default_delete_branch_after_merge: z.boolean().optional().describe("Delete branch after merge by default"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, ...body } = p;
        return client.patch(`/repos/${p.owner}/${p.repo}`, body);
      },
    },
    transfer: {
      description: "Transfer a repository to a new owner",
      params: {
        owner, repo,
        new_owner: z.string().describe("Username or org to transfer to"),
        team_ids: z.string().optional().describe("Comma-separated team IDs (when transferring to an org)"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { new_owner: p.new_owner };
        if (p.team_ids) body.team_ids = (p.team_ids as string).split(",").map(s => Number(s.trim()));
        return client.post(`/repos/${p.owner}/${p.repo}/transfer`, body);
      },
    },
    accept_transfer: {
      description: "Accept a pending repository transfer",
      params: { owner, repo },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/transfer/accept`),
    },
    reject_transfer: {
      description: "Reject a pending repository transfer",
      params: { owner, repo },
      handler: async (client, p) => client.post(`/repos/${p.owner}/${p.repo}/transfer/reject`),
    },

    // --- Commit statuses (CI status attached to a commit; complements forgejo_actions) ---
    create_status: {
      description: "Create a commit status on a SHA (e.g. report CI state)",
      params: {
        owner, repo,
        sha: z.string().describe("Commit SHA"),
        state: z.string().describe("Status state: pending, success, error, failure, warning"),
        context: z.string().optional().describe("A label to differentiate this status, e.g. ci/lint"),
        description: z.string().optional().describe("Short description of the status"),
        target_url: z.string().optional().describe("URL with more details (e.g. the CI run)"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { state: p.state };
        if (p.context !== undefined) body.context = p.context;
        if (p.description !== undefined) body.description = p.description;
        if (p.target_url !== undefined) body.target_url = p.target_url;
        return client.post(`/repos/${p.owner}/${p.repo}/statuses/${p.sha}`, body);
      },
    },
    list_statuses: {
      description: "List all commit statuses for a ref (branch, tag, or SHA)",
      params: {
        owner, repo,
        ref: z.string().describe("Branch, tag, or commit SHA"),
        sort: z.string().optional().describe("Sort: oldest, recentupdate, leastupdate, leastindex, highestindex"),
        state: z.string().optional().describe("Filter by state: pending, success, error, failure, warning"),
        page, limit,
      },
      handler: async (client, p) => {
        const { action, owner, repo, ref, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/commits/${p.ref}/statuses`, cleanParams(query));
      },
    },
    get_combined_status: {
      description: "Get the combined (rolled-up) commit status for a ref",
      params: { owner, repo, ref: z.string().describe("Branch, tag, or commit SHA") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/commits/${p.ref}/status`),
    },

    // --- Git data API (low-level objects) ---
    get_commit: {
      description: "Get a single git commit by SHA (full metadata, diff stat)",
      params: { owner, repo, sha: z.string().describe("Commit SHA") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/git/commits/${p.sha}`),
    },
    list_refs: {
      description: "List git references (branches and tags) of a repository",
      params: { owner, repo },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/git/refs`),
    },
    get_ref: {
      description: "Get git references matching a ref name (e.g. heads/main, tags/v1.0)",
      params: { owner, repo, ref: z.string().describe("Ref name, e.g. heads/main or tags/v1.0") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/git/refs/${p.ref}`),
    },
    get_tree: {
      description: "Get a git tree by SHA",
      params: {
        owner, repo,
        sha: z.string().describe("Tree SHA"),
        recursive: z.boolean().optional().describe("Recurse into subtrees"),
        page,
        per_page: z.number().optional().describe("Items per page"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, sha, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/git/trees/${p.sha}`, cleanParams(query));
      },
    },
    get_blob: {
      description: "Get a git blob by SHA (base64-encoded content)",
      params: { owner, repo, sha: z.string().describe("Blob SHA") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/git/blobs/${p.sha}`),
    },

    // --- Branches (delete) + branch protections ---
    delete_branch: {
      description: "Delete a branch",
      params: { owner, repo, branch: z.string().describe("Branch name to delete") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/branches/${p.branch}`),
    },
    list_branch_protections: {
      description: "List branch protection rules",
      params: { owner, repo },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/branch_protections`),
    },
    get_branch_protection: {
      description: "Get a branch protection rule by name",
      params: { owner, repo, bp_name: z.string().describe("Branch protection rule name") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/branch_protections/${p.bp_name}`),
    },
    create_branch_protection: {
      description: "Create a branch protection rule",
      params: {
        owner, repo,
        rule_name: z.string().describe("Rule name or branch glob (e.g. main or release/*)"),
        required_approvals: z.number().optional().describe("Number of required approving reviews"),
        enable_push: z.boolean().optional().describe("Allow direct pushes (whitelist applies if push whitelist enabled)"),
        enable_status_check: z.boolean().optional().describe("Require status checks to pass"),
        status_check_contexts: z.string().optional().describe("Comma-separated required status check contexts"),
        block_on_outdated_branch: z.boolean().optional().describe("Block merge if branch is behind base"),
        block_on_rejected_reviews: z.boolean().optional().describe("Block merge on rejected reviews"),
        dismiss_stale_approvals: z.boolean().optional().describe("Dismiss approvals when new commits are pushed"),
        require_signed_commits: z.boolean().optional().describe("Require signed commits"),
        apply_to_admins: z.boolean().optional().describe("Apply the rule to admins too"),
        protected_file_patterns: z.string().optional().describe("Glob patterns of protected files"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, status_check_contexts, ...rest } = p;
        const body: Record<string, unknown> = { ...rest };
        if (status_check_contexts) {
          body.status_check_contexts = (status_check_contexts as string).split(",").map(s => s.trim());
        }
        return client.post(`/repos/${p.owner}/${p.repo}/branch_protections`, body);
      },
    },
    edit_branch_protection: {
      description: "Edit a branch protection rule",
      params: {
        owner, repo,
        bp_name: z.string().describe("Branch protection rule name to edit"),
        required_approvals: z.number().optional().describe("Number of required approving reviews"),
        enable_push: z.boolean().optional().describe("Allow direct pushes"),
        enable_status_check: z.boolean().optional().describe("Require status checks to pass"),
        status_check_contexts: z.string().optional().describe("Comma-separated required status check contexts"),
        block_on_outdated_branch: z.boolean().optional().describe("Block merge if branch is behind base"),
        dismiss_stale_approvals: z.boolean().optional().describe("Dismiss approvals on new commits"),
        require_signed_commits: z.boolean().optional().describe("Require signed commits"),
        apply_to_admins: z.boolean().optional().describe("Apply to admins too"),
      },
      handler: async (client, p) => {
        const { action, owner, repo, bp_name, status_check_contexts, ...rest } = p;
        const body: Record<string, unknown> = { ...rest };
        if (status_check_contexts) {
          body.status_check_contexts = (status_check_contexts as string).split(",").map(s => s.trim());
        }
        return client.patch(`/repos/${p.owner}/${p.repo}/branch_protections/${p.bp_name}`, body);
      },
    },
    delete_branch_protection: {
      description: "Delete a branch protection rule",
      params: { owner, repo, bp_name: z.string().describe("Branch protection rule name") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/branch_protections/${p.bp_name}`),
    },

    // --- Collaborators ---
    check_collaborator: {
      description: "Check whether a user is a collaborator (success if so, errors 404 if not)",
      params: { owner, repo, collaborator: z.string().describe("Username to check") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/collaborators/${p.collaborator}`),
    },
    add_collaborator: {
      description: "Add or update a collaborator on a repository",
      params: {
        owner, repo,
        collaborator: z.string().describe("Username to add"),
        permission: z.string().optional().describe("Permission: read, write, or admin"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.permission) body.permission = p.permission;
        return client.put(`/repos/${p.owner}/${p.repo}/collaborators/${p.collaborator}`, body);
      },
    },
    remove_collaborator: {
      description: "Remove a collaborator from a repository",
      params: { owner, repo, collaborator: z.string().describe("Username to remove") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/collaborators/${p.collaborator}`),
    },
    get_collaborator_permission: {
      description: "Get a collaborator's permission level on a repository",
      params: { owner, repo, collaborator: z.string().describe("Username") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/collaborators/${p.collaborator}/permission`),
    },

    // --- Deploy keys ---
    list_keys: {
      description: "List a repository's deploy keys",
      params: { owner, repo, page, limit },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/keys`, cleanParams(query));
      },
    },
    get_key: {
      description: "Get a deploy key by id",
      params: { owner, repo, key_id: z.number().describe("Deploy key ID") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/keys/${p.key_id}`),
    },
    create_key: {
      description: "Add a deploy key to a repository",
      params: {
        owner, repo,
        title: z.string().describe("Key title"),
        key: z.string().describe("The public SSH key content"),
        read_only: z.boolean().optional().describe("Whether the key is read-only (default: true is safer)"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { title: p.title, key: p.key };
        if (p.read_only !== undefined) body.read_only = p.read_only;
        return client.post(`/repos/${p.owner}/${p.repo}/keys`, body);
      },
    },
    delete_key: {
      description: "Delete a deploy key",
      params: { owner, repo, key_id: z.number().describe("Deploy key ID") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/keys/${p.key_id}`),
    },

    // --- Watch / subscription ---
    get_subscription: {
      description: "Check the authenticated user's watch status on a repository",
      params: { owner, repo },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/subscription`),
    },
    watch: {
      description: "Watch a repository",
      params: { owner, repo },
      handler: async (client, p) => client.put(`/repos/${p.owner}/${p.repo}/subscription`),
    },
    unwatch: {
      description: "Unwatch a repository",
      params: { owner, repo },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/subscription`),
    },

    // --- Wiki ---
    list_wiki_pages: {
      description: "List a repository's wiki pages",
      params: { owner, repo, page, limit },
      handler: async (client, p) => {
        const { action, owner, repo, ...query } = p;
        return client.get(`/repos/${p.owner}/${p.repo}/wiki/pages`, cleanParams(query));
      },
    },
    get_wiki_page: {
      description: "Get a wiki page by name (content is base64-encoded)",
      params: { owner, repo, page_name: z.string().describe("Wiki page name") },
      handler: async (client, p) => client.get(`/repos/${p.owner}/${p.repo}/wiki/page/${encodeURIComponent(p.page_name as string)}`),
    },
    create_wiki_page: {
      description: "Create a wiki page",
      params: {
        owner, repo,
        title: z.string().describe("Wiki page title"),
        content_base64: z.string().describe("Page content, base64-encoded"),
        message: z.string().optional().describe("Commit message"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = { title: p.title, content_base64: p.content_base64 };
        if (p.message) body.message = p.message;
        return client.post(`/repos/${p.owner}/${p.repo}/wiki/new`, body);
      },
    },
    edit_wiki_page: {
      description: "Edit a wiki page",
      params: {
        owner, repo,
        page_name: z.string().describe("Existing wiki page name"),
        title: z.string().optional().describe("New title"),
        content_base64: z.string().optional().describe("New content, base64-encoded"),
        message: z.string().optional().describe("Commit message"),
      },
      handler: async (client, p) => {
        const body: Record<string, unknown> = {};
        if (p.title !== undefined) body.title = p.title;
        if (p.content_base64 !== undefined) body.content_base64 = p.content_base64;
        if (p.message !== undefined) body.message = p.message;
        return client.patch(`/repos/${p.owner}/${p.repo}/wiki/page/${encodeURIComponent(p.page_name as string)}`, body);
      },
    },
    delete_wiki_page: {
      description: "Delete a wiki page",
      params: { owner, repo, page_name: z.string().describe("Wiki page name") },
      handler: async (client, p) => client.delete(`/repos/${p.owner}/${p.repo}/wiki/page/${encodeURIComponent(p.page_name as string)}`),
    },
    list_wiki_revisions: {
      description: "List the revision history of a wiki page",
      params: { owner, repo, page_name: z.string().describe("Wiki page name"), page },
      handler: async (client, p) =>
        client.get(`/repos/${p.owner}/${p.repo}/wiki/revisions/${encodeURIComponent(p.page_name as string)}`, { page: p.page as number | undefined }),
    },
  });
}
