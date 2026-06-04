import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SpeedIcon from '@mui/icons-material/Speed';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { title: 'Check Fines', desc: 'Instant access to section details and fine amounts.', icon: <LocalAtmIcon color="primary" /> },
    { title: 'Contest Fines', desc: 'Expert advice on how to legally dispute wrong tickets.', icon: <VerifiedUserIcon color="primary" /> },
    { title: 'Risk Score', desc: 'Calculate your driver safety index automatically.', icon: <SpeedIcon color="primary" /> },
    { title: 'Rule Alerts', desc: 'Stay updated with new traffic amendments and rules.', icon: <WarningAmberIcon color="primary" /> },
  ];

  const valueProps = [
    { 
      icon: "🚫", 
      title: "Smart Violation Guidance", 
      desc: "Get instant explanations for traffic violations, legal sections, and penalty amounts based on real traffic regulations.",
      image: "https://images.unsplash.com/photo-1590492800080-6927d7fc8ca9?auto=format&fit=crop&q=80&w=600"
    },
    { 
      icon: "⚖️", 
      title: "Fine Verification", 
      desc: "Check whether a challan amount is valid and understand when a fine may be incorrect or excessive.",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600"
    },
    { 
      icon: "📊", 
      title: "Driver Risk Insights", 
      desc: "TRAK analyzes repeated traffic behavior patterns to help users identify risky driving habits early.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F6F0', position: 'relative', overflow: 'hidden' }}>
      {/* Hero Background Layer */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: { xs: '600px', md: '800px' },
        backgroundImage: 'url("https://images.unsplash.com/photo-1545147986-a9d6f210df77?auto=format&fit=crop&q=80&w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        filter: 'blur(2px)',
        opacity: 0.5,
        zIndex: 0
      }} />
      
      {/* Dark Overlay Layer for Contrast */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: { xs: '600px', md: '800px' },
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.15))',
        zIndex: 1
      }} />

      {/* Depth Layer with branding colors */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: { xs: '600px', md: '800px' },
        background: 'linear-gradient(to right, rgba(248,246,240,0.15), rgba(248,246,240,0.05))',
        zIndex: 2
      }} />

      {/* Blend Layer to page background */}
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: '500px', md: '700px' }, 
        left: 0, 
        right: 0, 
        height: '100px',
        background: 'linear-gradient(to bottom, transparent, #F8F6F0)',
        zIndex: 3
      }} />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 6, md: 10 } }}>
          <Logo size="medium" />
          <Button variant="outlined" color="primary" onClick={() => navigate('/dashboard')} sx={{ borderRadius: "12px", display: { xs: 'none', sm: 'inline-flex' } }}>
            Dashboard
          </Button>
        </Box>

        <Box sx={{ 
          mb: { xs: 8, md: 12 }, 
          textAlign: 'center', 
          pt: { xs: 2, md: 8 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '600px',
            height: '100%',
            maxHeight: '300px',
            background: 'rgba(255,255,255,0.15)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            zIndex: -1,
            pointerEvents: 'none'
          }
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              color: '#1A1A1A', 
              mb: 3, 
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 2px 10px rgba(255,255,255,0.2)',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' }
            }}
          >
            Track rules. <br />
            <Box component="span" sx={{ color: 'primary.main' }}>Avoid fines.</Box>
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(57, 71, 94, 0.9)', 
              mb: 6, 
              maxWidth: '800px', 
              mx: 'auto', 
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              px: 2,
              fontWeight: 500
            }}
          >
            TRAK is your modern traffic law assistant. Get instant answers to violations and manage your driver profile with ease.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            endIcon={<ChevronRightIcon />}
            onClick={() => navigate('/auth')}
            sx={{ 
              px: { xs: 6, md: 8 }, 
              py: 2, 
              borderRadius: "12px", 
              fontSize: '1.1rem', 
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.3s ease',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 15px 40px rgba(37, 99, 235, 0.4)'
              }
            }}
          >
            Try Now
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 12 }}>
          {features.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  borderRadius: "12px",
                  border: 'none',
                  transition: 'all 0.3s ease',
                  bgcolor: 'white',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }
                }}
              >
                <Box sx={{ mb: 3, bgcolor: 'rgba(37, 99, 235, 0.05)', width: 50, height: 50, borderRadius: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: 'secondary.main', lineHeight: 1.6 }}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 15, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#1A1A1A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Why Drivers Use TRAK
          </Typography>
          <Typography variant="body1" sx={{ color: 'secondary.main', mb: { xs: 6, md: 10 }, maxWidth: '800px', mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' }, px: 2 }}>
            TRAK helps drivers understand traffic laws, avoid unnecessary penalties, and stay informed with location-aware legal guidance.
          </Typography>
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {valueProps.map((v, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 0, 
                    borderRadius: "12px", 
                    bgcolor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    minHeight: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      '& .card-image': { opacity: 1, transform: 'scale(1.05)' },
                      '& .card-content': { color: 'white', zIndex: 2 },
                      '& .card-overlay': { opacity: 0.85 }
                    }
                  }}
                >
                  {/* Hover Image */}
                  <Box 
                    className="card-image"
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${v.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0,
                      transition: 'all 0.5s ease',
                      zIndex: 0
                    }} 
                  />
                  {/* Overlay */}
                  <Box 
                    className="card-overlay"
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(112, 134, 88, 0.95))',
                      opacity: 0,
                      transition: 'all 0.5s ease',
                      zIndex: 1
                    }} 
                  />
                  
                  {/* Content Container */}
                  <Box className="card-content" sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 2, transition: 'all 0.4s' }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>{v.icon}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{v.title}</Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>{v.desc}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 15, textAlign: 'center', pb: 10 }}>
          <Stack direction="row" spacing={2} sx={{ opacity: 0.5, justifyContent: 'center' }}>
            <Typography variant="body2">Trusted by 10k+ Drivers</Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2">Privacy First</Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2">Secure Data</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
