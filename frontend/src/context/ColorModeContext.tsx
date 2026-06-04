/**
 * ColorModeContext
 *
 * Provides a `mode` string ('light' | 'dark' | 'system') and a `setMode`
 * setter so that SettingsPage can toggle the MUI theme in real time.
 *
 * Usage
 * ─────
 * 1. Wrap your app in <ColorModeProvider> *above* <ThemeProvider>:
 *
 *      import { ColorModeProvider, useColorMode } from './context/ColorModeContext';
 *
 *      const AppWithTheme: React.FC = () => {
 *        const { resolvedMode } = useColorMode();
 *        const theme = React.useMemo(
 *          () => createTheme({ palette: { mode: resolvedMode } }),
 *          [resolvedMode]
 *        );
 *        return <ThemeProvider theme={theme}><App /></ThemeProvider>;
 *      };
 *
 *      ReactDOM.createRoot(document.getElementById('root')!).render(
 *        <ColorModeProvider>
 *          <AppWithTheme />
 *        </ColorModeProvider>
 *      );
 *
 * 2. In SettingsPage (or any component), call:
 *      const { mode, setMode } = useColorMode();
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Mode = 'light' | 'dark' | 'system';

interface ColorModeContextValue {
  /** The user-chosen preference (may be 'system') */
  mode: Mode;
  /** Update the preference */
  setMode: (m: Mode) => void;
  /** The resolved value actually applied to MUI (never 'system') */
  resolvedMode: 'light' | 'dark';
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  setMode: () => {},
  resolvedMode: 'light',
});

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = (localStorage.getItem('trak-theme') as Mode | null) ?? 'light';
  const [mode, setModeState] = useState<Mode>(stored);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem('trak-theme', m);
  };

  // Listen for system preference when mode === 'system'
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') return systemDark ? 'dark' : 'light';
    return mode;
  }, [mode, systemDark]);

  return (
    <ColorModeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);