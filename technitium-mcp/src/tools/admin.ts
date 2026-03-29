import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TechnitiumClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

export function registerAdminTools(server: McpServer, client: TechnitiumClient) {
  // Dashboard
  registerActionTool(server, client, "technitium_dashboard", "DNS server dashboard and statistics", {
    stats_get: {
      description: "Get DNS query statistics",
      params: {
        type: z.string().optional().describe("Stats type: LastHour, LastDay, LastWeek, LastMonth, LastYear, Custom"),
        start: z.string().optional().describe("Start date (for Custom type, format: yyyy-MM-dd HH:mm:ss)"),
        end: z.string().optional().describe("End date (for Custom type)"),
      },
      handler: async (client, p) => client.get("/dashboard/stats/get", cleanParams(p)),
    },
    stats_top: {
      description: "Get top clients, domains, and blocked domains",
      params: {
        type: z.string().optional().describe("Stats type: LastHour, LastDay, LastWeek, LastMonth, LastYear, Custom"),
        start: z.string().optional().describe("Start date (for Custom type)"),
        end: z.string().optional().describe("End date (for Custom type)"),
        limit: z.number().optional().describe("Number of top entries to return"),
      },
      handler: async (client, p) => client.get("/dashboard/stats/getTop", cleanParams(p)),
    },
    stats_delete: {
      description: "Delete all statistics data",
      handler: async (client) => client.get("/dashboard/stats/deleteAll"),
    },
  });

  // User management
  registerActionTool(server, client, "technitium_user", "Manage user profile and sessions", {
    profile_get: {
      description: "Get current user profile",
      handler: async (client) => client.get("/user/profile/get"),
    },
    profile_set: {
      description: "Update user profile",
      params: {
        displayName: z.string().optional().describe("Display name"),
        newPassword: z.string().optional().describe("New password"),
      },
      handler: async (client, p) => client.get("/user/profile/set", cleanParams(p)),
    },
    session_get: {
      description: "Get session info for a token",
      params: {
        token: z.string().describe("Session token to get info for"),
      },
      handler: async (client, p) => client.get("/user/session/get", cleanParams(p)),
    },
    session_delete: {
      description: "Delete a user session by partial token",
      params: {
        partialToken: z.string().describe("Partial token to identify session"),
      },
      handler: async (client, p) => client.get("/user/session/delete", cleanParams(p)),
    },
    create_token: {
      description: "Create a non-expiring API token",
      params: {
        tokenName: z.string().describe("Name for the API token"),
      },
      handler: async (client, p) => client.get("/user/createToken", cleanParams(p)),
    },
    check_update: {
      description: "Check for DNS server software updates",
      handler: async (client) => client.get("/user/checkForUpdate"),
    },
  });

  // Server Settings
  registerActionTool(server, client, "technitium_settings", "Manage DNS server settings", {
    get: {
      description: "Get all DNS server settings",
      handler: async (client) => client.get("/settings/get"),
    },
    set: {
      description: "Update DNS server settings",
      params: {
        dnsServerDomain: z.string().optional().describe("DNS server domain name"),
        dnsServerLocalEndPoints: z.string().optional().describe("Local endpoints (semicolon-separated)"),
        webServiceLocalAddresses: z.string().optional().describe("Web service bind addresses"),
        webServiceHttpPort: z.number().optional().describe("Web service HTTP port"),
        webServiceEnableTls: z.boolean().optional().describe("Enable TLS for web service"),
        webServiceTlsPort: z.number().optional().describe("Web service TLS port"),
        enableDnsOverHttp: z.boolean().optional().describe("Enable DNS over HTTP"),
        enableDnsOverTls: z.boolean().optional().describe("Enable DNS over TLS"),
        enableDnsOverHttps: z.boolean().optional().describe("Enable DNS over HTTPS"),
        enableDnsOverQuic: z.boolean().optional().describe("Enable DNS over QUIC"),
        preferIPv6: z.boolean().optional().describe("Prefer IPv6"),
        enableLogging: z.boolean().optional().describe("Enable query logging"),
        enableBlocking: z.boolean().optional().describe("Enable DNS blocking"),
        blockListUrls: z.string().optional().describe("Block list URLs (one per line)"),
        forwarders: z.string().optional().describe("Forwarder addresses (semicolon-separated)"),
        forwarderProtocol: z.string().optional().describe("Forwarder protocol: Udp, Tcp, Tls, Https, Quic"),
      },
      handler: async (client, p) => client.get("/settings/set", cleanParams(p)),
    },
    tsig_key_names: {
      description: "Get configured TSIG key names",
      handler: async (client) => client.get("/settings/getTsigKeyNames"),
    },
    force_update_blocklists: {
      description: "Force update all block lists now",
      handler: async (client) => client.get("/settings/forceUpdateBlockLists"),
    },
    temp_disable_blocklists: {
      description: "Temporarily disable block lists",
      params: {
        minutes: z.number().optional().describe("Minutes to disable (default: 5)"),
      },
      handler: async (client, p) => client.get("/settings/temporaryDisableBlockLists", cleanParams(p)),
    },
  });

  // Administration
  registerActionTool(server, client, "technitium_admin", "Server administration: users, groups, permissions", {
    sessions_list: {
      description: "List all active sessions",
      handler: async (client) => client.get("/admin/sessions/list"),
    },
    sessions_create_token: {
      description: "Create API token for any user (admin only)",
      params: {
        user: z.string().describe("Username"),
        tokenName: z.string().describe("Token name"),
      },
      handler: async (client, p) => client.get("/admin/sessions/createToken", cleanParams(p)),
    },
    sessions_delete: {
      description: "Delete any user's session",
      params: {
        partialToken: z.string().describe("Partial token to identify session"),
      },
      handler: async (client, p) => client.get("/admin/sessions/delete", cleanParams(p)),
    },
    users_list: {
      description: "List all users",
      handler: async (client) => client.get("/admin/users/list"),
    },
    users_create: {
      description: "Create a new user",
      params: {
        user: z.string().describe("Username"),
        pass: z.string().describe("Password"),
        displayName: z.string().optional().describe("Display name"),
      },
      handler: async (client, p) => client.get("/admin/users/create", cleanParams(p)),
    },
    users_get: {
      description: "Get user details",
      params: {
        user: z.string().describe("Username"),
      },
      handler: async (client, p) => client.get("/admin/users/get", cleanParams(p)),
    },
    users_set: {
      description: "Update user details",
      params: {
        user: z.string().describe("Username"),
        displayName: z.string().optional().describe("Display name"),
        newUser: z.string().optional().describe("New username (to rename)"),
        disabled: z.boolean().optional().describe("Disable user"),
        sessionTimeoutSeconds: z.number().optional().describe("Session timeout in seconds"),
      },
      handler: async (client, p) => client.get("/admin/users/set", cleanParams(p)),
    },
    users_delete: {
      description: "Delete a user",
      params: {
        user: z.string().describe("Username"),
      },
      handler: async (client, p) => client.get("/admin/users/delete", cleanParams(p)),
    },
    groups_list: {
      description: "List all groups",
      handler: async (client) => client.get("/admin/groups/list"),
    },
    groups_create: {
      description: "Create a new group",
      params: {
        group: z.string().describe("Group name"),
        description: z.string().optional().describe("Group description"),
        members: z.string().optional().describe("Members (comma-separated usernames)"),
      },
      handler: async (client, p) => client.get("/admin/groups/create", cleanParams(p)),
    },
    groups_get: {
      description: "Get group details",
      params: {
        group: z.string().describe("Group name"),
      },
      handler: async (client, p) => client.get("/admin/groups/get", cleanParams(p)),
    },
    groups_set: {
      description: "Update group details",
      params: {
        group: z.string().describe("Group name"),
        newGroup: z.string().optional().describe("New group name"),
        description: z.string().optional().describe("Group description"),
        members: z.string().optional().describe("Members (comma-separated)"),
      },
      handler: async (client, p) => client.get("/admin/groups/set", cleanParams(p)),
    },
    groups_delete: {
      description: "Delete a group",
      params: {
        group: z.string().describe("Group name"),
      },
      handler: async (client, p) => client.get("/admin/groups/delete", cleanParams(p)),
    },
    permissions_list: {
      description: "List all permissions",
      handler: async (client) => client.get("/admin/permissions/list"),
    },
    permissions_get: {
      description: "Get permission details for a section",
      params: {
        section: z.string().describe("Permission section: Dashboard, Zones, Cache, Allowed, Blocked, Apps, DnsClient, Settings, DhcpServer, Administration, Logs"),
      },
      handler: async (client, p) => client.get("/admin/permissions/get", cleanParams(p)),
    },
    permissions_set: {
      description: "Set permission details for a section",
      params: {
        section: z.string().describe("Permission section"),
        userPermissions: z.string().optional().describe("JSON user permissions"),
        groupPermissions: z.string().optional().describe("JSON group permissions"),
      },
      handler: async (client, p) => client.get("/admin/permissions/set", cleanParams(p)),
    },
  });

  // Logs
  registerActionTool(server, client, "technitium_logs", "DNS server logs and query logs", {
    list: {
      description: "List available log files",
      handler: async (client) => client.get("/logs/list"),
    },
    query: {
      description: "Query DNS query logs with filters",
      params: {
        pageNumber: z.number().optional().describe("Page number"),
        entriesPerPage: z.number().optional().describe("Entries per page"),
        start: z.string().optional().describe("Start date (yyyy-MM-dd HH:mm:ss)"),
        end: z.string().optional().describe("End date"),
        clientIpAddress: z.string().optional().describe("Filter by client IP"),
        protocol: z.string().optional().describe("Filter by protocol: Udp, Tcp, Tls, Https, Quic"),
        responseType: z.string().optional().describe("Filter by response type"),
        rcode: z.string().optional().describe("Filter by response code"),
        qname: z.string().optional().describe("Filter by query domain name"),
        qtype: z.string().optional().describe("Filter by query type"),
        qclass: z.string().optional().describe("Filter by query class"),
      },
      handler: async (client, p) => client.get("/logs/query", cleanParams(p)),
    },
    delete: {
      description: "Delete a log file",
      params: {
        log: z.string().describe("Log file name"),
      },
      handler: async (client, p) => client.get("/logs/delete", cleanParams(p)),
    },
    delete_all: {
      description: "Delete all log files",
      handler: async (client) => client.get("/logs/deleteAll"),
    },
  });
}
