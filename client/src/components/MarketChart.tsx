/* Design direction: Theme-synchronized financial canvas with compact range and mode controls. */
import CandlestickChartOutlined from '@mui/icons-material/CandlestickChartOutlined';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  CandlestickSeries,
  Chart,
  LineSeries,
  TimeScale,
  TimeScaleFitContentTrigger,
} from 'lightweight-charts-react-components';
import type { CandlestickData, LineData, Time, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useMemo, useState } from 'react';
import { fetchMarketChart, fetchOhlc } from '@/services/marketApi';
import type { ChartMode, ChartRange, MarketApiError } from '@/types';
import { DataError } from './DataState';

const ranges: { value: ChartRange; label: string }[] = [
  { value: '1', label: '24H' },
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '365', label: '1Y' },
  { value: 'max', label: 'All' },
];

export function MarketChart({ coinId }: { coinId: string }) {
  const theme = useTheme();
  const [range, setRange] = useState<ChartRange>('7');
  const [mode, setMode] = useState<ChartMode>('line');
  const [lineData, setLineData] = useState<LineData<Time>[]>([]);
  const [candleData, setCandleData] = useState<CandlestickData<Time>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MarketApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (mode === 'line') {
          const response = await fetchMarketChart(coinId, range);
          if (!active) return;
          setLineData(
            response.prices.map(([time, value]) => ({
              time: Math.floor(time / 1000) as UTCTimestamp,
              value,
            })),
          );
        } else {
          const response = await fetchOhlc(coinId, range);
          if (!active) return;
          setCandleData(
            response.map(([time, open, high, low, close]) => ({
              time: Math.floor(time / 1000) as UTCTimestamp,
              open,
              high,
              low,
              close,
            })),
          );
        }
      } catch (caughtError) {
        if (active) setError(caughtError as MarketApiError);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [coinId, mode, range, reloadKey]);

  const chartOptions = useMemo(
    () => ({
      layout: {
        background: { color: theme.palette.background.paper },
        textColor: theme.palette.text.secondary,
        fontFamily: 'Manrope, sans-serif',
      },
      grid: {
        vertLines: { color: theme.palette.divider },
        horzLines: { color: theme.palette.divider },
      },
      rightPriceScale: { borderColor: theme.palette.divider },
      timeScale: { borderColor: theme.palette.divider, timeVisible: range === '1' },
      crosshair: {
        vertLine: { color: '#5B7CFA', labelBackgroundColor: '#5B7CFA' },
        horzLine: { color: '#5B7CFA', labelBackgroundColor: '#5B7CFA' },
      },
      autoSize: true,
    }),
    [range, theme],
  );

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.25 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">Price history</Typography>
            <Typography variant="caption" color="text.secondary">
              Interactive CoinGecko market data
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, next: ChartMode | null) => next && setMode(next)}
              aria-label="Chart type"
            >
              <ToggleButton value="line" aria-label="Line chart"><ShowChartRounded fontSize="small" /></ToggleButton>
              <ToggleButton value="candlestick" aria-label="Candlestick chart"><CandlestickChartOutlined fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={range}
              onChange={(_, next: ChartRange | null) => next && setRange(next)}
              aria-label="Chart range"
            >
              {ranges.map((item) => <ToggleButton key={item.value} value={item.value}>{item.label}</ToggleButton>)}
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {loading ? (
          <Stack sx={{ minHeight: 360, alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress aria-label="Loading chart" />
          </Stack>
        ) : error ? (
          <DataError error={error} onRetry={() => setReloadKey((value) => value + 1)} compact />
        ) : mode === 'candlestick' && candleData.length === 0 ? (
          <Alert severity="info">No candlestick data is available for this range.</Alert>
        ) : (
          <Box sx={{ width: '100%', height: { xs: 300, sm: 380 } }}>
            <Chart
              options={chartOptions}
              containerProps={{ style: { width: '100%', height: '100%' } }}
            >
              {mode === 'line' ? (
                <LineSeries
                  data={lineData}
                  options={{ color: '#22D3EE', lineWidth: 2, crosshairMarkerBackgroundColor: '#5B7CFA' }}
                />
              ) : (
                <CandlestickSeries
                  data={candleData}
                  options={{
                    upColor: '#37D58A',
                    downColor: '#F26B70',
                    borderUpColor: '#37D58A',
                    borderDownColor: '#F26B70',
                    wickUpColor: '#37D58A',
                    wickDownColor: '#F26B70',
                  }}
                />
              )}
              <TimeScale>
                <TimeScaleFitContentTrigger deps={[mode, range, lineData.length, candleData.length]} />
              </TimeScale>
            </Chart>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
