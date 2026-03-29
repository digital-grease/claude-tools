import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TechnitiumClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

export function registerDnsTools(server: McpServer, client: TechnitiumClient) {
  // DNS Cache
  registerActionTool(server, client, "technitium_cache", "Manage DNS resolver cache", {
    list: {
      description: "List cached zones",
      params: {
        domain: z.string().optional().describe("Domain to browse cache for (default: root)"),
      },
      handler: async (client, p) => client.get("/cache/list", cleanParams(p)),
    },
    delete: {
      description: "Delete a specific cached zone entry",
      params: {
        domain: z.string().describe("Cached domain to delete"),
      },
      handler: async (client, p) => client.get("/cache/delete", cleanParams(p)),
    },
    flush: {
      description: "Flush the entire DNS cache",
      handler: async (client) => client.get("/cache/flush"),
    },
  });

  // Allowed Zones (whitelist)
  registerActionTool(server, client, "technitium_allowed", "Manage allowed (whitelisted) zones", {
    list: {
      description: "List allowed zones",
      params: {
        domain: z.string().optional().describe("Domain to list (default: root)"),
      },
      handler: async (client, p) => client.get("/allowed/list", cleanParams(p)),
    },
    add: {
      description: "Add a zone to the allow list",
      params: {
        domain: z.string().describe("Domain to allow"),
      },
      handler: async (client, p) => client.get("/allowed/add", cleanParams(p)),
    },
    delete: {
      description: "Remove a zone from the allow list",
      params: {
        domain: z.string().describe("Domain to remove"),
      },
      handler: async (client, p) => client.get("/allowed/delete", cleanParams(p)),
    },
    flush: {
      description: "Flush all allowed zones",
      handler: async (client) => client.get("/allowed/flush"),
    },
    export: {
      description: "Export allowed zones list",
      handler: async (client) => client.get("/allowed/export"),
    },
  });

  // Blocked Zones (blacklist)
  registerActionTool(server, client, "technitium_blocked", "Manage blocked (blacklisted) zones", {
    list: {
      description: "List blocked zones",
      params: {
        domain: z.string().optional().describe("Domain to list (default: root)"),
      },
      handler: async (client, p) => client.get("/blocked/list", cleanParams(p)),
    },
    add: {
      description: "Add a zone to the block list",
      params: {
        domain: z.string().describe("Domain to block"),
      },
      handler: async (client, p) => client.get("/blocked/add", cleanParams(p)),
    },
    delete: {
      description: "Remove a zone from the block list",
      params: {
        domain: z.string().describe("Domain to remove"),
      },
      handler: async (client, p) => client.get("/blocked/delete", cleanParams(p)),
    },
    flush: {
      description: "Flush all blocked zones",
      handler: async (client) => client.get("/blocked/flush"),
    },
    export: {
      description: "Export blocked zones list",
      handler: async (client) => client.get("/blocked/export"),
    },
  });

  // DNS Client (resolver)
  registerActionTool(server, client, "technitium_dnsclient", "DNS client for resolving queries", {
    resolve: {
      description: "Resolve a DNS query (optionally via specific server/protocol)",
      params: {
        domain: z.string().describe("Domain name to resolve"),
        type: z.string().describe("Record type: A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, PTR, etc."),
        server: z.string().describe("DNS server to query (e.g. 'this-server', '8.8.8.8', 'dns.google')"),
        protocol: z.string().optional().describe("Protocol: Udp, Tcp, Tls, Https, Quic"),
        dnssecValidation: z.boolean().optional().describe("Perform DNSSEC validation"),
      },
      handler: async (client, p) => client.get("/dnsclient/resolve", cleanParams(p)),
    },
  });
}
