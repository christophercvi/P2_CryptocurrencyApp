import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  ensureDemoAccount: vi.fn(),
  verifyCredentials: vi.fn(),
  createAccount: vi.fn(),
}));

vi.mock('@/storage/database', () => ({ database: { initialize: mocks.initialize } }));
vi.mock('@/repositories/accountRepository', () => ({
  ensureDemoAccount: mocks.ensureDemoAccount,
  verifyCredentials: mocks.verifyCredentials,
  createAccount: mocks.createAccount,
}));

const account = { id: 'user-1', email: 'ada@example.com', displayName: 'Ada Lovelace' };

function Probe() {
  const auth = useAuth();
  return (
    <>
      <span>{auth.loading ? 'loading' : 'ready'}</span>
      <span>{auth.storageMode ?? 'no-mode'}</span>
      <span>{auth.user?.email ?? 'signed-out'}</span>
      <button onClick={() => void auth.login(account.email, 'StrongPass1!', false)}>Session login</button>
      <button onClick={() => void auth.login(account.email, 'StrongPass1!', true)}>Remember login</button>
      <button onClick={() => void auth.login('missing@example.com', 'bad', false)}>Invalid login</button>
      <button onClick={() => void auth.register(account.displayName, account.email, 'StrongPass1!')}>Register</button>
      <button onClick={auth.logout}>Logout</button>
    </>
  );
}

function renderProvider() {
  return render(<AuthProvider><Probe /></AuthProvider>);
}

describe('AuthContext', () => {
  beforeEach(() => {
    mocks.initialize.mockReset().mockResolvedValue('opfs');
    mocks.ensureDemoAccount.mockReset().mockResolvedValue(undefined);
    mocks.verifyCredentials.mockReset();
    mocks.createAccount.mockReset();
  });

  it('initializes SQLite, creates the demo account, and exposes the storage mode', async () => {
    renderProvider();
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('opfs')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(mocks.ensureDemoAccount).toHaveBeenCalledOnce();
  });

  it('restores a valid session and removes malformed session data', async () => {
    sessionStorage.setItem('cryptocurrency-app-session', JSON.stringify(account));
    const first = renderProvider();
    expect(screen.getByText(account.email)).toBeInTheDocument();
    await screen.findByText('ready');
    first.unmount();

    sessionStorage.setItem('cryptocurrency-app-session', '{broken');
    renderProvider();
    expect(screen.getByText('signed-out')).toBeInTheDocument();
    await screen.findByText('ready');
    expect(sessionStorage.getItem('cryptocurrency-app-session')).toBeNull();
  });

  it('stores a normal login in sessionStorage', async () => {
    mocks.verifyCredentials.mockResolvedValueOnce(account);
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole('button', { name: 'Session login' }));
    await waitFor(() => expect(screen.getByText(account.email)).toBeInTheDocument());
    expect(sessionStorage.getItem('cryptocurrency-app-session')).toContain(account.email);
    expect(localStorage.getItem('cryptocurrency-app-session')).toBeNull();
  });

  it('stores a remembered login in localStorage and leaves invalid credentials signed out', async () => {
    mocks.verifyCredentials.mockResolvedValueOnce(account).mockResolvedValueOnce(null);
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole('button', { name: 'Remember login' }));
    expect(localStorage.getItem('cryptocurrency-app-session')).toContain(account.email);
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    await user.click(screen.getByRole('button', { name: 'Invalid login' }));
    expect(screen.getByText('signed-out')).toBeInTheDocument();
  });

  it('registers a local account and logout clears both session locations', async () => {
    mocks.createAccount.mockResolvedValueOnce(account);
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(screen.getByText(account.email)).toBeInTheDocument());
    expect(sessionStorage.getItem('cryptocurrency-app-session')).toContain(account.email);
    localStorage.setItem('cryptocurrency-app-session', JSON.stringify(account));
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(sessionStorage.getItem('cryptocurrency-app-session')).toBeNull();
    expect(localStorage.getItem('cryptocurrency-app-session')).toBeNull();
  });
});
