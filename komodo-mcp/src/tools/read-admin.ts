import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, readAction } from "../helpers.js";

const nameOrId = z.string().describe("Resource name or ID");

export function registerAdminReadTools(server: McpServer, client: KomodoClient) {
  // -- Users --
  registerActionTool(server, client, "komodo_users", "Query Komodo users", {
    list: readAction("ListUsers", "List all users"),
    find: readAction("FindUser", "Find a user by ID or username", {
      user: z.string().describe("User ID or username"),
    }, (p) => ({ user: p.user })),
    get_username: readAction("GetUsername", "Get username for a user ID", {
      user_id: z.string().describe("User ID"),
    }, (p) => ({ user_id: p.user_id })),
    list_api_keys: readAction("ListApiKeysForServiceUser", "List API keys for a service user", {
      user: z.string().describe("Service user ID or username"),
    }, (p) => ({ user: p.user })),
  });

  // -- User Groups --
  registerActionTool(server, client, "komodo_user_groups", "Query Komodo user groups", {
    list: readAction("ListUserGroups", "List all user groups"),
    get: readAction("GetUserGroup", "Get user group details", {
      user_group: nameOrId,
    }, (p) => ({ user_group: p.user_group })),
  });

  // -- Permissions --
  registerActionTool(server, client, "komodo_permissions", "Query Komodo permissions", {
    get: readAction("GetPermission", "Get permission for a user on a resource target", {
      user_target: z.string().describe("User or group ID"),
      resource_target_type: z.string().describe("Resource type (e.g., Deployment, Stack)"),
      resource_target_id: z.string().describe("Resource ID"),
    }, (p) => ({
      user_target: { type: "User", id: p.user_target },
      resource_target: { type: p.resource_target_type, id: p.resource_target_id },
    })),
    list: readAction("ListPermissions", "List all permissions"),
  });

  // -- Variables --
  registerActionTool(server, client, "komodo_variables", "Query Komodo variables", {
    list: readAction("ListVariables", "List all variables"),
    get: readAction("GetVariable", "Get variable details", {
      variable: nameOrId,
    }, (p) => ({ variable: p.variable })),
  });

  // -- Tags --
  registerActionTool(server, client, "komodo_tags", "Query Komodo tags", {
    list: readAction("ListTags", "List all tags"),
    get: readAction("GetTag", "Get tag details", {
      tag: nameOrId,
    }, (p) => ({ tag: p.tag })),
  });

  // -- Alerts --
  registerActionTool(server, client, "komodo_alerts", "Query Komodo alerts", {
    list: readAction("ListAlerts", "List alerts", {
      page: z.number().optional().describe("Page number (0-indexed)"),
    }, (p) => ({ query: { page: p.page ?? 0 } })),
    get: readAction("GetAlert", "Get alert details", {
      alert: z.string().describe("Alert ID"),
    }, (p) => ({ alert: p.alert })),
  });

  // -- Builders --
  registerActionTool(server, client, "komodo_builders", "Query Komodo builders", {
    list: readAction("ListBuilders", "List all builders"),
    get: readAction("GetBuilder", "Get builder details", {
      builder: nameOrId,
    }, (p) => ({ builder: p.builder })),
    get_summary: readAction("GetBuildersSummary", "Get summary counts"),
  });

  // -- Docker Registries --
  registerActionTool(server, client, "komodo_docker_registries", "Query Komodo Docker registries", {
    list: readAction("ListDockerRegistryAccounts", "List all Docker registries"),
    list_from_config: readAction("ListDockerRegistriesFromConfig", "List registries from core config"),
    get: readAction("GetDockerRegistryAccount", "Get registry account details", {
      registry: nameOrId,
    }, (p) => ({ registry: p.registry })),
  });

  // -- Git Providers --
  registerActionTool(server, client, "komodo_git_providers", "Query Komodo Git providers", {
    list: readAction("ListGitProviderAccounts", "List all Git providers"),
    list_from_config: readAction("ListGitProvidersFromConfig", "List providers from core config"),
    get: readAction("GetGitProviderAccount", "Get provider account details", {
      provider: nameOrId,
    }, (p) => ({ provider: p.provider })),
  });

  // -- System --
  registerActionTool(server, client, "komodo_system", "Query Komodo system info", {
    get_version: readAction("GetVersion", "Get Komodo version"),
    get_core_info: readAction("GetCoreInfo", "Get core system information"),
    list_schedules: readAction("ListSchedules", "List all scheduled tasks"),
    list_secrets: readAction("ListSecrets", "List all secret names"),
    list_terminals: readAction("ListTerminals", "List active terminals"),
    list_updates: readAction("ListUpdates", "List recent updates/operations", {
      page: z.number().optional().describe("Page number (0-indexed)"),
    }, (p) => ({ query: { page: p.page ?? 0 } })),
    get_update: readAction("GetUpdate", "Get details of a specific update", {
      update_id: z.string().describe("Update ID"),
    }, (p) => ({ id: p.update_id })),
    get_docker_summary: readAction("GetDockerContainersSummary", "Get summary of Docker containers across all servers"),
    find_resource: readAction("GetResourceMatchingContainer", "Find which Komodo resource owns a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
  });
}
