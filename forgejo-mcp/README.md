# forgejo-mcp

MCP (Model Context Protocol) server for [Forgejo](https://forgejo.org), a self-hosted Git service (a hard fork of Gitea). Exposes the Forgejo API v1 as MCP tools, enabling Claude Code and other MCP clients to manage repositories, issues, pull requests, and more.

Forgejo's REST API is served at `/api/v1` and is largely Gitea-compatible, so this server is a sibling of `gitea-mcp` pointed at a Forgejo instance.

## Setup

### 1. Install dependencies and build

```bash
npm install
npm run build
```

### 2. Configure environment variables

| Variable | Description |
|----------|-------------|
| `FORGEJO_URL` | Base URL of your Forgejo instance (e.g., `https://forgejo.example.com`) |
| `FORGEJO_TOKEN` | API token from Forgejo |

Generate a token in Forgejo under **Settings > Applications > Generate New Token**.

> **Note:** Unlike legacy Gitea, Forgejo *requires* at least one scope on a token — a scopeless token grants no API access. Select scopes covering the tools you intend to use:
>
> | Scope | Enables |
> |-------|---------|
> | `repository` | `forgejo_repos`, `forgejo_pulls`, most of `forgejo_issues` |
> | `issue` | `forgejo_issues` |
> | `organization` | `forgejo_orgs` |
> | `notification` | `forgejo_notifications` |
> | `user` | `forgejo_users` |
> | `misc` | `forgejo_admin` version/settings/templates/markdown |
> | `admin` | `forgejo_admin` user/org/cron management |
>
> Each scope has `read:` / `write:` variants (read → GET, write → POST/PUT/PATCH/DELETE). Pick `write:` where you need to create or modify.

### 3. Register with Claude Code

Add to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "forgejo": {
      "command": "node",
      "args": ["/path/to/forgejo-mcp/dist/index.js"],
      "env": {
        "FORGEJO_URL": "https://forgejo.example.com",
        "FORGEJO_TOKEN": "your-token"
      }
    }
  }
}
```

## Tool Reference

Tools are grouped by domain with an `action` parameter.

| Tool | Actions |
|------|---------|
| `forgejo_repos` | search, get, create_user, create_org, delete, edit, transfer, accept_transfer, reject_transfer, list_branches, get_branch, create_branch, delete_branch, list_branch_protections, get_branch_protection, create_branch_protection, edit_branch_protection, delete_branch_protection, list_tags, list_commits, get_commit, list_refs, get_ref, get_tree, get_blob, get_contents, create_file, update_file, delete_file, create_status, list_statuses, get_combined_status, list_releases, create_release, list_forks, create_fork, list_topics, list_collaborators, check_collaborator, add_collaborator, remove_collaborator, get_collaborator_permission, list_keys, get_key, create_key, delete_key, get_subscription, watch, unwatch, list_wiki_pages, get_wiki_page, create_wiki_page, edit_wiki_page, delete_wiki_page, list_wiki_revisions, list_hooks, create_hook, update_hook, delete_hook |
| `forgejo_issues` | list, get, create, update, list_comments, create_comment, get_comment, edit_comment, delete_comment, list_issue_reactions, add_issue_reaction, remove_issue_reaction, list_comment_reactions, add_comment_reaction, remove_comment_reaction, list_labels, add_labels, replace_labels, remove_label, clear_labels, list_milestones, create_milestone, get_milestone, edit_milestone, delete_milestone, list_repo_labels, create_repo_label, get_repo_label, edit_repo_label, delete_repo_label |
| `forgejo_pulls` | list, get, get_by_base_head, create, update, merge, is_merged, update_branch, list_reviews, get_review, create_review, submit_review, delete_review, dismiss_review, undismiss_review, list_review_comments, request_reviewers, unrequest_reviewers, get_diff, list_files, list_commits |
| `forgejo_users` | me, get, search, list_repos, list_my_repos, list_starred, list_my_starred, list_followers, list_following |
| `forgejo_orgs` | list_my, get, create, update, list_repos, list_members, list_teams, list_labels, list_hooks |
| `forgejo_notifications` | list, list_repo, mark_read, mark_repo_read |
| `forgejo_admin` | list_users, create_user, delete_user, list_orgs, list_cron_tasks, run_cron_task, version, settings, gitignore_templates, license_templates, render_markdown |
| `forgejo_actions` | list_runs, get_run, list_tasks, search_jobs, dispatch_workflow, list_secrets, set_secret, delete_secret, list_variables, get_variable, create_variable, update_variable, delete_variable, list_runners, get_runner, delete_runner, get_registration_token |

> **Actions / CI (`forgejo_actions`):** `list_tasks` returns per-job CI verdicts (which lane passed/failed) and `list_runs`/`get_run` the workflow-run rollup — the fastest way to see CI status. Reads need `read:repository`; secrets/variables/runners writes need `write:repository`.
>
> **No job logs over REST on gitea-1.22.** Forgejo 15.0.2 (`gitea-1.22` API) exposes **no** `/actions/jobs/{id}/logs` endpoint — the only `/jobs` route is `runners/jobs` (search by label, no log body). To read a failed lane's output, open the run URL (returned by `list_tasks`) in the web UI, or have the user paste the log. The REST logs endpoint (go-gitea PR #35382) requires a newer Forgejo; this server will gain a `job_logs` action once the instance is upgraded.

## Usage Examples

```
# Search for repositories
"Search for repos matching 'webapp' on my Forgejo instance"

# Create a pull request
"Create a PR from feature-branch to main on owner/repo"

# List issues
"Show me open issues on owner/repo"
```

## Development

```bash
npm run dev    # Watch mode (recompile on changes)
npm run build  # One-time build
npm start      # Run the MCP server
```
