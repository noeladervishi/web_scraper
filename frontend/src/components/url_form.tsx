"use client";
import { useState } from "react";
import { isValidUrl } from "../utils/is_val_url";
import { scrape } from "../service/api";
import type { ScrapeResult } from "../types/scrape";

export default function UrlForm({ onResult, onLoading, onError }: { onResult: (r: ScrapeResult | null) => void; onLoading?: (isLoading: boolean) => void; onError?: (message: string | null) => void }) {
  const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError?.(null);
    onResult(null);
    if (!isValidUrl(url)) {
      const msg = "Please enter a valid absolute http(s) URL.";
      onError?.(msg);
      return;
    }

    try {
      setLoading(true);
      onLoading?.(true);
      // Automatically extract everything - no selectors needed
      const res = await scrape(url);
      onResult(res);
      onError?.(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message || "Failed to scrape URL." : String(err) || "Failed to scrape URL.";
      onError?.(msg);
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          aria-label="URL"
        />
        <button className="btn px-4 py-2 disabled:opacity-60 w-full sm:w-auto" disabled={loading}>
          {loading ? "Scraping…" : "Scrape"}
        </button>
      </div>

      </form>
  );
}
