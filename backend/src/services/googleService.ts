import axios from "axios";
import * as cheerio from "cheerio";
import { priceCache } from "./cacheService";
import { logger } from "../utils/logger";
import { GoogleFinanceData } from "../types";

export async function scrapeFundamentals(
  ticker: string,
  exchange: "NSE" | "BSE" = "NSE"
): Promise<GoogleFinanceData> {
  const symbol = ticker.split(".")[0].toUpperCase();
  const cacheKey = `google:${symbol}:${exchange}`;

  const cached = priceCache.get<GoogleFinanceData>(cacheKey);
  if (cached) {
    return cached;
  }

  const fallback: GoogleFinanceData = {
    peRatio: null,
    latestEarnings: null
  };

  try {
    const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 7000
    });

    const $ = cheerio.load(res.data);
    let pe: number | null = null;
    let earnings: string | null = null;

    // hack: cheerio selector might break if google changes layout
    $("*").each((_, el) => {
      const label = $(el).clone().children().remove().end().text().trim();
      if (label === "P/E ratio") {
        const val = $(el).next().text().trim();
        if (val) {
          const num = parseFloat(val.replace(/,/g, ""));
          if (!isNaN(num)) pe = num;
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

    const result: GoogleFinanceData = {
      peRatio: pe,
      latestEarnings: earnings
    };

    // 5 min cache, fundamentals don't move every 15s
    priceCache.set(cacheKey, result, 300);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Google scrape failed for ${symbol}:${exchange} - ${msg}`);
    priceCache.set(cacheKey, fallback, 60);
    return fallback;
  }
}

export const fundamentalsScraper = {
  scrape: scrapeFundamentals
};
