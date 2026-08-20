/* Design direction: Quiet in-row trend signal that never competes with primary values. */
import Box from '@mui/material/Box';

export function Sparkline({ values, width = 92, height = 34 }: { values?: number[]; width?: number; height?: number }) {
  if (!values || values.length < 2) {
    return <Box sx={{ width, height, bgcolor: 'action.hover', borderRadius: 1 }} />;
  }

  const sampled = values.filter((_, index) => index % Math.max(1, Math.floor(values.length / 36)) === 0).slice(-36);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const points = sampled
    .map((value, index) => `${(index / (sampled.length - 1)) * width},${height - ((value - min) / range) * (height - 4) - 2}`)
    .join(' ');
  const positive = sampled[sampled.length - 1] >= sampled[0];

  return (
    <svg width={width} height={height} role="img" aria-label={positive ? 'Positive price trend' : 'Negative price trend'}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#37D58A' : '#F26B70'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
