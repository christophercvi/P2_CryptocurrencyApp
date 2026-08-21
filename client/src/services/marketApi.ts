import axios from 'axios';
import type {
  CoinDetail,
  CoinMarket,
  GlobalMarketData,
  MarketChartResponse,
  OhlcPoint,
  TrendingCoin,
} from '@/types';
import { MarketApiError } from '@/types';

const api = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

function normalizeApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 429) {
      return new MarketApiError(
        'CoinGecko is temporarily rate-limiting requests. Please wait a moment and retry.',
        status,
      );
    }
    if (!error.response) {
      return new MarketApiError('The market data service could not be reached.', undefined, true);
    }
    return new MarketApiError(
      'Market data is temporarily unavailable.',
      status,
      status === undefined || status >= 500,
    );
  }

  return new MarketApiError('An unexpected market data error occurred.');
}

async function request<T>(path: string, params?: Record<string, string | number | boolean>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await api.get<T>(path, { params });
      return response.data;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.status !== 429 || attempt === 2) throw normalized;
      await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
    }
  }

  throw new MarketApiError('Market data could not be loaded after retrying.');
}

export function fetchMarkets() {
  return request<CoinMarket[]>('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 100,
    page: 1,
    sparkline: true,
    price_change_percentage: '24h,7d',
  });
}

export function fetchGlobalMarket() {
  return request<GlobalMarketData>('/global');
}

export function fetchTrending() {
  return request<{ coins: TrendingCoin[] }>('/search/trending');
}

export function fetchCategories() {
  return request<Array<{ id: string; name: string }>>('/coins/categories');
}

export function fetchCoinDetail(coinId: string) {
  return request<CoinDetail>(`/coins/${coinId}`, {
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
    sparkline: true,
  });
}

export function fetchMarketChart(coinId: string, days: string) {
  return request<MarketChartResponse>(`/coins/${coinId}/market_chart`, {
    vs_currency: 'usd',
    days,
  });
}

export function fetchOhlc(coinId: string, days: string) {
  return request<OhlcPoint[]>(`/coins/${coinId}/ohlc`, {
    vs_currency: 'usd',
    days,
  });
}
