import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KomodoClient } from "../client.js";
import { registerActionTool, readAction } from "../helpers.js";

const nameOrId = z.string().describe("Resource name or ID");

export function registerOpsReadTools(server: McpServer, client: KomodoClient) {
  // -- Procedures --
  registerActionTool(server, client, "komodo_procedures", "Query Komodo procedures", {
    list: readAction("ListProcedures", "List all procedures"),
    get: readAction("GetProcedure", "Get procedure details", {
      procedure: nameOrId,
    }, (p) => ({ procedure: p.procedure })),
    get_summary: readAction("GetProceduresSummary", "Get summary counts"),
  });

  // -- Actions --
  registerActionTool(server, client, "komodo_actions", "Query Komodo actions", {
    list: readAction("ListActions", "List all actions"),
    get: readAction("GetAction", "Get action details", {
      action_id: nameOrId,
    }, (p) => ({ action: p.action_id })),
    get_summary: readAction("GetActionsSummary", "Get summary counts"),
  });

  // -- Alerters --
  registerActionTool(server, client, "komodo_alerters", "Query Komodo alerters", {
    list: readAction("ListAlerters", "List all alerters"),
    get: readAction("GetAlerter", "Get alerter details", {
      alerter: nameOrId,
    }, (p) => ({ alerter: p.alerter })),
    get_summary: readAction("GetAlertersSummary", "Get summary counts"),
  });

  // -- Syncs --
  registerActionTool(server, client, "komodo_syncs", "Query Komodo resource syncs", {
    list: readAction("ListResourceSyncs", "List all resource syncs"),
    get: readAction("GetResourceSync", "Get sync details", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
    get_summary: readAction("GetResourceSyncsSummary", "Get summary counts"),
    export_toml: readAction("ExportResourcesToToml", "Export a sync's resources as TOML", {
      sync: nameOrId,
    }, (p) => ({ sync: p.sync })),
    export_all_toml: readAction("ExportAllResourcesToToml", "Export all resources as TOML"),
  });

  // NOTE: Swarm read endpoints (ListSwarms, GetSwarm, etc.) are not available
  // in Komodo v1.19.5. Swarm write/execute tools are kept in their respective
  // files in case a newer version adds them — they'll just error gracefully.
}
