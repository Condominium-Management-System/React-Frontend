// src/pages/condo-admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Payment as PaymentIcon,
  Report as ReportIcon,
  MeetingRoom as MeetingRoomIcon,
  Domain as DomainIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StatsCard = styled(Card)(({ color }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: color || '#D3AD32',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  '.stat-icon': {
    width: 46,
    height: 46,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${color}15`,
  },
  '.stat-value': {
    fontSize: '1.85rem',
    fontWeight: 700,
    color: '#1a1a2e',
    lineHeight: 1.2,
  },
  '.stat-label': {
    color: '#6b7a8f',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  '.stat-sub': {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalBlocks: 0,
    totalRooms: 0,
    vacantRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalReports: 0,
    totalAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const condoId = user?.condoId;

      // Fetch live data from backend for this condo
      const [usersRes, blocksRes, roomsRes] = await Promise.all([
        api.users.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.blocks.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.rooms.getAll(condoId).catch(() => ({ data: { data: [] } })),
      ]);

      const usersList = usersRes.data?.data || [];
      const blocksRaw = blocksRes.data?.data;
      const blocksList = Array.isArray(blocksRaw)
        ? blocksRaw
        : Array.isArray(blocksRaw?.blocks)
        ? blocksRaw.blocks
        : [];
      const roomsList = Array.isArray(roomsRes.data?.data) ? roomsRes.data.data : [];

      const residents = usersList.filter((u) => u.role === 'resident');
      const occupied = roomsList.filter((r) => r.status === 'occupied').length;
      const vacant = roomsList.filter((r) => r.status === 'free').length;
      const occupancyRate = roomsList.length > 0
        ? Math.round((occupied / roomsList.length) * 100)
        : 0;

      // Optional payments/reports/announcements
      let paymentStats = { totalPayments: 0, totalCollectedVolume: 0 };
      try {
        const payRes = await api.payments.getStatistics();
        if (payRes.data?.data) paymentStats = payRes.data.data;
      } catch (e) {
        // Safe fallback
      }

      setStats({
        totalResidents: residents.length,
        totalBlocks: blocksList.length,
        totalRooms: roomsList.length,
        vacantRooms: vacant,
        occupiedRooms: occupied,
        occupancyRate,
        totalPayments: paymentStats.totalPayments || 0,
        totalRevenue: parseFloat(paymentStats.totalCollectedVolume) || 0,
        totalReports: 0,
        totalAnnouncements: 0,
      });
    } catch (error) {
      console.error('Error fetching condo dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return `ETB ${Number(amount || 0).toLocaleString()}`;
  };

  const condoCode = user?.condoCode || 'Assigned Condo';
  const adminName = user?.fullName || 'Condo Admin';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#D3AD32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          Condominium Operations Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
          Welcome back, {adminName} — Managing <strong>{condoCode}</strong>
        </Typography>
      </Box>

      {/* Row 1 - Units & Resident Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4a6cf7">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Total Residents</Typography>
                  <Typography className="stat-value">{stats.totalResidents}</Typography>
                  <Typography className="stat-sub">
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    Registered residents
                  </Typography>
                </Box>
                <Box className="stat-icon">
                  <PeopleIcon sx={{ color: '#4a6cf7', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#D3AD32">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Building Blocks</Typography>
                  <Typography className="stat-value">{stats.totalBlocks}</Typography>
                  <Typography className="stat-sub">Condominium blocks</Typography>
                </Box>
                <Box className="stat-icon">
                  <DomainIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#22c55e">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Total Rooms</Typography>
                  <Typography className="stat-value">{stats.totalRooms}</Typography>
                  <Typography className="stat-sub">
                    {stats.vacantRooms} vacant | {stats.occupiedRooms} occupied
                  </Typography>
                </Box>
                <Box className="stat-icon">
                  <MeetingRoomIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#8b5cf6">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Occupancy Rate</Typography>
                  <Typography className="stat-value">{stats.occupancyRate}%</Typography>
                  <Typography className="stat-sub">
                    {stats.occupancyRate > 0 ? 'Active occupancy' : 'No occupied units'}
                  </Typography>
                </Box>
                <Box className="stat-icon">
                  <TrendingUpIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Row 2 - Financial & Operations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard color="#22c55e">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Revenue Collected</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography className="stat-sub">From payments and dues</Typography>
                </Box>
                <Box className="stat-icon">
                  <PaymentIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard color="#8b5cf6">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Total Transactions</Typography>
                  <Typography className="stat-value">{stats.totalPayments}</Typography>
                  <Typography className="stat-sub">Recorded payments</Typography>
                </Box>
                <Box className="stat-icon">
                  <PaymentIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard color="#f59e0b">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Reports</Typography>
                  <Typography className="stat-value">{stats.totalReports}</Typography>
                  <Typography className="stat-sub">
                    {stats.totalReports === 0 ? 'All clear' : 'Pending review'}
                  </Typography>
                </Box>
                <Box className="stat-icon">
                  <ReportIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Summary Banner */}
      <Paper
        sx={{
          p: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Residents</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalResidents}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Blocks</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#D3AD32' }}>{stats.totalBlocks}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Units</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#4a6cf7' }}>{stats.totalRooms}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Occupancy</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.occupancyRate}%</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Revenue</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(stats.totalRevenue)}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
