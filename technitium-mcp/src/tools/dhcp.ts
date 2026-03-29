import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TechnitiumClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

export function registerDhcpTools(server: McpServer, client: TechnitiumClient) {
  // DHCP Scopes
  registerActionTool(server, client, "technitium_dhcp", "Manage DHCP server scopes and leases", {
    scopes_list: {
      description: "List all DHCP scopes",
      handler: async (client) => client.get("/dhcp/scopes/list"),
    },
    scopes_get: {
      description: "Get DHCP scope details",
      params: {
        name: z.string().describe("Scope name"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/get", cleanParams(p)),
    },
    scopes_set: {
      description: "Create or update a DHCP scope",
      params: {
        name: z.string().describe("Scope name"),
        startingAddress: z.string().optional().describe("Starting IP address of range"),
        endingAddress: z.string().optional().describe("Ending IP address of range"),
        subnetMask: z.string().optional().describe("Subnet mask"),
        leaseTimeDays: z.number().optional().describe("Lease time in days"),
        leaseTimeHours: z.number().optional().describe("Lease time hours"),
        leaseTimeMinutes: z.number().optional().describe("Lease time minutes"),
        domainName: z.string().optional().describe("Domain name for DHCP clients"),
        dnsTtl: z.number().optional().describe("DNS TTL for DHCP records"),
        routerAddress: z.string().optional().describe("Default gateway"),
        dnsServers: z.string().optional().describe("DNS servers (comma-separated)"),
        exclusions: z.string().optional().describe("Excluded IP ranges"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/set", cleanParams(p)),
    },
    scopes_enable: {
      description: "Enable a DHCP scope",
      params: {
        name: z.string().describe("Scope name"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/enable", cleanParams(p)),
    },
    scopes_disable: {
      description: "Disable a DHCP scope",
      params: {
        name: z.string().describe("Scope name"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/disable", cleanParams(p)),
    },
    scopes_delete: {
      description: "Delete a DHCP scope",
      params: {
        name: z.string().describe("Scope name"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/delete", cleanParams(p)),
    },
    scopes_add_reserved: {
      description: "Add a reserved lease to a scope",
      params: {
        name: z.string().describe("Scope name"),
        hardwareAddress: z.string().describe("MAC address"),
        ipAddress: z.string().describe("Reserved IP address"),
        hostName: z.string().optional().describe("Hostname"),
        comments: z.string().optional().describe("Comments"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/addReservedLease", cleanParams(p)),
    },
    scopes_remove_reserved: {
      description: "Remove a reserved lease from a scope",
      params: {
        name: z.string().describe("Scope name"),
        hardwareAddress: z.string().describe("MAC address"),
      },
      handler: async (client, p) => client.get("/dhcp/scopes/removeReservedLease", cleanParams(p)),
    },
    leases_list: {
      description: "List DHCP leases for a scope",
      params: {
        name: z.string().describe("Scope name"),
      },
      handler: async (client, p) => client.get("/dhcp/leases/list", cleanParams(p)),
    },
    leases_remove: {
      description: "Remove a DHCP lease",
      params: {
        name: z.string().describe("Scope name"),
        hardwareAddress: z.string().describe("MAC address"),
      },
      handler: async (client, p) => client.get("/dhcp/leases/remove", cleanParams(p)),
    },
    leases_convert_reserved: {
      description: "Convert a dynamic lease to reserved",
      params: {
        name: z.string().describe("Scope name"),
        hardwareAddress: z.string().describe("MAC address"),
      },
      handler: async (client, p) => client.get("/dhcp/leases/convertToReserved", cleanParams(p)),
    },
    leases_convert_dynamic: {
      description: "Convert a reserved lease to dynamic",
      params: {
        name: z.string().describe("Scope name"),
        hardwareAddress: z.string().describe("MAC address"),
      },
      handler: async (client, p) => client.get("/dhcp/leases/convertToDynamic", cleanParams(p)),
    },
  });
}
