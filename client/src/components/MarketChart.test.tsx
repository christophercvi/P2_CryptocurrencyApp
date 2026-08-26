import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketChart } from './MarketChart';

const marketApi = vi.hoisted(() => ({
  fetchMarketChart: vi.fn(),
  fetchOhlc: vi.fn(),
}));
const chartOptions = vi.hoisted(() => vi.fn());

vi.mock('@/services/marketApi', () => marketApi);
vi.mock('lightweight-charts-react-components', () => ({
  Chart: ({ children, options }: { children: React.ReactNode; options: unknown }) => {
    chartOptions(options);
    return <div data-testid="chart">{children}</div>;
  },
  LineSeries: () => <div data-testid="line-series" />,
  CandlestickSeries: () => <div data-testid="candlestick-series" />,
  TimeScale: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TimeScaleFitContentTrigger: () => null,
}));

function renderChart(mode: 'dark' | 'light' = 'dark') {
  return render(
    <ThemeProvider theme={createTheme({ palette: { mode } })}>
      <MarketChart coinId="bitcoin" />
    </ThemeProvider>,
  );
}

describe('MarketChart', () => {
  beforeEach(() => {
    marketApi.fetchMarketChart.mockReset().mockResolvedValue({
      prices: [[1_700_000_000_000, 70_000], [1_700_086_400_000, 80_000]],
      market_caps: [],
      total_volumes: [],
    });
    marketApi.fetchOhlc.mockReset().mockResolvedValue([
      [1_700_000_000_000, 70_000, 72_000, 69_000, 71_000],
    ]);
    chartOptions.mockReset();
  });

  it('renders a line series with the default seven-day range', async () => {
    renderChart('dark');
    expect(await screen.findByTestId('line-series')).toBeInTheDocument();
    expect(marketApi.fetchMarketChart).toHaveBeenCalledWith('bitcoin', '7');
    expect(chartOptions).toHaveBeenCalledWith(expect.objectContaining({ layout: expect.objectContaining({ textColor: expect.any(String) }) }));
  });

  it('switches to candlesticks and keeps the selected range control', async () => {
    const user = userEvent.setup();
    renderChart();
    await screen.findByTestId('line-series');
    await user.click(screen.getByRole('button', { name: 'Candlestick chart' }));
    expect(await screen.findByTestId('candlestick-series')).toBeInTheDocument();
    expect(marketApi.fetchOhlc).toHaveBeenCalledWith('bitcoin', '7');

    await user.click(screen.getByRole('button', { name: '30D' }));
    await waitFor(() => expect(marketApi.fetchOhlc).toHaveBeenLastCalledWith('bitcoin', '30'));
  });

  it('uses different chart surface colors for light and dark themes', async () => {
    const dark = renderChart('dark');
    await screen.findByTestId('line-series');
    const darkBackground = chartOptions.mock.calls.at(-1)?.[0].layout.background.color;
    dark.unmount();

    renderChart('light');
    await screen.findByTestId('line-series');
    const lightBackground = chartOptions.mock.calls.at(-1)?.[0].layout.background.color;
    expect(lightBackground).not.toBe(darkBackground);
  });
});
