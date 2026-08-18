/* Design direction: Matching authentication surface with progressive, security-focused validation. */
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (displayName.trim().length < 2) {
      setError('Enter your name using at least 2 characters.');
      return;
    }
    if (!emailPattern.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!strongPassword.test(password)) {
      setError('Use 10+ characters with upper and lowercase letters, a number, and a symbol.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(displayName, email, password);
      navigate('/watchlist', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Account creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" onSubmit={submit} spacing={2.1} noValidate>
      <div>
        <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.45rem' } }}>
          Create your account
        </Typography>
        <Typography color="rgba(244,247,255,0.58)" sx={{ mt: 0.75 }}>
          Save assets and manage price alerts in this browser.
        </Typography>
      </div>
      <TextField label="Name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required fullWidth />
      <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        fullWidth
        error={Boolean(error)}
        helperText={error || 'Passwords are protected with Argon2id before storage.'}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <PersonAddAltOutlined />}
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </Button>
      <Typography color="rgba(244,247,255,0.55)" sx={{ textAlign: 'center' }} variant="body2">
        Already registered?{' '}
        <RouterLink to="/login" style={{ color: '#8EA5FF', fontWeight: 700 }}>
          Sign in
        </RouterLink>
      </Typography>
    </Stack>
  );
}
