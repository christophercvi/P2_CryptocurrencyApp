import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const state = vi.hoisted(() => ({ user: null as { id: string } | null, loading: false }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => state }));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/watchlist']}>
      <Routes>
        <Route path="/login" element={<div>Login destination</div>} />
        <Route path="/watchlist" element={<ProtectedRoute><div>Private content</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects signed-out users to login', () => {
    state.user = null;
    state.loading = false;
    renderProtected();
    expect(screen.getByText('Login destination')).toBeInTheDocument();
  });

  it('renders protected content for an authenticated user', () => {
    state.user = { id: 'user-1' };
    renderProtected();
    expect(screen.getByText('Private content')).toBeInTheDocument();
  });
});
