/* Design direction: Invisible route guard with a direct and predictable authentication redirect. */
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { PropsWithChildren } from 'react';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Stack sx={{ minHeight: '55vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress aria-label="Loading account" size={34} />
      </Stack>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
