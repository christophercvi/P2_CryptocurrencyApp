/* Design direction: Full-width market discovery table with persistent filters and resilient API feedback. */
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataError, FreshnessAlert, MarketTableSkeleton } from '@/components/DataState';
import { MarketTable } from '@/components/MarketTable';
import { useMarketData } from '@/contexts/MarketDataContext';

export function MarketsPage() {
  const { markets, loading, error, lastUpdated, refresh } = useMarketData();

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
      <Stack spacing={0.5} sx={{ mb: 2.5 }}>
        <Typography variant="h4">Markets</Typography>
        <Typography color="text.secondary">Search, filter, and compare the top 100 cryptocurrencies.</Typography>
      </Stack>
      <FreshnessAlert lastUpdated={lastUpdated} />
      <Stack sx={{ mt: 2 }}>
        {loading && markets.length === 0 ? (
          <MarketTableSkeleton />
        ) : error && markets.length === 0 ? (
          <DataError error={error} onRetry={() => void refresh()} />
        ) : (
          <MarketTable coins={markets} />
        )}
      </Stack>
    </Container>
  );
}
