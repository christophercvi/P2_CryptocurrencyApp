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
    <Card>
      <CardContent>
        <Stack spacing={1.35}>
          <Skeleton variant="rounded" height={42} />
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={48} />
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
          src="/manus-storage/cryptocurrencyapp-data-state_3f9dbb2f.png"
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
