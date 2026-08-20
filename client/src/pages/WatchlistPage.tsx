/* Design direction: Protected tracked-assets workspace with local alert controls and clear saved-state feedback. */
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/MetricCard';
import { CoinAvatar } from '@/components/CoinAvatar';
import { PriceChange } from '@/components/PriceChange';
import { Sparkline } from '@/components/Sparkline';
import { useMarketData } from '@/contexts/MarketDataContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import type { WatchlistItem } from '@/types';
import { formatCurrency } from '@/utils/format';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { markets } = useMarketData();
  const { items, loading, removeCoin, setAlert } = useWatchlist();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<WatchlistItem | null>(null);
  const [target, setTarget] = useState('');
  const [notice, setNotice] = useState('');

  const rows = useMemo(
    () => items.filter((item) => `${item.coinName} ${item.symbol}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );
  const enriched = rows.map((item) => ({ item, market: markets.find((coin) => coin.id === item.coinId) }));
  const available = enriched.filter((row) => row.market);
  const best = [...available].sort((left, right) => (right.market?.price_change_percentage_24h ?? 0) - (left.market?.price_change_percentage_24h ?? 0))[0];
  const averageChange = available.length
    ? available.reduce((sum, row) => sum + (row.market?.price_change_percentage_24h ?? 0), 0) / available.length
    : 0;

  const openAlert = (item: WatchlistItem) => {
    setEditing(item);
    setTarget(item.alertTarget?.toString() ?? '');
  };

  const saveAlert = async () => {
    if (!editing) return;
    const parsedTarget = target ? Number(target) : null;
    await setAlert(editing.coinId, true, Number.isFinite(parsedTarget) ? parsedTarget : null);
    setNotice(`${editing.coinName} price alert updated.`);
    setEditing(null);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">My Watchlist</Typography>
          <Typography color="text.secondary">Assets saved in your local SQLite database</Typography>
        </Box>
        <Button component={RouterLink} to="/markets" variant="contained" startIcon={<StarRounded />}>Browse markets</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.25, mb: 2 }}>
        <MetricCard label="Saved assets" value={String(items.length)} />
        <MetricCard label="Price alerts" value={String(items.filter((item) => item.alertEnabled).length)} />
        <MetricCard label="Average 24h" value={`${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(2)}%`} />
        <MetricCard label="Best performer" value={best?.market?.symbol.toUpperCase() ?? '—'} detail={best?.market ? <PriceChange value={best.market.price_change_percentage_24h} compact /> : undefined} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 300px' }, gap: 2 }}>
        <Card>
          <CardContent>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter watched assets"
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> } }}
              sx={{ mb: 2 }}
            />
            {loading ? (
              <Typography color="text.secondary">Loading saved assets…</Typography>
            ) : enriched.length === 0 ? (
              <Alert severity="info">Your watchlist is empty. Add an asset from Markets or an asset detail page.</Alert>
            ) : (
              <Stack spacing={0.5}>
                {enriched.map(({ item, market }) => (
                  <Box
                    key={item.coinId}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '34px minmax(0,1fr) auto', md: '40px minmax(130px,1fr) 110px 100px 110px 90px' },
                      gap: 1,
                      alignItems: 'center',
                      p: 1.25,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <CoinAvatar src={item.image} name={item.coinName} size={32} />
                    <Button color="inherit" onClick={() => navigate(`/coin/${item.coinId}`)} sx={{ minWidth: 0, justifyContent: 'flex-start', p: 0 }}>
                      <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                        <Typography noWrap sx={{ fontWeight: 800, fontSize: 13 }}>{item.coinName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.symbol.toUpperCase()}</Typography>
                      </Box>
                    </Button>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography className="tabular-numbers" sx={{ fontWeight: 800, fontSize: 13 }}>{formatCurrency(market?.current_price)}</Typography>
                      <Box sx={{ display: { md: 'none' } }}><PriceChange value={market?.price_change_percentage_24h} compact /></Box>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}><PriceChange value={market?.price_change_percentage_24h} compact /></Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}><Sparkline values={market?.sparkline_in_7d?.price} width={90} /></Box>
                    <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                      <Switch checked={item.alertEnabled} onChange={(_, checked) => checked ? openAlert(item) : void setAlert(item.coinId, false, item.alertTarget)} />
                      <IconButton size="small" onClick={() => openAlert(item)} aria-label={`Edit ${item.coinName} alert`}><NotificationsActiveOutlined fontSize="small" /></IconButton>
                    </Stack>
                    <IconButton aria-label={`Remove ${item.coinName}`} onClick={() => void removeCoin(item.coinId)}><DeleteOutlineRounded /></IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card sx={{ height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6">Price alerts</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, mb: 2 }}>
              Alert targets are stored locally as preferences. This static app does not send background notifications when closed.
            </Typography>
            <Stack spacing={1}>
              {items.filter((item) => item.alertEnabled).map((item) => (
                <Button key={item.coinId} color="inherit" onClick={() => openAlert(item)} sx={{ justifyContent: 'space-between' }}>
                  <span>{item.symbol.toUpperCase()}</span>
                  <span>{item.alertTarget ? formatCurrency(item.alertTarget) : 'Target not set'}</span>
                </Button>
              ))}
              {items.every((item) => !item.alertEnabled) && <Alert severity="info">No active price alerts.</Alert>}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Set {editing?.coinName} alert</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Target price (USD)"
            type="number"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void saveAlert()}>Save alert</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={3200} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
}
