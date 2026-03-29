/**
 * Common Komodo API response types.
 * These are lightweight TS representations of the Rust types from komodo_client.
 */

// -- Generic resource types --

export interface Resource<Config = Record<string, unknown>, Info = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  template: boolean;
  tags: string[];
  info: Info;
  config: Config;
  base_permission: PermissionLevelAndSpecifics;
  updated_at: number;
}

export interface ResourceListItem<Info = Record<string, unknown>> {
  id: string;
  name: string;
  tags: string[];
  resource_type: string;
  info: Info;
  updated_at: number;
}

export interface ResourceQuery<Specific = Record<string, unknown>> {
  names?: string[];
  templates?: "include" | "exclude" | "only";
  tags?: string[];
  tag_behavior?: "all" | "any";
  specific?: Specific;
}

export interface PermissionLevelAndSpecifics {
  level: string;
  specifics: string[];
}

// -- Update (common response for execute operations) --

export interface Update {
  id: string;
  operation: string;
  start_ts: number;
  success: boolean;
  operator: string;
  target: ResourceTarget;
  logs: Log[];
  end_ts?: number;
  status: string;
  version: Version;
  commit_hash: string;
  other_data: string;
  prev_toml: string;
  current_toml: string;
}

export interface ResourceTarget {
  type: string;
  id: string;
}

export interface Log {
  stage: string;
  stdout: string;
  stderr: string;
  command: string;
  success: boolean;
  start_ts: number;
  end_ts: number;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

// -- Batch execution response --

export interface BatchExecutionResponse {
  successes: number;
  failures: number;
  updates: Update[];
}
