import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, readAction } from "../helpers.js";

const nameOrId = z.string().describe("Resource name or ID");
const query = z.string().optional().describe("Search/filter query string");
const tail = z.number().optional().describe("Number of log lines to return from the tail");
const searchTerm = z.string().describe("Term to search for in logs");

export function registerCoreReadTools(server: McpServer, client: KomodoClient) {
  // -- Deployments --
  registerActionTool(server, client, "komodo_deployments", "Query Komodo deployments", {
    list: readAction("ListDeployments", "List all deployments", {
      query: z.string().optional().describe("Filter by name pattern"),
    }, (p) => ({ query: p.query ? { names: [], specific: {} } : {} })),
    get: readAction("GetDeployment", "Get deployment details", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    get_container: readAction("GetDeploymentContainer", "Get the container info for a deployment", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    get_log: readAction("GetDeploymentLog", "Get deployment container logs", {
      deployment: nameOrId,
      tail: tail,
    }, (p) => ({ deployment: p.deployment, tail: p.tail ?? 100 })),
    search_log: readAction("SearchDeploymentLog", "Search deployment container logs", {
      deployment: nameOrId,
      terms: searchTerm,
    }, (p) => ({ deployment: p.deployment, terms: [p.terms] })),
    get_stats: readAction("GetDeploymentStats", "Get deployment container stats (CPU, memory)", {
      deployment: nameOrId,
    }, (p) => ({ deployment: p.deployment })),
    get_summary: readAction("GetDeploymentsSummary", "Get summary counts for all deployments"),
  });

  // -- Stacks --
  registerActionTool(server, client, "komodo_stacks", "Query Komodo stacks", {
    list: readAction("ListStacks", "List all stacks"),
    get: readAction("GetStack", "Get stack details", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    get_log: readAction("GetStackLog", "Get stack service logs", {
      stack: nameOrId,
      tail: tail,
    }, (p) => ({ stack: p.stack, tail: p.tail ?? 100 })),
    search_log: readAction("SearchStackLog", "Search stack service logs", {
      stack: nameOrId,
      terms: searchTerm,
    }, (p) => ({ stack: p.stack, terms: [p.terms] })),
    list_services: readAction("ListStackServices", "List services in a stack", {
      stack: nameOrId,
    }, (p) => ({ stack: p.stack })),
    get_summary: readAction("GetStacksSummary", "Get summary counts for all stacks"),
  });

  // -- Servers --
  registerActionTool(server, client, "komodo_servers", "Query Komodo servers", {
    list: readAction("ListServers", "List all servers"),
    get: readAction("GetServer", "Get server details", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    get_state: readAction("GetServerState", "Get server online/offline state", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    get_stats: readAction("GetSystemStats", "Get server CPU, memory, disk stats", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    get_system_info: readAction("GetSystemInformation", "Get server OS, kernel, architecture info", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    list_processes: readAction("ListSystemProcesses", "List running processes on a server", {
      server: nameOrId,
    }, (p) => ({ server: p.server })),
    get_summary: readAction("GetServersSummary", "Get summary counts for all servers"),
  });

  // -- Builds --
  registerActionTool(server, client, "komodo_builds", "Query Komodo builds", {
    list: readAction("ListBuilds", "List all builds"),
    get: readAction("GetBuild", "Get build details", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
    list_versions: readAction("ListBuildVersions", "List available versions for a build", {
      build: nameOrId,
    }, (p) => ({ build: p.build })),
    get_summary: readAction("GetBuildsSummary", "Get summary counts for all builds"),
  });

  // -- Repos --
  registerActionTool(server, client, "komodo_repos", "Query Komodo repos", {
    list: readAction("ListRepos", "List all repos"),
    get: readAction("GetRepo", "Get repo details", {
      repo: nameOrId,
    }, (p) => ({ repo: p.repo })),
    get_summary: readAction("GetReposSummary", "Get summary counts for all repos"),
  });
}
