import { isValidUrl } from "./validate_url.js";
import { scrapeUrl } from "./scrape.service.js";
export async function scrapeHandler(req, res, next) {
    try {
        const url = (req.body?.url || req.query?.url);
        if (!url || !isValidUrl(url)) {
            return res
                .status(400)
                .json({ error: "Invalid or missing 'url' (must be absolute http(s) URL)" });
        }
        const result = await scrapeUrl(url);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=scrape.controller.js.map