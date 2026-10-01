"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioData_1 = require("../data/portfolioData");
const yahooService_1 = require("../services/yahooService");
const googleService_1 = require("../services/googleService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        count: portfolioData_1.portfolioHoldings.length,
        stocks: portfolioData_1.portfolioHoldings
    });
});
router.get("/:ticker", async (req, res) => {
    const raw = req.params.ticker;
    const ticker = Array.isArray(raw) ? raw[0] : raw;
    if (!ticker) {
        res.status(400).json({ error: "ticker parameter missing" });
        return;
    }
    try {
        const match = portfolioData_1.portfolioHoldings.find((h) => h.ticker.toLowerCase() === ticker.toLowerCase());
        const exchange = match ? match.exchange : "NSE";
        const [priceSettled, fundSettled] = await Promise.allSettled([
            (0, yahooService_1.fetchLivePrice)(ticker),
            (0, googleService_1.scrapeFundamentals)(ticker, exchange)
        ]);
        const cmp = priceSettled.status === "fulfilled" ? priceSettled.value : null;
        const fund = fundSettled.status === "fulfilled"
            ? fundSettled.value
            : { peRatio: null, latestEarnings: null };
        res.json({
            ticker,
            exchange,
            cmp,
            peRatio: fund.peRatio,
            latestEarnings: fund.latestEarnings,
            lastFetchAt: new Date().toISOString()
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "failed to load ticker";
        logger_1.logger.error(`Error in /api/stocks/${ticker}: ${msg}`);
        res.status(500).json({ error: msg });
    }
});
exports.default = router;
