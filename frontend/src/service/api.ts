import type { ScrapeResult } from "../types/scrape";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload) return undefined;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const candidate = p.error ?? p.message ?? p.error_description;
    if (typeof candidate === "string") return candidate;
  }
  return undefined;
}

export async function scrape(
  url: string,
  options?: { itemSelector?: string; nextSelector?: string; maxPages?: number },
  timeout = 300000
): Promise<ScrapeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const body = { url, ...(options || {}) };
    const res = await fetch(`${API_BASE}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      let payload: unknown;
      try {
        payload = await res.json();
      } catch {
        payload = await res.text();
      }
      const msg = extractErrorMessage(payload) || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }

    const data = await res.json();
    return data as ScrapeResult;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  } finally {
    clearTimeout(timer);
  }
}
