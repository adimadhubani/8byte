"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundamentalsScraper = void 0;
exports.scrapeFundamentals = scrapeFundamentals;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const cacheService_1 = require("./cacheService");
const logger_1 = require("../utils/logger");
async function scrapeFundamentals(ticker, exchange = "NSE") {
    const symbol = ticker.split(".")[0].toUpperCase();
    const cacheKey = `google:${symbol}:${exchange}`;
    const cached = cacheService_1.priceCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    const fallback = {
        peRatio: null,
        latestEarnings: null
    };
    try {
        const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
        const res = await axios_1.default.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            },
            timeout: 7000
        });
        const $ = cheerio.load(res.data);
        let pe = null;
        let earnings = null;
        // hack: cheerio selector might break if google changes layout
        $("*").each((_, el) => {
            const label = $(el).clone().children().remove().end().text().trim();
            if (label === "P/E ratio") {
                const val = $(el).next().text().trim();
                if (val) {
                    const num = parseFloat(val.replace(/,/g, ""));
                    if (!isNaN(num))
                        pe = num;
                }
            }
        });
        $("*").each((_, el) => {
            const text = $(el).clone().children().remove().end().text().trim();
            if (!earnings && /Fiscal\s+Q[1-4]\s+\d{4}\s+earnings\s+call/i.test(text)) {
                earnings = text.replace(/earnings\s+call/i, "").trim();
            }
        });
        // backup search agar standard pattern na mile
        if (!earnings) {
            $("*").each((_, el) => {
                const text = $(el).clone().children().remove().end().text().trim();
                if (!earnings && /Q[1-4]\s+(FY)?\d{2,4}/i.test(text)) {
                    earnings = text;
                }
            });
        }
        const result = {
            peRatio: pe,
            latestEarnings: earnings
        };
        // 5 min cache, fundamentals don't move every 15s
        cacheService_1.priceCache.set(cacheKey, result, 300);
        return result;
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.logger.warn(`Google scrape failed for ${symbol}:${exchange} - ${msg}`);
        cacheService_1.priceCache.set(cacheKey, fallback, 60);
        return fallback;
    }
}
exports.fundamentalsScraper = {
    scrape: scrapeFundamentals
};
