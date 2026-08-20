/* Design direction: Compact semantic market movement with tabular numerals. */
import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded';
import ArrowDropUpRounded from '@mui/icons-material/ArrowDropUpRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatPercentage } from '@/utils/format';

export function PriceChange({ value, compact = false }: { value?: number | null; compact?: boolean }) {
  const positive = (value ?? 0) >= 0;
  const color = positive ? 'success.main' : 'error.main';
  const Icon = positive ? ArrowDropUpRounded : ArrowDropDownRounded;

  return (
    <Stack direction="row" spacing={0.1} sx={{ alignItems: 'center', color }}>
      <Icon sx={{ fontSize: compact ? 17 : 20 }} />
      <Typography className="tabular-numbers" sx={{ color: 'inherit', fontSize: compact ? 12 : 13, fontWeight: 800 }}>
        {formatPercentage(value)}
      </Typography>
    </Stack>
  );
}
