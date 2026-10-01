export interface Holding {
  id: string;
  name: string;
  ticker: string;
  exchange: "NSE" | "BSE";
  sector: string;
  purchasePrice: number;
  quantity: number;
}

export interface HoldingRow extends Holding {
  investment: number;
  weightPct: number;
  portfolioPercent?: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  error?: string | null;
}

// backwards alias
export type EnrichedHolding = HoldingRow;

export interface SectorTotals {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: HoldingRow[];
}

export type SectorSummary = SectorTotals;

export interface PortfolioTotals {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  totalHoldings: number;
  lastUpdated: string;
  lastFetchAt?: string;
}

export interface PortfolioResponse {
  holdings: HoldingRow[];
  sectors: SectorTotals[];
  totals: PortfolioTotals;
}
