import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, readAction } from "../helpers.js";

const serverParam = z.string().describe("Server name or ID");
const containerName = z.string().describe("Container name");
const tail = z.number().optional().describe("Number of log lines to return from the tail");

export function registerDockerReadTools(server: McpServer, client: KomodoClient) {
  // -- Containers --
  registerActionTool(server, client, "komodo_containers", "Query Docker containers on Komodo servers", {
    list: readAction("ListDockerContainers", "List containers on a server", {
      server: serverParam,
    }, (p) => ({ server: p.server })),
    list_all: readAction("ListAllDockerContainers", "List containers across all servers"),
    get_log: readAction("GetContainerLog", "Get container logs", {
      server: serverParam,
      container: containerName,
      tail: tail,
    }, (p) => ({ server: p.server, container: p.container, tail: p.tail ?? 100 })),
    search_log: readAction("SearchContainerLog", "Search container logs", {
      server: serverParam,
      container: containerName,
      terms: z.string().describe("Search term"),
    }, (p) => ({ server: p.server, container: p.container, terms: [p.terms] })),
    inspect: readAction("InspectDockerContainer", "Inspect a container (full details)", {
      server: serverParam,
      container: containerName,
    }, (p) => ({ server: p.server, container: p.container })),
  });

  // -- Images --
  registerActionTool(server, client, "komodo_images", "Query Docker images on Komodo servers", {
    list: readAction("ListDockerImages", "List images on a server", {
      server: serverParam,
    }, (p) => ({ server: p.server })),
    inspect: readAction("InspectDockerImage", "Inspect an image", {
      server: serverParam,
      image: z.string().describe("Image name or ID"),
    }, (p) => ({ server: p.server, image: p.image })),
  });

  // -- Networks --
  registerActionTool(server, client, "komodo_networks", "Query Docker networks on Komodo servers", {
    list: readAction("ListDockerNetworks", "List networks on a server", {
      server: serverParam,
    }, (p) => ({ server: p.server })),
    inspect: readAction("InspectDockerNetwork", "Inspect a network", {
      server: serverParam,
      network: z.string().describe("Network name or ID"),
    }, (p) => ({ server: p.server, network: p.network })),
  });

  // -- Volumes --
  registerActionTool(server, client, "komodo_volumes", "Query Docker volumes on Komodo servers", {
    list: readAction("ListDockerVolumes", "List volumes on a server", {
      server: serverParam,
    }, (p) => ({ server: p.server })),
    inspect: readAction("InspectDockerVolume", "Inspect a volume", {
      server: serverParam,
      volume: z.string().describe("Volume name"),
    }, (p) => ({ server: p.server, volume: p.volume })),
  });

  // -- Compose Projects --
  registerActionTool(server, client, "komodo_compose_projects", "Query Docker Compose projects", {
    list: readAction("ListComposeProjects", "List all compose projects on a server", {
      server: serverParam,
    }, (p) => ({ server: p.server })),
  });
}
