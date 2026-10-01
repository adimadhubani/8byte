import { useState, useEffect, useCallback, useRef } from "react";
import { PortfolioResponse } from "../types";
import { pullPortfolio } from "../services/api";

const POLL_TIME = 15000; // 15s auto-refresh

interface HoldingsHookState {
  data: PortfolioResponse | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchAt: Date | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  dismissError: () => void;
}

export function useHoldings(): HoldingsHookState {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<Date | null>(null);

  // user fast refresh kare toh purana pending request cancel karo
  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (firstRun = false) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (firstRun) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await pullPortfolio(ctrl.signal);
      setData(res);
      setLastFetchAt(new Date());
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "CanceledError") {
        return;
      }
      const msg = err instanceof Error ? err.message : "portfolio load nahi ho paya";
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const timer = setInterval(() => {
      loadData(false);
    }, POLL_TIME);

    return () => {
      clearInterval(timer);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    isRefreshing,
    error,
    lastFetchAt,
    lastUpdated: lastFetchAt,
    refresh,
    dismissError
  };
}

export const usePortfolio = useHoldings;
