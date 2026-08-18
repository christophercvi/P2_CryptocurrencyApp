/* Design direction: Calm, explicit session states integrated with the market terminal shell. */
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { createAccount, ensureDemoAccount, verifyCredentials } from '@/repositories/accountRepository';
import { database } from '@/storage/database';
import type { AuthUser, StorageMode } from '@/types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  storageMode: StorageMode | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  register: (displayName: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'cryptocurrency-app-session';

function readStoredSession() {
  const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredSession());
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<StorageMode | null>(null);

  useEffect(() => {
    let active = true;
    database
      .initialize()
      .then(async (mode) => {
        await ensureDemoAccount();
        if (active) setStorageMode(mode);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      storageMode,
      login: async (email, password, remember) => {
        const authenticatedUser = await verifyCredentials(email, password);
        if (!authenticatedUser) return false;

        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        const target = remember ? localStorage : sessionStorage;
        target.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        return true;
      },
      register: async (displayName, email, password) => {
        const account = await createAccount(displayName, email, password);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
        setUser(account);
        return account;
      },
      logout: () => {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [loading, storageMode, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
