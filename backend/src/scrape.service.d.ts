import type { ScrapeResult } from "./scrape.types.js";
export declare class ScrapeError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
export declare function scrapeUrl(url: string): Promise<ScrapeResult>;
//# sourceMappingURL=scrape.service.d.ts.map