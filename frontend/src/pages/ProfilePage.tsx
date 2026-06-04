import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Chip,
  Divider, Stack, Skeleton, useMediaQuery, useTheme
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShieldIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsIcon from '@mui/icons-material/Directions';
import { useAuth } from '../context/AuthContext';
import { getRiskScore } from '../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const getVehicleIcon = (type?: string) => {
  if (!type) return <DirectionsCarIcon sx={{ fontSize: 15 }} />;
  const t = type.toLowerCase();
  if (t === 'bike' || t === 'motorcycle') return <TwoWheelerIcon sx={{ fontSize: 15 }} />;
  if (t === 'truck') return <LocalShippingIcon sx={{ fontSize: 15 }} />;
  return <DirectionsCarIcon sx={{ fontSize: 15 }} />;
};

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

// ─── Risk Arc ─────────────────────────────────────────────────────────────────
const RiskArc: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
      <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1, color }}>
            {score}
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
            / 100
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.3 }}>
          Your Risk Score
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <ShieldIcon sx={{ fontSize: 15, color }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color }}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
          Based on your violation history
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2,
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    '&:last-child': { borderBottom: 'none' },
  }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '8px',
      bgcolor: 'rgba(37,99,235,0.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'primary.main', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      {typeof value === 'string'
        ? <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || '—'}
          </Typography>
        : value}
    </Box>
  </Box>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', mb: 2 }}>
    <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Typography variant="overline" sx={{
        color: 'text.secondary', fontWeight: 700,
        letterSpacing: '0.1em', fontSize: '0.68rem', display: 'block', mb: 1.5,
      }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <Box sx={{ maxWidth: 680, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
    <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', mb: 2 }}>
      <CardContent sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
          <Skeleton variant="rounded" width={72} height={72} sx={{ borderRadius: '18px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={28} />
            <Skeleton width="40%" height={20} sx={{ mt: 0.5 }} />
            <Skeleton width="55%" height={18} sx={{ mt: 0.3 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
    {[1, 2, 3].map(i => (
      <Card key={i} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', mb: 2 }}>
        <CardContent sx={{ px: 3, py: 2.5 }}>
          <Skeleton width="30%" height={18} sx={{ mb: 1.5 }} />
          {[1, 2, 3].map(j => <Skeleton key={j} height={44} sx={{ mb: 0.5 }} />)}
        </CardContent>
      </Card>
    ))}
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [risk, setRisk] = useState<{ score: number; label: string; total_violations: number; total_fines: number } | null>(null);
  const [riskLoading, setRiskLoading] = useState(true);

  useEffect(() => {
    getRiskScore()
      .then(setRisk)
      .catch(() => setRisk(null))
      .finally(() => setRiskLoading(false));
  }, []);

  if (!user) return <ProfileSkeleton />;

  const initials = getInitials(user.full_name || 'U');

  // ✅ Fixed: full date e.g. "31 May 2026"
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box sx={{
      maxWidth: 680, mx: 'auto',
      px: { xs: 1.5, sm: 3 },
      py: { xs: 2, sm: 4 },
      pb: { xs: 8, sm: 4 },
    }}>

      {/* ── Profile Header ── */}
      <Card elevation={0} sx={{
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '20px',
        mb: 2,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 70%)',
        overflow: 'visible',
      }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ alignItems: 'center', textAlign: { xs: 'center', sm: 'left' } }}
          >
            <Avatar variant="rounded" sx={{
              width: { xs: 80, sm: 72 },
              height: { xs: 80, sm: 72 },
              bgcolor: '#D1D5DB',
              color: '#374151',
              fontWeight: 800,
              fontSize: '1.5rem',
              borderRadius: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid rgba(37,99,235,0.12)',
              flexShrink: 0,
            }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.3rem' }, lineHeight: 1.2 }}>
                {user.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3, fontSize: '0.85rem' }}>
                {user.email}
              </Typography>
              {user.state && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <LocationOnIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {user.state}
                  </Typography>
                </Stack>
              )}
            </Box>

            {risk && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Chip
                  size="small"
                  label={`Score: ${risk.score}`}
                  sx={{ fontWeight: 700, bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', fontSize: '0.78rem' }}
                />
                <Chip
                  size="small"
                  label={`${risk.total_violations} violations`}
                  sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                  variant="outlined"
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Personal Information ── */}
      <SectionCard title="Personal Information">
        <InfoRow icon={<PersonIcon sx={{ fontSize: 15 }} />}     label="Full Name" value={user.full_name} />
        <InfoRow icon={<BadgeIcon sx={{ fontSize: 15 }} />}      label="Email"     value={user.email} />
        <InfoRow icon={<LocationOnIcon sx={{ fontSize: 15 }} />} label="State"     value={user.state || '—'} />
        {/* ✅ Fixed: shows full date like "31 May 2026" */}
        <InfoRow
          icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
          label="Member Since"
          value={
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.1 }}>
              {memberSince}
            </Typography>
          }
        />
      </SectionCard>

      {/* ── Driving Information ── */}
      <SectionCard title="Driving Information">
        <InfoRow
          icon={<BadgeIcon sx={{ fontSize: 15 }} />}
          label="License Number"
          value={user.license_number || 'Not set'}
        />
        <InfoRow
          icon={<DirectionsIcon sx={{ fontSize: 15 }} />}
          label="Years of Experience"
          value={user.driving_years != null ? `${user.driving_years} year${user.driving_years !== 1 ? 's' : ''}` : 'Not set'}
        />
        <InfoRow
          icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
          label="Age"
          value={user.age != null ? `${user.age} years old` : 'Not set'}
        />
      </SectionCard>

      {/* ── Vehicle Information ── */}
      <SectionCard title="Vehicle Information">
        <InfoRow
          icon={getVehicleIcon(user.vehicle_type)}
          label="Vehicle Type"
          value={
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.1, alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {capitalize(user.vehicle_type) || 'Not set'}
              </Typography>
            </Stack>
          }
        />
      </SectionCard>

      {/* ── Risk Summary ── */}
      <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', mb: 2 }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="overline" sx={{
            color: 'text.secondary', fontWeight: 700,
            letterSpacing: '0.1em', fontSize: '0.68rem', display: 'block', mb: 1.5,
          }}>
            Risk Summary
          </Typography>

          {riskLoading ? (
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
              <Skeleton variant="circular" width={100} height={100} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="50%" height={20} />
                <Skeleton width="70%" height={28} sx={{ mt: 0.5 }} />
                <Skeleton width="40%" height={18} sx={{ mt: 0.5 }} />
              </Box>
            </Stack>
          ) : risk ? (
            <>
              <RiskArc score={risk.score} label={risk.label} />
              <Divider sx={{ my: 2 }} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                divider={<Divider orientation={isMobile ? 'horizontal' : 'vertical'} flexItem />}
              >
                <Box sx={{ flex: 1, textAlign: { xs: 'left', sm: 'center' } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Total Violations</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: risk.total_violations > 0 ? '#ef4444' : '#22c55e' }}>
                    {risk.total_violations}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'left', sm: 'center' } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Total Fines</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>
                    ₹{risk.total_fines.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'left', sm: 'center' } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Points Lost</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>
                    {100 - risk.score}
                  </Typography>
                </Box>
              </Stack>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Could not load risk data.
            </Typography>
          )}
        </CardContent>
      </Card>

    </Box>
  );
};

export default ProfilePage;