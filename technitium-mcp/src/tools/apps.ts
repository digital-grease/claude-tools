import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TechnitiumClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

export function registerAppsTools(server: McpServer, client: TechnitiumClient) {
  registerActionTool(server, client, "technitium_apps", "Manage DNS apps (plugins)", {
    list: {
      description: "List installed DNS apps",
      handler: async (client) => client.get("/apps/list"),
    },
    list_store: {
      description: "List apps available in the DNS app store",
      handler: async (client) => client.get("/apps/listStoreApps"),
    },
    download_install: {
      description: "Download and install an app from the store",
      params: {
        name: z.string().describe("App name from the store"),
        url: z.string().optional().describe("Custom download URL"),
      },
      handler: async (client, p) => client.get("/apps/downloadAndInstall", cleanParams(p)),
    },
    download_update: {
      description: "Download and update an app from the store",
      params: {
        name: z.string().describe("App name"),
        url: z.string().optional().describe("Custom download URL"),
      },
      handler: async (client, p) => client.get("/apps/downloadAndUpdate", cleanParams(p)),
    },
    uninstall: {
      description: "Uninstall a DNS app",
      params: {
        name: z.string().describe("App name"),
      },
      handler: async (client, p) => client.get("/apps/uninstall", cleanParams(p)),
    },
    config_get: {
      description: "Get app configuration",
      params: {
        name: z.string().describe("App name"),
      },
      handler: async (client, p) => client.get("/apps/config/get", cleanParams(p)),
    },
    config_set: {
      description: "Set app configuration",
      params: {
        name: z.string().describe("App name"),
        config: z.string().describe("JSON configuration string"),
      },
      handler: async (client, p) => client.get("/apps/config/set", cleanParams(p)),
    },
  });
}
