# Vendored: bookstack-mcp

Upstream: https://github.com/ttpears/bookstack-mcp
Pinned commit: cd1d444158a9ab73d84150e37fb6ab36c432f773 (v4.0.0, 2026-05-23)
Vendored: 2026-06-24

Static-reviewed before vendoring (single-destination to the configured BookStack
only; no telemetry/eval/shell-out; token never logged). Write tools are gated
behind BOOKSTACK_ENABLE_WRITE=true.

To update: re-clone upstream at the new pin, diff src/, rebuild (`npm run build`).

## Build
Upstream builds with `tsc`, but tsc OOMs/stalls here on zod's type instantiation
(root has zod@4, this workspace nests zod@3 — tsc tries to check both). We instead
transpile the reviewed source with esbuild (no type-checking; CI upstream already
type-checks). `npm run build` -> esbuild bundle to dist/index.js, deps external.
