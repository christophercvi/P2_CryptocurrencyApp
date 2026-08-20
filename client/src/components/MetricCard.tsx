/* Design direction: Compact terminal metric with restrained depth and one semantic signal. */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card sx={{ minWidth: 0, background: 'linear-gradient(145deg, rgba(91,124,250,0.06), transparent 58%)' }}>
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2.25 } } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          {icon}
        </Stack>
        <Typography className="tabular-numbers" variant="h5" sx={{ fontSize: { xs: '1.05rem', sm: '1.28rem' } }}>
          {value}
        </Typography>
        {detail && <BoxDetail>{detail}</BoxDetail>}
      </CardContent>
    </Card>
  );
}

function BoxDetail({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: 6, minHeight: 22 }}>{children}</div>;
}
