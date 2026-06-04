import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems = [
    { text: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
    { text: 'Chat',       icon: <ChatIcon />,               path: '/dashboard/chat' },
    { text: 'Risk Score', icon: <AssessmentIcon />,         path: '/dashboard/risk' },
    { text: 'Alerts',     icon: <NotificationsActiveIcon />, path: '/dashboard/alerts' },
    { text: 'Profile',    icon: <PersonOutlineIcon />,      path: '/dashboard/profile' },
    { text: 'Settings',   icon: <SettingsOutlinedIcon />,   path: '/dashboard/settings' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    handleDrawerToggle();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const drawer = (
    <>
      {/* Brand */}
      <Box sx={{ mb: 4, pl: 2, height: 40, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.1em' }}>
          TRAK
        </Typography>
      </Box>

      {/* Main Menu */}
      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, mb: 1, pl: 2, letterSpacing: '0.1em' }}>
        MENU
      </Typography>

      <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column', mb: 3 }}>
        {mainItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontWeight: active ? 600 : 500, fontSize: '0.92rem' } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* Quick Links */}
      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, mb: 1, pl: 2, letterSpacing: '0.1em' }}>
        QUICK LINKS
      </Typography>
      <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column', mb: 3 }}>
        {[
          { text: 'Parivahan',   url: 'https://parivahan.gov.in' },
          { text: 'E-Challan',   url: 'https://echallan.parivahan.gov.in' },
          { text: 'Sarathi (DL)', url: 'https://sarathi.parivahan.gov.in' },
        ].map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton
              component="a" href={link.url} target="_blank" rel="noopener noreferrer"
              sx={{
                borderRadius: '12px', color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(37, 99, 235, 0.04)', color: 'primary.main',
                  '& .MuiSvgIcon-root': { opacity: 1, color: 'primary.main' },
                },
              }}
            >
              <ListItemText primary={link.text} slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: 500 } } }} />
              <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.5, ml: 1 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* Logout */}
      <List sx={{ mb: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { handleDrawerToggle(); onLogout?.(); }}
            sx={{ borderRadius: '12px', color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.06)' } }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontWeight: 500, fontSize: '0.92rem' } } }} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', px: 2 }}>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', mb: 0.5, '&:hover': { textDecoration: 'underline' } }}
          onClick={() => alert('Feedback feature coming soon!')}>
          Send Feedback
        </Typography>
        <Typography variant="caption" sx={{ color: 'secondary.main' }}>TRAK v1.0.0</Typography>
      </Box>
    </>
  );

  const paperSx = {
    width: drawerWidth, boxSizing: 'border-box' as const,
    bgcolor: 'white', px: 2, py: 4,
    display: 'flex', flexDirection: 'column' as const,
  };

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': paperSx }}>
        {drawer}
      </Drawer>
      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { ...paperSx, borderRight: '1px solid rgba(0,0,0,0.05)' } }}
        open>
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;