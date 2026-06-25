import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ForgejoClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const owner = z.string().describe("Repository owner (user or org)");
const repo = z.string().describe("Repository name");
const page = z.number().optional().describe("Page number (default: 1)");
const limit = z.number().optional().describe("Items per page (default: 50)");

// Status/conclusion filter shared by runs and tasks listings.
const statusFilter = z
  .string()
  .optional()
  .describe(
    "Filter by status or conclusion: unknown, waiting, running, success, failure, cancelled, skipped, blocked (and check-run states like in_progress, queued, requested)",
  );

export function registerActionTools(server: McpServer, client: ForgejoClient) {
  registerActionTool(
    server,
    client,
    "forgejo_actions",
    "Inspect and control Forgejo Actions (CI/CD): workflow runs, per-job task verdicts, workflow dispatch, secrets, variables, and runners. " +
      "Use list_tasks or list_runs to see which CI lanes passed/failed. " +
      "NOTE: this Forgejo (15.0.2 / gitea-1.22) exposes NO REST endpoint for job logs — to read a failed lane's output, open the run in the web UI or have the user paste the log.",
    {
      list_runs: {
        description:
          "List a repository's workflow runs (one row per workflow run). Filterable by event/status/ref/sha/workflow.",
        params: {
          owner,
          repo,
          event: z
            .string()
            .optional()
            .describe("Filter by triggering event, e.g. push, pull_request, workflow_dispatch"),
          status: statusFilter,
          run_number: z.number().optional().describe("Return the run with this run number"),
          head_sha: z.string().optional().describe("Only runs associated with this head SHA"),
          ref: z.string().optional().describe("Only runs for this git ref, e.g. refs/heads/main"),
          workflow_id: z.string().optional().describe("Only runs for this workflow id, e.g. ci.yml"),
          page,
          limit,
        },
        handler: async (client, p) => {
          const { action, owner, repo, ...query } = p;
          return client.get(`/repos/${p.owner}/${p.repo}/actions/runs`, cleanParams(query));
        },
      },
      get_run: {
        description: "Get a single workflow run by its run id.",
        params: {
          owner,
          repo,
          run_id: z.number().describe("Workflow run id (from list_runs)"),
        },
        handler: async (client, p) =>
          client.get(`/repos/${p.owner}/${p.repo}/actions/runs/${p.run_id}`),
      },
      list_tasks: {
        description:
          "List a repository's action tasks — the per-job CI verdicts (the #1 way to see which lane passed/failed). " +
          "Quirk: the JSON wrapper key is `workflow_runs`, and queued/waiting tasks with no free runner are omitted — do not treat 'absent' as 'passed'.",
        params: {
          owner,
          repo,
          status: statusFilter,
          page,
          limit,
        },
        handler: async (client, p) => {
          const { action, owner, repo, ...query } = p;
          return client.get(`/repos/${p.owner}/${p.repo}/actions/tasks`, cleanParams(query));
        },
      },
      search_jobs: {
        description: "Search a repository's action jobs by runner labels.",
        params: {
          owner,
          repo,
          labels: z.string().optional().describe("Comma-separated list of run-job labels to match"),
        },
        handler: async (client, p) =>
          client.get(`/repos/${p.owner}/${p.repo}/actions/runners/jobs`, {
            labels: p.labels as string | undefined,
          }),
      },
      dispatch_workflow: {
        description:
          "Dispatch (manually trigger) a workflow. Requires the workflow to have an on: workflow_dispatch trigger.",
        params: {
          owner,
          repo,
          workflow: z.string().describe("Workflow file name, e.g. ci.yml"),
          ref: z.string().describe("Git ref to run against, e.g. main or refs/heads/main"),
          inputs: z
            .record(z.string(), z.string())
            .optional()
            .describe("Workflow inputs as a string->string map (keys defined in the workflow file)"),
          return_run_info: z
            .boolean()
            .optional()
            .describe("Return info about the dispatched run (default: false)"),
        },
        handler: async (client, p) => {
          const body: Record<string, unknown> = { ref: p.ref };
          if (p.inputs) body.inputs = p.inputs;
          if (p.return_run_info !== undefined) body.return_run_info = p.return_run_info;
          return client.post(
            `/repos/${p.owner}/${p.repo}/actions/workflows/${p.workflow}/dispatches`,
            body,
          );
        },
      },

      // --- Secrets (write-only values; list returns names/metadata, never the secret) ---
      list_secrets: {
        description: "List a repository's Actions secrets (names and metadata only — values are never returned).",
        params: { owner, repo, page, limit },
        handler: async (client, p) => {
          const { action, owner, repo, ...query } = p;
          return client.get(`/repos/${p.owner}/${p.repo}/actions/secrets`, cleanParams(query));
        },
      },
      set_secret: {
        description: "Create or update a repository Actions secret.",
        params: {
          owner,
          repo,
          secret_name: z.string().describe("Secret name (will be upper-cased by Forgejo)"),
          data: z
            .string()
            .describe("Secret value. Base64-encode it if line endings must be preserved (LF normalization otherwise)."),
        },
        handler: async (client, p) =>
          client.put(`/repos/${p.owner}/${p.repo}/actions/secrets/${p.secret_name}`, {
            data: p.data,
          }),
      },
      delete_secret: {
        description: "Delete a repository Actions secret.",
        params: {
          owner,
          repo,
          secret_name: z.string().describe("Secret name to delete"),
        },
        handler: async (client, p) =>
          client.delete(`/repos/${p.owner}/${p.repo}/actions/secrets/${p.secret_name}`),
      },

      // --- Variables ---
      list_variables: {
        description: "List a repository's Actions variables.",
        params: { owner, repo, page, limit },
        handler: async (client, p) => {
          const { action, owner, repo, ...query } = p;
          return client.get(`/repos/${p.owner}/${p.repo}/actions/variables`, cleanParams(query));
        },
      },
      get_variable: {
        description: "Get a single repository Actions variable.",
        params: {
          owner,
          repo,
          variable_name: z.string().describe("Variable name"),
        },
        handler: async (client, p) =>
          client.get(`/repos/${p.owner}/${p.repo}/actions/variables/${p.variable_name}`),
      },
      create_variable: {
        description: "Create a repository Actions variable.",
        params: {
          owner,
          repo,
          variable_name: z.string().describe("Variable name (will be upper-cased by Forgejo)"),
          value: z.string().describe("Variable value"),
        },
        handler: async (client, p) =>
          client.post(`/repos/${p.owner}/${p.repo}/actions/variables/${p.variable_name}`, {
            value: p.value,
          }),
      },
      update_variable: {
        description: "Update a repository Actions variable (value, and optionally rename it).",
        params: {
          owner,
          repo,
          variable_name: z.string().describe("Existing variable name"),
          value: z.string().describe("New value"),
          new_name: z
            .string()
            .optional()
            .describe("New name for the variable (omit to keep the current name)"),
        },
        handler: async (client, p) => {
          const body: Record<string, unknown> = { value: p.value };
          if (p.new_name) body.name = p.new_name;
          return client.put(`/repos/${p.owner}/${p.repo}/actions/variables/${p.variable_name}`, body);
        },
      },
      delete_variable: {
        description: "Delete a repository Actions variable.",
        params: {
          owner,
          repo,
          variable_name: z.string().describe("Variable name to delete"),
        },
        handler: async (client, p) =>
          client.delete(`/repos/${p.owner}/${p.repo}/actions/variables/${p.variable_name}`),
      },

      // --- Runners ---
      list_runners: {
        description: "List a repository's registered Actions runners.",
        params: { owner, repo, page, limit },
        handler: async (client, p) => {
          const { action, owner, repo, ...query } = p;
          return client.get(`/repos/${p.owner}/${p.repo}/actions/runners`, cleanParams(query));
        },
      },
      get_runner: {
        description: "Get a single repository Actions runner by id.",
        params: {
          owner,
          repo,
          runner_id: z.number().describe("Runner id"),
        },
        handler: async (client, p) =>
          client.get(`/repos/${p.owner}/${p.repo}/actions/runners/${p.runner_id}`),
      },
      delete_runner: {
        description: "Delete (deregister) a repository Actions runner.",
        params: {
          owner,
          repo,
          runner_id: z.number().describe("Runner id to delete"),
        },
        handler: async (client, p) =>
          client.delete(`/repos/${p.owner}/${p.repo}/actions/runners/${p.runner_id}`),
      },
      get_registration_token: {
        description: "Get a registration token used to register a new runner against this repository.",
        params: { owner, repo },
        handler: async (client, p) =>
          client.get(`/repos/${p.owner}/${p.repo}/actions/runners/registration-token`),
      },
    },
  );
}
