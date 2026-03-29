import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, writeAction } from "../helpers.js";

const nameOrId = z.string().describe("Resource name or ID");
const nameParam = z.string().describe("Name for the new resource");
const configParam = z.string().optional().describe("JSON config object for the resource");

function configBody(type: string) {
  return (p: Record<string, unknown>) => {
    const body: Record<string, unknown> = { [type]: p.name ?? p[type] };
    if (p.config) {
      try {
        body.config = JSON.parse(p.config as string);
      } catch {
        body.config = {};
      }
    }
    return body;
  };
}

function updateBody(type: string) {
  return (p: Record<string, unknown>) => {
    const body: Record<string, unknown> = { id: p[type] ?? p.name };
    if (p.config) {
      try {
        body.config = JSON.parse(p.config as string);
      } catch {
        body.config = {};
      }
    }
    return body;
  };
}

export function registerWriteTools(server: McpServer, client: KomodoClient) {
  // -- Deployment CRUD --
  registerActionTool(server, client, "komodo_deployment_manage", "Create, update, delete, copy, rename deployments", {
    create: writeAction("CreateDeployment", "Create a new deployment", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateDeployment", "Update deployment config", {
      deployment: nameOrId, config: configParam,
    }, updateBody("deployment")),
    delete: writeAction("DeleteDeployment", "Delete a deployment (DESTRUCTIVE)", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    copy: writeAction("CopyDeployment", "Copy a deployment", {
      deployment: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.deployment, new_name: p.new_name })),
    rename: writeAction("RenameDeployment", "Rename a deployment", {
      deployment: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ deployment: p.deployment, new_name: p.new_name })),
    create_from_container: writeAction("CreateDeploymentFromContainer", "Create deployment from existing container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
  });

  // -- Stack CRUD --
  registerActionTool(server, client, "komodo_stack_manage", "Create, update, delete, copy, rename stacks", {
    create: writeAction("CreateStack", "Create a new stack", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateStack", "Update stack config", {
      stack: nameOrId, config: configParam,
    }, updateBody("stack")),
    delete: writeAction("DeleteStack", "Delete a stack (DESTRUCTIVE)", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    copy: writeAction("CopyStack", "Copy a stack", {
      stack: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.stack, new_name: p.new_name })),
    rename: writeAction("RenameStack", "Rename a stack", {
      stack: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ stack: p.stack, new_name: p.new_name })),
    write_file: writeAction("WriteStackFileContents", "Write/update stack compose file contents", {
      stack: nameOrId, contents: z.string().describe("File contents"),
    }, (p) => ({ stack: p.stack, contents: p.contents })),
    check_update: writeAction("CheckStackForUpdate", "Check if stack has pending updates", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
  });

  // -- Server CRUD --
  registerActionTool(server, client, "komodo_server_manage", "Create, update, delete servers", {
    create: writeAction("CreateServer", "Create a new server", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateServer", "Update server config", {
      server: nameOrId, config: configParam,
    }, updateBody("server")),
    delete: writeAction("DeleteServer", "Delete a server (DESTRUCTIVE)", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    copy: writeAction("CopyServer", "Copy a server", {
      server: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.server, new_name: p.new_name })),
    rename: writeAction("RenameServer", "Rename a server", {
      server: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ server: p.server, new_name: p.new_name })),
  });

  // -- Build CRUD --
  registerActionTool(server, client, "komodo_build_manage", "Create, update, delete builds", {
    create: writeAction("CreateBuild", "Create a new build", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateBuild", "Update build config", {
      build: nameOrId, config: configParam,
    }, updateBody("build")),
    delete: writeAction("DeleteBuild", "Delete a build (DESTRUCTIVE)", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
    copy: writeAction("CopyBuild", "Copy a build", {
      build: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.build, new_name: p.new_name })),
    rename: writeAction("RenameBuild", "Rename a build", {
      build: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ build: p.build, new_name: p.new_name })),
    write_file: writeAction("WriteBuildFileContents", "Write/update build Dockerfile contents", {
      build: nameOrId, contents: z.string().describe("File contents"),
    }, (p) => ({ build: p.build, contents: p.contents })),
    refresh_cache: writeAction("RefreshBuildCache", "Refresh the build cache", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
  });

  // -- Repo CRUD --
  registerActionTool(server, client, "komodo_repo_manage", "Create, update, delete repos", {
    create: writeAction("CreateRepo", "Create a new repo", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateRepo", "Update repo config", {
      repo: nameOrId, config: configParam,
    }, updateBody("repo")),
    delete: writeAction("DeleteRepo", "Delete a repo (DESTRUCTIVE)", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
    copy: writeAction("CopyRepo", "Copy a repo", {
      repo: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.repo, new_name: p.new_name })),
    rename: writeAction("RenameRepo", "Rename a repo", {
      repo: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ repo: p.repo, new_name: p.new_name })),
    refresh_cache: writeAction("RefreshRepoCache", "Refresh the repo cache", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
  });

  // -- Procedure CRUD --
  registerActionTool(server, client, "komodo_procedure_manage", "Create, update, delete procedures", {
    create: writeAction("CreateProcedure", "Create a new procedure", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateProcedure", "Update procedure config", {
      procedure: nameOrId, config: configParam,
    }, updateBody("procedure")),
    delete: writeAction("DeleteProcedure", "Delete a procedure (DESTRUCTIVE)", {
      procedure: nameOrId,
    }, (p) => ({ procedure: p.procedure })),
    copy: writeAction("CopyProcedure", "Copy a procedure", {
      procedure: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.procedure, new_name: p.new_name })),
    rename: writeAction("RenameProcedure", "Rename a procedure", {
      procedure: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ procedure: p.procedure, new_name: p.new_name })),
  });

  // -- Action CRUD --
  registerActionTool(server, client, "komodo_action_manage", "Create, update, delete actions", {
    create: writeAction("CreateAction", "Create a new action", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateAction", "Update action config", {
      action_id: nameOrId, config: configParam,
    }, updateBody("action_id")),
    delete: writeAction("DeleteAction", "Delete an action (DESTRUCTIVE)", {
      action_id: nameOrId,
    }, (p) => ({ action: p.action_id })),
    copy: writeAction("CopyAction", "Copy an action", {
      action_id: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.action_id, new_name: p.new_name })),
    rename: writeAction("RenameAction", "Rename an action", {
      action_id: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ action: p.action_id, new_name: p.new_name })),
  });

  // -- Alerter CRUD --
  registerActionTool(server, client, "komodo_alerter_manage", "Create, update, delete alerters", {
    create: writeAction("CreateAlerter", "Create a new alerter", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateAlerter", "Update alerter config", {
      alerter: nameOrId, config: configParam,
    }, updateBody("alerter")),
    delete: writeAction("DeleteAlerter", "Delete an alerter (DESTRUCTIVE)", {
      alerter: nameOrId,
    }, (p) => ({ alerter: p.alerter })),
    copy: writeAction("CopyAlerter", "Copy an alerter", {
      alerter: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.alerter, new_name: p.new_name })),
    rename: writeAction("RenameAlerter", "Rename an alerter", {
      alerter: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ alerter: p.alerter, new_name: p.new_name })),
  });

  // -- Sync CRUD --
  registerActionTool(server, client, "komodo_sync_manage", "Create, update, delete resource syncs", {
    create: writeAction("CreateResourceSync", "Create a new resource sync", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateResourceSync", "Update sync config", {
      sync: nameOrId, config: configParam,
    }, updateBody("sync")),
    delete: writeAction("DeleteResourceSync", "Delete a sync (DESTRUCTIVE)", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
    copy: writeAction("CopyResourceSync", "Copy a sync", {
      sync: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.sync, new_name: p.new_name })),
    rename: writeAction("RenameResourceSync", "Rename a sync", {
      sync: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ sync: p.sync, new_name: p.new_name })),
    write_file: writeAction("WriteSyncFileContents", "Write/update sync file contents", {
      sync: nameOrId, contents: z.string().describe("File contents"),
    }, (p) => ({ sync: p.sync, contents: p.contents })),
    commit: writeAction("CommitSync", "Commit pending sync changes", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
    refresh_pending: writeAction("RefreshResourceSyncPending", "Refresh pending sync changes", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
  });

  // -- Swarm CRUD --
  registerActionTool(server, client, "komodo_swarm_manage", "Create, update, delete swarms", {
    create: writeAction("CreateSwarm", "Create a new swarm", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateSwarm", "Update swarm config", {
      swarm: nameOrId, config: configParam,
    }, updateBody("swarm")),
    delete: writeAction("DeleteSwarm", "Delete a swarm (DESTRUCTIVE)", {
      swarm: nameOrId,
    }, (p) => ({ swarm: p.swarm })),
    copy: writeAction("CopySwarm", "Copy a swarm", {
      swarm: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.swarm, new_name: p.new_name })),
    rename: writeAction("RenameSwarm", "Rename a swarm", {
      swarm: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ swarm: p.swarm, new_name: p.new_name })),
  });

  // -- Builder CRUD --
  registerActionTool(server, client, "komodo_builder_manage", "Create, update, delete builders", {
    create: writeAction("CreateBuilder", "Create a new builder", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateBuilder", "Update builder config", {
      builder: nameOrId, config: configParam,
    }, updateBody("builder")),
    delete: writeAction("DeleteBuilder", "Delete a builder (DESTRUCTIVE)", {
      builder: nameOrId,
    }, (p) => ({ builder: p.builder })),
    copy: writeAction("CopyBuilder", "Copy a builder", {
      builder: nameOrId, new_name: z.string().describe("Name for the copy"),
    }, (p) => ({ name: p.builder, new_name: p.new_name })),
    rename: writeAction("RenameBuilder", "Rename a builder", {
      builder: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ builder: p.builder, new_name: p.new_name })),
  });

  // -- Docker Registry CRUD --
  registerActionTool(server, client, "komodo_docker_registry_manage", "Create, update, delete Docker registries", {
    create: writeAction("CreateDockerRegistryAccount", "Create a Docker registry account", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateDockerRegistryAccount", "Update registry account", {
      registry: nameOrId, config: configParam,
    }, updateBody("registry")),
    delete: writeAction("DeleteDockerRegistryAccount", "Delete a registry account (DESTRUCTIVE)", {
      registry: nameOrId,
    }, (p) => ({ registry: p.registry })),
  });

  // -- Git Provider CRUD --
  registerActionTool(server, client, "komodo_git_provider_manage", "Create, update, delete Git providers", {
    create: writeAction("CreateGitProviderAccount", "Create a Git provider account", {
      name: nameParam, config: configParam,
    }, configBody("name")),
    update: writeAction("UpdateGitProviderAccount", "Update provider account", {
      provider: nameOrId, config: configParam,
    }, updateBody("provider")),
    delete: writeAction("DeleteGitProviderAccount", "Delete a provider account (DESTRUCTIVE)", {
      provider: nameOrId,
    }, (p) => ({ provider: p.provider })),
  });

  // -- User Management --
  registerActionTool(server, client, "komodo_user_manage", "Manage Komodo users (admin)", {
    create_local: writeAction("CreateLocalUser", "Create a local user", {
      username: z.string().describe("Username"),
      password: z.string().describe("Password"),
    }, (p) => ({ username: p.username, password: p.password })),
    create_service: writeAction("CreateServiceUser", "Create a service user", {
      username: z.string().describe("Username"),
      description: z.string().optional().describe("Description"),
    }, (p) => ({ username: p.username, description: p.description ?? "" })),
    delete: writeAction("DeleteUser", "Delete a user (DESTRUCTIVE)", {
      user: z.string().describe("User ID"),
    }, (p) => ({ user: p.user })),
    update_admin: writeAction("UpdateUserAdmin", "Set/unset user admin status", {
      user: z.string().describe("User ID"),
      admin: z.boolean().describe("Whether user should be admin"),
    }, (p) => ({ user: p.user, admin: p.admin })),
    create_api_key: writeAction("CreateApiKeyForServiceUser", "Create API key for a service user", {
      user: z.string().describe("Service user ID"),
      key_name: z.string().describe("API key name"),
    }, (p) => ({ user: p.user, name: p.key_name })),
    delete_api_key: writeAction("DeleteApiKeyForServiceUser", "Delete API key for a service user", {
      user: z.string().describe("Service user ID"),
      key: z.string().describe("API key to delete"),
    }, (p) => ({ user: p.user, key: p.key })),
  });

  // -- User Group Management --
  registerActionTool(server, client, "komodo_user_group_manage", "Manage Komodo user groups", {
    create: writeAction("CreateUserGroup", "Create a user group", {
      name: nameParam,
    }, (p) => ({ name: p.name })),
    delete: writeAction("DeleteUserGroup", "Delete a user group (DESTRUCTIVE)", {
      user_group: nameOrId,
    }, (p) => ({ user_group: p.user_group })),
    rename: writeAction("RenameUserGroup", "Rename a user group", {
      user_group: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ user_group: p.user_group, new_name: p.new_name })),
    add_user: writeAction("AddUserToUserGroup", "Add a user to a group", {
      user_group: nameOrId, user: z.string().describe("User ID"),
    }, (p) => ({ user_group: p.user_group, user: p.user })),
    remove_user: writeAction("RemoveUserFromUserGroup", "Remove a user from a group", {
      user_group: nameOrId, user: z.string().describe("User ID"),
    }, (p) => ({ user_group: p.user_group, user: p.user })),
  });

  // -- Permission Management --
  registerActionTool(server, client, "komodo_permission_manage", "Manage Komodo permissions", {
    update_on_target: writeAction("UpdatePermissionOnTarget", "Set permission for a user/group on a resource", {
      user_target: z.string().describe("User or group ID"),
      resource_type: z.string().describe("Resource type"),
      resource_id: z.string().describe("Resource ID"),
      level: z.string().describe("Permission level (None, Read, Execute, Write)"),
    }, (p) => ({
      user_target: { type: "User", id: p.user_target },
      resource_target: { type: p.resource_type, id: p.resource_id },
      permission: p.level,
    })),
  });

  // -- Variable Management --
  registerActionTool(server, client, "komodo_variable_manage", "Manage Komodo variables", {
    create: writeAction("CreateVariable", "Create a variable", {
      name: nameParam,
      value: z.string().describe("Variable value"),
      description: z.string().optional().describe("Description"),
      is_secret: z.boolean().optional().describe("Whether this is a secret"),
    }, (p) => ({ name: p.name, value: p.value, description: p.description ?? "", is_secret: p.is_secret ?? false })),
    delete: writeAction("DeleteVariable", "Delete a variable (DESTRUCTIVE)", {
      variable: nameOrId,
    }, (p) => ({ variable: p.variable })),
    update_value: writeAction("UpdateVariableValue", "Update a variable's value", {
      variable: nameOrId, value: z.string().describe("New value"),
    }, (p) => ({ variable: p.variable, value: p.value })),
    update_description: writeAction("UpdateVariableDescription", "Update a variable's description", {
      variable: nameOrId, description: z.string().describe("New description"),
    }, (p) => ({ variable: p.variable, description: p.description })),
  });

  // -- Tag Management --
  registerActionTool(server, client, "komodo_tag_manage", "Manage Komodo tags", {
    create: writeAction("CreateTag", "Create a tag", {
      name: nameParam,
    }, (p) => ({ name: p.name })),
    delete: writeAction("DeleteTag", "Delete a tag (DESTRUCTIVE)", {
      tag: nameOrId,
    }, (p) => ({ tag: p.tag })),
    rename: writeAction("RenameTag", "Rename a tag", {
      tag: nameOrId, new_name: z.string().describe("New name"),
    }, (p) => ({ tag: p.tag, new_name: p.new_name })),
  });

  // -- Alert Management --
  registerActionTool(server, client, "komodo_alert_manage", "Manage Komodo alerts", {
    close: writeAction("CloseAlert", "Close/acknowledge an alert", {
      alert: z.string().describe("Alert ID"),
    }, (p) => ({ alert: p.alert })),
  });

  // -- Network Management --
  registerActionTool(server, client, "komodo_network_manage", "Create Docker networks", {
    create: writeAction("CreateNetwork", "Create a Docker network on a server", {
      server: z.string().describe("Server name or ID"),
      network_name: z.string().describe("Network name"),
      driver: z.string().optional().describe("Network driver (default: bridge)"),
    }, (p) => ({ server: p.server, name: p.network_name, driver: p.driver ?? "bridge" })),
  });
}
