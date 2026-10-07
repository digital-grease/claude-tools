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
        content: [{ type: "text", text: JSON.stringify(redact(result), null, 2) }],
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

/**
 * Strip secrets from every Komodo API response before it reaches the caller.
 *
 * Komodo returns full resource objects from reads AND from writes (e.g. DeleteStack
 * returns the deleted stack), including the stack/deployment `environment`, the
 * rendered compose (`deployed_config`, with secrets already interpolated), webhook
 * secrets and secret variables. None of that should land in a model's context.
 *
 * - `environment`: keep variable NAMES, drop values ("KEY=<redacted>"), so you can
 *   still see what is set.
 * - `deployed_config`: replaced entirely (interpolated values are unrecognisable).
 * - secret-looking keys (password, secret, token, passkey, api key, private key, ...):
 *   value replaced.
 * - Komodo variables with `is_secret: true`: `value` replaced.
 */
const REDACTED = "<redacted by komodo-mcp>";
const SECRET_KEY =
  /(^|_)(password|passwd|pass|secret|secrets|token|passkey|passkeys|api_?key|private_?key|credentials?)($|_)/i;

export function redact(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => redact(v, key));
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const secretVariable = obj.is_secret === true;
    for (const [k, v] of Object.entries(obj)) {
      if (secretVariable && k === "value") out[k] = REDACTED;
      else out[k] = redact(v, k);
    }
    return out;
  }
  if (typeof value === "string" && value !== "") {
    if (key === "deployed_config") return REDACTED;
    if (key === "environment") {
      return value
        .split("\n")
        .map((line) => {
          const m = line.match(/^(\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*)\s*=/);
          return m ? `${m[1]}=<redacted>` : line;
        })
        .join("\n");
    }
    if (SECRET_KEY.test(key)) return REDACTED;
  }
  return value;
}

/** "a, b,c" -> ["a", "b", "c"]; missing or empty -> [] */
export function splitList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function stripAction(params: Record<string, unknown>): Record<string, unknown> {
  const { action, ...rest } = params;
  // Remove undefined values
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
}
