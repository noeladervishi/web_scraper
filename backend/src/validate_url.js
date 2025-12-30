export function isValidUrl(url) {
    try {
        const u = new URL(String(url));
        return u.protocol === "http:" || u.protocol === "https:";
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=validate_url.js.map