/**
 * Komodo API client — thin HTTP wrapper over Komodo's RPC-style API.
 * All requests are POST /{module}/{RequestName} with JSON bodies.
 */

export interface KomodoClientConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export class KomodoClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: KomodoClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.headers = {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "x-api-secret": config.apiSecret,
    };
  }

  async read<T = unknown>(request: string, body: Record<string, unknown> = {}): Promise<T> {
    return this.rpc<T>("read", request, body);
  }

  async write<T = unknown>(request: string, body: Record<string, unknown> = {}): Promise<T> {
    return this.rpc<T>("write", request, body);
  }

  async execute<T = unknown>(request: string, body: Record<string, unknown> = {}): Promise<T> {
    return this.rpc<T>("execute", request, body);
  }

  private async rpc<T>(module: string, request: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/${module}/${request}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Komodo API error (${res.status} ${res.statusText}): ${text}`);
    }

    return res.json() as Promise<T>;
  }
}
