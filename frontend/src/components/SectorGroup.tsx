import React from "react";
import { SectorTotals } from "../types";
import { PortfolioTable } from "./PortfolioTable";
import { toRupees, asPercent, gainLossClass, badgeStyle } from "../utils/format";

interface SectorBlockProps {
  sector: SectorTotals;
}

export const SectorBlock: React.FC<SectorBlockProps> = ({ sector }) => {
  const color = gainLossClass(sector.totalGainLoss);
  const badgeClass = badgeStyle(sector.totalGainLoss);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-base font-bold text-slate-800">{sector.sector}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-200 text-slate-700">
            {sector.holdings.length} {sector.holdings.length === 1 ? "Stock" : "Stocks"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium mr-1.5">Invested:</span>
            <span className="font-semibold text-slate-800">
              {toRupees(sector.totalInvestment)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase font-medium mr-1.5">Present Value:</span>
            <span className="font-semibold text-slate-800">
              {toRupees(sector.totalPresentValue)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 uppercase font-medium">Gain/Loss:</span>
            <span className={`font-bold ${color}`}>
              {toRupees(sector.totalGainLoss)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${badgeClass}`}>
              {asPercent(sector.totalGainLossPercent)}
            </span>
          </div>
        </div>
      </div>

      <PortfolioTable holdings={sector.holdings} />
    </div>
  );
};

export const SectorGroup = SectorBlock;
