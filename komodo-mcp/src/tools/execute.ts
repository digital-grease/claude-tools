import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, executeAction } from "../helpers.js";

const nameOrId = z.string().describe("Resource name or ID");

export function registerExecuteTools(server: McpServer, client: KomodoClient) {
  // -- Deployment Control --
  registerActionTool(server, client, "komodo_deployment_control", "Control deployment lifecycle (start, stop, deploy, destroy)", {
    deploy: executeAction("Deploy", "Deploy/redeploy a deployment", {
      deployment: nameOrId,
      stop_signal: z.string().optional().describe("Stop signal (e.g., SIGTERM)"),
      stop_time: z.number().optional().describe("Stop timeout in seconds"),
    }, (p) => ({ deployment: p.deployment, stop_signal: p.stop_signal, stop_time: p.stop_time })),
    start: executeAction("StartDeployment", "Start a stopped deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    stop: executeAction("StopDeployment", "Stop a running deployment", {
      deployment: nameOrId,
      stop_signal: z.string().optional().describe("Stop signal"),
      stop_time: z.number().optional().describe("Stop timeout in seconds"),
    }, (p) => ({ deployment: p.deployment, stop_signal: p.stop_signal, stop_time: p.stop_time })),
    restart: executeAction("RestartDeployment", "Restart a deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    pause: executeAction("PauseDeployment", "Pause a deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    unpause: executeAction("UnpauseDeployment", "Unpause a paused deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    pull: executeAction("PullDeployment", "Pull latest image for a deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    destroy: executeAction("DestroyDeployment", "Destroy a deployment's container (DESTRUCTIVE)", {
      deployment: nameOrId,
      stop_signal: z.string().optional().describe("Stop signal"),
      stop_time: z.number().optional().describe("Stop timeout in seconds"),
    }, (p) => ({ deployment: p.deployment, stop_signal: p.stop_signal, stop_time: p.stop_time })),
  });

  // -- Stack Control --
  registerActionTool(server, client, "komodo_stack_control", "Control stack lifecycle", {
    deploy: executeAction("DeployStack", "Deploy a stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    deploy_if_changed: executeAction("DeployStackIfChanged", "Deploy stack only if config changed", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    start: executeAction("StartStack", "Start a stopped stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    stop: executeAction("StopStack", "Stop a running stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    restart: executeAction("RestartStack", "Restart a stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    pause: executeAction("PauseStack", "Pause a stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    unpause: executeAction("UnpauseStack", "Unpause a paused stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    pull: executeAction("PullStack", "Pull latest images for a stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    destroy: executeAction("DestroyStack", "Destroy a stack (DESTRUCTIVE)", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    run_service: executeAction("RunStackService", "Run a one-off service command in a stack", {
      stack: nameOrId,
      service: z.string().describe("Service name"),
      command: z.string().describe("Command to run"),
    }, (p) => ({ stack: p.stack, service: p.service, command: p.command })),
  });

  // -- Container Control --
  registerActionTool(server, client, "komodo_container_control", "Control Docker containers directly", {
    start: executeAction("StartContainer", "Start a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    stop: executeAction("StopContainer", "Stop a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    restart: executeAction("RestartContainer", "Restart a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    pause: executeAction("PauseContainer", "Pause a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    unpause: executeAction("UnpauseContainer", "Unpause a container", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    destroy: executeAction("DestroyContainer", "Destroy a container (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
      container: z.string().describe("Container name"),
    }, (p) => ({ server: p.server, container: p.container })),
    start_all: executeAction("StartAllContainers", "Start all containers on a server", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
    stop_all: executeAction("StopAllContainers", "Stop all containers on a server (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
    restart_all: executeAction("RestartAllContainers", "Restart all containers on a server", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
  });

  // -- Build Control --
  registerActionTool(server, client, "komodo_build_control", "Run and cancel builds", {
    run: executeAction("RunBuild", "Run a build", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
    cancel: executeAction("CancelBuild", "Cancel a running build", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
  });

  // -- Repo Control --
  registerActionTool(server, client, "komodo_repo_control", "Clone, pull, and build repos", {
    clone: executeAction("CloneRepo", "Clone a repo", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
    pull: executeAction("PullRepo", "Pull latest changes for a repo", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
    build: executeAction("BuildRepo", "Build a repo", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
    cancel_build: executeAction("CancelRepoBuild", "Cancel a running repo build", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
  });

  // -- Procedure / Action / Sync Control --
  registerActionTool(server, client, "komodo_procedure_control", "Run procedures", {
    run: executeAction("RunProcedure", "Run a procedure", {
      procedure: nameOrId,
    }, (p) => ({ procedure: p.procedure })),
  });

  registerActionTool(server, client, "komodo_action_control", "Run actions", {
    run: executeAction("RunAction", "Run an action", {
      action_id: nameOrId,
    }, (p) => ({ action: p.action_id })),
  });

  registerActionTool(server, client, "komodo_sync_control", "Run resource syncs", {
    run: executeAction("RunSync", "Run a resource sync", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
  });

  // -- Alerter Control --
  registerActionTool(server, client, "komodo_alerter_control", "Test and trigger alerters", {
    test: executeAction("TestAlerter", "Send a test alert", {
      alerter: nameOrId,
    }, (p) => ({ alerter: p.alerter })),
    send_alert: executeAction("SendAlert", "Send an alert via an alerter", {
      alerter: nameOrId,
      message: z.string().describe("Alert message"),
    }, (p) => ({ alerter: p.alerter, message: p.message })),
  });

  // -- Image / Network / Volume Cleanup --
  registerActionTool(server, client, "komodo_image_control", "Manage Docker images", {
    delete: executeAction("DeleteImage", "Delete a Docker image (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
      image: z.string().describe("Image name or ID"),
    }, (p) => ({ server: p.server, image: p.image })),
    prune: executeAction("PruneImages", "Prune unused images (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
  });

  registerActionTool(server, client, "komodo_network_control", "Manage Docker networks", {
    delete: executeAction("DeleteNetwork", "Delete a Docker network (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
      network: z.string().describe("Network name or ID"),
    }, (p) => ({ server: p.server, network: p.network })),
    prune: executeAction("PruneNetworks", "Prune unused networks (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
  });

  registerActionTool(server, client, "komodo_volume_control", "Manage Docker volumes", {
    delete: executeAction("DeleteVolume", "Delete a Docker volume (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
      volume: z.string().describe("Volume name"),
    }, (p) => ({ server: p.server, volume: p.volume })),
    prune: executeAction("PruneVolumes", "Prune unused volumes (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
  });

  // -- Swarm Control --
  registerActionTool(server, client, "komodo_swarm_control", "Control Docker Swarm operations", {
    create_config: executeAction("CreateSwarmConfig", "Create a swarm config", {
      swarm: nameOrId,
      config_name: z.string().describe("Config name"),
      data: z.string().describe("Config data"),
    }, (p) => ({ swarm: p.swarm, name: p.config_name, data: p.data })),
    create_secret: executeAction("CreateSwarmSecret", "Create a swarm secret", {
      swarm: nameOrId,
      secret_name: z.string().describe("Secret name"),
      data: z.string().describe("Secret data"),
    }, (p) => ({ swarm: p.swarm, name: p.secret_name, data: p.data })),
    remove_services: executeAction("RemoveSwarmServices", "Remove swarm services (DESTRUCTIVE)", {
      swarm: nameOrId,
      services: z.string().describe("Comma-separated service names"),
    }, (p) => ({ swarm: p.swarm, services: (p.services as string).split(",").map(s => s.trim()) })),
    remove_stacks: executeAction("RemoveSwarmStacks", "Remove swarm stacks (DESTRUCTIVE)", {
      swarm: nameOrId,
      stacks: z.string().describe("Comma-separated stack names"),
    }, (p) => ({ swarm: p.swarm, stacks: (p.stacks as string).split(",").map(s => s.trim()) })),
  });

  // -- Batch Operations --
  registerActionTool(server, client, "komodo_batch", "Batch operations across multiple resources", {
    batch_deploy: executeAction("BatchDeploy", "Deploy multiple deployments", {
      deployments: z.string().describe("Comma-separated deployment names"),
    }, (p) => ({ deployments: (p.deployments as string).split(",").map(s => s.trim()) })),
    batch_deploy_stack: executeAction("BatchDeployStack", "Deploy multiple stacks", {
      stacks: z.string().describe("Comma-separated stack names"),
    }, (p) => ({ stacks: (p.stacks as string).split(",").map(s => s.trim()) })),
    batch_run_build: executeAction("BatchRunBuild", "Run multiple builds", {
      builds: z.string().describe("Comma-separated build names"),
    }, (p) => ({ builds: (p.builds as string).split(",").map(s => s.trim()) })),
    batch_run_action: executeAction("BatchRunAction", "Run multiple actions", {
      actions: z.string().describe("Comma-separated action names"),
    }, (p) => ({ actions: (p.actions as string).split(",").map(s => s.trim()) })),
    batch_run_procedure: executeAction("BatchRunProcedure", "Run multiple procedures", {
      procedures: z.string().describe("Comma-separated procedure names"),
    }, (p) => ({ procedures: (p.procedures as string).split(",").map(s => s.trim()) })),
    batch_destroy_deployment: executeAction("BatchDestroyDeployment", "Destroy multiple deployments (DESTRUCTIVE)", {
      deployments: z.string().describe("Comma-separated deployment names"),
    }, (p) => ({ deployments: (p.deployments as string).split(",").map(s => s.trim()) })),
    batch_destroy_stack: executeAction("BatchDestroyStack", "Destroy multiple stacks (DESTRUCTIVE)", {
      stacks: z.string().describe("Comma-separated stack names"),
    }, (p) => ({ stacks: (p.stacks as string).split(",").map(s => s.trim()) })),
  });

  // -- System Control --
  registerActionTool(server, client, "komodo_system_control", "System-level operations (admin)", {
    backup_database: executeAction("BackupCoreDatabase", "Backup the Komodo database"),
    prune_system: executeAction("PruneSystem", "Prune Docker system on a server (DESTRUCTIVE)", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
    prune_buildx: executeAction("PruneBuildx", "Prune buildx cache on a server", {
      server: z.string().describe("Server name or ID"),
    }, (p) => ({ server: p.server })),
    rotate_core_keys: executeAction("RotateCoreKeys", "Rotate core encryption keys (admin)"),
    rotate_all_server_keys: executeAction("RotateAllServerKeys", "Rotate all server SSH keys (admin)"),
    global_auto_update: executeAction("GlobalAutoUpdate", "Trigger auto-update for all resources"),
  });
}
