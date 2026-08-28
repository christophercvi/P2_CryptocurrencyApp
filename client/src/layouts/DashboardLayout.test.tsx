import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardLayout } from './DashboardLayout';

const state = vi.hoisted(() => ({
  user: { id: 'user-1', email: 'ada@example.com', displayName: 'Ada Lovelace' } as { id: string; email: string; displayName: string } | null,
  logout: vi.fn(),
  mode: 'dark' as 'dark' | 'light',
  preference: 'dark' as 'dark' | 'light' | 'system',
  setPreference: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: state.user, logout: state.logout }) }));
vi.mock('@/theme/AppThemeProvider', () => ({
  useAppTheme: () => ({ mode: state.mode, preference: state.preference, setPreference: state.setPreference }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div>Location: {location.pathname}{location.search}</div>;
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="*" element={<LocationProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    state.user = { id: 'user-1', email: 'ada@example.com', displayName: 'Ada Lovelace' };
    state.mode = 'dark';
    state.preference = 'dark';
    state.logout.mockReset();
    state.setPreference.mockReset();
  });

  it('submits the global asset search to the markets route', async () => {
    const user = userEvent.setup();
    renderLayout();
    const search = screen.getByPlaceholderText('Search assets, symbols, categories…');
    await user.type(search, 'bitcoin{Enter}');
    expect(screen.getByText('Location: /markets?search=bitcoin')).toBeInTheDocument();
  });

  it('offers Dark, Light, and Device Default theme choices', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getAllByRole('button', { name: 'Choose theme' })[0]);
    expect(screen.getByRole('menuitem', { name: /Dark/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Light/ })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: /Device Default/ }));
    expect(state.setPreference).toHaveBeenCalledWith('system');
  });

  it('opens the account menu and logs out', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    await user.click(screen.getByText('Logout'));
    expect(state.logout).toHaveBeenCalledOnce();
    expect(screen.getByText('Location: /login')).toBeInTheDocument();
  });

  it('opens the mobile navigation drawer and exposes primary routes', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Markets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Watchlist' })).toBeInTheDocument();
  });
});
