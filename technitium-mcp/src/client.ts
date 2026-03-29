/**
 * Technitium DNS Server API client.
 * Auth: token query parameter on every request.
 * Base path: /api
 * Accepts GET (query params) and POST (application/x-www-form-urlencoded).
 */

export interface TechnitiumClientConfig {
  baseUrl: string;
  token: string;
}

export class TechnitiumClient {
  private baseUrl: string;
  private token: string;

  constructor(config: TechnitiumClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
  }

  /** GET request with query parameters */
  async get<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url);
  }

  /** POST request with form-urlencoded body */
  async post<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path);
    const body = new URLSearchParams();
    body.set("token", this.token);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          body.set(key, String(value));
        }
      }
    }
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}/api${path}`);
    url.searchParams.set("token", this.token);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Technitium API error (${res.status} ${res.statusText}): ${text}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const json = await res.json() as { status: string; errorMessage?: string; [key: string]: unknown };
      if (json.status === "error") {
        throw new Error(`Technitium API error: ${json.errorMessage ?? "Unknown error"}`);
      }
      if (json.status === "invalid-token") {
        throw new Error("Technitium API error: Invalid or expired token");
      }
      return json as T;
    }

    const text = await res.text();
    return text as T;
  }
}
