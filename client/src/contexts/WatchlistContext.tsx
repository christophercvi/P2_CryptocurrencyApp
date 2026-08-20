/* Design direction: Immediate watchlist feedback backed by durable local SQLite state. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { addToWatchlist, getWatchlist, removeFromWatchlist, updatePriceAlert } from '@/repositories/watchlistRepository';
import { useAuth } from '@/contexts/AuthContext';
import type { CoinMarket, WatchlistItem } from '@/types';

type WatchlistContextValue = {
  items: WatchlistItem[];
  loading: boolean;
  hasCoin: (coinId: string) => boolean;
  addCoin: (coin: CoinMarket) => Promise<void>;
  removeCoin: (coinId: string) => Promise<void>;
  setAlert: (coinId: string, enabled: boolean, target: number | null) => Promise<void>;
  reload: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await getWatchlist(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<WatchlistContextValue>(
    () => ({
      items,
      loading,
      hasCoin: (coinId) => items.some((item) => item.coinId === coinId),
      addCoin: async (coin) => {
        if (!user) throw new Error('Sign in to save assets.');
        await addToWatchlist(user.id, coin);
        await reload();
      },
      removeCoin: async (coinId) => {
        if (!user) return;
        await removeFromWatchlist(user.id, coinId);
        await reload();
      },
      setAlert: async (coinId, enabled, target) => {
        if (!user) return;
        await updatePriceAlert(user.id, coinId, enabled, target);
        await reload();
      },
      reload,
    }),
    [items, loading, reload, user],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider.');
  return context;
}
