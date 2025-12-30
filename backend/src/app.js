import express from "express";
import cors from "cors";
import registerScrapeRoutes from "./scrape.routes.js";
import errorMiddleware from "./error.middleware.js";
export function createApp() {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors({
        origin: true,
    }));
    app.use(express.json({ limit: "1mb" }));
    registerScrapeRoutes(app);
    app.get("/health", (_, res) => res.json({ ok: true }));
    app.use(errorMiddleware);
    return app;
}
//# sourceMappingURL=app.js.map