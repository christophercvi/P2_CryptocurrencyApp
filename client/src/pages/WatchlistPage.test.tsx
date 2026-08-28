import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bitcoin } from '@/test/fixtures';
import { WatchlistPage } from './WatchlistPage';

const state = vi.hoisted(() => ({
  items: [] as Array<{
    userId: string;
    coinId: string;
    coinName: string;
    symbol: string;
    image: string;
    addedAt: string;
    alertEnabled: boolean;
    alertTarget: number | null;
  }>,
  loading: false,
  removeCoin: vi.fn(),
  setAlert: vi.fn(),
}));

vi.mock('@/contexts/MarketDataContext', () => ({ useMarketData: () => ({ markets: [bitcoin] }) }));
vi.mock('@/contexts/WatchlistContext', () => ({ useWatchlist: () => state }));

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

function renderPage() {
  return render(<MemoryRouter><WatchlistPage /></MemoryRouter>);
}

describe('WatchlistPage', () => {
  beforeEach(() => {
    state.items = [saved];
    state.loading = false;
    state.removeCoin.mockReset().mockResolvedValue(undefined);
    state.setAlert.mockReset().mockResolvedValue(undefined);
  });

  it('renders loading and empty states', () => {
    state.loading = true;
    const loading = renderPage();
    expect(screen.getByText('Loading saved assets…')).toBeInTheDocument();
    loading.unmount();

    state.loading = false;
    state.items = [];
    renderPage();
    expect(screen.getByText(/watchlist is empty/i)).toBeInTheDocument();
  });

  it('filters watched assets by name or symbol', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Filter watched assets'), 'eth');
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  it('opens the alert dialog and persists a numeric target', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Edit Bitcoin alert' }));
    expect(screen.getByRole('dialog', { name: 'Set Bitcoin alert' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Target price (USD)'), '85000');
    await user.click(screen.getByRole('button', { name: 'Save alert' }));
    expect(state.setAlert).toHaveBeenCalledWith('bitcoin', true, 85_000);
    expect(await screen.findByText('Bitcoin price alert updated.')).toBeInTheDocument();
  });

  it('disables an existing alert from the switch', async () => {
    state.items = [{ ...saved, alertEnabled: true, alertTarget: 85_000 }];
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('switch'));
    expect(state.setAlert).toHaveBeenCalledWith('bitcoin', false, 85_000);
  });

  it('removes a watched asset', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Remove Bitcoin' }));
    expect(state.removeCoin).toHaveBeenCalledWith('bitcoin');
  });
});
