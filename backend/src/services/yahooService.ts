import YahooFinance from "yahoo-finance2";
import { priceCache } from "./cacheService";
import { logger } from "../utils/logger";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Yahoo se live price nikalta hai, fail ho toh null
export async function fetchLivePrice(ticker: string): Promise<number | null> {
  const cacheKey = `cmp:${ticker}`;
  const cached = priceCache.get<number>(cacheKey);

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
      priceCache.set(cacheKey, price, 15);
      return price;
    }

    return null;
  } catch (err: unknown) {
    // yahoo kabhi kabhi 401 ya timeout deta hai, silent fallback
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Yahoo CMP fail (${ticker}): ${msg}`);
    return null;
  }
}

export const marketData = {
  fetchLivePrice
};
