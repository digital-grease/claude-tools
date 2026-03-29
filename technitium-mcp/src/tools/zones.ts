import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TechnitiumClient } from "../client.js";
import { registerActionTool, cleanParams } from "../helpers.js";

const domain = z.string().describe("Domain name");
const zone = z.string().describe("Zone name");

export function registerZoneTools(server: McpServer, client: TechnitiumClient) {
  // Zone management
  registerActionTool(server, client, "technitium_zones", "Manage DNS authoritative zones", {
    list: {
      description: "List all hosted zones (paginated)",
      params: {
        pageNumber: z.number().optional().describe("Page number (default: 1)"),
        zonesPerPage: z.number().optional().describe("Zones per page (default: 10)"),
      },
      handler: async (client, p) => client.get("/zones/list", cleanParams(p)),
    },
    create: {
      description: "Create a new zone",
      params: {
        zone,
        type: z.string().describe("Zone type: Primary, Secondary, Stub, Forwarder, SecondaryForwarder, Catalog, SecondaryCatalog"),
        primaryNameServerAddresses: z.string().optional().describe("Primary NS addresses (semicolon-separated) for Secondary/Stub zones"),
        zoneTransferProtocol: z.string().optional().describe("Zone transfer protocol: Tcp, Tls, Quic"),
        tsigKeyName: z.string().optional().describe("TSIG key name for zone transfer"),
        protocol: z.string().optional().describe("Forwarder protocol: Udp, Tcp, Tls, Https, Quic"),
        forwarder: z.string().optional().describe("Forwarder address for Forwarder zones"),
        catalog: z.string().optional().describe("Catalog zone name to add this zone to"),
      },
      handler: async (client, p) => client.get("/zones/create", cleanParams(p)),
    },
    delete: {
      description: "Delete a zone",
      params: { zone },
      handler: async (client, p) => client.get("/zones/delete", cleanParams(p)),
    },
    enable: {
      description: "Enable a zone",
      params: { zone },
      handler: async (client, p) => client.get("/zones/enable", cleanParams(p)),
    },
    disable: {
      description: "Disable a zone",
      params: { zone },
      handler: async (client, p) => client.get("/zones/disable", cleanParams(p)),
    },
    clone: {
      description: "Clone a zone with all records",
      params: {
        zone,
        sourceZone: z.string().describe("Source zone to clone from"),
      },
      handler: async (client, p) => client.get("/zones/clone", cleanParams(p)),
    },
    convert: {
      description: "Convert zone type",
      params: {
        zone,
        type: z.string().describe("New zone type"),
      },
      handler: async (client, p) => client.get("/zones/convert", cleanParams(p)),
    },
    export: {
      description: "Export zone in RFC 1035 format",
      params: { zone },
      handler: async (client, p) => client.get("/zones/export", cleanParams(p)),
    },
    resync: {
      description: "Resync secondary zone from primary",
      params: { zone },
      handler: async (client, p) => client.get("/zones/resync", cleanParams(p)),
    },
    options_get: {
      description: "Get zone configuration options",
      params: { zone },
      handler: async (client, p) => client.get("/zones/options/get", cleanParams(p)),
    },
    options_set: {
      description: "Set zone configuration options",
      params: {
        zone,
        disabled: z.boolean().optional().describe("Disable zone"),
        zoneTransfer: z.string().optional().describe("Zone transfer setting: Deny, Allow, AllowOnlyPrivateNetworks, AllowOnlyZoneNameServers, UseSpecifiedNetworkACL"),
        zoneTransferNetworkACL: z.string().optional().describe("Network ACL for zone transfer (CIDR, semicolon-separated)"),
        notify: z.string().optional().describe("Notify setting: None, ZoneNameServers, SpecifiedNameServers"),
        notifyNameServers: z.string().optional().describe("Name servers to notify (semicolon-separated)"),
      },
      handler: async (client, p) => client.get("/zones/options/set", cleanParams(p)),
    },
    permissions_get: {
      description: "Get zone permissions",
      params: { zone },
      handler: async (client, p) => client.get("/zones/permissions/get", cleanParams(p)),
    },
    permissions_set: {
      description: "Set zone permissions",
      params: {
        zone,
        permissions: z.string().describe("JSON permissions object"),
      },
      handler: async (client, p) => client.get("/zones/permissions/set", cleanParams(p)),
    },
  });

  // DNS Records
  registerActionTool(server, client, "technitium_records", "Manage DNS resource records", {
    get: {
      description: "Get records for a domain in a zone",
      params: {
        domain,
        zone: z.string().optional().describe("Zone name (optional, auto-detected)"),
        type: z.string().optional().describe("Record type: A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, PTR, CAA, ANAME, FWD, APP, etc."),
        listZone: z.boolean().optional().describe("List all records in zone if true"),
      },
      handler: async (client, p) => client.get("/zones/records/get", cleanParams(p)),
    },
    add: {
      description: "Add a DNS record",
      params: {
        domain,
        zone: z.string().optional().describe("Zone name (optional, auto-detected)"),
        type: z.string().describe("Record type: A, AAAA, CNAME, MX, TXT, NS, SRV, PTR, CAA, ANAME, FWD, APP, etc."),
        ttl: z.number().optional().describe("TTL in seconds (default: 3600)"),
        overwrite: z.boolean().optional().describe("Overwrite existing records of same type"),
        comments: z.string().optional().describe("Comments for the record"),
        ipAddress: z.string().optional().describe("IP address (for A/AAAA records)"),
        cname: z.string().optional().describe("CNAME value"),
        exchange: z.string().optional().describe("MX exchange server"),
        preference: z.number().optional().describe("MX preference"),
        text: z.string().optional().describe("TXT record value"),
        nameServer: z.string().optional().describe("NS record value"),
        priority: z.number().optional().describe("SRV priority"),
        weight: z.number().optional().describe("SRV weight"),
        port: z.number().optional().describe("SRV port"),
        target: z.string().optional().describe("SRV target"),
        ptrName: z.string().optional().describe("PTR record value"),
        flags: z.number().optional().describe("CAA flags"),
        tag: z.string().optional().describe("CAA tag"),
        value: z.string().optional().describe("CAA/URI value"),
        protocol: z.string().optional().describe("Forwarder protocol: Udp, Tcp, Tls, Https, Quic"),
        forwarder: z.string().optional().describe("Forwarder address (for FWD records)"),
        appName: z.string().optional().describe("App name (for APP records)"),
        classPath: z.string().optional().describe("App class path (for APP records)"),
        recordData: z.string().optional().describe("App record data (for APP records)"),
      },
      handler: async (client, p) => client.get("/zones/records/add", cleanParams(p)),
    },
    update: {
      description: "Update an existing DNS record",
      params: {
        domain,
        zone: z.string().optional().describe("Zone name"),
        type: z.string().describe("Record type"),
        ttl: z.number().optional().describe("New TTL"),
        comments: z.string().optional().describe("New comments"),
        ipAddress: z.string().optional().describe("New IP address"),
        newIpAddress: z.string().optional().describe("New IP address (when changing A/AAAA)"),
        cname: z.string().optional().describe("Current CNAME"),
        newCname: z.string().optional().describe("New CNAME value"),
        exchange: z.string().optional().describe("Current MX exchange"),
        newExchange: z.string().optional().describe("New MX exchange"),
        preference: z.number().optional().describe("MX preference"),
        text: z.string().optional().describe("Current TXT value"),
        newText: z.string().optional().describe("New TXT value"),
        nameServer: z.string().optional().describe("Current NS value"),
        newNameServer: z.string().optional().describe("New NS value"),
        target: z.string().optional().describe("Current SRV target"),
        newTarget: z.string().optional().describe("New SRV target"),
        priority: z.number().optional().describe("SRV priority"),
        weight: z.number().optional().describe("SRV weight"),
        port: z.number().optional().describe("SRV port"),
        newDomain: z.string().optional().describe("New domain name (to rename record)"),
      },
      handler: async (client, p) => client.get("/zones/records/update", cleanParams(p)),
    },
    delete: {
      description: "Delete a DNS record",
      params: {
        domain,
        zone: z.string().optional().describe("Zone name"),
        type: z.string().describe("Record type"),
        ipAddress: z.string().optional().describe("IP address (for A/AAAA)"),
        cname: z.string().optional().describe("CNAME value"),
        exchange: z.string().optional().describe("MX exchange"),
        text: z.string().optional().describe("TXT value"),
        nameServer: z.string().optional().describe("NS value"),
        target: z.string().optional().describe("SRV target"),
        ptrName: z.string().optional().describe("PTR value"),
      },
      handler: async (client, p) => client.get("/zones/records/delete", cleanParams(p)),
    },
  });

  // DNSSEC operations
  registerActionTool(server, client, "technitium_dnssec", "Manage DNSSEC for zones", {
    sign: {
      description: "Sign a zone with DNSSEC",
      params: {
        zone,
        algorithm: z.string().optional().describe("Algorithm: RSA, ECDSA, EDDSA"),
        hashAlgorithm: z.string().optional().describe("Hash algorithm: MD5, SHA1, SHA256, SHA512"),
        kskKeySize: z.number().optional().describe("KSK key size"),
        zskKeySize: z.number().optional().describe("ZSK key size"),
        nxProof: z.string().optional().describe("NX proof: NSEC, NSEC3"),
        iterations: z.number().optional().describe("NSEC3 iterations"),
        saltLength: z.number().optional().describe("NSEC3 salt length"),
        dnsKeyTtl: z.number().optional().describe("DNSKEY TTL"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/sign", cleanParams(p)),
    },
    unsign: {
      description: "Remove DNSSEC from a zone",
      params: { zone },
      handler: async (client, p) => client.get("/zones/dnssec/unsign", cleanParams(p)),
    },
    view_ds: {
      description: "View DS record info for DNSSEC delegation",
      params: { zone },
      handler: async (client, p) => client.get("/zones/dnssec/viewDS", cleanParams(p)),
    },
    properties_get: {
      description: "Get DNSSEC properties for a zone",
      params: { zone },
      handler: async (client, p) => client.get("/zones/dnssec/properties/get", cleanParams(p)),
    },
    convert_to_nsec: {
      description: "Convert DNSSEC to NSEC",
      params: { zone },
      handler: async (client, p) => client.get("/zones/dnssec/properties/convertToNSEC", cleanParams(p)),
    },
    convert_to_nsec3: {
      description: "Convert DNSSEC to NSEC3",
      params: {
        zone,
        iterations: z.number().optional().describe("NSEC3 iterations"),
        saltLength: z.number().optional().describe("NSEC3 salt length"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/properties/convertToNSEC3", cleanParams(p)),
    },
    update_nsec3_params: {
      description: "Update NSEC3 parameters",
      params: {
        zone,
        iterations: z.number().optional().describe("NSEC3 iterations"),
        saltLength: z.number().optional().describe("NSEC3 salt length"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/properties/updateNSEC3Params", cleanParams(p)),
    },
    update_dnskey_ttl: {
      description: "Update DNSKEY TTL",
      params: {
        zone,
        ttl: z.number().describe("New TTL value"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/properties/updateDnsKeyTtl", cleanParams(p)),
    },
    rollover_dnskey: {
      description: "Perform DNSKEY rollover",
      params: {
        zone,
        keyTag: z.number().describe("Key tag of the key to rollover"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/properties/rolloverDnsKey", cleanParams(p)),
    },
    retire_dnskey: {
      description: "Retire a DNSKEY",
      params: {
        zone,
        keyTag: z.number().describe("Key tag of the key to retire"),
      },
      handler: async (client, p) => client.get("/zones/dnssec/properties/retireDnsKey", cleanParams(p)),
    },
  });
}
