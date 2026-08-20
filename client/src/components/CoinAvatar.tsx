/* Design direction: API-first asset identity with a compact branded fallback that never shows a broken image. */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function CoinAvatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'rgba(91,124,250,0.13)',
        color: 'primary.main',
        border: '1px solid rgba(91,124,250,0.22)',
      }}
    >
      <Typography sx={{ fontSize: size * 0.38, fontWeight: 800, lineHeight: 1 }}>{name.slice(0, 1).toUpperCase()}</Typography>
      {src && (
        <Box
          component="img"
          src={src}
          alt={`${name} logo`}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          sx={{ position: 'absolute', inset: 0, width: size, height: size, borderRadius: '50%', objectFit: 'contain' }}
        />
      )}
    </Box>
  );
}
