import React, { useState } from "react";
import { useHoldings } from "./hooks/usePortfolio";
import { KpiCard } from "./components/SummaryCard";
import { SectorBlock } from "./components/SectorGroup";
import { PortfolioTable } from "./components/PortfolioTable";
import { Loader } from "./components/Loader";
import { FetchError } from "./components/ErrorBanner";
import { toRupees, asPercent, gainLossClass, badgeStyle } from "./utils/format";

export const App: React.FC = () => {
  const {
    data,
    loading,
    isRefreshing,
    error,
    lastFetchAt,
    refresh,
    dismissError
  } = useHoldings();

  const [activeTab, setActiveTab] = useState<"sectors" | "all">("sectors");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-black text-lg shadow">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Portfolio Dashboard
              </h1>
              <p className="text-xs text-slate-500">Live Indian Equities Tracker</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {lastFetchAt && (
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-400">Last updated</div>
                <div className="text-xs font-medium text-slate-600 font-mono">
                  {lastFetchAt.toLocaleTimeString()}
                </div>
              </div>
            )}

            <button
              onClick={() => refresh()}
              disabled={loading || isRefreshing}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition shadow-sm"
            >
              <svg
                className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? "Updating..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {error && <FetchError message={error} onDismiss={dismissError} />}

        {loading && !data && <Loader message="Fetching live prices and fundamentals..." />}

        {data && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                title="Total Investment"
                value={toRupees(data.totals.totalInvestment)}
                subtitle={`${data.totals.totalHoldings} stocks tracked`}
              />

              <KpiCard
                title="Present Value"
                value={toRupees(data.totals.totalPresentValue)}
                subtitle="Live market valuation"
              />

              <KpiCard
                title="Total Gain / Loss"
                value={toRupees(data.totals.totalGainLoss)}
                valueClassName={gainLossClass(data.totals.totalGainLoss)}
                badgeText={asPercent(data.totals.totalGainLossPercent)}
                badgeClassName={badgeStyle(data.totals.totalGainLoss)}
              />

              <KpiCard
                title="Market Status"
                value="Auto-refreshing"
                subtitle="Polling every 15 seconds"
                badgeText="Live"
                badgeClassName="bg-green-50 text-green-700 border-green-200"
              />
            </section>

            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("sectors")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === "sectors"
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  By Sector ({data.sectors.length})
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === "all"
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  All Holdings ({data.holdings.length})
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Prices update in background every 15s
              </div>
            </div>

            {activeTab === "sectors" ? (
              <section className="space-y-6">
                {data.sectors.map((sec) => (
                  <SectorBlock key={sec.sector} sector={sec} />
                ))}
              </section>
            ) : (
              <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <PortfolioTable holdings={data.holdings} />
              </section>
            )}
          </>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <p className="text-xs text-slate-500">
          Data from unofficial sources. For educational purposes only.
        </p>
      </footer>
    </div>
  );
};

export default App;
