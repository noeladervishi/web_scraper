export default function errorMiddleware(err, req, res, next) {
    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    // log minimal error server-side
    if (status >= 500) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
    res.status(status).json({ error: message });
}
//# sourceMappingURL=error.middleware.js.map