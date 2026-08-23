// src/pages/super-admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosConfig';
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
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Professional Stats Card
const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
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
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  },
  '.stat-icon': {
    width: 48,
    height: 48,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${color}15` || 'rgba(211, 173, 50, 0.1)',
  },
  '.stat-value': {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1a1a2e',
    lineHeight: 1.2,
  },
  '.stat-label': {
    color: '#6b7a8f',
    fontSize: '0.875rem',
    fontWeight: 500,
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
  const [stats, setStats] = useState({
    totalCondos: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalReports: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data...');

      // Fetch all data in parallel
      const [condosRes, usersRes, paymentsRes] = await Promise.all([
        api.condos.getAll(),
        api.users.getAll(),
        api.payments.getStatistics(),
      ]);

      const condos = condosRes.data.data || [];
      const users = usersRes.data.data || [];
      const payments = paymentsRes.data.data || {};

      console.log('✅ Dashboard Data:', {
        condos: condos.length,
        users: users.length,
        payments: payments,
      });

      setStats({
        totalCondos: condos.length,
        totalUsers: users.length,
        totalRevenue: payments.totalCollectedVolume || 0,
        totalReports: 0,
        totalPayments: payments.totalPayments || 0,
      });

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#D3AD32' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">Failed to load dashboard</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
          <button onClick={fetchDashboardData}>Retry</button>
        </Paper>
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'ETB 0';
    return `ETB ${Number(amount).toLocaleString()}`;
  };

  // Chart data
  const chartData = [
    { month: 'Apr', revenue: 400 },
    { month: 'May', revenue: 600 },
    { month: 'Jun', revenue: 800 },
    { month: 'Jul', revenue: 700 },
    { month: 'Aug', revenue: 900 },
    { month: 'Sep', revenue: 1000 },
  ];

  const pieData = [
    { name: 'Bank Transfer', value: 50 },
    { name: 'Telebirr', value: 30 },
    { name: 'CBE Birr', value: 20 },
  ];

  const COLORS = ['#D3AD32', '#4a6cf7', '#22c55e'];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
          Overview of all condominiums and system metrics
        </Typography>
      </Box>

      {/* Stats Grid - Professional Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4a6cf7">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Total Condos</Typography>
                  <Typography className="stat-value">{stats.totalCondos}</Typography>
                  <Typography className="stat-sub">
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    +2 this quarter
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(74, 108, 247, 0.1)' }}>
                  <ApartmentIcon sx={{ color: '#4a6cf7', fontSize: 24 }} />
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
                  <Typography className="stat-label">Total Users</Typography>
                  <Typography className="stat-value">{stats.totalUsers}</Typography>
                  <Typography className="stat-sub">
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    +124 this week
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <PeopleIcon sx={{ color: '#22c55e', fontSize: 24 }} />
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
                  <Typography className="stat-label">Total Revenue</Typography>
                  <Typography className="stat-value" sx={{ color: '#D3AD32' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography className="stat-sub">
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    +12% growth
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                  <PaymentIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#ef4444">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography className="stat-label">Total Reports</Typography>
                  <Typography className="stat-value" sx={{ color: '#ef4444' }}>
                    {stats.totalReports}
                  </Typography>
                  <Typography className="stat-sub">
                    {stats.totalReports > 0 ? '⚠️ Requires attention' : '✅ All clear'}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <ReportIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
              Revenue Performance
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D3AD32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D3AD32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="month" stroke="#6b7a8f" />
                <YAxis stroke="#6b7a8f" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#D3AD32" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
              Payment Methods
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Stats Summary */}
      <Paper sx={{ 
        mt: 3, 
        p: 2, 
        borderRadius: '12px', 
        bgcolor: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
      }}>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Condos</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.totalCondos}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Users</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.totalUsers}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Revenue</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(stats.totalRevenue)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Reports</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>{stats.totalReports}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;