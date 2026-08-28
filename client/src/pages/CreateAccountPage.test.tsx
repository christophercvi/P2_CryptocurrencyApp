import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateAccountPage } from './CreateAccountPage';

const register = vi.hoisted(() => vi.fn());
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ register }) }));

function renderCreateAccount() {
  return render(
    <MemoryRouter initialEntries={['/create-account']}>
      <Routes>
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/watchlist" element={<div>New account watchlist</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CreateAccountPage', () => {
  beforeEach(() => register.mockReset());

  it('requires a strong matching password', async () => {
    const user = userEvent.setup();
    renderCreateAccount();
    await user.type(screen.getByLabelText(/^name/i), 'Ada');
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'weak');
    await user.type(screen.getByLabelText(/confirm password/i), 'weak');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/10\+ characters/i)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('creates a validated account and enters the protected route', async () => {
    register.mockResolvedValueOnce({ id: 'user-1', email: 'ada@example.com', displayName: 'Ada Lovelace' });
    const user = userEvent.setup();
    renderCreateAccount();
    await user.type(screen.getByLabelText(/^name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'StrongPass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('New account watchlist')).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith('Ada Lovelace', 'ada@example.com', 'StrongPass1!');
  });
});
