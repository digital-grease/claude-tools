# komodo-mcp

MCP (Model Context Protocol) server for [Komodo](https://komo.do), a container and infrastructure management platform. Exposes Komodo's full API as MCP tools, enabling Claude Code and other MCP clients to manage deployments, stacks, servers, builds, and more.

## Setup

### 1. Install dependencies and build

```bash
cd komodo-mcp
npm install
npm run build
```

### 2. Configure environment variables

The server requires three environment variables:

| Variable | Description |
|----------|-------------|
| `KOMODO_URL` | Base URL of your Komodo instance (e.g., `https://komodo.example.com`) |
| `KOMODO_API_KEY` | API key from Komodo |
| `KOMODO_API_SECRET` | API secret from Komodo |

Generate an API key pair in Komodo under **Settings > API Keys**.

### 3. Register with Claude Code

Add to your Claude Code MCP config (`~/.claude/claude_desktop_config.json` or project-level):

```json
{
  "mcpServers": {
    "komodo": {
      "command": "node",
      "args": ["/path/to/komodo-mcp/dist/index.js"],
      "env": {
        "KOMODO_URL": "https://komodo.example.com",
        "KOMODO_API_KEY": "your-api-key",
        "KOMODO_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

## Tool Reference

Tools are grouped by resource domain with an `action` parameter to keep the tool count manageable (~45 tools instead of 250+).

### Read Tools (Query & Inspection)

| Tool | Actions |
|------|---------|
| `komodo_deployments` | list, get, get_container, get_log, search_log, get_stats, get_summary |
| `komodo_stacks` | list, get, get_log, search_log, list_services, get_summary |
| `komodo_servers` | list, get, get_state, get_stats, get_system_info, list_processes, get_summary |
| `komodo_builds` | list, get, list_versions, get_summary |
| `komodo_repos` | list, get, get_summary |
| `komodo_containers` | list, list_all, get_log, search_log, inspect |
| `komodo_images` | list, inspect |
| `komodo_networks` | list, inspect |
| `komodo_volumes` | list, inspect |
| `komodo_compose_projects` | list |
| `komodo_procedures` | list, get, get_summary |
| `komodo_actions` | list, get, get_summary |
| `komodo_alerters` | list, get, get_summary |
| `komodo_syncs` | list, get, get_summary, export_toml, export_all_toml |
| `komodo_swarms` | list, get, get_summary, inspect, list_nodes, list_services, list_stacks, list_networks, list_configs, list_secrets |
| `komodo_users` | list, find, get_username, list_api_keys |
| `komodo_user_groups` | list, get |
| `komodo_permissions` | get, list |
| `komodo_variables` | list, get |
| `komodo_tags` | list, get |
| `komodo_alerts` | list, get |
| `komodo_builders` | list, get, get_summary |
| `komodo_docker_registries` | list, list_from_config, get |
| `komodo_git_providers` | list, list_from_config, get |
| `komodo_system` | get_version, get_core_info, list_schedules, list_secrets, list_terminals, list_updates, get_update, get_docker_summary, find_resource |

### Write Tools (Create, Update, Delete)

| Tool | Actions |
|------|---------|
| `komodo_deployment_manage` | create, update, delete, copy, rename, create_from_container |
| `komodo_stack_manage` | create, update, delete, copy, rename, write_file, check_update |
| `komodo_server_manage` | create, update, delete, copy, rename |
| `komodo_build_manage` | create, update, delete, copy, rename, write_file, refresh_cache |
| `komodo_repo_manage` | create, update, delete, copy, rename, refresh_cache |
| `komodo_procedure_manage` | create, update, delete, copy, rename |
| `komodo_action_manage` | create, update, delete, copy, rename |
| `komodo_alerter_manage` | create, update, delete, copy, rename |
| `komodo_sync_manage` | create, update, delete, copy, rename, write_file, commit, refresh_pending |
| `komodo_swarm_manage` | create, update, delete, copy, rename |
| `komodo_builder_manage` | create, update, delete, copy, rename |
| `komodo_docker_registry_manage` | create, update, delete |
| `komodo_git_provider_manage` | create, update, delete |
| `komodo_user_manage` | create_local, create_service, delete, update_admin, create_api_key, delete_api_key |
| `komodo_user_group_manage` | create, delete, rename, add_user, remove_user |
| `komodo_permission_manage` | update_on_target |
| `komodo_variable_manage` | create, delete, update_value, update_description |
| `komodo_tag_manage` | create, delete, rename |
| `komodo_alert_manage` | close |
| `komodo_network_manage` | create |

### Execute Tools (Lifecycle & Operations)

| Tool | Actions |
|------|---------|
| `komodo_deployment_control` | deploy, start, stop, restart, pause, unpause, pull, destroy |
| `komodo_stack_control` | deploy, deploy_if_changed, start, stop, restart, pause, unpause, pull, destroy, run_service |
| `komodo_container_control` | start, stop, restart, pause, unpause, destroy, start_all, stop_all, restart_all |
| `komodo_build_control` | run, cancel |
| `komodo_repo_control` | clone, pull, build, cancel_build |
| `komodo_procedure_control` | run |
| `komodo_action_control` | run |
| `komodo_sync_control` | run |
| `komodo_alerter_control` | test, send_alert |
| `komodo_image_control` | delete, prune |
| `komodo_network_control` | delete, prune |
| `komodo_volume_control` | delete, prune |
| `komodo_swarm_control` | create_config, create_secret, remove_services, remove_stacks |
| `komodo_batch` | batch_deploy, batch_deploy_stack, batch_run_build, batch_run_action, batch_run_procedure, batch_destroy_deployment, batch_destroy_stack |
| `komodo_system_control` | backup_database, prune_system, prune_buildx, rotate_core_keys, rotate_all_server_keys, global_auto_update |

## Usage Examples

```
# Ask Claude to list your deployments
"List all my Komodo deployments"

# Check server health
"Show me the CPU and memory stats for server prod-1"

# View stack logs
"Get the last 50 lines of logs for the monitoring stack"

# Deploy a stack
"Deploy the web-app stack"
```

## Development

```bash
npm run dev    # Watch mode (recompile on changes)
npm run build  # One-time build
npm start      # Run the MCP server
```
