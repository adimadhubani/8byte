"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const stocks_1 = __importDefault(require("./routes/stocks"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.env.HOST || "127.0.0.1";
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"]
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "portfolio-dashboard-backend",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});
app.use("/api/portfolio", portfolio_1.default);
app.use("/api/stocks", stocks_1.default);
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// global catch-all
app.use((err, _req, res, _next) => {
    logger_1.logger.error("Unhandled error: " + err.message);
    res.status(500).json({
        error: err.message || "Something went wrong on the server"
    });
});
const server = app.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
    logger_1.logger.info(`Portfolio Backend running on http://${HOST}:${PORT}`);
});
// airplay conflict macOS pe standard headache hai
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger_1.logger.error(`Port ${PORT} already taken. If on Mac, turn off AirPlay receiver or pass PORT=5001`);
        process.exit(1);
    }
    else {
        logger_1.logger.error("Server crash: " + err.message);
    }
});
exports.default = app;
