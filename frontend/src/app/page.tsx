"use client";
import { useState } from "react";
import UrlForm from "../components/url_form";
import ResultCard from "../components/result_card";
import LoadingSpinner from "../components/loading_spinner";
import ErrorMessage from "../components/error_message";
import ThemeToggle from "../components/theme_toggle";
import type { ScrapeResult } from "../types/scrape";

export default function Home() {
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full">
      <div className="container py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 sm:gap-10">
          {/* Header + URL Scraper (title + theme + form + helper text) */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-3 items-center">
              <div />
              <h1 className="text-center text-3xl sm:text-4xl font-semibold text-gradient page-title">URL Scraper</h1>
              <div className="justify-self-end">
                <ThemeToggle />
              </div>
            </div>
            <UrlForm onResult={(r) => setResult(r)} onLoading={setLoading} onError={setError} />
            <div className="text-sm text-muted">Enter a URL and click Scrape.</div>
            {loading && (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" /> <span className="text-muted">Working…</span>
              </div>
            )}
            {error && <ErrorMessage message={error} />}
          </section>

          {/* Results */}
          <div className="w-full">
            {result ? (
              <ResultCard result={result} />
            ) : (
              <div className="text-sm text-muted">No results yet. Submit a URL to see results here.</div>
            )}
          </div>

          {/* How it works */}
          <section className="w-full">
            <h2 className="h4 font-semibold mb-2 text-gradient">How this works</h2>
            <div className="text-sm text-muted leading-relaxed">
              <p>
                Enter a public URL and click Scrape. The backend fetches the page and parses the HTML server-side using Cheerio.
                It extracts the page title, meta description, H1 headings, a link count, and a list of text/link items from anchors and other elements.
                Your input is validated locally and never stored.
              </p>
              <p>
                Results appear above. You can download the data as JSON or CSV. If a site blocks bots or requires authentication,
                the request may fail, and an error message will be displayed.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full text-center text-xs text-muted-weak pt-2">Copyrights 2025 ©</footer>
        </div>
      </div>
    </div>
  );
}
