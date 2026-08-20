import { database } from '@/storage/database';
import type { CoinMarket, WatchlistItem } from '@/types';

type WatchlistRow = {
  user_id: string;
  coin_id: string;
  coin_name: string;
  symbol: string;
  image: string;
  added_at: string;
  alert_enabled: number;
  alert_target: number | null;
};

function mapRow(row: WatchlistRow): WatchlistItem {
  return {
    userId: row.user_id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    symbol: row.symbol,
    image: row.image,
    addedAt: row.added_at,
    alertEnabled: Boolean(row.alert_enabled),
    alertTarget: row.alert_target,
  };
}

export async function getWatchlist(userId: string) {
  const rows = await database.query<WatchlistRow>(
    'SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
    [userId],
  );
  return rows.map(mapRow);
}

export async function addToWatchlist(userId: string, coin: CoinMarket) {
  await database.execute(
    `INSERT INTO watchlist (user_id, coin_id, coin_name, symbol, image, added_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, coin_id) DO UPDATE SET coin_name = excluded.coin_name, symbol = excluded.symbol, image = excluded.image`,
    [userId, coin.id, coin.name, coin.symbol, coin.image, new Date().toISOString()],
  );
}

export async function removeFromWatchlist(userId: string, coinId: string) {
  await database.execute('DELETE FROM watchlist WHERE user_id = ? AND coin_id = ?', [userId, coinId]);
}

export async function updatePriceAlert(
  userId: string,
  coinId: string,
  alertEnabled: boolean,
  alertTarget: number | null,
) {
  await database.execute(
    'UPDATE watchlist SET alert_enabled = ?, alert_target = ? WHERE user_id = ? AND coin_id = ?',
    [alertEnabled ? 1 : 0, alertTarget, userId, coinId],
  );
}
