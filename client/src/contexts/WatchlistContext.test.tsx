import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bitcoin } from '@/test/fixtures';
import { WatchlistProvider, useWatchlist } from './WatchlistContext';

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1', email: 'ada@example.com', displayName: 'Ada' } as { id: string; email: string; displayName: string } | null,
  getWatchlist: vi.fn(),
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
  updatePriceAlert: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('@/repositories/watchlistRepository', () => ({
  getWatchlist: mocks.getWatchlist,
  addToWatchlist: mocks.addToWatchlist,
  removeFromWatchlist: mocks.removeFromWatchlist,
  updatePriceAlert: mocks.updatePriceAlert,
}));

const saved = {
  userId: 'user-1',
  coinId: 'bitcoin',
  coinName: 'Bitcoin',
  symbol: 'btc',
  image: bitcoin.image,
  addedAt: '2026-08-22T08:00:00Z',
  alertEnabled: false,
  alertTarget: null,
};

function Probe() {
  const watchlist = useWatchlist();
  return (
    <>
      <span>{watchlist.loading ? 'loading' : 'ready'}</span>
      <span>{watchlist.items.map((item) => item.coinName).join(',') || 'empty'}</span>
      <span>{watchlist.hasCoin('bitcoin') ? 'has-bitcoin' : 'no-bitcoin'}</span>
      <button onClick={() => void watchlist.addCoin(bitcoin)}>Add</button>
      <button onClick={() => void watchlist.removeCoin('bitcoin')}>Remove</button>
      <button onClick={() => void watchlist.setAlert('bitcoin', true, 85_000)}>Alert</button>
      <button onClick={() => void watchlist.reload()}>Reload</button>
    </>
  );
}

describe('WatchlistContext', () => {
  beforeEach(() => {
    mocks.user = { id: 'user-1', email: 'ada@example.com', displayName: 'Ada' };
    mocks.getWatchlist.mockReset().mockResolvedValue([saved]);
    mocks.addToWatchlist.mockReset().mockResolvedValue(undefined);
    mocks.removeFromWatchlist.mockReset().mockResolvedValue(undefined);
    mocks.updatePriceAlert.mockReset().mockResolvedValue(undefined);
  });

  it('loads and indexes the current user watchlist', async () => {
    render(<WatchlistProvider><Probe /></WatchlistProvider>);
    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('has-bitcoin')).toBeInTheDocument();
    expect(mocks.getWatchlist).toHaveBeenCalledWith('user-1');
  });

  it('returns an empty collection without querying when signed out', async () => {
    mocks.user = null;
    render(<WatchlistProvider><Probe /></WatchlistProvider>);
    expect(await screen.findByText('empty')).toBeInTheDocument();
    expect(mocks.getWatchlist).not.toHaveBeenCalled();
  });

  it('adds a coin and reloads persisted items', async () => {
    const user = userEvent.setup();
    render(<WatchlistProvider><Probe /></WatchlistProvider>);
    await screen.findByText('Bitcoin');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(mocks.addToWatchlist).toHaveBeenCalledWith('user-1', bitcoin));
    expect(mocks.getWatchlist.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('removes a coin and updates an alert before reloading', async () => {
    const user = userEvent.setup();
    render(<WatchlistProvider><Probe /></WatchlistProvider>);
    await screen.findByText('Bitcoin');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Alert' }));
    expect(mocks.removeFromWatchlist).toHaveBeenCalledWith('user-1', 'bitcoin');
    expect(mocks.updatePriceAlert).toHaveBeenCalledWith('user-1', 'bitcoin', true, 85_000);
  });

  it('does not mutate persistence when signed out', async () => {
    mocks.user = null;
    const user = userEvent.setup();
    render(<WatchlistProvider><Probe /></WatchlistProvider>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Alert' }));
    expect(mocks.removeFromWatchlist).not.toHaveBeenCalled();
    expect(mocks.updatePriceAlert).not.toHaveBeenCalled();
  });
});
