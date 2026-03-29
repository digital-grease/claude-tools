/**
 * Read-only smoke test for the Komodo MCP server.
 * Exercises read operations only — no state changes, no destructive actions.
 *
 * Usage:
 *   KOMODO_URL=https://... KOMODO_API_KEY=... KOMODO_API_SECRET=... npx tsx test/smoke.ts
 */

import { KomodoClient } from "../src/client.js";

const baseUrl = process.env.KOMODO_URL;
const apiKey = process.env.KOMODO_API_KEY;
const apiSecret = process.env.KOMODO_API_SECRET;

if (!baseUrl || !apiKey || !apiSecret) {
  console.error("Set KOMODO_URL, KOMODO_API_KEY, KOMODO_API_SECRET");
  process.exit(1);
}

const client = new KomodoClient({ baseUrl, apiKey, apiSecret });

interface TestResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`  PASS  ${name} — ${detail}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, detail: msg });
    console.log(`  FAIL  ${name} — ${msg}`);
  }
}

console.log("\nKomodo MCP — Read-Only Smoke Test");
console.log(`Target: ${baseUrl}\n`);

// --- System ---
await test("GetVersion", async () => {
  const res = await client.read<{ version: string }>("GetVersion", {});
  return `v${res.version}`;
});

await test("GetCoreInfo", async () => {
  const res = await client.read<Record<string, unknown>>("GetCoreInfo", {});
  return `keys: ${Object.keys(res).join(", ")}`;
});

// --- Deployments ---
await test("ListDeployments", async () => {
  const res = await client.read<unknown[]>("ListDeployments", { query: {} });
  return `${res.length} deployments`;
});

// --- Stacks ---
await test("ListStacks", async () => {
  const res = await client.read<unknown[]>("ListStacks", { query: {} });
  return `${res.length} stacks`;
});

// --- Servers ---
await test("ListServers", async () => {
  const res = await client.read<unknown[]>("ListServers", { query: {} });
  return `${res.length} servers`;
});

// --- Builds ---
await test("ListBuilds", async () => {
  const res = await client.read<unknown[]>("ListBuilds", { query: {} });
  return `${res.length} builds`;
});

// --- Repos ---
await test("ListRepos", async () => {
  const res = await client.read<unknown[]>("ListRepos", { query: {} });
  return `${res.length} repos`;
});

// --- Procedures ---
await test("ListProcedures", async () => {
  const res = await client.read<unknown[]>("ListProcedures", { query: {} });
  return `${res.length} procedures`;
});

// --- Actions ---
await test("ListActions", async () => {
  const res = await client.read<unknown[]>("ListActions", { query: {} });
  return `${res.length} actions`;
});

// --- Alerters ---
await test("ListAlerters", async () => {
  const res = await client.read<unknown[]>("ListAlerters", { query: {} });
  return `${res.length} alerters`;
});

// --- Resource Syncs ---
await test("ListResourceSyncs", async () => {
  const res = await client.read<unknown[]>("ListResourceSyncs", { query: {} });
  return `${res.length} syncs`;
});

// --- Tags ---
await test("ListTags", async () => {
  const res = await client.read<unknown[]>("ListTags", {});
  return `${res.length} tags`;
});

// --- Variables ---
await test("ListVariables", async () => {
  const res = await client.read<unknown[]>("ListVariables", {});
  return `${res.length} variables`;
});

// --- Users ---
await test("ListUsers", async () => {
  const res = await client.read<unknown[]>("ListUsers", {});
  return `${res.length} users`;
});

// --- User Groups ---
await test("ListUserGroups", async () => {
  const res = await client.read<unknown[]>("ListUserGroups", {});
  return `${res.length} user groups`;
});

// --- Builders ---
await test("ListBuilders", async () => {
  const res = await client.read<unknown[]>("ListBuilders", { query: {} });
  return `${res.length} builders`;
});

// --- Docker Registries ---
await test("ListDockerRegistryAccounts", async () => {
  const res = await client.read<unknown[]>("ListDockerRegistryAccounts", {});
  return `${res.length} registries`;
});

// --- Git Providers ---
await test("ListGitProviderAccounts", async () => {
  const res = await client.read<unknown[]>("ListGitProviderAccounts", {});
  return `${res.length} git providers`;
});

// --- Schedules ---
await test("ListSchedules", async () => {
  const res = await client.read<unknown[]>("ListSchedules", {});
  return `${res.length} schedules`;
});

// --- Stack services (first stack if any) ---
await test("ListStackServices (first stack)", async () => {
  const stacks = await client.read<Array<{ name: string }>>("ListStacks", { query: {} });
  if (stacks.length === 0) return "skipped (no stacks)";
  const res = await client.read<unknown[]>("ListStackServices", { stack: stacks[0].name });
  return `${res.length} services on "${stacks[0].name}"`;
});

// --- Summaries ---
await test("GetDeploymentsSummary", async () => {
  const res = await client.read<Record<string, unknown>>("GetDeploymentsSummary", {});
  return JSON.stringify(res);
});

await test("GetStacksSummary", async () => {
  const res = await client.read<Record<string, unknown>>("GetStacksSummary", {});
  return JSON.stringify(res);
});

await test("GetServersSummary", async () => {
  const res = await client.read<Record<string, unknown>>("GetServersSummary", {});
  return JSON.stringify(res);
});

// --- Deep read: get first deployment details (if any) ---
await test("GetDeployment (first)", async () => {
  const list = await client.read<Array<{ name: string }>>("ListDeployments", { query: {} });
  if (list.length === 0) return "skipped (no deployments)";
  const dep = await client.read<Record<string, unknown>>("GetDeployment", { deployment: list[0].name });
  return `fetched "${list[0].name}" — keys: ${Object.keys(dep).join(", ")}`;
});

// --- Deep read: get first server stats (if any) ---
await test("GetSystemStats (first server)", async () => {
  const list = await client.read<Array<{ name: string }>>("ListServers", { query: {} });
  if (list.length === 0) return "skipped (no servers)";
  const stats = await client.read<Record<string, unknown>>("GetSystemStats", { server: list[0].name });
  return `fetched stats for "${list[0].name}" — keys: ${Object.keys(stats).join(", ")}`;
});

// --- Deep read: get first server's containers (if any) ---
await test("ListDockerContainers (first server)", async () => {
  const list = await client.read<Array<{ name: string }>>("ListServers", { query: {} });
  if (list.length === 0) return "skipped (no servers)";
  const containers = await client.read<unknown[]>("ListDockerContainers", { server: list[0].name });
  return `${containers.length} containers on "${list[0].name}"`;
});

// --- Report ---
console.log("\n--- Results ---");
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`${passed} passed, ${failed} failed out of ${results.length} tests\n`);

if (failed > 0) {
  console.log("Failures:");
  for (const r of results.filter((r) => !r.ok)) {
    console.log(`  ${r.name}: ${r.detail}`);
  }
  console.log();
  process.exit(1);
}
