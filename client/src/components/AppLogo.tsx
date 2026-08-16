/* Design direction: Geometric Market Indigo mark with a crisp two-weight wordmark. */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type AppLogoProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function AppLogo({ compact = false, inverse = false }: AppLogoProps) {
  const size = compact ? 32 : 38;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          flex: '0 0 auto',
          display: 'grid',
          placeItems: 'center',
          clipPath: 'polygon(25% 7%, 75% 7%, 100% 50%, 75% 93%, 25% 93%, 0 50%)',
          bgcolor: '#5B7CFA',
          '&::after': {
            content: '""',
            width: '42%',
            height: '42%',
            borderRadius: '50%',
            bgcolor: '#0B1220',
            boxShadow: 'inset -3px -2px 0 #22D3EE',
          },
        }}
      >
        <Box
          component="img"
          src="/manus-storage/cryptocurrencyapp-logo_31524350.png"
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          sx={{ position: 'absolute', inset: 0, width: size, height: size, objectFit: 'contain' }}
        />
      </Box>
      {!compact && (
        <Typography
          component="span"
          sx={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color: inverse ? '#FFFFFF' : 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          Cryptocurrency<span style={{ color: '#5B7CFA' }}>App</span>
        </Typography>
      )}
    </Box>
  );
}
