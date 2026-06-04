import React, { useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress,
  List, ListItem, ListItemText, Divider, Button, Chip, Stack,
} from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import GppGoodIcon from '@mui/icons-material/GppGood';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/Error';
import { Violation } from '../utils/chatEngine';
import { useViolations } from '../context/ViolationContext';
import rulesData from '../data/rules.json';

// ─── Scoring logic (self-contained, only "you") ───────────────────────────────
//
// Score starts at 100.
// Each violation deducts its `points` value from the score.
// Floor is 0.
//
const computeScore = (history: string[], allViolations: Violation[]): number => {
  const deduction = history.reduce((acc, vId) => {
    const v = allViolations.find((v) => v.id === vId);
    return acc + (v?.points ?? 0);
  }, 0);
  return Math.max(0, 100 - deduction);
};

const getRiskLabel = (score: number) => {
  if (score >= 80) return { text: 'Safe Driver Profile',     color: '#22c55e', Icon: GppGoodIcon };
  if (score >= 50) return { text: 'Moderate Risk Profile',   color: '#f59e0b', Icon: WarningAmberIcon };
  return            { text: 'High Risk Profile',             color: '#ef4444', Icon: ErrorOutlineIcon };
};

// ─── Score ring ───────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const size = 180;
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* track */}
      <CircularProgress variant="determinate" value={100} size={size} thickness={4}
        sx={{ color: `${color}22` }} />
      {/* fill */}
      <CircularProgress variant="determinate" value={score} size={size} thickness={4}
        sx={{ color, position: 'absolute', left: 0, transition: 'all 1s ease-in-out' }} />
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontWeight: 900, fontSize: '2.8rem', lineHeight: 1, color }}>
          {score}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em' }}>
          OUT OF 100
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const RiskPage: React.FC = () => {
  const { violationHistory, clearHistory } = useViolations();
  const allViolations: Violation[] = rulesData.violations;

  // Live score derived purely from the user's own violation history
  const score  = useMemo(() => computeScore(violationHistory, allViolations), [violationHistory]);
  const status = getRiskLabel(score);
  const { Icon: StatusIcon } = status;

  const TrendIcon = score >= 80 ? TrendingUpIcon : score >= 50 ? RemoveIcon : TrendingDownIcon;

  const totalFines = useMemo(() =>
    violationHistory.reduce((acc, vId) => {
      const v = allViolations.find((v) => v.id === vId);
      return acc + (v?.fine ?? 0);
    }, 0),
  [violationHistory]);

  const pointsLost = 100 - score;

  return (
    <Box sx={{ px: { xs: 0, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Page header ── */}
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
          Your Risk Profile
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
          Score updates instantly when violations are logged via Chat.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>

        {/* ── Score card ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}>
            {/* decorative blob */}
            <Box sx={{
              position: 'absolute', top: -30, right: -30,
              width: 160, height: 160,
              bgcolor: `${status.color}12`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary' }}>
              Risk Safety Score
            </Typography>

            <ScoreRing score={score} color={status.color} />

            {/* Label */}
            <Chip
              icon={<StatusIcon sx={{ fontSize: '1rem !important', color: `${status.color} !important` }} />}
              label={status.text}
              sx={{
                fontWeight: 700,
                fontSize: '0.82rem',
                bgcolor: `${status.color}15`,
                color: status.color,
                border: 'none',
                px: 1,
              }}
            />

            {/* Stats row */}
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}
              spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
              {[
                { label: 'Violations',  value: violationHistory.length },
                { label: 'Points Lost', value: pointsLost },
                { label: 'Total Fines', value: `₹${totalFines.toLocaleString('en-IN')}` },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Trend hint */}
            <Typography variant="body2" sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              color: status.color, fontWeight: 600,
            }}>
              <TrendIcon fontSize="small" />
              {score === 100
                ? 'No violations — keep it up!'
                : score >= 80
                ? 'Good standing — drive carefully.'
                : score >= 50
                ? 'Some violations logged — stay alert.'
                : 'Multiple violations — high risk.'}
            </Typography>
          </Paper>
        </Grid>

        {/* ── Violation history ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            height: '100%',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Violation History</Typography>
              {violationHistory.length > 0 && (
                <Button size="small" color="error" startIcon={<DeleteOutlineIcon />}
                  onClick={clearHistory}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
                  Clear all
                </Button>
              )}
            </Box>

            {/* Score scale legend */}
            <Box sx={{
              display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap',
            }}>
              {[
                { range: '80–100', label: 'Safe',     color: '#22c55e' },
                { range: '50–79',  label: 'Moderate', color: '#f59e0b' },
                { range: '0–49',   label: 'High Risk', color: '#ef4444' },
              ].map((s) => (
                <Box key={s.range} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.4, borderRadius: '6px',
                  bgcolor: `${s.color}12`,
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: s.color }}>
                    {s.range} · {s.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <List disablePadding>
              {violationHistory.length === 0 ? (
                <Box sx={{
                  textAlign: 'center', py: 8,
                  border: '1.5px dashed rgba(0,0,0,0.08)', borderRadius: '12px',
                }}>
                  <GppGoodIcon sx={{ fontSize: 40, color: '#22c55e', opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    No violations recorded yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                    Chat with TRAK to log a violation — your score will update here instantly.
                  </Typography>
                </Box>
              ) : (
                violationHistory.map((vId, index) => {
                  const v = allViolations.find((v) => v.id === vId);
                  if (!v) return null;
                  return (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0, py: 1.75, alignItems: 'flex-start' }}>
                        {/* Left: severity dot */}
                        <Box sx={{
                          width: 8, height: 8, borderRadius: '50%', mt: 0.7, mr: 1.5, flexShrink: 0,
                          bgcolor: v.points >= 15 ? '#ef4444' : v.points >= 8 ? '#f59e0b' : '#22c55e',
                        }} />
                        <ListItemText
                          primary={v.name}
                          secondary={v.section}
                          slotProps={{
                            primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } },
                            secondary: { sx: { fontSize: '0.78rem' } },
                          }}
                        />
                        <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                          <Typography sx={{ fontWeight: 800, color: 'error.main', fontSize: '0.9rem' }}>
                            −{v.points} pts
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ₹{v.fine.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < violationHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskPage;