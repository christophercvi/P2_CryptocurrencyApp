import { http, HttpResponse } from 'msw';
import { bitcoin, bitcoinDetail, ethereum, globalMarket, trending } from './fixtures';

const api = 'https://api.coingecko.com/api/v3';

export const handlers = [
  http.get(`${api}/coins/markets`, () => HttpResponse.json([bitcoin, ethereum])),
  http.get(`${api}/global`, () => HttpResponse.json(globalMarket)),
  http.get(`${api}/search/trending`, () => HttpResponse.json(trending)),
  http.get(`${api}/coins/categories`, () => HttpResponse.json([{ id: 'layer-1', name: 'Layer 1' }])),
  http.get(`${api}/coins/:coinId`, () => HttpResponse.json(bitcoinDetail)),
  http.get(`${api}/coins/:coinId/market_chart`, () =>
    HttpResponse.json({
      prices: [[1_700_000_000_000, 70_000], [1_700_086_400_000, 80_000]],
      market_caps: [[1_700_000_000_000, 1_500_000_000_000]],
      total_volumes: [[1_700_000_000_000, 40_000_000_000]],
    }),
  ),
  http.get(`${api}/coins/:coinId/ohlc`, () =>
    HttpResponse.json([
      [1_700_000_000_000, 70_000, 72_000, 69_000, 71_000],
      [1_700_086_400_000, 71_000, 81_000, 70_000, 80_000],
    ]),
  ),
];
