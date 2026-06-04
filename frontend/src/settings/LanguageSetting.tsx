// src/components/settings/LanguageSetting.tsx
// Drop this component anywhere in your SettingsPage.
// It persists the chosen language to localStorage under 'trak_language'.

import React, { useState } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup,
  Snackbar, Alert,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import type { SupportedLang } from '../types/lang';

const LANGUAGES: { code: SupportedLang; label: string; native: string }[] = [
  { code: 'en', label: 'English',   native: 'English' },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்'    },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ'   },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം'  },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు'  },
  { code: 'hi', label: 'Hindi',     native: 'हिन्दी'   },
];

const LanguageSetting: React.FC = () => {
  const [lang, setLang] = useState<SupportedLang>(
    () => (localStorage.getItem('trak_language') as SupportedLang) ?? 'en',
  );
  const [toast, setToast] = useState(false);

  const handleChange = (_: React.MouseEvent, value: SupportedLang | null) => {
    if (!value) return;
    setLang(value);
    localStorage.setItem('trak_language', value);
    setToast(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <TranslateIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Chat Language
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        TRAK will translate bot replies into your chosen language (English query is still used internally for accuracy).
      </Typography>

      <ToggleButtonGroup
        value={lang}
        exclusive
        onChange={handleChange}
        aria-label="chat language"
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1.5px solid rgba(37,99,235,0.2) !important',
            borderRadius: '10px !important',
            mx: 0,
          },
          '& .Mui-selected': {
            bgcolor: 'rgba(37,99,235,0.1) !important',
            borderColor: 'primary.main !important',
            color: 'primary.main',
            fontWeight: 700,
          },
        }}
      >
        {LANGUAGES.map(({ code, label, native }) => (
          <ToggleButton
            key={code}
            value={code}
            aria-label={label}
            sx={{ px: 2, py: 0.8, textTransform: 'none', fontSize: '0.85rem' }}
          >
            {native}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Snackbar
        open={toast}
        autoHideDuration={2500}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: '10px' }}>
          Language updated. Takes effect on next chat.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LanguageSetting;