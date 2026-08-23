/* Design direction: Desktop market table becomes a compact touch-first list without horizontal scrolling. */
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import type { CoinMarket } from '@/types';
import { formatCurrency } from '@/utils/format';
import { PriceChange } from './PriceChange';
import { Sparkline } from './Sparkline';
import { CoinAvatar } from './CoinAvatar';

type SortOption = 'market-cap' | 'price' | 'gainers' | 'losers';

export function MarketTable({ coins, limit }: { coins: CoinMarket[]; limit?: number }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { hasCoin, addCoin, removeCoin } = useWatchlist();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [sort, setSort] = useState<SortOption>('market-cap');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = limit ?? 12;

  useEffect(() => {
    setSearch(params.get('search') ?? '');
  }, [params]);

  const visible = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    let rows = coins.filter(
      (coin) => !normalized || coin.name.toLowerCase().includes(normalized) || coin.symbol.toLowerCase().includes(normalized),
    );

    if (filter === 'gainers') rows = rows.filter((coin) => coin.price_change_percentage_24h > 0);
    if (filter === 'losers') rows = rows.filter((coin) => coin.price_change_percentage_24h < 0);

    rows = [...rows].sort((left, right) => {
      if (sort === 'price') return right.current_price - left.current_price;
      if (sort === 'gainers') return right.price_change_percentage_24h - left.price_change_percentage_24h;
      if (sort === 'losers') return left.price_change_percentage_24h - right.price_change_percentage_24h;
      return left.market_cap_rank - right.market_cap_rank;
    });

    return rows;
  }, [coins, filter, search, sort]);

  useEffect(() => setPage(1), [filter, search, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / rowsPerPage));
  const rows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleWatchlist = async (coin: CoinMarket) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (hasCoin(coin.id)) await removeCoin(coin.id);
    else await addCoin(coin);
  };

  return (
    <Card>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or symbol"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> } }}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} sx={{ minWidth: 170 }}>
            <MenuItem value="market-cap">Market cap rank</MenuItem>
            <MenuItem value="price">Highest price</MenuItem>
            <MenuItem value="gainers">Top gainers</MenuItem>
            <MenuItem value="losers">Top losers</MenuItem>
          </Select>
          <Stack direction="row" spacing={0.75}>
            {(['all', 'gainers', 'losers'] as const).map((value) => (
              <Chip
                key={value}
                label={value === 'all' ? 'Market cap' : value[0].toUpperCase() + value.slice(1)}
                color={filter === value ? 'primary' : 'default'}
                variant={filter === value ? 'filled' : 'outlined'}
                onClick={() => setFilter(value)}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="small" aria-label="Cryptocurrency market">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">24h</TableCell>
              <TableCell align="right">Market cap</TableCell>
              <TableCell align="center">7d trend</TableCell>
              <TableCell align="center">Watchlist</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((coin) => (
              <TableRow key={coin.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/coin/${coin.id}`)}>
                <TableCell>{coin.market_cap_rank}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                    <CoinAvatar src={coin.image} name={coin.name} size={30} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{coin.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{coin.symbol.toUpperCase()}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="right" className="tabular-numbers">{formatCurrency(coin.current_price)}</TableCell>
                <TableCell align="right"><Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><PriceChange value={coin.price_change_percentage_24h} compact /></Box></TableCell>
                <TableCell align="right" className="tabular-numbers">{formatCurrency(coin.market_cap, true)}</TableCell>
                <TableCell align="center"><Sparkline values={coin.sparkline_in_7d?.price} /></TableCell>
                <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                  <Tooltip title={hasCoin(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}>
                    <IconButton onClick={() => void toggleWatchlist(coin)} color={hasCoin(coin.id) ? 'primary' : 'default'}>
                      {hasCoin(coin.id) ? <StarRounded /> : <StarBorderRounded />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack sx={{ display: { xs: 'flex', md: 'none' }, p: 1.2 }} spacing={0.4}>
        {rows.map((coin) => (
          <Box
            key={coin.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/coin/${coin.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') navigate(`/coin/${coin.id}`);
            }}
            sx={{
              display: 'grid',
              gridTemplateColumns: '30px minmax(0,1fr) auto auto',
              gap: 1,
              alignItems: 'center',
              py: 1.2,
              px: 0.75,
              textAlign: 'left',
              borderRadius: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 1 },
            }}
          >
            <CoinAvatar src={coin.image} name={coin.name} size={28} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: 13 }}>{coin.name}</Typography>
              <Typography variant="caption" color="text.secondary">#{coin.market_cap_rank} · {coin.symbol.toUpperCase()}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography className="tabular-numbers" sx={{ fontWeight: 800, fontSize: 13 }}>{formatCurrency(coin.current_price)}</Typography>
              <PriceChange value={coin.price_change_percentage_24h} compact />
            </Box>
            <IconButton
              size="small"
              aria-label={hasCoin(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={(event) => {
                event.stopPropagation();
                void toggleWatchlist(coin);
              }}
            >
              {hasCoin(coin.id) ? <StarRounded color="primary" /> : <StarBorderRounded />}
            </IconButton>
          </Box>
        ))}
      </Stack>

      {rows.length === 0 && (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">No assets match these filters</Typography>
          <Typography color="text.secondary">Clear the search or select another market view.</Typography>
        </Box>
      )}

      {!limit && pageCount > 1 && (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Page {page} of {pageCount}</Typography>
          <Stack direction="row" spacing={1}>
            <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button endIcon={<ArrowForwardRounded />} disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
