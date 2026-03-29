import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import { TechnitiumClient } from "./client.js";

export interface ActionRoute {
  description: string;
  params?: ZodRawShape;
  handler: (client: TechnitiumClient, params: Record<string, unknown>) => Promise<unknown>;
}

export function registerActionTool(
  server: McpServer,
  client: TechnitiumClient,
  name: string,
  description: string,
  actions: Record<string, ActionRoute>,
) {
  const actionDescriptions = Object.entries(actions)
    .map(([key, route]) => `  - ${key}: ${route.description}`)
    .join("\n");

  const fullDescription = `${description}\n\nActions:\n${actionDescriptions}`;

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

  server.tool(name, fullDescription, paramMap as ZodRawShape, async (params) => {
    const action = params.action as string;
    const route = actions[action];
    if (!route) {
      return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }] };
    }

    try {
      const result = await route.handler(client, params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  });
}

/** Strip action and undefined values from params, return as query-param-friendly record */
export function cleanParams(params: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
  const { action, ...rest } = params;
  return Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  ) as Record<string, string | number | boolean | undefined>;
}
