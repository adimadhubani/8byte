import { Router, Request, Response } from "express";
import { portfolioHoldings } from "../data/portfolioData";
import { fetchLivePrice } from "../services/yahooService";
import { scrapeFundamentals } from "../services/googleService";
import { logger } from "../utils/logger";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    count: portfolioHoldings.length,
    stocks: portfolioHoldings
  });
});

router.get("/:ticker", async (req: Request, res: Response) => {
  const raw = req.params.ticker;
  const ticker = Array.isArray(raw) ? raw[0] : raw;

  if (!ticker) {
    res.status(400).json({ error: "ticker parameter missing" });
    return;
  }

  try {
    const match = portfolioHoldings.find(
      (h) => h.ticker.toLowerCase() === ticker.toLowerCase()
    );
    const exchange = match ? match.exchange : "NSE";

    const [priceSettled, fundSettled] = await Promise.allSettled([
      fetchLivePrice(ticker),
      scrapeFundamentals(ticker, exchange)
    ]);

    const cmp = priceSettled.status === "fulfilled" ? priceSettled.value : null;
    const fund =
      fundSettled.status === "fulfilled"
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "failed to load ticker";
    logger.error(`Error in /api/stocks/${ticker}: ${msg}`);
    res.status(500).json({ error: msg });
  }
});

export default router;
