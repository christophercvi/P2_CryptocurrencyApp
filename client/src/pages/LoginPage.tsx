/* Design direction: Compact institutional sign-in form with explicit validation and data-storage status. */
import LockOutlined from '@mui/icons-material/LockOutlined';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, storageMode } = useAuth();
  const [email, setEmail] = useState('demo@cryptocurrency.app');
  const [password, setPassword] = useState('Demo123!');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!emailPattern.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const authenticated = await login(email, password, remember);
      if (!authenticated) {
        setError('Email or password is incorrect.');
        return;
      }
      const destination = (location.state as { from?: string } | null)?.from ?? '/watchlist';
      navigate(destination, { replace: true });
    } catch {
      setError('Sign in could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" onSubmit={submit} spacing={2.25} noValidate>
      <div>
        <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.45rem' } }}>
          Welcome back
        </Typography>
        <Typography color="rgba(244,247,255,0.58)" sx={{ mt: 0.75 }}>
          Sign in to continue to your watchlist.
        </Typography>
      </div>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
        fullWidth
        error={Boolean(error)}
        helperText={error || 'Use at least 8 characters.'}
      />
      <FormControlLabel
        control={<Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />}
        label="Keep me signed in on this device"
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting || loading}
        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockOutlined />}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
      <Button component={RouterLink} to="/" color="inherit">
        Explore markets without an account
      </Button>
      <Typography color="rgba(244,247,255,0.55)" sx={{ textAlign: 'center' }} variant="body2">
        New to CryptocurrencyApp?{' '}
        <RouterLink to="/create-account" style={{ color: '#8EA5FF', fontWeight: 700 }}>
          Create an account
        </RouterLink>
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', p: 1.5, border: '1px solid rgba(145,167,201,0.14)', borderRadius: 2 }}
      >
        <LockOutlined sx={{ fontSize: 17, color: '#5B7CFA' }} />
        <Typography variant="caption" color="rgba(244,247,255,0.58)">
          Demo: demo@cryptocurrency.app / Demo123! · Storage: {storageMode ?? 'initializing'}
        </Typography>
      </Stack>
    </Stack>
  );
}
