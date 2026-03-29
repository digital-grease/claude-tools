# technitium-mcp

MCP server for [Technitium DNS Server](https://technitium.com/dns/). Provides tools for managing DNS zones, records, cache, blocking, DHCP, apps, and server administration.

## Setup

```bash
npm install
npm run build
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TECHNITIUM_URL` | Base URL of the Technitium DNS server (e.g., `http://localhost:5380`) |
| `TECHNITIUM_TOKEN` | API token (create via Technitium web UI or `/api/user/createToken`) |

### Register with Claude Code

```bash
claude mcp add -s user technitium-mcp \
  -e TECHNITIUM_URL=http://your-dns-server:5380 \
  -e TECHNITIUM_TOKEN=your-api-token \
  -- node /path/to/technitium-mcp/dist/index.js
```

## Tools

| Tool | Description | Actions |
|------|-------------|---------|
| `technitium_zones` | Authoritative zone management | list, create, delete, enable, disable, clone, convert, export, resync, options_get/set, permissions_get/set |
| `technitium_records` | DNS resource records | get, add, update, delete |
| `technitium_dnssec` | DNSSEC operations | sign, unsign, view_ds, properties_get, convert_to_nsec/nsec3, update_nsec3_params, update_dnskey_ttl, rollover_dnskey, retire_dnskey |
| `technitium_cache` | DNS resolver cache | list, delete, flush |
| `technitium_allowed` | Allowed (whitelisted) zones | list, add, delete, flush, export |
| `technitium_blocked` | Blocked (blacklisted) zones | list, add, delete, flush, export |
| `technitium_dnsclient` | DNS client resolver | resolve |
| `technitium_dashboard` | Statistics and dashboard | stats_get, stats_top, stats_delete |
| `technitium_user` | User profile and sessions | profile_get/set, session_get/delete, create_token, check_update |
| `technitium_settings` | Server settings | get, set, tsig_key_names, force_update_blocklists, temp_disable_blocklists |
| `technitium_admin` | Administration (users, groups, permissions) | sessions_list/create_token/delete, users_list/create/get/set/delete, groups_list/create/get/set/delete, permissions_list/get/set |
| `technitium_logs` | Query and server logs | list, query, delete, delete_all |
| `technitium_dhcp` | DHCP server management | scopes_list/get/set/enable/disable/delete/add_reserved/remove_reserved, leases_list/remove/convert_reserved/convert_dynamic |
| `technitium_apps` | DNS app plugins | list, list_store, download_install, download_update, uninstall, config_get, config_set |

## API Documentation

Full API docs: https://github.com/TechnitiumSoftware/DnsServer/blob/master/APIDOCS.md
