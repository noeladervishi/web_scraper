import type { Express } from "express";
import { scrapeHandler } from "./scrape.controller.js";

export default function registerScrapeRoutes(app: Express) {
  app.post("/api/scrape", scrapeHandler);
  // convenience GET for quick testing
  app.get("/api/scrape", scrapeHandler);
}
