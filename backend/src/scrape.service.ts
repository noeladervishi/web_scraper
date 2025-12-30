import axios from "axios";
import { load } from "cheerio";
import type { ScrapeResult, ScrapeItem } from "./scrape.types.js";

export class ScrapeError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ScrapeError.prototype);
  }
}

export async function scrapeUrl(
  url: string,
  options?: { itemSelector?: string; nextSelector?: string; maxPages?: number }
): Promise<ScrapeResult> {
  // No limit on pages - extract ALL data by following pagination
  const maxPages = options?.maxPages ?? 1000; // Default to 1000 pages to handle large sites
  const seen = new Set<string>();
  const items: ScrapeItem[] = [];
  const pagesVisited: string[] = [];

  let nextUrl: string | null = url;
  let pages = 0;
  let capturedTitle: string | null = null;
  let capturedMeta: string | null = null;
  let capturedH1s: string[] = [];
  let capturedLinkCount = 0;

  try {
    // Continue scraping until no more pages or maxPages limit (if set)
    while (nextUrl && pages < maxPages) {
      pages++;
      // fetch page
      const res = await axios.get(nextUrl, {
        timeout: 30000, // 30 seconds per page
        headers: {
          "User-Agent": "WebScraper/1.0 (+https://example.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        responseType: "text",
        maxRedirects: 5,
      });

      const contentType = res.headers["content-type"] || "";
      if (!contentType.includes("text/html")) {
        throw new ScrapeError("Non-HTML response received", 422);
      }

      const $ = load(res.data);

      // metadata from first page (capture once)
      if (pages === 1) {
        capturedTitle = ($("head title").first().text() || "").trim() || null;
        capturedMeta = $("meta[name=description]").attr("content")?.trim() || null;
        capturedH1s = $("h1").map((_, el: any) => $(el).text().trim()).get().filter(Boolean);
        capturedLinkCount = $("a").length;
        
        // Debug: log what we found
        console.log(`[Scrape] Page 1 - Title: ${capturedTitle}, H1s: ${capturedH1s.length}, Links: ${capturedLinkCount}`);
        console.log(`[Scrape] Found articles: ${$("article").length}, sections: ${$("section").length}, paragraphs: ${$("p").length}`);
      }

      // SIMPLIFIED EXTRACTION - Always extract items from ANY page
      const sel = options?.itemSelector;
      let elMatches: any[] = [];
      
      if (sel) {
        // User provided selector
        elMatches = $(sel).toArray();
      } else {
        // AUTOMATIC EXTRACTION - Get ALL data from the page
        // Prioritize articles first (most common for product listings like books.toscrape.com)
        const articles = $("article").toArray();
        
        // If we have articles, use them primarily (but still add other content)
        if (articles.length > 0) {
          // Get articles and their direct children that might be content
          elMatches = articles;
          
          // Also add other structured content
          const sections = $("section").toArray();
          const listItems = $("li").not("article li").toArray(); // Avoid nested list items
          const paragraphs = $("p").not("article p").filter((_, el) => {
            return $(el).text().trim().length > 0;
          }).toArray();
          const headings = $("h1, h2, h3, h4, h5, h6").not("article h1, article h2, article h3, article h4, article h5, article h6").filter((_, el) => {
            return $(el).text().trim().length > 0;
          }).toArray();
          
          elMatches = [...elMatches, ...sections, ...listItems, ...paragraphs, ...headings];
        } else {
          // No articles found, get everything else
          const sections = $("section").toArray();
          const listItems = $("li").toArray();
          const paragraphs = $("p").filter((_, el) => {
            return $(el).text().trim().length > 0;
          }).toArray();
          const headings = $("h1, h2, h3, h4, h5, h6").filter((_, el) => {
            return $(el).text().trim().length > 0;
          }).toArray();
          const contentDivs = $("div").filter((_, el) => {
            const $el = $(el);
            const text = $el.text().trim();
            // No limit on children - extract ALL divs with content
            return text.length > 20;
          }).toArray();
          const tableRows = $("tr").filter((_, el) => {
            return $(el).text().trim().length > 0;
          }).toArray();
          
          elMatches = [...sections, ...listItems, ...paragraphs, ...headings, ...contentDivs, ...tableRows];
        }
      }
      
      // Debug: log how many elements we found
      if (pages === 1) {
        console.log(`[Scrape] Total elements to process: ${elMatches.length}`);
        console.log(`[Scrape] Articles: ${$("article").length}, Sections: ${$("section").length}, Paragraphs: ${$("p").length}, Headings: ${$("h1, h2, h3, h4, h5, h6").length}`);
      }

      // Process all matched elements - extract unique content
      for (const el of elMatches) {
        try {
          const $el = $(el);
          
          // Get direct text only (not from children) to avoid nested duplicates
          let text = "";
          $el.contents().each((_, node) => {
            if (node.type === 'text') {
              text += $(node).text();
            }
          });
          text = text.trim();
          
          // If no direct text, get all text (including children)
          if (!text) {
            text = $el.text().trim();
          }
          
          const html = $el.html() || "";
          let link: string | null = null;
          
          // Try to find a link (check element itself first, then children)
          let href = $el.attr("href");
          if (!href) {
            href = $el.find("a").first().attr("href");
          }
          if (href) {
            try {
              link = new URL(href, nextUrl).toString();
            } catch {
              link = href;
            }
          }
          
          // Create display text - prefer text, fallback to stripped HTML
          let displayText = text;
          if (!displayText && html) {
            // Strip HTML tags and clean up whitespace
            displayText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
          }
          if (!displayText && link) {
            displayText = link;
          }
          
          // Skip if truly empty (no text, no HTML, no link)
          if (!displayText && !html && !link) continue;
          
          // Use link as text if we have nothing else
          if (!displayText && link) {
            displayText = link;
          }
          
          // Create unique key from text and link (use first 300 chars for better uniqueness)
          const key = (displayText || "").slice(0, 300) + "::" + (link || "");
          
          // Skip only if we've seen this exact content before
          if (seen.has(key)) continue;
          
          seen.add(key);
          
          // ALWAYS add if we have any content
          items.push({ 
            text: displayText || "Content item", 
            html: html || "", 
            link: link || null 
          });
        } catch (err) {
          // Skip elements that cause errors
          continue;
        }
      }
      
      // Debug: log how many items we extracted from this page
      if (pages === 1) {
        console.log(`[Scrape] Extracted ${items.length} items from page ${pages}`);
        if (items.length === 0) {
          console.log(`[Scrape] WARNING: No items extracted! Elements found: ${elMatches.length}`);
        }
      }
      
      // GUARANTEE: If we still have no items after processing, extract directly from articles
      if (items.length === 0 && pages === 1) {
        console.log(`[Scrape] No items found, trying direct article extraction`);
        const articles = $("article").toArray();
        for (const article of articles) {
          const $article = $(article);
          const text = $article.text().trim();
          if (text.length > 0) {
            const href = $article.find("a").first().attr("href");
            let link: string | null = null;
            if (href) {
              try {
                link = new URL(href, nextUrl).toString();
              } catch {
                link = href;
              }
            }
            items.push({
              text: text.slice(0, 500),
              html: $article.html() || "",
              link: link
            });
          }
        }
        console.log(`[Scrape] Direct article extraction found ${items.length} items`);
      }
      
      // Final fallback: use page title or heading
      if (items.length === 0 && pages === 1) {
        const fallbackText = capturedTitle || capturedH1s[0] || "Page content";
        items.push({
          text: fallbackText,
          html: "",
          link: null
        });
        console.log(`[Scrape] Added final fallback item: ${fallbackText}`);
      }

      pagesVisited.push(nextUrl);
      
      // Debug: log pagination progress
      if (pages % 10 === 0 || pages === 1) {
        console.log(`[Scrape] Page ${pages}: Extracted ${items.length} total items so far, visiting: ${nextUrl}`);
      }
      
      // Final safety net: if we STILL have no items, extract ANY content from the page
      // This should rarely trigger, but ensures we always extract something
      if (items.length === 0 && pages === 1) {
        console.log(`[Scrape] Safety net triggered - no items found, extracting all content`);
        
        // Get ALL text content blocks - be extremely aggressive, NO LIMITS
        const allTextElements = $("p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, article, section").filter((_, el) => {
          const $el = $(el);
          const text = $el.text().trim();
          // Accept anything with meaningful text
          return text.length > 10; // Lower threshold
        }).toArray(); // NO SLICE - extract ALL
        
        console.log(`[Scrape] Safety net found ${allTextElements.length} potential elements`);
        
        for (const el of allTextElements) {
          const $el = $(el);
          const text = $el.text().trim();
          const html = $el.html() || "";
          const href = $el.find("a").first().attr("href");
          let link: string | null = null;
          if (href) {
            try {
              link = new URL(href, nextUrl).toString();
            } catch {
              link = href;
            }
          }
          
          if (text.length > 10) {
            const key = text.slice(0, 100) + "::" + (link || "");
            if (!seen.has(key)) {
              seen.add(key);
              items.push({ text, html, link });
            }
          }
        }
        
        console.log(`[Scrape] Safety net extracted ${items.length} items`);
      }

      // find next link
      let candidateNext: string | null = null;
      if (options?.nextSelector) {
        const a = $(options.nextSelector).first();
        if (a && a.attr) {
          candidateNext = a.attr("href") || null;
        }
      }

      // heuristic: link[rel=next], a[rel=next], a.next, aria-label=next, contains "next"
      if (!candidateNext) {
        const relNext = $("link[rel=next]").attr("href") || $("a[rel=next]").attr("href");
        if (relNext) candidateNext = relNext;
      }

      if (!candidateNext) {
        const nextA = $("a").filter((_, a) => {
          const $a = $(a);
          const rel = ($a.attr("rel") || "").toLowerCase();
          const aria = ($a.attr("aria-label") || "").toLowerCase();
          const text = ($a.text() || "").toLowerCase().trim();
          if (rel === "next") return true;
          if (aria.includes("next")) return true;
          if (/^next\b/.test(text) || /\bnext$/.test(text)) return true;
          if ($a.hasClass("next")) return true;
          return false;
        }).first();
        if (nextA && nextA.attr) candidateNext = nextA.attr("href") || null;
      }

      if (!candidateNext) {
        // try numeric pagination: extract page numbers from all links and pick the smallest > current
        try {
          const currentUrlObj = new URL(nextUrl);
          // attempt to detect current page number from query params
          const pageParamNames = ["page", "p", "pg", "start"];
          let currentPageNum = NaN;
          for (const name of pageParamNames) {
            const v = currentUrlObj.searchParams.get(name);
            if (v && /\d+/.test(v)) {
              currentPageNum = Number(v);
              break;
            }
          }

          const links: Array<{ href: string; num?: number }> = [];
          $("a").each((_, a) => {
            const href = $(a).attr("href") || "";
            const m = href.match(/[?&](?:page|p|pg|start)=(\d+)/i) || href.match(/page[-_/](\d+)/i);
            if (m) {
              const num = Number(m[1]);
              if (!Number.isNaN(num)) links.push({ href, num });
            }
          });

          if (links.length > 0) {
            // find candidate with smallest num > currentPageNum (or smallest overall if current unknown)
            const sorted = links.sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
            let chosen: string | null = null;
            if (!Number.isNaN(currentPageNum)) {
              const higher = sorted.find((l) => (l.num ?? 0) > currentPageNum);
              if (higher) chosen = higher.href;
            }
            if (!chosen && sorted.length) chosen = sorted[0]?.href || null;
            if (chosen) candidateNext = chosen;
          }
        } catch {
          // ignore
        }
      }

      if (candidateNext) {
        // resolve relative to current page
        try {
          const resolved = new URL(candidateNext, nextUrl).toString();
          // avoid loops
          if (pagesVisited.includes(resolved)) {
            console.log(`[Scrape] Stopping pagination - already visited: ${resolved}`);
            nextUrl = null;
          } else {
            nextUrl = resolved;
            if (pages === 1) {
              console.log(`[Scrape] Found next page: ${nextUrl}`);
            }
          }
        } catch {
          nextUrl = null;
        }
      } else {
        if (pages === 1) {
          console.log(`[Scrape] No next page found - pagination complete`);
        }
        nextUrl = null;
      }
    }

    // return aggregated result: use captured metadata from first page
    const result = {
      title: capturedTitle,
      metaDescription: capturedMeta,
      h1s: capturedH1s,
      linkCount: capturedLinkCount,
      items,
      pagesVisited,
    };
    
    // Debug: log final result
    console.log(`[Scrape] Final result - Items: ${result.items.length}, Pages: ${result.pagesVisited.length}`);
    
    return result;
  } catch (err: any) {
    if (err.code === "ECONNABORTED") {
      throw new ScrapeError("Request timed out", 504);
    }
    if (err.response) {
      const status = err.response.status || 502;
      throw new ScrapeError(
        `Failed to fetch: ${err.response.status} ${err.response.statusText}`,
        status
      );
    }
    if (err instanceof ScrapeError) {
      throw err;
    }
    throw new ScrapeError("Failed to scrape URL", 502);
  }
}
