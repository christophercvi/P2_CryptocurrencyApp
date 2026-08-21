/* Design direction: Shared, low-churn market state for a stable data-first dashboard. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { fetchGlobalMarket, fetchMarkets, fetchTrending } from '@/services/marketApi';
import type { CoinMarket, GlobalMarketData, MarketApiError, TrendingCoin } from '@/types';

type MarketDataContextValue = {
  markets: CoinMarket[];
  global: GlobalMarketData['data'] | null;
  trending: TrendingCoin[];
  loading: boolean;
  error: MarketApiError | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
};

const MarketDataContext = createContext<MarketDataContextValue | null>(null);
const CACHE_KEY = 'cryptocurrency-app-market-cache';
const CACHE_TTL = 60_000;

type MarketCache = {
  savedAt: number;
  markets: CoinMarket[];
  global: GlobalMarketData['data'];
  trending: TrendingCoin[];
};

function readCache(): MarketCache | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as MarketCache;
    return Date.now() - cache.savedAt < CACHE_TTL ? cache : null;
  } catch {
    return null;
  }
}

export function MarketDataProvider({ children }: PropsWithChildren) {
  const cached = useMemo(readCache, []);
  const [markets, setMarkets] = useState<CoinMarket[]>(cached?.markets ?? []);
  const [global, setGlobal] = useState<GlobalMarketData['data'] | null>(cached?.global ?? null);
  const [trending, setTrending] = useState<TrendingCoin[]>(cached?.trending ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<MarketApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(cached ? new Date(cached.savedAt) : null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [marketRows, globalResponse, trendingResponse] = await Promise.all([
        fetchMarkets(),
        fetchGlobalMarket(),
        fetchTrending(),
      ]);
      const savedAt = Date.now();
      setMarkets(marketRows);
      setGlobal(globalResponse.data);
      setTrending(trendingResponse.coins.slice(0, 6));
      setLastUpdated(new Date(savedAt));
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ savedAt, markets: marketRows, global: globalResponse.data, trending: trendingResponse.coins.slice(0, 6) }),
      );
    } catch (caughtError) {
      setError(caughtError as MarketApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cached) void refresh();
  }, [cached, refresh]);

  const value = useMemo(
    () => ({ markets, global, trending, loading, error, lastUpdated, refresh }),
    [error, global, lastUpdated, loading, markets, refresh, trending],
  );

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) throw new Error('useMarketData must be used within MarketDataProvider.');
  return context;
}
