/**
 * Offline test for redact() (src/helpers.ts). No Komodo connection needed.
 *   npx tsx test/redact.ts
 * All values below are fake.
 */
import { redact } from "../src/helpers.js";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}

// Shaped like a real DeleteStack / GetStack response.
const stack = {
  name: "demo",
  info: {
    deployed_hash: "45fc9be",
    deployed_config: "services:\n  db:\n    environment:\n      DB_PASSWORD: fake-interpolated-value\n",
    deployed_contents: [{ path: "compose.yaml", contents: "DB_PASSWORD: \"${DB_PASSWORD}\"\n" }],
  },
  config: {
    repo: "mflowers/demo",
    passthrough_mode: "on",
    webhook_enabled: true,
    webhook_secret: "fake-webhook-secret",
    environment: "APP_ADMIN_PASSWORD=fake-1\nDB_PASSWORD='fake-2'\n# comment\nexport TZ=America/Chicago\n",
  },
};
const out = JSON.stringify(redact(stack));
check("no fake secret survives", !/fake-(1|2|interpolated|webhook)/.test(out));
const r = redact(stack) as typeof stack;
check("environment keeps names", r.config.environment.includes("APP_ADMIN_PASSWORD=<redacted>") && r.config.environment.includes("DB_PASSWORD=<redacted>"));
check("environment keeps comments and export prefix", r.config.environment.includes("# comment") && r.config.environment.includes("export TZ=<redacted>"));
check("deployed_config replaced", !r.info.deployed_config.includes("services"));
check("webhook_secret replaced", r.config.webhook_secret !== "fake-webhook-secret");
check("compose template placeholders kept", r.info.deployed_contents[0].contents.includes("${DB_PASSWORD}"));
check("non-secret keys untouched", r.name === "demo" && r.config.repo === "mflowers/demo" && r.config.webhook_enabled === true && r.info.deployed_hash === "45fc9be");
check("'pass' inside a word is not a secret key", r.config.passthrough_mode === "on");

// Komodo variables.
const vars = redact([
  { name: "NTFY_KOMODO_AUTH", value: "fake-secret-var", is_secret: true },
  { name: "PLAIN", value: "visible", is_secret: false },
]) as Array<{ name: string; value: string }>;
check("secret variable value replaced", vars[0].value !== "fake-secret-var" && vars[0].name === "NTFY_KOMODO_AUTH");
check("plain variable value kept", vars[1].value === "visible");

// Nested secret-looking keys anywhere.
const nested = redact({ a: { b: [{ api_key: "fake-k", private_key: "fake-p", token: "fake-t", passkeys: ["fake-x"] }] } });
check("nested secret keys replaced", !/fake-/.test(JSON.stringify(nested)));

// Non-object results pass through.
check("strings/numbers pass through", redact("ok") === "ok" && redact(3) === 3 && redact(null) === null);

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
