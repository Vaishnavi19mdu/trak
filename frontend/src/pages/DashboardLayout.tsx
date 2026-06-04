import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isChat = location.pathname.includes('/chat');

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} onLogout={handleLogout} />

      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // On mobile the nav sidebar is hidden (drawer), so take full width
        width: { xs: '100%', sm: `calc(100% - 260px)` },
        height: '100vh',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Topbar handleDrawerToggle={handleDrawerToggle} />

        {isChat ? (
          <Box sx={{
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            // No padding on mobile — every pixel counts in the chat view
            p: { xs: 0, sm: 1.5 },
            gap: 0,
            minWidth: 0,
          }}>
            <Outlet />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: '100px' }}>
              <Outlet />
            </Container>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout;