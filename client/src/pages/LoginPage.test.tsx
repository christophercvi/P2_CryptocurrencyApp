import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  loading: false,
  storageMode: 'opfs' as const,
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/watchlist" element={<div>Protected watchlist</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => auth.login.mockReset());

  it('shows client-side validation before authentication', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('reports invalid credentials', async () => {
    auth.login.mockResolvedValueOnce(false);
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  });

  it('navigates to the protected watchlist after a successful login', async () => {
    auth.login.mockResolvedValueOnce(true);
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Protected watchlist')).toBeInTheDocument();
    expect(auth.login).toHaveBeenCalledWith('demo@cryptocurrency.app', 'Demo123!', true);
  });
});
