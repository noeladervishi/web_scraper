import { scrapeHandler } from "./scrape.controller.js";
export default function registerScrapeRoutes(app) {
    app.post("/api/scrape", scrapeHandler);
    // convenience GET for quick testing
    app.get("/api/scrape", scrapeHandler);
}
//# sourceMappingURL=scrape.routes.js.map