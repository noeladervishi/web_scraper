"use client";
import React from "react";
import type { ScrapeResult } from "../types/scrape";

function downloadFile(content: string, filename: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(result: ScrapeResult) {
  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSV = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows: string[][] = [];
  
  // Header row for scraped items (text and link only, no HTML)
  rows.push(["text", "link"]);
  
  // Add each scraped item as a row
  const items = result?.items ?? [];
  if (items.length > 0) {
    items.forEach((item) => {
      rows.push([
        escapeCSV(item.text),
        escapeCSV(item.link ?? ""),
      ]);
    });
  } else {
    // If no items, add a placeholder row
    rows.push(["No items extracted", ""]);
  }
  
  return rows.map((r) => r.join(",")).join("\n");
}

export default function ResultCard({ result }: { result: ScrapeResult }) {
  // defensive defaults in case backend returns partial result
  const h1s = result?.h1s ?? [];
  const items = result?.items ?? [];

  const handleDownloadJSON = () => {
    const filename = `scrape-result-${new Date().toISOString()}.json`;
    downloadFile(JSON.stringify(result, null, 2), filename, "application/json");
  };

  const handleDownloadCSV = () => {
    const filename = `scrape-result-${new Date().toISOString()}.csv`;
    downloadFile(toCSV(result), filename, "text/csv");
  };

  return (
    <div className="p-4">
      <div className="mb-2 flex justify-between items-start gap-4">
        <div>
          <div className="text-sm text-muted">Title</div>
          <div className="text-lg font-medium">{result.title ?? <span className="text-muted-weak">—</span>}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadJSON} className="btn px-3 py-1 text-sm">Download JSON</button>
          <button onClick={handleDownloadCSV} className="btn-ghost px-3 py-1 text-sm">Download CSV</button>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-sm text-muted">Meta Description</div>
        <div className="text-base">{result.metaDescription ?? <span className="text-muted-weak">—</span>}</div>
      </div>

      <div className="mb-2">
        <div className="text-sm text-muted">H1s</div>
        {h1s.length ? (
          <ul className="list-disc pl-5">
            {h1s.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-weak">None found</div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted">Extracted items</div>
        {items.length ? (
          <div className="max-h-64 overflow-auto rounded border p-1" style={{ background: "var(--card-bg)" }}>
            <ul className="divide-y" role="list">
              {items.slice(0, 50).map((it, i) => {
                const fullText = it.text || "";
                const displayText = fullText.length > 240 ? `${fullText.slice(0, 240)}…` : fullText || "—";
                return (
                  <li key={i} className="py-2 px-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="text-sm leading-snug" title={fullText}>{displayText}</div>
                    {it.link ? (
                      <a href={it.link} target="_blank" rel="noopener noreferrer" className="text-xs text-link truncate block sm:max-w-[40%]" title={it.link}>
                        {it.link}
                      </a>
                    ) : (
                      <div className="text-xs text-muted-weak">No link</div>
                    )}
                  </li>
                );
              })}
            </ul>
            {items.length > 50 && (
              <div className="text-xs text-muted mt-2 px-2">Showing first 50 of {items.length} items</div>
            )}
          </div>
        ) : (
          <div className="text-muted-weak">No items extracted</div>
        )}
      </div>

      <div>
        <div className="text-sm text-muted">Link Count</div>
        <div className="text-base font-medium">{result.linkCount}</div>
      </div>
    </div>
  );
}
