import type { CoinDetail, CoinMarket, GlobalMarketData, TrendingCoin } from '@/types';

export const bitcoin: CoinMarket = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://coin-images.coingecko.com/bitcoin.png',
  current_price: 80_000,
  market_cap: 1_600_000_000_000,
  market_cap_rank: 1,
  fully_diluted_valuation: 1_680_000_000_000,
  total_volume: 50_000_000_000,
  high_24h: 81_000,
  low_24h: 78_000,
  price_change_24h: 1_500,
  price_change_percentage_24h: 2.4,
  market_cap_change_24h: 30_000_000_000,
  market_cap_change_percentage_24h: 1.9,
  circulating_supply: 20_000_000,
  total_supply: 20_000_000,
  max_supply: 21_000_000,
  ath: 126_000,
  ath_change_percentage: -36,
  ath_date: '2025-10-01T00:00:00Z',
  atl: 67,
  atl_change_percentage: 100_000,
  atl_date: '2013-07-01T00:00:00Z',
  last_updated: '2026-08-22T08:00:00Z',
  sparkline_in_7d: { price: [70_000, 72_000, 75_000, 80_000] },
  price_change_percentage_7d_in_currency: 8.1,
};

export const ethereum: CoinMarket = {
  ...bitcoin,
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  current_price: 2_500,
  market_cap: 300_000_000_000,
  market_cap_rank: 2,
  price_change_percentage_24h: -1.5,
  sparkline_in_7d: { price: [2_700, 2_650, 2_600, 2_500] },
};

export const globalMarket: GlobalMarketData = {
  data: {
    active_cryptocurrencies: 18_000,
    markets: 1_000,
    total_market_cap: { usd: 2_800_000_000_000 },
    total_volume: { usd: 120_000_000_000 },
    market_cap_percentage: { btc: 58, eth: 12 },
    market_cap_change_percentage_24h_usd: 1.2,
    updated_at: 1_787_380_000,
  },
};

export const trending: { coins: TrendingCoin[] } = {
  coins: [
    {
      item: {
        id: 'bitcoin',
        coin_id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: bitcoin.image,
        small: bitcoin.image,
        data: { price_change_percentage_24h: { usd: 2.4 } },
      },
    },
  ],
};

export const bitcoinDetail: CoinDetail = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  description: { en: '<p>Decentralized digital currency.</p>' },
  image: { thumb: bitcoin.image, small: bitcoin.image, large: bitcoin.image },
  market_cap_rank: 1,
  categories: ['Layer 1'],
  links: { homepage: ['https://bitcoin.org'], blockchain_site: [] },
  market_data: {
    current_price: { usd: 80_000 },
    market_cap: { usd: 1_600_000_000_000 },
    total_volume: { usd: 50_000_000_000 },
    high_24h: { usd: 81_000 },
    low_24h: { usd: 78_000 },
    price_change_percentage_24h: 2.4,
    circulating_supply: 20_000_000,
    total_supply: 20_000_000,
    max_supply: 21_000_000,
    ath: { usd: 126_000 },
    ath_change_percentage: { usd: -36 },
    ath_date: { usd: '2025-10-01T00:00:00Z' },
  },
};
