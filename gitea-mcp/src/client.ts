/**
 * Gitea API client — thin HTTP wrapper over Gitea's REST API v1.
 * Base path: /api/v1
 */

export interface GiteaClientConfig {
  baseUrl: string;
  token: string;
}

export class GiteaClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: GiteaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "") + "/api/v1";
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `token ${config.token}`,
    };
  }

  async get<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, query);
    return this.request<T>("GET", url);
  }

  async post<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("POST", this.buildUrl(path), body);
  }

  async put<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("PUT", this.buildUrl(path), body);
  }

  async patch<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("PATCH", this.buildUrl(path), body);
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>("DELETE", this.buildUrl(path));
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

  private async request<T>(method: string, url: string, body?: Record<string, unknown>): Promise<T> {
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gitea API error (${res.status} ${res.statusText}): ${text}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json() as Promise<T>;
    }

    // Some DELETE endpoints return 204 No Content
    if (res.status === 204) {
      return { success: true } as T;
    }

    const text = await res.text();
    return text as T;
  }
}
