import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import {
  fetchCategories,
  fetchCoinDetail,
  fetchGlobalMarket,
  fetchMarketChart,
  fetchMarkets,
  fetchOhlc,
  fetchTrending,
} from './marketApi';
import { server } from '@/test/server';

const api = 'https://api.coingecko.com/api/v3';

describe('marketApi', () => {
  it('loads the market overview resources from CoinGecko', async () => {
    const [markets, global, trending, categories] = await Promise.all([
      fetchMarkets(),
      fetchGlobalMarket(),
      fetchTrending(),
      fetchCategories(),
    ]);

    expect(markets).toHaveLength(2);
    expect(markets[0].id).toBe('bitcoin');
    expect(global.data.active_cryptocurrencies).toBe(18_000);
    expect(trending.coins[0].item.symbol).toBe('BTC');
    expect(categories[0].name).toBe('Layer 1');
  });

  it('loads coin detail, line history, and candlestick history', async () => {
    const [detail, chart, ohlc] = await Promise.all([
      fetchCoinDetail('bitcoin'),
      fetchMarketChart('bitcoin', '7'),
      fetchOhlc('bitcoin', '30'),
    ]);

    expect(detail.name).toBe('Bitcoin');
    expect(chart.prices[1][1]).toBe(80_000);
    expect(ohlc[1]).toEqual([1_700_086_400_000, 71_000, 81_000, 70_000, 80_000]);
  });

  it('normalizes a keyless API rate-limit response after retries', async () => {
    server.use(http.get(`${api}/global`, () => HttpResponse.json({ error: 'rate limited' }, { status: 429 })));

    await expect(fetchGlobalMarket()).rejects.toMatchObject({
      name: 'MarketApiError',
      status: 429,
      retryable: true,
    });
  });

  it('marks a missing asset as non-retryable', async () => {
    server.use(http.get(`${api}/coins/:coinId`, () => HttpResponse.json({ error: 'not found' }, { status: 404 })));

    await expect(fetchCoinDetail('missing')).rejects.toMatchObject({
      name: 'MarketApiError',
      status: 404,
      retryable: false,
    });
  });
});
