/* Design direction: Explicit loading, rate-limit, and unavailable states matching the HiFi feedback panels. */
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { MarketApiError } from '@/types';

export function MarketTableSkeleton() {
  return (
    <Card aria-label="Loading market table">
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px,1fr) 170px 240px' }, gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={40} />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: '56px minmax(180px,1fr) 130px 100px 150px 120px 90px',
            gap: 1.5,
            px: 1.25,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {['Rank', 'Asset', 'Price', '24h', 'Market cap', '7d trend', 'Watchlist'].map((label) => (
            <Typography key={label} variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{label}</Typography>
          ))}
        </Box>
        <Stack spacing={0}>
          {Array.from({ length: 7 }, (_, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '30px minmax(120px,1fr) 96px', md: '56px minmax(180px,1fr) 130px 100px 150px 120px 90px' },
                gap: 1.5,
                alignItems: 'center',
                minHeight: 54,
                px: 1.25,
                borderBottom: index === 6 ? 0 : '1px solid',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="text" width={18} />
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Box sx={{ minWidth: 70, flex: 1 }}>
                  <Skeleton variant="text" width="58%" />
                  <Skeleton variant="text" width="28%" />
                </Box>
              </Stack>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="62%" sx={{ display: { xs: 'none', md: 'block' } }} />
              <Skeleton variant="text" width="72%" sx={{ display: { xs: 'none', md: 'block' } }} />
              <Skeleton variant="rounded" height={22} sx={{ display: { xs: 'none', md: 'block' } }} />
              <Skeleton variant="circular" width={24} height={24} sx={{ display: { xs: 'none', md: 'block' }, justifySelf: 'center' }} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DataError({ error, onRetry, compact = false }: { error: MarketApiError; onRetry: () => void; compact?: boolean }) {
  return (
    <Card>
      <CardContent sx={{ p: compact ? 2.5 : 4, textAlign: 'center' }}>
        <Box
          component="img"
          src="/assets/cryptocurrencyapp-data-state.webp"
          alt="Data connection unavailable"
          sx={{ width: compact ? 132 : 190, maxWidth: '62%', mb: 1.5 }}
        />
        <Typography variant={compact ? 'h6' : 'h5'}>{error.status === 429 ? 'Chart temporarily limited' : 'Market data unavailable'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2.25 }}>
          {error.message}
        </Typography>
        <Button variant="contained" startIcon={<RefreshRounded />} onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function FreshnessAlert({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <Alert severity="warning" variant="outlined" sx={{ py: 0.2 }}>
      CoinGecko data refreshes periodically on the free keyless API.
      {lastUpdated ? ` Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ''}
    </Alert>
  );
}
