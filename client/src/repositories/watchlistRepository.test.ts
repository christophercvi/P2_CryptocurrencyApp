import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bitcoin } from '@/test/fixtures';

const { query, execute } = vi.hoisted(() => ({ query: vi.fn(), execute: vi.fn() }));

vi.mock('@/storage/database', () => ({ database: { query, execute } }));

import { addToWatchlist, getWatchlist, removeFromWatchlist, updatePriceAlert } from './watchlistRepository';

describe('watchlistRepository', () => {
  beforeEach(() => {
    query.mockReset();
    execute.mockReset();
  });

  it('maps SQLite rows into watchlist items', async () => {
    query.mockResolvedValueOnce([
      {
        user_id: 'user-1',
        coin_id: 'bitcoin',
        coin_name: 'Bitcoin',
        symbol: 'btc',
        image: bitcoin.image,
        added_at: '2026-08-22T08:00:00Z',
        alert_enabled: 1,
        alert_target: 85_000,
      },
    ]);

    await expect(getWatchlist('user-1')).resolves.toEqual([
      expect.objectContaining({ coinId: 'bitcoin', alertEnabled: true, alertTarget: 85_000 }),
    ]);
  });

  it('adds, removes, and updates local alert preferences', async () => {
    await addToWatchlist('user-1', bitcoin);
    await updatePriceAlert('user-1', 'bitcoin', true, 85_000);
    await removeFromWatchlist('user-1', 'bitcoin');

    expect(execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO watchlist'),
      expect.arrayContaining(['user-1', 'bitcoin', 'Bitcoin', 'btc']),
    );
    expect(execute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE watchlist'),
      [1, 85_000, 'user-1', 'bitcoin'],
    );
    expect(execute).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('DELETE FROM watchlist'),
      ['user-1', 'bitcoin'],
    );
  });
});
