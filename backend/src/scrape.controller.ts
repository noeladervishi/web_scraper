import type { Request, Response, NextFunction } from "express";
import { isValidUrl } from "./validate_url.js";
import { scrapeUrl } from "./scrape.service.js";

export async function scrapeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const url = (req.body?.url || req.query?.url) as string | undefined;
    const itemSelector = (req.body?.itemSelector || req.query?.itemSelector) as string | undefined;
    const nextSelector = (req.body?.nextSelector || req.query?.nextSelector) as string | undefined;
    const maxPages = req.body?.maxPages ? Number(req.body.maxPages) : undefined;

    if (!url || !isValidUrl(url)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'url' (must be absolute http(s) URL)" });
    }

    const opts: { itemSelector?: string; nextSelector?: string; maxPages?: number } = {};
    if (itemSelector) opts.itemSelector = itemSelector;
    if (nextSelector) opts.nextSelector = nextSelector;
    if (typeof maxPages === "number" && !Number.isNaN(maxPages)) opts.maxPages = maxPages;

    const result = await scrapeUrl(url, opts);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
