export class AppError extends Error {
    status;
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
//# sourceMappingURL=error_handler.js.map