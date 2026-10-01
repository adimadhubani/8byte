import { Router, Request, Response } from "express";
import { portfolioHoldings } from "../data/portfolioData";
import { fetchLivePrice } from "../services/yahooService";
import { scrapeFundamentals } from "../services/googleService";
import { Holding, HoldingRow, SectorTotals, PortfolioResponse } from "../types";
import { logger } from "../utils/logger";

const router = Router();

// single stock enrich helper
async function attachMarketData(holding: Holding, totalCostBasis: number): Promise<HoldingRow> {
  const investment = holding.purchasePrice * holding.quantity;
  const weightPct = totalCostBasis > 0 ? Number(((investment / totalCostBasis) * 100).toFixed(2)) : 0;

  let cmp: number | null = null;
  let peRatio: number | null = null;
  let latestEarnings: string | null = null;
  let errorMsg: string | null = null;

  try {
    // allSettled not all, warna ek stock fail hote hi pura response reject ho jata
    const [priceResult, fundResult] = await Promise.allSettled([
      fetchLivePrice(holding.ticker),
      scrapeFundamentals(holding.ticker, holding.exchange)
    ]);

    if (priceResult.status === "fulfilled") {
      cmp = priceResult.value;
    } else {
      errorMsg = "CMP fetch failed";
    }

    if (fundResult.status === "fulfilled") {
      peRatio = fundResult.value.peRatio;
      latestEarnings = fundResult.value.latestEarnings;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "enrichment error";
    logger.error(`Error enriching ${holding.ticker}: ${msg}`);
    errorMsg = msg;
  }

  const { presentValue, gainLoss, gainLossPercent } = computeGainLoss(holding.quantity, investment, cmp);

  return {
    ...holding,
    investment,
    weightPct,
    portfolioPercent: weightPct,
    cmp,
    presentValue,
    gainLoss,
    gainLossPercent,
    peRatio,
    latestEarnings,
    error: errorMsg
  };
}

const computeGainLoss = (qty: number, cost: number, currentPrice: number | null) => {
  if (currentPrice === null) {
    return { presentValue: null, gainLoss: null, gainLossPercent: null };
  }
  const presentValue = Number((currentPrice * qty).toFixed(2));
  const gainLoss = Number((presentValue - cost).toFixed(2));
  const gainLossPercent = cost > 0 ? Number(((gainLoss / cost) * 100).toFixed(2)) : 0;
  return { presentValue, gainLoss, gainLossPercent };
};

// aggregates rows into response format
function shapeResponse(holdingsWithPrices: HoldingRow[], totalCost: number): PortfolioResponse {
  const sectorMap = new Map<string, HoldingRow[]>();
  for (const row of holdingsWithPrices) {
    const group = sectorMap.get(row.sector) || [];
    group.push(row);
    sectorMap.set(row.sector, group);
  }

  // sector wise bucket bana rahe hain
  const sectorBreakdown: SectorTotals[] = [];
  sectorMap.forEach((sectorRows, sectorName) => {
    const sectorInvestment = sectorRows.reduce((sum, h) => sum + h.investment, 0);
    const sectorPresentValue = sectorRows.reduce((sum, h) => {
      return sum + (h.presentValue !== null ? h.presentValue : h.investment);
    }, 0);

    const diff = Number((sectorPresentValue - sectorInvestment).toFixed(2));
    const diffPct = sectorInvestment > 0 ? Number(((diff / sectorInvestment) * 100).toFixed(2)) : 0;

    sectorBreakdown.push({
      sector: sectorName,
      totalInvestment: Number(sectorInvestment.toFixed(2)),
      totalPresentValue: Number(sectorPresentValue.toFixed(2)),
      totalGainLoss: diff,
      totalGainLossPercent: diffPct,
      holdings: sectorRows
    });
  });

  const totalPresentValue = holdingsWithPrices.reduce((sum, h) => {
    return sum + (h.presentValue !== null ? h.presentValue : h.investment);
  }, 0);

  const totalDiff = Number((totalPresentValue - totalCost).toFixed(2));
  const totalDiffPct = totalCost > 0 ? Number(((totalDiff / totalCost) * 100).toFixed(2)) : 0;
  const now = new Date().toISOString();

  return {
    holdings: holdingsWithPrices,
    sectors: sectorBreakdown,
    totals: {
      totalInvestment: Number(totalCost.toFixed(2)),
      totalPresentValue: Number(totalPresentValue.toFixed(2)),
      totalGainLoss: totalDiff,
      totalGainLossPercent: totalDiffPct,
      totalHoldings: holdingsWithPrices.length,
      lastUpdated: now,
      lastFetchAt: now
    }
  };
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    // weight nikalne ke liye pehle total base investment chahiye
    const totalCostBasis = portfolioHoldings.reduce(
      (sum, h) => sum + h.purchasePrice * h.quantity,
      0
    );

    // this should be fine, but revisit if rate limit becomes an issue
    const promises = portfolioHoldings.map((h) => attachMarketData(h, totalCostBasis));
    const holdingsWithPrices = await Promise.all(promises);

    const response = shapeResponse(holdingsWithPrices, totalCostBasis);
    res.json(response);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "portfolio calculation failed";
    logger.error("Failed to build portfolio: " + msg);
    res.status(500).json({ error: msg });
  }
});

export default router;
