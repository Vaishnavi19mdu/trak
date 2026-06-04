import React from 'react';
import {
  Box, Typography, Card, CardContent, Divider, Switch,
  Avatar, Button, Snackbar, Alert,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTip';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../context/AuthContext';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ── All Indian states + UTs ──────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

const SectionCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', mb: 1.5, overflow: 'visible' }}>
    <CardContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.07em', color: 'text.secondary', fontSize: '0.68rem' }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      {children}
    </CardContent>
  </Card>
);

const ActionRow: React.FC<{
  label: string;
  description?: string;
  danger?: boolean;
  onClick?: () => void;
}> = ({ label, description, danger = false, onClick }) => (
  <Box sx={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    py: 0.9, borderBottom: '1px solid rgba(0,0,0,0.04)',
    '&:last-child': { borderBottom: 'none' },
  }}>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.84rem', color: danger ? 'error.main' : 'text.primary' }}>
        {label}
      </Typography>
      {description && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>{description}</Typography>
      )}
    </Box>
    <Button
      size="small" variant="text"
      onClick={onClick ?? (() => alert(`${label} — coming soon`))}
      sx={{
        color: danger ? 'error.main' : 'primary.main',
        fontWeight: 600, fontSize: '0.72rem', minWidth: 0, px: 1,
        '&:hover': { bgcolor: danger ? 'rgba(239,68,68,0.06)' : 'rgba(37,99,235,0.06)' },
      }}
    >
      {danger ? 'Delete' : 'Change'}
    </Button>
  </Box>
);

const NotifToggle: React.FC<{ label: string; description?: string }> = ({ label, description }) => {
  const [checked, setChecked] = React.useState(true);
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      py: 0.9, borderBottom: '1px solid rgba(0,0,0,0.04)',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.84rem' }}>{label}</Typography>
        {description && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>{description}</Typography>
        )}
      </Box>
      <Switch checked={checked} onChange={() => setChecked(!checked)} size="small" color="primary" />
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const name     = user?.full_name ?? 'Driver';
  const email    = user?.email     ?? '';
  const initials = getInitials(name);

  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg]   = React.useState('Settings saved successfully.');
  const handleCancel = () => alert('Changes discarded');

  const [editOpen, setEditOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    license_number: '',
    vehicle_type:   '',
    driving_years:  '',
    age:            '',
    state:          '',
  });
  const [saving, setSaving] = React.useState(false);

  const handleOpenEdit = () => {
    setEditForm({
      license_number: user?.license_number ?? '',
      vehicle_type:   user?.vehicle_type   ?? '',
      driving_years:  user?.driving_years != null ? String(user.driving_years) : '',
      age:            user?.age            != null ? String(user.age)           : '',
      state:          user?.state          ?? '',
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('trak_token');
      const res = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          license_number: editForm.license_number || null,
          vehicle_type:   editForm.vehicle_type   || null,
          driving_years:  editForm.driving_years  ? Number(editForm.driving_years) : null,
          age:            editForm.age             ? Number(editForm.age)           : null,
          state:          editForm.state           || null,
        }),
      });

      if (!res.ok) throw new Error('Save failed');

      await refreshUser();
      setEditOpen(false);
      setToastMsg('Profile updated successfully.');
      setToastOpen(true);
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    setToastMsg('Settings saved successfully.');
    setToastOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: { xs: 2, sm: 3 }, pt: 2.5, pb: '90px' }}>

      {/* ── Profile Card ── */}
      <Card elevation={0} sx={{
        border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', mb: 1.5,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(255,255,255,0) 65%)',
        overflow: 'visible',
      }}>
        <CardContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.75 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar variant="rounded" sx={{
                width: 56, height: 56, bgcolor: '#2563EB', color: 'white',
                fontWeight: 800, fontSize: '1.2rem', borderRadius: '14px',
                boxShadow: '0 3px 10px rgba(37,99,235,0.28)',
              }}>
                {initials || <PersonOutlinedIcon sx={{ fontSize: 26 }} />}
              </Avatar>
              <Tooltip title="Change photo">
                <IconButton size="small" onClick={() => alert('Upload photo — coming soon')} sx={{
                  position: 'absolute', bottom: -5, right: -5,
                  bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)', width: 22, height: 22,
                  '&:hover': { bgcolor: 'rgba(37,99,235,0.06)' },
                }}>
                  <CameraAltOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.8rem' }}>{email}</Typography>
              {user?.state && (
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, mt: 0.2, display: 'block', fontSize: '0.72rem' }}>
                  📍 {user.state}
                </Typography>
              )}
            </Box>

            <Button variant="outlined" size="small"
              startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
              onClick={handleOpenEdit}
              sx={{
                borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem',
                borderColor: 'rgba(37,99,235,0.3)', color: 'primary.main', py: 0.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(37,99,235,0.04)' },
              }}>
              Edit
            </Button>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              { icon: <BadgeIcon sx={{ fontSize: 12 }} />, label: 'License', value: user?.license_number ?? 'Not set' },
              { icon: <DirectionsCarIcon sx={{ fontSize: 12 }} />, label: 'Vehicle', value: user?.vehicle_type ? user.vehicle_type.charAt(0).toUpperCase() + user.vehicle_type.slice(1) : 'Not set' },
              { icon: <CalendarTodayIcon sx={{ fontSize: 12 }} />, label: 'Age', value: user?.age ? `${user.age} yrs` : 'Not set' },
            ].map(({ icon, label, value }) => (
              <Box key={label} sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.25, py: 0.5, borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.07)', bgcolor: 'rgba(0,0,0,0.015)',
              }}>
                <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.7rem' }}>{label}:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: value === 'Not set' ? 'text.disabled' : 'text.primary' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Account Settings ── */}
      <SectionCard icon={<LockOutlinedIcon sx={{ fontSize: 15 }} />} title="Account Settings">
        <ActionRow label="Change Password" description="Last changed 3 months ago" />
        <ActionRow label="Update Email"    description={email} />
        <ActionRow label="Delete Account"  description="Permanently remove your data" danger />
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard icon={<NotificationsNoneIcon sx={{ fontSize: 15 }} />} title="Notifications">
        <NotifToggle label="Traffic Rule Updates"    description="Get notified when new rules are published" />
        <NotifToggle label="Risk Alerts"             description="Warnings when your score drops below 50" />
        <NotifToggle label="License Expiry Reminder" description="30 days before expiry" />
        <NotifToggle label="Challan Updates"         description="New challans linked to your vehicle" />
      </SectionCard>

      {/* ── Privacy & Security ── */}
      <SectionCard icon={<PrivacyTipOutlinedIcon sx={{ fontSize: 15 }} />} title="Privacy & Security">
        <ActionRow label="Clear Chat History" description="Remove all previous conversations" />
        <ActionRow label="Download My Data"   description="Export a copy of your data" />
      </SectionCard>

      {/* ── Sticky Save Bar ── */}
      <Box sx={{
        position: 'fixed', bottom: 0,
        left: { xs: 0, sm: 260 }, right: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        px: { xs: 2, sm: 4 }, py: 1.25,
        display: 'flex', justifyContent: 'flex-end', gap: 1.25,
        zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        <Button size="small" variant="outlined" onClick={handleCancel} sx={{
          borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem',
          borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary',
          '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
        }}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={handleSave} disableElevation sx={{
          borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', bgcolor: 'primary.main', px: 2.5,
          '&:hover': { bgcolor: 'primary.dark' },
        }}>
          Save Changes
        </Button>
      </Box>

      {/* ── Edit Profile Dialog ── */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: '14px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
          Edit Profile
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="License Number"
            size="small"
            fullWidth
            value={editForm.license_number}
            onChange={e => setEditForm(f => ({ ...f, license_number: e.target.value }))}
            placeholder="e.g. TN01 20230012345"
          />

          <TextField
            label="Vehicle Type"
            size="small"
            fullWidth
            select
            value={editForm.vehicle_type}
            onChange={e => setEditForm(f => ({ ...f, vehicle_type: e.target.value }))}
          >
            <MenuItem value="">— Select —</MenuItem>
            <MenuItem value="bike">Bike</MenuItem>
            <MenuItem value="car">Car</MenuItem>
            <MenuItem value="truck">Truck</MenuItem>
          </TextField>

          <TextField
            label="Years of Driving Experience"
            size="small"
            fullWidth
            type="number"
            value={editForm.driving_years}
            onChange={e => {
              const v = Math.min(60, Math.max(0, Number(e.target.value)));
              setEditForm(f => ({ ...f, driving_years: e.target.value === '' ? '' : String(v) }));
            }}
          />

          <TextField
            label="Age"
            size="small"
            fullWidth
            type="number"
            value={editForm.age}
            onChange={e => {
              const v = Math.min(100, Math.max(16, Number(e.target.value)));
              setEditForm(f => ({ ...f, age: e.target.value === '' ? '' : String(v) }));
            }}
          />

          {/* ✅ Indian states dropdown */}
          <TextField
            label="State"
            size="small"
            fullWidth
            select
            value={editForm.state}
            onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
            slotProps={{ select: { MenuProps: { sx: { maxHeight: 260 } } } }}
          >
            <MenuItem value="">— Select State —</MenuItem>
            {INDIAN_STATES.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setEditOpen(false)}
            disabled={saving}
            sx={{ borderRadius: '8px', color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleEditSave}
            disabled={saving}
            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', px: 2.5 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Success Toast ── */}
      <Snackbar
        open={toastOpen} autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 72, sm: 64 } }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled"
          sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;