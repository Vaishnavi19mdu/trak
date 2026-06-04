import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, TextField, Paper,
  MenuItem, Divider, Alert, CircularProgress, LinearProgress,
  Chip, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MultipleStopIcon from '@mui/icons-material/MultipleStop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { updateProfile } from '../lib/api';

const LICENSE_TYPES = [
  { value: 'two_wheeler', label: 'Two-Wheeler', icon: <DirectionsBikeIcon /> },
  { value: 'lmv', label: 'LMV (Car)', icon: <DirectionsCarIcon /> },
  { value: 'commercial', label: 'Commercial', icon: <LocalShippingIcon /> },
  { value: 'multiple', label: 'Multiple', icon: <MultipleStopIcon /> },
];

const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'both', label: 'Both' },
  { value: 'commercial', label: 'Commercial Vehicle' },
];

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } };

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [dob, setDob] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const filledCount = [dob, licenseNumber, licenseType, licenseExpiry, vehicleType].filter(Boolean).length;
  const progress = (filledCount / 5) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    setError(''); setLoading(true);
    try {
      // Calculate age from DOB
      let age: number | undefined;
      if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      }

      await updateProfile({
        license_number: licenseNumber || undefined,
        vehicle_type: vehicleType || undefined,
        age: age || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F6F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, py: 6 }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A1A', mb: 1 }}>
            Complete Your Driver Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'secondary.main', maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
            This helps TRAK give you personalized advice. Everything here is optional — you can fill it in later.
          </Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.main' }}>Profile completeness</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(37,99,235,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 3 } }} />
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: '10px', mb: 3 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'white', p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Date of Birth */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1A1A1A' }}>
              Date of Birth
            </Typography>
            <TextField type="date" fullWidth value={dob} onChange={e => setDob(e.target.value)} sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Your age will be calculated automatically" />
          </Box>

          <Divider />

          {/* Primary Vehicle */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1A1A1A' }}>
              Primary Vehicle
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {VEHICLE_TYPES.map(v => (
                <Chip
                  key={v.value}
                  label={v.label}
                  onClick={() => setVehicleType(vehicleType === v.value ? '' : v.value)}
                  variant={vehicleType === v.value ? 'filled' : 'outlined'}
                  color={vehicleType === v.value ? 'primary' : 'default'}
                  sx={{ fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: 'secondary.main', mt: 1, display: 'block' }}>
              TRAK uses this to tailor violation advice to your vehicle type
            </Typography>
          </Box>

          <Divider />

          {/* License Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1A1A1A' }}>
              Driving License
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="License Number" fullWidth value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)} sx={fieldSx}
                placeholder="e.g. TN01 20230012345" />

              <TextField select label="License Type" fullWidth value={licenseType}
                onChange={e => setLicenseType(e.target.value)} sx={fieldSx}>
                <MenuItem value=""><em>Select type</em></MenuItem>
                {LICENSE_TYPES.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {t.icon} {t.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField label="License Expiry Date" type="date" fullWidth value={licenseExpiry}
                onChange={e => setLicenseExpiry(e.target.value)} sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
          </Box>

          <Divider />

          {/* License Upload */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#1A1A1A' }}>
              Upload License <Typography component="span" variant="caption" sx={{ color: 'secondary.main', fontWeight: 400 }}>(Optional)</Typography>
            </Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', display: 'block', mb: 1.5 }}>
              JPG, PNG or PDF · Used only for verification display
            </Typography>

            {!uploadedFile ? (
              <Box component="label" sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed rgba(0,0,0,0.12)', borderRadius: '12px', p: 4, cursor: 'pointer',
                transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(37,99,235,0.03)' }
              }}>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={handleFileChange} />
                <UploadFileIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  Click to upload
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'rgba(112,134,88,0.06)', borderRadius: '10px', border: '1px solid rgba(112,134,88,0.2)' }}>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uploadedFile.name}
                </Typography>
                <Chip label="Not Verified" size="small" sx={{ bgcolor: 'rgba(255,160,0,0.1)', color: 'warning.main', fontWeight: 700, fontSize: '0.65rem' }} />
                <IconButton size="small" onClick={() => setUploadedFile(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Actions */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button variant="contained" fullWidth size="large" onClick={handleSave} disabled={loading}
            sx={{ borderRadius: '10px', fontWeight: 700, py: 1.5, fontSize: '1rem' }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Save Profile'}
          </Button>
          <Button variant="text" fullWidth onClick={() => navigate('/dashboard')}
            sx={{ borderRadius: '10px', fontWeight: 600, color: 'secondary.main' }}>
            Skip for now — set up later
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfileSetupPage;