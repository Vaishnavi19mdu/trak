import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Primary Blue
    },
    secondary: {
      main: '#7194AB', // Secondary Blue
    },
    success: {
      main: '#708658', // Primary Green
    },
    warning: {
      main: '#FACC15', // Warning Yellow
    },
    background: {
      default: '#F8F6F0', // Pearl White
      paper: '#FFFFFF',
    },
    text: {
      primary: '#57473A', // Neutral Brown
    },
  },
  typography: {
    fontFamily: '"Montserrat", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
        },
      },
    },
  },
});

export default theme;
