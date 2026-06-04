import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge,
  Menu, MenuItem, Divider, List, ListItemText,
  Dialog, DialogTitle, DialogContent, Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  handleDrawerToggle: () => void;
}

// ─── Avatar options ───────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { id: 'person', label: 'Individual', icon: <PersonIcon sx={{ fontSize: 32 }} /> },
  { id: 'car',    label: 'Car',        icon: <DirectionsCarIcon sx={{ fontSize: 32 }} /> },
  { id: 'bike',   label: 'Bike',       icon: <TwoWheelerIcon sx={{ fontSize: 32 }} /> },
  { id: 'auto',   label: 'Auto',       icon: <AirportShuttleIcon sx={{ fontSize: 32 }} /> },
  { id: 'bus',    label: 'Bus',        icon: <DirectionsBusIcon sx={{ fontSize: 32 }} /> },
];

const AVATAR_BG: Record<string, string> = {
  person: '#DBEAFE', car: '#D1FAE5', bike: '#FEF3C7', auto: '#EDE9FE', bus: '#FCE7F3',
};
const AVATAR_COLOR: Record<string, string> = {
  person: '#2563EB', car: '#059669', bike: '#D97706', auto: '#7C3AED', bus: '#DB2777',
};

const Topbar: React.FC<TopbarProps> = ({ handleDrawerToggle }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl,       setAnchorEl]       = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl,  setNotifAnchorEl]  = React.useState<null | HTMLElement>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState<string>('person');

  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':          return 'Law Assistant';
      case '/dashboard/chat':     return 'Law Assistant';
      case '/dashboard/risk':     return 'Risk Profile';
      case '/dashboard/alerts':   return 'Traffic Alerts';
      case '/dashboard/profile':  return 'Profile';
      case '/dashboard/settings': return 'Settings';
      default:                    return 'Dashboard';
    }
  };

  const handleMenu      = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleNotifMenu = (e: React.MouseEvent<HTMLElement>) => setNotifAnchorEl(e.currentTarget);
  const handleClose     = () => { setAnchorEl(null); setNotifAnchorEl(null); };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/auth');
  };

  const currentOption = AVATAR_OPTIONS.find((o) => o.id === selectedAvatar)!;

  // Initials fallback from real user
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          height: { xs: 56, md: 64 },
          bgcolor: 'white',
          color: 'text.primary',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          {/* ── Left ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 0.5, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <IconButton
              onClick={handleBack}
              sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' }, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>

            <Box sx={{ transform: { xs: 'scale(0.9)', sm: 'scale(1)' }, transformOrigin: 'left center' }}>
              <Logo size="small" />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'text.secondary', ml: 0.5, display: { xs: 'none', md: 'block' } }}
            >
              {getTitle()}
            </Typography>
          </Box>

          {/* ── Right ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton onClick={handleNotifMenu} size="large">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Avatar button */}
            <Tooltip title={user?.full_name ?? 'Account'}>
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  border: `1.5px solid ${AVATAR_COLOR[selectedAvatar]}44`,
                  borderRadius: '12px',
                  bgcolor: AVATAR_BG[selectedAvatar],
                  '&:hover': { opacity: 0.85 },
                }}
              >
                <Box
                  sx={{
                    width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: AVATAR_COLOR[selectedAvatar],
                    fontWeight: 700, fontSize: '0.85rem',
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {/* Show initials from real user if available, else the icon */}
                  {initials || currentOption.icon}
                </Box>
              </IconButton>
            </Tooltip>

            {/* ── Notifications Menu ── */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleClose}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              slotProps={{ paper: { sx: { mt: 1.5, minWidth: 280, borderRadius: '12px' } } }}
            >
              <Typography variant="overline" sx={{ px: 2, py: 1, fontWeight: 700, color: 'secondary.main', display: 'block' }}>
                Notifications
              </Typography>
              <List sx={{ p: 0 }}>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary="New traffic rule updated"
                    secondary="Section 183(1) regarding overspeeding..."
                    slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } }, secondary: { variant: 'caption' } }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary="High risk warning"
                    secondary="Your risk score dropped below 50."
                    slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } }, secondary: { variant: 'caption' } }}
                  />
                </MenuItem>
              </List>
            </Menu>

            {/* ── User Menu ── */}
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              slotProps={{ paper: { sx: { mt: 1.5, minWidth: 190, borderRadius: '12px' } } }}
            >
              {/* User info header */}
              {user && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.full_name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                </Box>
              )}
              <MenuItem
                onClick={() => { handleClose(); setAvatarPickerOpen(true); }}
                sx={{ fontSize: '0.88rem', fontWeight: 500, color: 'text.secondary', py: 1, mt: 0.5 }}
              >
                Change Avatar
              </MenuItem>
              <MenuItem
                onClick={() => { handleClose(); navigate('/dashboard/profile'); }}
                sx={{ fontSize: '0.88rem', fontWeight: 500, py: 1 }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => { handleClose(); navigate('/dashboard/settings'); }}
                sx={{ fontSize: '0.88rem', fontWeight: 500, py: 1 }}
              >
                Settings
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ fontSize: '0.88rem', fontWeight: 500, color: 'error.main', py: 1 }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Avatar Picker Dialog ── */}
      <Dialog
        open={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1, minWidth: 340 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          Choose your avatar
        </DialogTitle>
        <DialogContent>
          {/* Replaced Grid with flex Box to avoid MUI version issues */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = selectedAvatar === opt.id;
              return (
                <Box
                  key={opt.id}
                  onClick={() => { setSelectedAvatar(opt.id); setAvatarPickerOpen(false); }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.75,
                    cursor: 'pointer',
                    p: 1.5,
                    width: 80,
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: isSelected ? AVATAR_COLOR[opt.id] : 'rgba(0,0,0,0.08)',
                    bgcolor: isSelected ? AVATAR_BG[opt.id] : 'rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: AVATAR_BG[opt.id] },
                  }}
                >
                  <Box sx={{ color: AVATAR_COLOR[opt.id], '& svg': { fontSize: 36 } }}>
                    {opt.icon}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: isSelected ? 700 : 500, color: 'text.secondary' }}>
                    {opt.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Topbar;