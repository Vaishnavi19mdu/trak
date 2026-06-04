// src/hooks/useAppTheme.ts
// Listens for 'trak-theme-change' events (fired by SettingsPage)
// and returns the correct MUI theme object to pass to <ThemeProvider>.

import { useState, useEffect, useMemo } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'system';

const getStoredMode = (): ThemeMode =>
  (localStorage.getItem('trak-theme') as ThemeMode) ?? 'light';

const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

const buildTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#2563EB' },
      secondary: { main: '#64748b' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#F8F6F0',
        paper:   mode === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // prevents MUI dark-mode gradient on cards
          },
        },
      },
    },
  });

export const useAppTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    const handler = (e: Event) => {
      setMode((e as CustomEvent<ThemeMode>).detail);
    };
    window.addEventListener('trak-theme-change', handler);
    return () => window.removeEventListener('trak-theme-change', handler);
  }, []);

  // Also react if the user changes their OS preference while on 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode('system'); // re-trigger a re-render
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const theme = useMemo(() => buildTheme(resolveMode(mode)), [mode]);
  return theme;
};