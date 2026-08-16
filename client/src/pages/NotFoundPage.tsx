/* Design direction: Direct recovery page that preserves the application shell and route clarity. */
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
          404
        </Typography>
        <Typography variant="h2">Market route not found</Typography>
        <Typography color="text.secondary">The requested page is unavailable or the asset link has changed.</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Return to market overview
        </Button>
      </Stack>
    </Container>
  );
}
