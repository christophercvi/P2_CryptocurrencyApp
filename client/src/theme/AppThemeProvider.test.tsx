import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppThemeProvider, useAppTheme } from './AppThemeProvider';

function ThemeProbe() {
  const { mode, preference, setPreference } = useAppTheme();
  return (
    <>
      <Typography>Theme: {mode}</Typography>
      <Typography>Preference: {preference}</Typography>
      <Button onClick={() => setPreference('light')}>Use light</Button>
      <Button onClick={() => setPreference('system')}>Use device</Button>
    </>
  );
}

describe('AppThemeProvider', () => {
  it('uses Dark Mode by default and remembers a Light Mode selection', () => {
    render(<AppThemeProvider><ThemeProbe /></AppThemeProvider>);

    expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use light' }));
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
    expect(localStorage.getItem('cryptocurrency-app-theme')).toBe('light');
  });

  it('restores a previously selected theme', () => {
    localStorage.setItem('cryptocurrency-app-theme', 'light');
    render(<AppThemeProvider><ThemeProbe /></AppThemeProvider>);
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
  });

  it('stores Device Default while resolving the current device scheme', () => {
    render(<AppThemeProvider><ThemeProbe /></AppThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Use device' }));
    expect(screen.getByText('Preference: system')).toBeInTheDocument();
    expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    expect(localStorage.getItem('cryptocurrency-app-theme')).toBe('system');
  });
});
