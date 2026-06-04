import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  Chip, Stack, Skeleton, Avatar, Divider, LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShieldIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GppGoodIcon from '@mui/icons-material/GppGood';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';
import { getRiskScore, getViolations } from '../lib/api';

interface RiskData {
  score: number; label: string; color: string;
  total_violations: number; total_points_lost: number; total_fines: number;
}
interface Violation {
  id: number; name: string; fine: number; points: number; recorded_at: string;
}

const STATIC_ALERTS = [
  { id: 1, title: 'New Traffic Rule Updated', body: 'Section 183(1) regarding overspeeding amended for Chennai City limits.', type: 'Official', time: 'Today' },
  { id: 2, title: 'PUC Drive Reminder', body: 'Special PUC certificate checks at major intersections starting Monday.', type: 'Official', time: '3 hrs ago' },
  { id: 3, title: 'High-risk Driver Warning', body: 'You have accumulated penalty points. Check your risk score.', type: 'Alert', time: '2 days ago' },
];
const QUICK_LINKS = [
  { label: 'E-Challan', sub: 'Pay or check fines', url: 'https://echallan.parivahan.gov.in', color: '#ef4444' },
  { label: 'Parivahan', sub: 'Vehicle services', url: 'https://parivahan.gov.in', color: '#2563eb' },
  { label: 'Sarathi DL', sub: 'License services', url: 'https://sarathi.parivahan.gov.in', color: '#16a34a' },
];

const RiskArc: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const r = 42, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, color }}>{score}</Typography>
        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600 }}>/100</Typography>
      </Box>
    </Box>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode; iconBg: string; sub?: string }> =
  ({ label, value, icon, iconBg, sub }) => (
    <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1.1, mt: 0.3 }}>{value}</Typography>
            {sub && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.3, display: 'block' }}>{sub}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: iconBg, width: 40, height: 40, borderRadius: '12px' }}>{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRiskScore(), getViolations()])
      .then(([r, v]) => { setRisk(r); setViolations(v); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const riskColor = risk ? risk.color : '#6b7280';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: { xs: 8, sm: 4 } }}>

      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' } }}>
          {greeting}, {firstName} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
          Here's your driving overview for today.
        </Typography>
      </Box>

      {/* Risk Score Hero */}
      <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', mb: 2.5, background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(255,255,255,0) 70%)' }}>
        <CardContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          {loading ? (
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={110} height={110} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={20} />
                <Skeleton width="60%" height={36} sx={{ mt: 0.5 }} />
                <Skeleton width="50%" height={20} sx={{ mt: 1 }} />
              </Box>
            </Stack>
          ) : risk ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { xs: 'center', sm: 'center' } }}>
              <RiskArc score={risk.score} color={riskColor} />
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em' }}>YOUR RISK SCORE</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, mt: 0.5 }}>
                  <ShieldIcon sx={{ fontSize: 18, color: riskColor }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: riskColor }}>{risk.label}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={risk.score} sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.07)', '& .MuiLinearProgress-bar': { bgcolor: riskColor, borderRadius: 3 } }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  {100 - risk.score} points lost · ₹{risk.total_fines.toLocaleString('en-IN')} total fines
                </Typography>
              </Box>
              <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/dashboard/risk')}
                sx={{ borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Full Analysis
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Could not load risk data.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 130px' }}>
          {loading ? <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} /> : (
            <StatCard label="VIOLATIONS" value={risk?.total_violations ?? 0}
              icon={<WarningAmberIcon sx={{ fontSize: 18, color: '#f59e0b' }} />}
              iconBg="rgba(245,158,11,0.12)" sub="Total recorded" />
          )}
        </Box>
        <Box sx={{ flex: '1 1 130px' }}>
          {loading ? <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} /> : (
            <StatCard label="TOTAL FINES" value={`₹${(risk?.total_fines ?? 0).toLocaleString('en-IN')}`}
              icon={<ReportProblemOutlinedIcon sx={{ fontSize: 18, color: '#ef4444' }} />}
              iconBg="rgba(239,68,68,0.10)" sub="Accumulated" />
          )}
        </Box>
        <Box sx={{ flex: '1 1 130px' }}>
          {loading ? <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} /> : (
            <StatCard label="POINTS LOST" value={risk?.total_points_lost ?? 0}
              icon={<GppGoodIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
              iconBg="rgba(37,99,235,0.10)" sub="of 100 possible" />
          )}
        </Box>
      </Box>

      {/* Bottom split: Alerts + Quick actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>

        {/* Recent Alerts */}
        <Box sx={{ flex: '2 1 300px' }}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', height: '100%' }}>
            <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>Recent Alerts</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/dashboard/alerts')}
                  sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}>See all</Button>
              </Stack>
              <Stack spacing={1.5}>
                {STATIC_ALERTS.slice(0, 3).map((alert) => (
                  <Box key={alert.id} sx={{
                    p: 1.5, borderRadius: '10px',
                    bgcolor: alert.type === 'Alert' ? 'rgba(239,68,68,0.04)' : 'rgba(37,99,235,0.03)',
                    border: `1px solid ${alert.type === 'Alert' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.07)'}`,
                  }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <NotificationsActiveIcon sx={{ fontSize: 15, mt: 0.3, color: alert.type === 'Alert' ? 'error.main' : 'primary.main', flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{alert.title}</Typography>
                          <Chip label={alert.type} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alert.type === 'Alert' ? 'error.main' : 'success.main', color: 'white', borderRadius: '4px' }} />
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3, lineHeight: 1.4 }}>{alert.body}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.3, display: 'block' }}>{alert.time}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions + Links */}
        <Box sx={{ flex: '1 1 200px' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}>
              <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', display: 'block', mb: 1.5 }}>Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button fullWidth variant="contained" startIcon={<ChatIcon />} onClick={() => navigate('/dashboard/chat')}
                    sx={{ borderRadius: '10px', fontWeight: 700, justifyContent: 'flex-start', py: 1.2 }}>
                    Ask Traffic Assistant
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<AssessmentIcon />} onClick={() => navigate('/dashboard/risk')}
                    sx={{ borderRadius: '10px', fontWeight: 700, justifyContent: 'flex-start', py: 1.2 }}>
                    View Risk Analysis
                  </Button>
                </Stack>
              </CardContent>
            </Card>
            <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', flex: 1 }}>
              <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', display: 'block', mb: 1.5 }}>Government Portals</Typography>
                <Stack spacing={1}>
                  {QUICK_LINKS.map((link) => (
                    <Box key={link.label} component="a" href={link.url} target="_blank" rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '10px', textDecoration: 'none', border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(0,0,0,0.01)', transition: 'all 0.15s', '&:hover': { bgcolor: `${link.color}08`, borderColor: `${link.color}30` } }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>{link.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{link.sub}</Typography>
                      </Box>
                      <OpenInNewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      {/* Recent Violations */}
      {!loading && violations.length > 0 && (
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>Recent Violations</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} onClick={() => navigate('/dashboard/risk')}
                sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}>Full history</Button>
            </Stack>
            <Stack spacing={0}>
              {violations.slice(0, 4).map((v, i) => (
                <Box key={v.id}>
                  {i > 0 && <Divider />}
                  <Stack direction="row" sx={{ alignItems: 'center', py: 1.2 }} spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(239,68,68,0.1)' }}>
                      <DirectionsCarIcon sx={{ fontSize: 15, color: 'error.main' }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{v.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(v.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Typography>
                    </Box>
                    <Stack sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.85rem' }}>₹{v.fine.toLocaleString('en-IN')}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>-{v.points} pts</Typography>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

export default DashboardPage;