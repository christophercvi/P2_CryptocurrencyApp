/* Design direction: Resilient terminal state with calm recovery actions and explicit hierarchy. */
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { failed: boolean };

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render failure', error, errorInfo);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ width: 'min(100%, 520px)', p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <ErrorOutlineRounded color="primary" sx={{ fontSize: 54, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            This view is temporarily unavailable
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your saved account and watchlist data remain in this browser. Reload the application to restore the market view.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload application
          </Button>
        </Paper>
      </Stack>
    );
  }
}
