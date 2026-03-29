import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import { KomodoClient } from "./client.js";

/**
 * Helper to register a Komodo tool that dispatches to different API calls
 * based on an `action` parameter.
 */
export interface ActionRoute {
  description: string;
  /** Additional params beyond `action` */
  params?: ZodRawShape;
  handler: (client: KomodoClient, params: Record<string, unknown>) => Promise<unknown>;
}

export function registerActionTool(
  server: McpServer,
  client: KomodoClient,
  name: string,
  description: string,
  actions: Record<string, ActionRoute>,
) {
  const actionDescriptions = Object.entries(actions)
    .map(([key, route]) => `  - ${key}: ${route.description}`)
    .join("\n");

  const fullDescription = `${description}\n\nActions:\n${actionDescriptions}`;

  // Collect all possible params across actions as optional
  const paramMap: Record<string, z.ZodType> = {
    action: z.enum(Object.keys(actions) as [string, ...string[]]).describe("The action to perform"),
  };

  for (const route of Object.values(actions)) {
    if (route.params) {
      for (const [key, schema] of Object.entries(route.params)) {
        if (!(key in paramMap)) {
          paramMap[key] = (schema as z.ZodType).optional().describe(
            (schema as z.ZodType).description ?? key,
          );
        }
      }
    }
  }

  const allParams = paramMap as ZodRawShape;

  server.tool(name, fullDescription, allParams, async (params) => {
    const action = params.action as string;
    const route = actions[action];
    if (!route) {
      return { content: [{ type: "text", text: `Unknown action: ${action}` }] };
    }

    try {
      const result = await route.handler(client, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
    }
  });
}

/** Shortcut for a simple passthrough to client.read */
export function readAction(
  requestName: string,
  description: string,
  params?: ZodRawShape,
  bodyBuilder?: (params: Record<string, unknown>) => Record<string, unknown>,
): ActionRoute {
  return {
    description,
    params,
    handler: async (client, p) => {
      const body = bodyBuilder ? bodyBuilder(p) : stripAction(p);
      return client.read(requestName, body);
    },
  };
}

/** Shortcut for a simple passthrough to client.write */
export function writeAction(
  requestName: string,
  description: string,
  params?: ZodRawShape,
  bodyBuilder?: (params: Record<string, unknown>) => Record<string, unknown>,
): ActionRoute {
  return {
    description,
    params,
    handler: async (client, p) => {
      const body = bodyBuilder ? bodyBuilder(p) : stripAction(p);
      return client.write(requestName, body);
    },
  };
}

/** Shortcut for a simple passthrough to client.execute */
export function executeAction(
  requestName: string,
  description: string,
  params?: ZodRawShape,
  bodyBuilder?: (params: Record<string, unknown>) => Record<string, unknown>,
): ActionRoute {
  return {
    description,
    params,
    handler: async (client, p) => {
      const body = bodyBuilder ? bodyBuilder(p) : stripAction(p);
      return client.execute(requestName, body);
    },
  };
}

function stripAction(params: Record<string, unknown>): Record<string, unknown> {
  const { action, ...rest } = params;
  // Remove undefined values
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
}
