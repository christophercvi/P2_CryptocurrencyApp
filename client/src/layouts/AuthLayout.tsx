/* Design direction: Low-key fintech hero paired with a precise, high-contrast account form. */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router-dom';
import { AppLogo } from '@/components/AppLogo';

export function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#07111F', color: '#F4F7FF' }}>
      <Container maxWidth="xl" sx={{ minHeight: '100vh', py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 32px)', md: 'calc(100vh - 48px)' },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.08fr) minmax(440px, 0.92fr)' },
            border: '1px solid rgba(145,167,201,0.16)',
            borderRadius: { xs: 2, md: 3 },
            overflow: 'hidden',
            bgcolor: '#0B1220',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Stack
            sx={{
              justifyContent: 'space-between',
              display: { xs: 'none', lg: 'flex' },
              p: 5,
              minHeight: 700,
              backgroundImage:
                'linear-gradient(90deg, rgba(7,17,31,0.20), rgba(7,17,31,0.58)), url(/assets/cryptocurrencyapp-auth-hero.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <AppLogo inverse />
            <Box sx={{ maxWidth: 520 }}>
              <Typography variant="h2" sx={{ fontSize: 'clamp(2.7rem, 4.8vw, 5rem)', lineHeight: 0.98 }}>
                Crypto clarity,
                <Box component="span" sx={{ display: 'block', color: '#5B7CFA' }}>
                  at a glance.
                </Box>
              </Typography>
              <Typography sx={{ mt: 2.5, color: 'rgba(244,247,255,0.68)', maxWidth: 430 }}>
                Monitor live markets, build a personal watchlist, and explore assets with clear, responsive data.
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2.5, sm: 5, md: 7 } }}>
            <Box sx={{ width: '100%', maxWidth: 450 }}>
              <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 5 }}>
                <AppLogo inverse />
              </Box>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
