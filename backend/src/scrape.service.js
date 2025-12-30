import axios from "axios";
import { load } from "cheerio";
export class ScrapeError extends Error {
    status;
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, ScrapeError.prototype);
    }
}
export async function scrapeUrl(url) {
    try {
        const res = await axios.get(url, {
            timeout: 8000,
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
        const title = ($("head title").first().text() || "").trim() || null;
        const metaDescription = $("meta[name=description]").attr("content")?.trim() || null;
        const h1s = $("h1")
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(Boolean);
        const linkCount = $("a").length;
        return { title, metaDescription, h1s, linkCount };
    }
    catch (err) {
        if (err.code === "ECONNABORTED") {
            throw new ScrapeError("Request timed out", 504);
        }
        if (err.response) {
            const status = err.response.status || 502;
            throw new ScrapeError(`Failed to fetch: ${err.response.status} ${err.response.statusText}`, status);
        }
        if (err instanceof ScrapeError) {
            throw err;
        }
        throw new ScrapeError("Failed to scrape URL", 502);
    }
}
//# sourceMappingURL=scrape.service.js.map