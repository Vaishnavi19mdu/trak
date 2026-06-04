import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/ProtectedRoute';

import AuthPage          from './pages/AuthPage';
import ProfileSetupPage  from './pages/ProfileSetupPage';
import LandingPage       from './pages/LandingPage';
import DashboardLayout   from './pages/DashboardLayout';
import DashboardPage     from './pages/DashboardPage';
import ChatPage          from './pages/ChatPage';       // ← was ChatBox
import RiskPage          from './pages/RiskPage';
import AlertsPage        from './pages/AlertsPage';
import ProfilePage       from './pages/ProfilePage';
import SettingsPage      from './pages/SettingsPage';

type ThemeMode = 'light' | 'dark' | 'system';

const getStoredMode = (): ThemeMode =>
  (localStorage.getItem('trak-theme') as ThemeMode) ?? 'light';

const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system')
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return mode;
};

const makeTheme = (resolved: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode: resolved,
      primary:   { main: '#2563EB' },
      secondary: { main: '#39475E' },
      background: {
        default: resolved === 'light' ? '#F8F6F0' : '#0F1117',
        paper:   resolved === 'light' ? '#FFFFFF'  : '#1A1D27',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      fontWeightBold: 700,
    },
  });

const App: React.FC = () => {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    const handler = (e: Event) => setMode((e as CustomEvent<ThemeMode>).detail);
    window.addEventListener('trak-theme-change', handler);
    return () => window.removeEventListener('trak-theme-change', handler);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const theme = useMemo(() => makeTheme(resolveMode(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"     element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index          element={<DashboardPage />} />
              <Route path="chat"    element={<ChatPage />} />  {/* ← fixed */}
              <Route path="risk"    element={<RiskPage />} />
              <Route path="alerts"  element={<AlertsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;