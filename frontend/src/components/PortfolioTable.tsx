import React from "react";
import { HoldingRow } from "../types";
import { toRupees, asPercent, gainLossClass } from "../utils/format";

interface TableProps {
  holdings: HoldingRow[];
}

export const PortfolioTable: React.FC<TableProps> = ({ holdings }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-4 py-3">Particulars</th>
            <th scope="col" className="px-3 py-3 text-center">Exchange</th>
            <th scope="col" className="px-3 py-3 text-right">Qty</th>
            <th scope="col" className="px-4 py-3 text-right">Purchase Price</th>
            <th scope="col" className="px-4 py-3 text-right">Investment</th>
            <th scope="col" className="px-3 py-3 text-right">Portfolio %</th>
            <th scope="col" className="px-4 py-3 text-right">CMP</th>
            <th scope="col" className="px-4 py-3 text-right">Present Value</th>
            <th scope="col" className="px-4 py-3 text-right">Gain / Loss</th>
            <th scope="col" className="px-3 py-3 text-right">P/E</th>
            <th scope="col" className="px-4 py-3 text-center">Latest Earnings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {holdings.map((h) => {
            const color = gainLossClass(h.gainLoss);
            const weight = h.weightPct ?? h.portfolioPercent ?? 0;

            return (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{h.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{h.ticker}</div>
                </td>

                <td className="px-3 py-3.5 whitespace-nowrap text-center">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
                    {h.exchange}
                  </span>
                </td>

                <td className="px-3 py-3.5 whitespace-nowrap text-right font-medium text-slate-800">
                  {h.quantity}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-right text-slate-700">
                  {toRupees(h.purchasePrice)}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-right font-medium text-slate-900">
                  {toRupees(h.investment)}
                </td>

                <td className="px-3 py-3.5 whitespace-nowrap text-right text-slate-600">
                  {weight.toFixed(2)}%
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-right font-semibold text-slate-900">
                  {h.cmp !== null ? toRupees(h.cmp) : "—"}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-right font-semibold text-slate-900">
                  {toRupees(h.presentValue)}
                </td>

                <td className={`px-4 py-3.5 whitespace-nowrap text-right font-semibold ${color}`}>
                  {h.gainLoss !== null ? (
                    <div>
                      <div>{toRupees(h.gainLoss)}</div>
                      <div className="text-xs font-normal">
                        ({asPercent(h.gainLossPercent)})
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="px-3 py-3.5 whitespace-nowrap text-right text-slate-700">
                  {h.peRatio !== null ? h.peRatio.toFixed(2) : "—"}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-center text-xs text-slate-600">
                  {h.latestEarnings || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
