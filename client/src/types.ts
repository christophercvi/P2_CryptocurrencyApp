export type ThemeMode = 'light' | 'dark';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
  price_change_percentage_7d_in_currency?: number;
  last_updated: string;
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number;
  categories: string[];
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    high_24h: Record<string, number>;
    low_24h: Record<string, number>;
    price_change_percentage_24h: number;
    ath: Record<string, number>;
    ath_change_percentage: Record<string, number>;
    ath_date: Record<string, string>;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
};

export type GlobalMarketData = {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
};

export type TrendingCoin = {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    thumb: string;
    small: string;
    market_cap_rank: number | null;
    data?: { price_change_percentage_24h?: Record<string, number> };
  };
};

export type MarketChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

export type ChartRange = '1' | '7' | '30' | '365' | 'max';
export type ChartMode = 'line' | 'candlestick';
export type OhlcPoint = [number, number, number, number, number];

export type WatchlistItem = {
  userId: string;
  coinId: string;
  coinName: string;
  symbol: string;
  image: string;
  addedAt: string;
  alertEnabled: boolean;
  alertTarget: number | null;
};

export type StorageMode = 'opfs' | 'memory';

export class MarketApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable = true,
  ) {
    super(message);
    this.name = 'MarketApiError';
  }
}
