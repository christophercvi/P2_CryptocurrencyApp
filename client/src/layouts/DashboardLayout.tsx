/* Design direction: Asymmetric market terminal with a persistent desktop rail and mobile bottom navigation. */
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import BarChartRounded from '@mui/icons-material/BarChartRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import DevicesOutlined from '@mui/icons-material/DevicesOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import NotificationsNoneRounded from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppLogo } from '@/components/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/theme/AppThemeProvider';

const drawerWidth = 88;

const navItems = [
  { label: 'Overview', path: '/', icon: <DashboardOutlined /> },
  { label: 'Markets', path: '/markets', icon: <BarChartRounded /> },
  { label: 'Watchlist', path: '/watchlist', icon: <StarBorderRounded /> },
  { label: 'Portfolio', path: '/portfolio', icon: <AccountBalanceWalletOutlined /> },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, preference, setPreference } = useAppTheme();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [themeAnchor, setThemeAnchor] = useState<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const runSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/markets?search=${encodeURIComponent(query)}` : '/markets');
  };

  const navList = (
    <Stack sx={{ height: '100%', alignItems: 'center', py: 2 }}>
      <AppLogo compact />
      <List sx={{ width: '100%', mt: 4, px: 1 }}>
        {navItems.map((item) => (
          <Tooltip title={item.label} placement="right" key={item.path}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              sx={{
                minHeight: 58,
                mb: 1,
                px: 0.75,
                borderRadius: 2,
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'text.secondary',
                '&.active': {
                  color: 'primary.main',
                  bgcolor: 'rgba(91, 124, 250, 0.10)',
                  boxShadow: 'inset 3px 0 #5B7CFA',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'inherit', mb: 0.25 }}>{item.icon}</ListItemIcon>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textAlign: 'center' }}>{item.label}</Typography>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Theme settings" placement="right">
        <IconButton onClick={(event) => setThemeAnchor(event.currentTarget)} aria-label="Choose theme">
          {preference === 'system' ? <DevicesOutlined /> : mode === 'dark' ? <DarkModeOutlined /> : <LightModeOutlined />}
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: 'rgba(11, 18, 32, 0.78)',
          color: '#F4F7FF',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(145,167,201,0.14)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, gap: 2 }}>
          <IconButton
            aria-label="Open navigation"
            color="inherit"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuRounded />
          </IconButton>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <AppLogo inverse />
          </Box>
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', lg: 'flex' }, ml: 2 }}>
            {navItems.slice(1, 4).map((item) => (
              <Button
                component={NavLink}
                to={item.path}
                key={item.path}
                color="inherit"
                sx={{
                  minWidth: 0,
                  px: 0.5,
                  borderRadius: 0,
                  color: 'rgba(244,247,255,0.68)',
                  borderBottom: '2px solid transparent',
                  '&.active': { color: '#FFFFFF', borderBottomColor: '#5B7CFA' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box component="form" onSubmit={runSearch} sx={{ flexGrow: 1, maxWidth: 520, ml: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search assets, symbols, categories…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: 'rgba(244,247,255,0.58)' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiOutlinedInput-root': {
                  color: '#F4F7FF',
                  bgcolor: 'rgba(2, 10, 24, 0.42)',
                  '& fieldset': { borderColor: 'rgba(145,167,201,0.18)' },
                },
              }}
            />
          </Box>
          <Tooltip title="Notifications">
            <IconButton color="inherit" aria-label="Notifications">
              <NotificationsNoneRounded />
            </IconButton>
          </Tooltip>
          {user ? (
            <>
              <IconButton color="inherit" onClick={(event) => setAccountAnchor(event.currentTarget)} aria-label="Account menu">
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, fontWeight: 800 }}>
                  {user.displayName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
                <MenuItem disabled>{user.email}</MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setAccountAnchor(null);
                    logout();
                    navigate('/login');
                  }}
                >
                  <LogoutRounded fontSize="small" sx={{ mr: 1.2 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button variant="contained" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper', borderRightColor: 'divider' },
        }}
      >
        {navList}
      </Drawer>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {navList}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 68 } }} />
        <Outlet />
      </Box>

      <BottomNavigation
        showLabels
        value={navItems.findIndex((item) => item.path === location.pathname)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            onClick={() => navigate(item.path)}
          />
        ))}
        {!user && (
          <BottomNavigationAction label="Sign in" icon={<PersonOutlineRounded />} onClick={() => navigate('/login')} />
        )}
      </BottomNavigation>
      <Menu anchorEl={themeAnchor} open={Boolean(themeAnchor)} onClose={() => setThemeAnchor(null)}>
        {([
          { value: 'dark' as const, label: 'Dark', icon: <DarkModeOutlined fontSize="small" /> },
          { value: 'light' as const, label: 'Light', icon: <LightModeOutlined fontSize="small" /> },
          { value: 'system' as const, label: 'Device Default', icon: <DevicesOutlined fontSize="small" /> },
        ]).map((item) => (
          <MenuItem
            key={item.value}
            selected={preference === item.value}
            onClick={() => {
              setPreference(item.value);
              setThemeAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
            {preference === item.value && <CheckRounded color="primary" fontSize="small" sx={{ ml: 2 }} />}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
