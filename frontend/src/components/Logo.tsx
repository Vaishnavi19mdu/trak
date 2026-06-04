import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DoneIcon from '@mui/icons-material/Done';

const Logo: React.FC<{ size?: 'small' | 'large' | 'medium', clickable?: boolean }> = ({ size = 'medium', clickable = true }) => {
  const navigate = useNavigate();
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const handleClick = () => {
    if (clickable) navigate('/');
  };

  return (
    <Box 
      onClick={handleClick}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        cursor: clickable ? 'pointer' : 'default',
        transition: "all 0.2s ease",
        '&:hover': clickable ? { 
          transform: "scale(1.03)",
          opacity: 0.9
        } : {}
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        width: isLarge ? 24 : 18, 
        height: isLarge ? 32 : 24,
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        mr: 0.5
      }}>
        {/* Road (2 vertical blue lines) */}
        <Box sx={{ width: 3, height: '100%', bgcolor: '#2563EB', borderRadius: 1 }} />
        <Box sx={{ width: 3, height: '100%', bgcolor: '#2563EB', borderRadius: 1 }} />
        
        {/* Green tick attached at bottom-right */}
        <Box sx={{ 
          position: 'absolute', 
          right: -8, 
          bottom: -2,
          bgcolor: '#708658',
          borderRadius: '4px',
          width: isLarge ? 14 : 12,
          height: isLarge ? 14 : 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white'
        }}>
          <DoneIcon sx={{ color: 'white', fontSize: isLarge ? 10 : 8, fontWeight: 900 }} />
        </Box>
      </Box>
      <Typography 
        variant={isLarge ? "h5" : "h6"} 
        sx={{ 
          fontWeight: 800, 
          color: '#2563EB', 
          letterSpacing: '0.05em',
          lineHeight: 1,
          fontSize: isSmall ? '1.1rem' : 'inherit',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        TRAK
      </Typography>
    </Box>
  );
};

export default Logo;
