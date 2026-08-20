/* Design direction: Honest watchlist-based allocation view without inventing holdings or transaction data. */
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useMarketData } from '@/contexts/MarketDataContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { CoinAvatar } from '@/components/CoinAvatar';
import { formatCurrency } from '@/utils/format';

export function PortfolioPage() {
  const { markets } = useMarketData();
  const { items } = useWatchlist();
  const rows = items
    .map((item) => ({ item, market: markets.find((coin) => coin.id === item.coinId) }))
    .filter((row) => row.market)
    .sort((left, right) => (right.market?.market_cap ?? 0) - (left.market?.market_cap ?? 0));
  const totalMarketCap = rows.reduce((sum, row) => sum + (row.market?.market_cap ?? 0), 0);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
      <Typography variant="h4">Portfolio View</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        A market-cap comparison of your watched assets.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        CryptocurrencyApp does not collect balances or transactions. This view compares public market capitalization only.
      </Alert>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Watched-asset market cap distribution</Typography>
          {rows.length === 0 ? (
            <Stack spacing={2} sx={{ alignItems: 'flex-start', py: 3 }}>
              <Typography color="text.secondary">Add assets to your watchlist to populate this comparison.</Typography>
              <Button component={RouterLink} to="/markets" variant="contained">Browse markets</Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {rows.map(({ item, market }) => {
                const share = totalMarketCap ? ((market?.market_cap ?? 0) / totalMarketCap) * 100 : 0;
                return (
                  <Box key={item.coinId}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <CoinAvatar src={item.image} name={item.coinName} size={26} />
                        <Typography sx={{ fontWeight: 800 }}>{item.coinName}</Typography>
                      </Stack>
                      <Typography className="tabular-numbers" color="text.secondary">
                        {share.toFixed(1)}% · {formatCurrency(market?.market_cap, true)}
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={share} sx={{ height: 8, borderRadius: 8 }} />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
