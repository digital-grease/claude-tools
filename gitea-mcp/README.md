# gitea-mcp

MCP (Model Context Protocol) server for [Gitea](https://gitea.com), a self-hosted Git service. Exposes the Gitea API v1 as MCP tools, enabling Claude Code and other MCP clients to manage repositories, issues, pull requests, and more.

## Setup

### 1. Install dependencies and build

```bash
npm install
npm run build
```

### 2. Configure environment variables

| Variable | Description |
|----------|-------------|
| `GITEA_URL` | Base URL of your Gitea instance (e.g., `https://gitea.example.com`) |
| `GITEA_TOKEN` | API token from Gitea |

Generate a token in Gitea under **Settings > Applications > Access Tokens**.

### 3. Register with Claude Code

Add to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "gitea": {
      "command": "node",
      "args": ["/path/to/gitea-mcp/dist/index.js"],
      "env": {
        "GITEA_URL": "https://gitea.example.com",
        "GITEA_TOKEN": "your-token"
      }
    }
  }
}
```

## Tool Reference

Tools are grouped by domain with an `action` parameter.

| Tool | Actions |
|------|---------|
| `gitea_repos` | search, get, create_user, create_org, delete, list_branches, get_branch, create_branch, list_tags, list_commits, get_contents, create_file, update_file, delete_file, list_releases, create_release, list_forks, create_fork, list_topics, list_collaborators, list_hooks, create_hook, update_hook, delete_hook |
| `gitea_issues` | list, get, create, update, list_comments, create_comment, list_labels, add_labels, list_milestones, create_milestone, list_repo_labels, create_repo_label |
| `gitea_pulls` | list, get, create, update, merge, list_reviews, create_review, get_diff, list_files, list_commits |
| `gitea_users` | me, get, search, list_repos, list_my_repos, list_starred, list_my_starred, list_followers, list_following |
| `gitea_orgs` | list_my, get, create, update, list_repos, list_members, list_teams, list_labels, list_hooks |
| `gitea_notifications` | list, list_repo, mark_read, mark_repo_read |
| `gitea_admin` | list_users, create_user, delete_user, list_orgs, list_cron_tasks, run_cron_task, version, settings, gitignore_templates, license_templates, render_markdown |

## Usage Examples

```
# Search for repositories
"Search for repos matching 'webapp' on my Gitea instance"

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
