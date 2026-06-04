import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, TextField,
  Paper, Alert, CircularProgress, InputAdornment,
  IconButton, MenuItem, Stepper, Step, StepLabel, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { login, register } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } };

// ── Login Form ────────────────────────────────────────
const LoginForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      await refreshUser();          // ← populate AuthContext before navigating
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <Box component="form" onSubmit={handle} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}
      <TextField label="Email" type="email" fullWidth required value={email}
        onChange={e => setEmail(e.target.value)} sx={fieldSx} />
      <TextField label="Password" type={showPw ? 'text' : 'password'} fullWidth required
        value={password} onChange={e => setPassword(e.target.value)} sx={fieldSx}
        slotProps={{ input: { endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
              {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        )}}}
      />
      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
        sx={{ borderRadius: '10px', fontWeight: 700, py: 1.5, fontSize: '1rem', mt: 0.5 }}>
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Log In'}
      </Button>
      <Typography variant="caption" sx={{ textAlign: 'center', color: 'secondary.main' }}>
        Don't have an account?{' '}
        <Box component="span" onClick={onSwitch}
          sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
          Sign Up
        </Box>
      </Typography>
    </Box>
  );
};

// ── Register Form (2-step) ────────────────────────────
const RegisterForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [state, setState] = useState('');

  const validateStep1 = () => {
    if (!fullName.trim()) { setError('Full name is required.'); return false; }
    if (!email.trim()) { setError('Email is required.'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return false; }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (validateStep1()) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(email, fullName, password);
      await refreshUser();          // ← populate AuthContext before navigating
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
      setStep(0);
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {['Account', 'Location'].map(label => (
          <Step key={label}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.8rem' } }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ borderRadius: '10px', mb: 2 }}>{error}</Alert>}

      {step === 0 && (
        <Box component="form" onSubmit={handleNext} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Full Name" fullWidth required value={fullName}
            onChange={e => setFullName(e.target.value)} sx={fieldSx} />
          <TextField label="Email" type="email" fullWidth required value={email}
            onChange={e => setEmail(e.target.value)} sx={fieldSx} />
          <TextField label="Password" type={showPw ? 'text' : 'password'} fullWidth required
            value={password} onChange={e => setPassword(e.target.value)} sx={fieldSx}
            helperText="Minimum 6 characters"
            slotProps={{ input: { endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                  {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )}}}
          />
          <TextField label="Confirm Password" type="password" fullWidth required
            value={confirmPw} onChange={e => setConfirmPw(e.target.value)} sx={fieldSx} />
          <Button type="submit" variant="contained" fullWidth size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700, py: 1.5, fontSize: '1rem', mt: 0.5 }}>
            Continue
          </Button>
          <Typography variant="caption" sx={{ textAlign: 'center', color: 'secondary.main' }}>
            Already have an account?{' '}
            <Box component="span" onClick={onSwitch}
              sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
              Log In
            </Box>
          </Typography>
        </Box>
      )}

      {step === 1 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ bgcolor: 'rgba(37,99,235,0.04)', borderRadius: '10px', p: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
              Why do we ask for your state?
            </Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', lineHeight: 1.6 }}>
              Traffic laws and fine amounts vary by state. TRAK uses your location to give accurate, region-specific guidance.
            </Typography>
          </Box>

          <TextField
            select label="State / Region" fullWidth value={state}
            onChange={e => setState(e.target.value)} sx={fieldSx}
            helperText="Optional — you can set this later in your profile"
          >
            <MenuItem value=""><em>Skip for now</em></MenuItem>
            <Divider />
            {INDIAN_STATES.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ borderRadius: '10px', fontWeight: 700, py: 1.5, fontSize: '1rem' }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
          <Button variant="text" fullWidth onClick={() => setStep(0)}
            sx={{ borderRadius: '10px', fontWeight: 600, color: 'secondary.main' }}>
            ← Back
          </Button>
        </Box>
      )}
    </Box>
  );
};

// ── Main AuthPage ─────────────────────────────────────
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F6F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.03em' }}>
            TRAK
          </Typography>
          <Typography variant="body2" sx={{ color: 'secondary.main', mt: 0.5, fontWeight: 500 }}>
            Your traffic law assistant
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'white', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {(['login', 'register'] as const).map((m) => (
              <Box key={m} onClick={() => setMode(m)} sx={{
                flex: 1, textAlign: 'center', py: 2, cursor: 'pointer', fontWeight: 700,
                fontSize: '0.95rem', transition: 'all 0.2s',
                color: mode === m ? 'primary.main' : 'secondary.main',
                borderBottom: mode === m ? '2px solid' : '2px solid transparent',
                borderColor: mode === m ? 'primary.main' : 'transparent',
              }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 4 }}>
            {mode === 'login'
              ? <LoginForm onSwitch={() => setMode('register')} />
              : <RegisterForm onSwitch={() => setMode('login')} />
            }
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'secondary.main', opacity: 0.5 }}>
          Tamil Nadu Traffic Law Assistant · Privacy First
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthPage;