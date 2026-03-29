/**
 * Traefik API client — thin HTTP wrapper over Traefik's read-only API.
 * Base path: /api
 */

export interface TraefikClientConfig {
  baseUrl: string;
  username?: string;
  password?: string;
}

export class TraefikClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: TraefikClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "") + "/api";
    this.headers = {
      Accept: "application/json",
    };

    if (config.username && config.password) {
      const encoded = Buffer.from(`${config.username}:${config.password}`).toString("base64");
      this.headers["Authorization"] = `Basic ${encoded}`;
    }
  }

  async get<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, query);
    const res = await fetch(url, { headers: this.headers });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Traefik API error (${res.status} ${res.statusText}): ${text}`);
    }

    return res.json() as Promise<T>;
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
}
