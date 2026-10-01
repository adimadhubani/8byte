import axios from "axios";
import { priceCache } from "./cacheService";

const CACHE_TTL = 15;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchLivePrice(ticker: string): Promise<number | null> {
  const cacheKey = `cmp:${ticker}`;
  const cached = priceCache.get<number>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // direct chart endpoint, no crumb needed
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
    const res = await axios.get(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      timeout: 6000
    });

    const meta = res.data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose ?? null;

    if (typeof price === "number") {
      priceCache.set(cacheKey, price, CACHE_TTL);
      return price;
    }
    return null;
  } catch (err) {
    const msg = (err as Error).message;
    // silent fail, caller handles null
    if (!msg.includes("429")) {
      console.warn(`Yahoo price fail ${ticker}: ${msg}`);
    }
    return null;
  }
}

// jitter delay helper (agar currently use kar rahe ho)
export function jitter(ms = 200) {
  return new Promise((r) => setTimeout(r, Math.random() * ms));
}