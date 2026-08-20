/* Design direction: Dominant financial chart, compact watchlist panel, and layered market statistics. */
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { DataError } from '@/components/DataState';
import { CoinAvatar } from '@/components/CoinAvatar';
import { MarketChart } from '@/components/MarketChart';
import { MetricCard } from '@/components/MetricCard';
import { PriceChange } from '@/components/PriceChange';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { fetchCoinDetail } from '@/services/marketApi';
import type { CoinDetail, CoinMarket, MarketApiError } from '@/types';
import { formatCurrency, formatNumber, stripHtml } from '@/utils/format';

export function CoinDetailPage() {
  const { coinId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markets } = useMarketData();
  const { hasCoin, addCoin, removeCoin } = useWatchlist();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MarketApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchCoinDetail(coinId)
      .then((data) => active && setCoin(data))
      .catch((caughtError) => active && setError(caughtError as MarketApiError))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [coinId, reloadKey]);

  const marketCoin = useMemo(() => markets.find((item) => item.id === coinId), [coinId, markets]);

  if (loading && !coin) {
    return <Stack sx={{ minHeight: '62vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress aria-label="Loading asset details" /></Stack>;
  }

  if (error && !coin) {
    return <Container maxWidth="md" sx={{ py: 5 }}><DataError error={error} onRetry={() => setReloadKey((value) => value + 1)} /></Container>;
  }

  if (!coin) return null;

  const usd = coin.market_data.current_price.usd;
  const isSaved = hasCoin(coin.id);

  const fallbackMarket: CoinMarket = marketCoin ?? {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image.small,
    current_price: usd,
    market_cap: coin.market_data.market_cap.usd,
    market_cap_rank: coin.market_cap_rank,
    fully_diluted_valuation: null,
    total_volume: coin.market_data.total_volume.usd,
    high_24h: coin.market_data.high_24h.usd,
    low_24h: coin.market_data.low_24h.usd,
    price_change_24h: 0,
    price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
    market_cap_change_24h: 0,
    market_cap_change_percentage_24h: 0,
    circulating_supply: coin.market_data.circulating_supply,
    total_supply: coin.market_data.total_supply,
    max_supply: coin.market_data.max_supply,
    ath: coin.market_data.ath.usd,
    ath_change_percentage: coin.market_data.ath_change_percentage.usd,
    ath_date: coin.market_data.ath_date.usd,
    atl: 0,
    atl_change_percentage: 0,
    atl_date: '',
    last_updated: new Date().toISOString(),
  };

  const toggleSaved = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/coin/${coin.id}` } });
      return;
    }
    if (isSaved) await removeCoin(coin.id);
    else await addCoin(fallbackMarket);
  };

  const homepage = coin.links.homepage.find(Boolean);

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
      <Button component={RouterLink} to="/markets" color="inherit" startIcon={<ArrowBackRounded />} sx={{ mb: 2 }}>
        Back to markets
      </Button>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CoinAvatar src={coin.image.large} name={coin.name} size={58} />
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h4">{coin.name}</Typography>
              <Typography color="text.secondary" sx={{ fontWeight: 800 }}>{coin.symbol.toUpperCase()}</Typography>
              <Chip size="small" label={`#${coin.market_cap_rank}`} />
            </Stack>
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mt: 0.4 }}>
              <Typography className="tabular-numbers" variant="h5">{formatCurrency(usd)}</Typography>
              <PriceChange value={coin.market_data.price_change_percentage_24h} />
            </Stack>
          </Box>
        </Stack>
        <Button
          variant={isSaved ? 'outlined' : 'contained'}
          startIcon={isSaved ? <StarRounded /> : <StarBorderRounded />}
          onClick={() => void toggleSaved()}
        >
          {isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 290px' }, gap: 2 }}>
        <Stack spacing={2}>
          <MarketChart coinId={coin.id} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1.25 }}>
            <MetricCard label="24h low" value={formatCurrency(coin.market_data.low_24h.usd)} />
            <MetricCard label="24h high" value={formatCurrency(coin.market_data.high_24h.usd)} />
            <MetricCard label="24h volume" value={formatCurrency(coin.market_data.total_volume.usd, true)} />
          </Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Market statistics</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Stat label="Market cap" value={formatCurrency(coin.market_data.market_cap.usd, true)} />
                <Stat label="All-time high" value={formatCurrency(coin.market_data.ath.usd)} />
                <Stat label="Circulating supply" value={`${formatNumber(coin.market_data.circulating_supply)} ${coin.symbol.toUpperCase()}`} />
                <Stat label="Max supply" value={coin.market_data.max_supply ? formatNumber(coin.market_data.max_supply) : 'Unlimited'} />
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">About {coin.name}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.75 }}>
                {stripHtml(coin.description.en).slice(0, 640) || `CoinGecko does not currently provide a description for ${coin.name}.`}
              </Typography>
              {homepage && (
                <Link href={homepage} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  Official website <LinkRounded fontSize="small" />
                </Link>
              )}
            </CardContent>
          </Card>
        </Stack>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6">Watchlist status</Typography>
              <Divider sx={{ my: 1.5 }} />
              {user ? (
                <Alert severity={isSaved ? 'success' : 'info'}>
                  {isSaved ? `${coin.name} is saved to your local watchlist.` : 'Add this asset to track it in your protected view.'}
                </Alert>
              ) : (
                <Alert severity="info">Sign in to save this asset and manage price alerts.</Alert>
              )}
              <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => void toggleSaved()}>
                {isSaved ? 'Remove asset' : user ? 'Save asset' : 'Sign in'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">Categories</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                {coin.categories.slice(0, 8).map((category) => <Chip key={category} size="small" label={category} />)}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography className="tabular-numbers" sx={{ mt: 0.35, fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}
