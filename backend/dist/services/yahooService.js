"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLivePrice = fetchLivePrice;
exports.jitter = jitter;
const axios_1 = __importDefault(require("axios"));
const cacheService_1 = require("./cacheService");
const CACHE_TTL = 15;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
async function fetchLivePrice(ticker) {
    const cacheKey = `cmp:${ticker}`;
    const cached = cacheService_1.priceCache.get(cacheKey);
    if (cached !== undefined)
        return cached;
    try {
        // direct chart endpoint, no crumb needed
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
        const res = await axios_1.default.get(url, {
            headers: { "User-Agent": UA, Accept: "application/json" },
            timeout: 6000
        });
        const meta = res.data?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice ?? meta?.previousClose ?? null;
        if (typeof price === "number") {
            cacheService_1.priceCache.set(cacheKey, price, CACHE_TTL);
            return price;
        }
        return null;
    }
    catch (err) {
        const msg = err.message;
        // silent fail, caller handles null
        if (!msg.includes("429")) {
            console.warn(`Yahoo price fail ${ticker}: ${msg}`);
        }
        return null;
    }
}
// jitter delay helper (agar currently use kar rahe ho)
function jitter(ms = 200) {
    return new Promise((r) => setTimeout(r, Math.random() * ms));
}
