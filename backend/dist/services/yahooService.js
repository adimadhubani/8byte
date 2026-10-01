"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketData = void 0;
exports.fetchLivePrice = fetchLivePrice;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const cacheService_1 = require("./cacheService");
const logger_1 = require("../utils/logger");
const yf = new yahoo_finance2_1.default({ suppressNotices: ["yahooSurvey"] });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Yahoo se live price nikalta hai, fail ho toh null
async function fetchLivePrice(ticker) {
    const cacheKey = `cmp:${ticker}`;
    const cached = cacheService_1.priceCache.get(cacheKey);
    if (cached !== undefined) {
        return cached;
    }
    // jitter daal rahe hain taaki thundering herd na bane
    const jitterMs = Math.floor(Math.random() * 200) + 100;
    await delay(jitterMs);
    try {
        const quote = await yf.quote(ticker);
        const price = quote?.regularMarketPrice ?? null;
        if (price !== null && typeof price === "number") {
            // 15s TTL = UI refresh interval, isse rate limit nahi lagta
            cacheService_1.priceCache.set(cacheKey, price, 15);
            return price;
        }
        return null;
    }
    catch (err) {
        // yahoo kabhi kabhi 401 ya timeout deta hai, silent fallback
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.logger.warn(`Yahoo CMP fail (${ticker}): ${msg}`);
        return null;
    }
}
exports.marketData = {
    fetchLivePrice
};
