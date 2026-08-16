/* Design direction: Structured interim canvas aligned to the market terminal content rhythm. */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function TemporaryPage({ title }: { title: string }) {
  return (
    <Container maxWidth={false} sx={{ py: { xs: 3, md: 4 }, pb: { xs: 11, md: 4 } }}>
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Live market data and controls are loading.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
        <Stack spacing={1.4}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={360} />
        </Stack>
        <Skeleton variant="rounded" height={220} />
      </Box>
    </Container>
  );
}
