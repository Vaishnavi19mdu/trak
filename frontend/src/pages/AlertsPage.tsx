import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Tabs, Tab, Button, Collapse, Divider, Link, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, IconButton } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import SecurityIcon from '@mui/icons-material/Security';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Alert {
  id: number;
  title: string;
  desc: string;
  longDesc?: string;
  links?: { label: string; url: string }[];
  type: 'Official' | 'Alert' | 'System';
  date: string;
  timestamp: number;
  icon: React.ReactNode;
}

const AlertsPage: React.FC = () => {
  const [filter, setFilter] = React.useState('All');
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [readAlertIds, setReadAlertIds] = React.useState<number[]>([]);

  const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setFilter(newValue);
  };

  const handleExpandClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    if (!readAlertIds.includes(id)) {
      setReadAlertIds(prev => [...prev, id]);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!readAlertIds.includes(id)) {
      setReadAlertIds(prev => [...prev, id]);
    } else {
      setReadAlertIds(prev => prev.filter(readId => readId !== id));
    }
  };

  const handleMarkAllRead = () => {
    const allIds = alerts.map(a => a.id);
    setReadAlertIds(allIds);
  };

  const alerts: Alert[] = [
    {
      id: 1,
      title: 'New Traffic Rule Updated',
      desc: 'Section 183(1) regarding overspeeding has been amended for the Chennai City limits effective immediately.',
      longDesc: 'The revised speed limit for Light Motor Vehicles (LMV) on arterial roads is now 50 km/h, reduced from 60 km/h. For transport vehicles, the limit is strictly 40 km/h. Automated speed cameras have been recalibrated to reflect these changes.',
      links: [
        { label: 'e-Gazette of India', url: 'https://egazette.nic.in/' },
        { label: 'Parivahan Portal', url: 'https://parivahan.gov.in/' },
      ],
      type: 'Official',
      date: 'Today',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      icon: <CampaignIcon />,
    },
    {
      id: 2,
      title: 'High-risk driver warning',
      desc: 'You have accumulated 5 penalty points. Reaching 12 points will result in a 6-month license suspension.',
      longDesc: 'Under the New Road Safety Policy, points are valid for 24 months from the date of violation. You currently have violations for "No Helmet" and "Overspeeding". We recommend attending a road safety awareness course to reduce your active point count.',
      links: [
        { label: 'Driving Licence Services', url: 'https://parivahan.gov.in/parivahan/' },
        { label: 'Road Safety Resources', url: 'https://morth.nic.in/road-safety' },
      ],
      type: 'Alert',
      date: '2 days ago',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
      icon: <NewReleasesIcon />,
    },
    {
      id: 3,
      title: 'Privacy Policy Update',
      desc: 'We have updated how we handle your Parivahan data to ensure better security.',
      longDesc: 'We now use end-to-end encryption for storage of your driving license details. Your data is only fetched directly from government servers when you request a refresh and is never shared with third-party advertisers.',
      links: [
        { label: 'Parivahan Privacy Policy', url: 'https://parivahan.gov.in/parivahan/' },
      ],
      type: 'System',
      date: '1 week ago',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
      icon: <SecurityIcon />,
    },
    {
      id: 4,
      title: 'Pollution Under Control (PUC) Drive',
      desc: 'Special drive to check PUC certificates starting next Monday at all major intersections.',
      longDesc: 'The Traffic Department will conduct manual checks at over 40 checkpoints across the city. Ensure your certificate is valid and the QR code is legible. Fines for expired PUC have been increased to ₹2,000 for first-time offenders.',
      links: [
        { label: 'Check PUC Certificate', url: 'https://puc.parivahan.gov.in/pucview/' },
        { label: 'Parivahan PUC Services', url: 'https://puc.parivahan.gov.in/' },
      ],
      type: 'Official',
      date: '3 hours ago',
      timestamp: Date.now() - 1000 * 60 * 60 * 3,
      icon: <CampaignIcon />,
    },
    {
      id: 5,
      title: 'Maintenance Downtime',
      desc: 'The TRAK dashboard will be down for scheduled maintenance this Sunday from 2 AM to 4 AM.',
      longDesc: 'We will be migrating our database to a faster instance to reduce response times for fine queries. All bot features will be unavailable during this window.',
      links: [
        { label: 'Parivahan Services Dashboard', url: 'https://vahan.parivahan.gov.in/' },
      ],
      type: 'System',
      date: '4 days ago',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
      icon: <InfoIcon />,
    },
  ];

  const filteredAlerts = alerts
    .filter(alert => {
      const matchesFilter = filter === 'All' || alert.type === filter;
      const matchesSearch =
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) =>
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            Recent Updates
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Mark all as read
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'secondary.main' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px', bgcolor: 'background.paper' },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 160, flexGrow: { xs: 1, md: 0 } }} size="medium">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                IconComponent={SortIcon}
                sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>

            <Tabs
              value={filter}
              onChange={handleFilterChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.1)',
                flexGrow: { xs: 1, md: 0 },
                '& .MuiTab-root': { minWidth: 60, fontWeight: 600, textTransform: 'none', py: 0, fontSize: '0.85rem' },
              }}
            >
              <Tab value="All" label="All" />
              <Tab value="Official" label="Official" />
              <Tab value="Alert" label="Alerts" />
              <Tab value="System" label="System" />
            </Tabs>
          </Box>
        </Box>
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
          <Paper
            key={alert.id}
            elevation={0}
            sx={{
              p: 0,
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden',
              opacity: readAlertIds.includes(alert.id) ? 0.75 : 1,
              transition: 'all 0.3s',
              bgcolor: readAlertIds.includes(alert.id) ? 'transparent' : 'background.paper',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
            }}
          >
            <Box sx={{ p: 3 }}>
              <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{
                  minWidth: 56,
                  color: alert.type === 'Alert' ? 'error.main' : alert.type === 'Official' ? 'success.main' : 'primary.main',
                  bgcolor: alert.type === 'Alert' ? 'rgba(211,47,47,0.05)' : alert.type === 'Official' ? 'rgba(112,134,88,0.05)' : 'rgba(37,99,235,0.05)',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  {alert.icon}
                  {!readAlertIds.includes(alert.id) && (
                    <Box sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 12,
                      height: 12,
                      bgcolor: 'error.main',
                      borderRadius: '50%',
                      border: '2px solid white',
                    }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ fontWeight: readAlertIds.includes(alert.id) ? 600 : 800, fontSize: '1.1rem' }}>
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.type}
                          size="small"
                          color={alert.type === 'Alert' ? 'error' : alert.type === 'Official' ? 'success' : 'primary'}
                          sx={{ fontWeight: 600, borderRadius: '8px', height: 20, fontSize: '0.65rem' }}
                          variant={alert.type === 'System' ? 'outlined' : 'filled'}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkAsRead(e, alert.id)}
                        sx={{ color: readAlertIds.includes(alert.id) ? 'success.main' : 'action.disabled' }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.6, fontWeight: readAlertIds.includes(alert.id) ? 400 : 500 }}>
                        {alert.desc}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                          {alert.date}
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          endIcon={expandedId === alert.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          onClick={() => handleExpandClick(alert.id)}
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        >
                          {expandedId === alert.id ? 'Show Less' : 'More Details'}
                        </Button>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </Box>

            <Collapse in={expandedId === alert.id} timeout="auto" unmountOnExit>
              <Box sx={{ px: 4, pb: 4, pt: 0 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" sx={{ color: 'secondary.main', lineHeight: 1.8, mb: 3 }}>
                  {alert.longDesc}
                </Typography>

                {alert.links && alert.links.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {alert.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {link.label}
                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </Link>
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        )) : (
          <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
            <Typography>No updates found for this category.</Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default AlertsPage;