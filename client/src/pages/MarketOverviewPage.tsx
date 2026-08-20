/* Design direction: HiFi-aligned market overview with compact metrics, a broad asset table, and a narrow trending rail. */
import BoltRounded from '@mui/icons-material/BoltRounded';
import CurrencyBitcoinRounded from '@mui/icons-material/CurrencyBitcoinRounded';
import LanguageRounded from '@mui/icons-material/LanguageRounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { DataError, FreshnessAlert, MarketTableSkeleton } from '@/components/DataState';
import { CoinAvatar } from '@/components/CoinAvatar';
import { MarketTable } from '@/components/MarketTable';
import { MetricCard } from '@/components/MetricCard';
import { PriceChange } from '@/components/PriceChange';
import { useMarketData } from '@/contexts/MarketDataContext';
import { formatCurrency, formatNumber } from '@/utils/format';

export function MarketOverviewPage() {
  const { markets, global, trending, loading, error, lastUpdated, refresh } = useMarketData();

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="h4">Market Overview</Typography>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 0 4px rgba(55,213,138,0.12)' }} />
        </Stack>
        <Typography color="text.secondary">Live cryptocurrency market intelligence</Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1, sm: 1.5 },
          mb: 1.5,
          backgroundImage: 'url(/manus-storage/cryptocurrencyapp-market-texture_41f945fc.jpg)',
          backgroundSize: 'cover',
          borderRadius: 2.5,
          p: { xs: 0.5, sm: 0.75 },
        }}
      >
        <MetricCard
          label="Global market cap"
          value={formatCurrency(global?.total_market_cap.usd, true)}
          detail={<PriceChange value={global?.market_cap_change_percentage_24h_usd} compact />}
          icon={<LanguageRounded color="primary" fontSize="small" />}
        />
        <MetricCard
          label="24h volume"
          value={formatCurrency(global?.total_volume.usd, true)}
          detail={<Typography variant="caption" color="text.secondary">Across tracked markets</Typography>}
          icon={<QueryStatsRounded color="secondary" fontSize="small" />}
        />
        <MetricCard
          label="BTC dominance"
          value={`${(global?.market_cap_percentage.btc ?? 0).toFixed(1)}%`}
          detail={<Typography variant="caption" color="text.secondary">Share of global cap</Typography>}
          icon={<CurrencyBitcoinRounded sx={{ color: 'warning.main' }} fontSize="small" />}
        />
        <MetricCard
          label="Active assets"
          value={formatNumber(global?.active_cryptocurrencies, false)}
          detail={<Typography variant="caption" color="text.secondary">Current CoinGecko coverage</Typography>}
          icon={<BoltRounded color="primary" fontSize="small" />}
        />
      </Box>

      <FreshnessAlert lastUpdated={lastUpdated} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 280px' }, gap: 2, mt: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1.25 }}>Top cryptocurrencies</Typography>
          {loading && markets.length === 0 ? (
            <MarketTableSkeleton />
          ) : error && markets.length === 0 ? (
            <DataError error={error} onRetry={() => void refresh()} />
          ) : (
            <MarketTable coins={markets} limit={10} />
          )}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1.25 }}>Trending</Typography>
          <Card>
            <CardContent sx={{ p: 1.25 }}>
              <Stack spacing={0.4}>
                {trending.map(({ item }) => (
                  <Stack
                    key={item.id}
                    component={RouterLink}
                    to={`/coin/${item.id}`}
                    direction="row"
                    spacing={1.25}
                    sx={{
                      alignItems: 'center',
                      p: 1.1,
                      borderRadius: 1.5,
                      color: 'inherit',
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <CoinAvatar src={item.small} name={item.name} size={34} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 800, fontSize: 13 }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.symbol}</Typography>
                    </Box>
                    <PriceChange value={item.data?.price_change_percentage_24h?.usd} compact />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
