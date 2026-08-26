import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bitcoin, ethereum } from '@/test/fixtures';
import { MarketTable } from './MarketTable';

const watchlist = vi.hoisted(() => ({
  hasCoin: vi.fn(),
  addCoin: vi.fn(),
  removeCoin: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('@/contexts/WatchlistContext', () => ({ useWatchlist: () => watchlist }));

describe('MarketTable', () => {
  beforeEach(() => {
    watchlist.hasCoin.mockReset().mockReturnValue(false);
    watchlist.addCoin.mockReset().mockResolvedValue(undefined);
    watchlist.removeCoin.mockReset().mockResolvedValue(undefined);
  });

  it('searches by symbol and filters gainers and losers', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><MarketTable coins={[bitcoin, ethereum]} /></MemoryRouter>);

    await user.type(screen.getByPlaceholderText('Search name or symbol'), 'eth');
    expect(screen.queryAllByText('Bitcoin')).toHaveLength(0);
    expect(screen.getAllByText('Ethereum').length).toBeGreaterThan(0);

    await user.clear(screen.getByPlaceholderText('Search name or symbol'));
    await user.click(screen.getByText('Gainers'));
    expect(screen.getAllByText('Bitcoin').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Ethereum')).toHaveLength(0);

    await user.click(screen.getByText('Losers'));
    expect(screen.getAllByText('Ethereum').length).toBeGreaterThan(0);
  });

  it('adds an authenticated asset to the SQLite watchlist', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><MarketTable coins={[bitcoin]} /></MemoryRouter>);
    const controls = screen.getAllByRole('button', { name: 'Add to watchlist' });
    await user.click(controls[0]);
    expect(watchlist.addCoin).toHaveBeenCalledWith(bitcoin);
  });
});
