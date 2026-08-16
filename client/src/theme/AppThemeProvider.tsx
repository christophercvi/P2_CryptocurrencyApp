/* Design direction: Midnight Market Terminal with mirrored light and dark financial surfaces. */
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { ThemeMode } from '@/types';

export type ThemePreference = ThemeMode | 'system';

type ThemeModeContextValue = {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
const THEME_KEY = 'cryptocurrency-app-theme';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const savedMode = localStorage.getItem(THEME_KEY);
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') return savedMode;
    return 'dark';
  });
  const [systemMode, setSystemMode] = useState<ThemeMode>(() =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  );
  const mode = preference === 'system' ? systemMode : preference;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const update = (event: MediaQueryListEvent | MediaQueryList) => setSystemMode(event.matches ? 'light' : 'dark');
    update(media);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const theme = useMemo(() => {
    const dark = mode === 'dark';
    const baseTheme = createTheme({
      cssVariables: true,
      palette: {
        mode,
        primary: { main: '#5B7CFA', light: '#8EA5FF', dark: '#3658CE' },
        secondary: { main: '#22D3EE' },
        success: { main: '#37D58A' },
        error: { main: '#F26B70' },
        warning: { main: '#F4B740' },
        background: dark
          ? { default: '#0B1220', paper: '#111C2E' }
          : { default: '#F4F7FB', paper: '#FFFFFF' },
        text: dark
          ? { primary: '#F4F7FF', secondary: '#94A3BA' }
          : { primary: '#142033', secondary: '#637087' },
        divider: dark ? 'rgba(145, 167, 201, 0.16)' : 'rgba(31, 50, 76, 0.12)',
      },
      typography: {
        fontFamily: 'Manrope, system-ui, sans-serif',
        h1: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 700 },
        h2: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 700 },
        h3: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 650 },
        h4: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 650 },
        h5: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 650 },
        h6: { fontFamily: 'Space Grotesk, Manrope, sans-serif', fontWeight: 650 },
        button: { textTransform: 'none', fontWeight: 700 },
      },
      shape: { borderRadius: 12 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              minWidth: 320,
              minHeight: '100vh',
              backgroundImage: dark
                ? 'radial-gradient(circle at 82% 8%, rgba(34,211,238,0.055), transparent 28%)'
                : 'radial-gradient(circle at 82% 8%, rgba(91,124,250,0.07), transparent 28%)',
            },
            '*': { boxSizing: 'border-box' },
            '::selection': { background: '#5B7CFA', color: '#FFFFFF' },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: `1px solid ${dark ? 'rgba(145,167,201,0.14)' : 'rgba(31,50,76,0.09)'}`,
              backgroundImage: 'none',
              boxShadow: dark
                ? '0 16px 42px rgba(1, 7, 18, 0.18)'
                : '0 16px 42px rgba(50, 70, 105, 0.08)',
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: { minHeight: 40, borderRadius: 9 },
          },
        },
        MuiTextField: {
          defaultProps: { size: 'small' },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: { borderRadius: 9 },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: 8, fontWeight: 700 },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { borderColor: dark ? 'rgba(145,167,201,0.11)' : 'rgba(31,50,76,0.08)' },
            head: { color: dark ? '#94A3BA' : '#637087', fontWeight: 700 },
          },
        },
      },
    });

    return responsiveFontSizes(baseTheme);
  }, [mode]);

  const context = useMemo(
    () => ({
      mode,
      preference,
      setPreference: (next: ThemePreference) => {
        localStorage.setItem(THEME_KEY, next);
        setPreferenceState(next);
      },
    }),
    [mode, preference],
  );

  return (
    <ThemeModeContext.Provider value={context}>
      <ThemeProvider theme={theme} disableTransitionOnChange>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return context;
}
