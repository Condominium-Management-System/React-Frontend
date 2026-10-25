// src/pages/super-admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { promotionService } from '../../services/promotionService';
import { announcementService } from '../../services/announcementService';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  Campaign as CampaignIcon,
Search as SearchIcon,
  Domain as DomainIcon,
  MeetingRoom as MeetingRoomIcon,
  AccountBalance as AccountBalanceIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Professional Stats Card
const StatsCard = styled(Card)(({ color }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `2px solid ${color || '#D3AD32'}`,
    outlineOffset: '2px',
  },
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
    borderColor: color || '#D3AD32',
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

const SummaryItem = styled(Box)(() => ({
  textAlign: 'center',
  padding: '8px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'scale(1.04)',
  },
  '&:focus-visible': {
    outline: '2px solid #D3AD32',
  },
}));

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCondos: 0,
    totalUsers: 0,
    condoAdmins: 0,
    residents: 0,
    totalBlocks: 0,
    totalRooms: 0,
    totalEqubs: 0,
    totalIddirs: 0,
    totalRevenue: 0,
    totalReports: 0,
    pendingReports: 0,
    totalAnnouncements: 0,
    totalPromotions: 0,
    activePromotions: 0,
    promotionTotalValue: 0,
    totalLostFound: 0,
    totalPayments: 0,
    totalCondoAccounts: 0,
    totalOperationalFunds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all system-wide data in parallel
      const [condosRes, usersRes, paymentsRes, blocksRes, roomsRes, equbsRes, iddirsRes, promosRes, annRes, repRes, lfRes, accountsRes] = await Promise.all([
        api.condos.getAll().catch(() => ({ data: { data: [] } })),
        api.users.getAll().catch(() => ({ data: { data: [] } })),
        api.payments.getStatistics().catch(() => ({ data: { data: {} } })),
        api.blocks.getAll().catch(() => ({ data: { data: [] } })),
        api.rooms.getAll().catch(() => ({ data: { data: [] } })),
        api.equbs.getAll().catch(() => ({ data: { equbs: [] } })),
        api.iddirs.getAll().catch(() => ({ data: { iddirs: [] } })),
        promotionService.getAll({ status: 'all', limit: 200 }).catch(() => ({ items: [] })),
        announcementService.getAll({ limit: 200 }).catch(() => ({ items: [] })),
        api.reports.getAdminAll({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        api.lostFound.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
        api.condoAccounts.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const condos = condosRes.data?.data || [];
      const users = usersRes.data?.data || [];
      const payments = paymentsRes.data?.data || {};
      const blocksRaw = blocksRes.data?.data;
      const blocksList = Array.isArray(blocksRaw)
        ? blocksRaw
        : Array.isArray(blocksRaw?.blocks)
        ? blocksRaw.blocks
        : [];
      const roomsList = Array.isArray(roomsRes.data?.data) ? roomsRes.data.data : [];
      const equbsList = equbsRes.data?.equbs || equbsRes.data?.data || [];
      const iddirsList = iddirsRes.data?.iddirs || iddirsRes.data?.data || [];

      const condoAdminsCount = users.filter((u) => u.role === 'condo_admin').length;
      const residentsCount = users.filter((u) => u.role === 'resident').length;

      const promosList = promosRes?.items || promosRes?.data?.items || (Array.isArray(promosRes) ? promosRes : []);
      const promoTotalValue = promosList.reduce((sum, p) => sum + (parseFloat(p.price) || Number(p.price) || 0), 0);
      const activePromos = promosList.filter((p) => p.status === 'active' || p.status === 'approved').length;

      const annList = annRes?.items || annRes?.data?.items || (Array.isArray(annRes) ? annRes : []);
      const repRaw = repRes.data?.data;
      const repList = Array.isArray(repRaw) ? repRaw : repRaw?.items || [];
      const pendingReports = repList.filter((r) => r.status === 'reported' || r.status === 'pending').length;

      const lfRaw = lfRes.data?.data;
      const lfList = Array.isArray(lfRaw) ? lfRaw : lfRaw?.items || [];

      const condoAccountsList = accountsRes?.data?.data || accountsRes?.data || [];
      const totalOperationalFunds = Array.isArray(condoAccountsList)
        ? condoAccountsList.reduce((sum, a) => sum + (Number(a.balance) || 0), 0)
        : 0;

      setStats({
        totalCondos: condos.length,
        totalUsers: users.length,
        condoAdmins: condoAdminsCount,
        residents: residentsCount,
        totalBlocks: blocksList.length,
        totalRooms: roomsList.length,
        totalEqubs: equbsList.length,
        totalIddirs: iddirsList.length,
        totalRevenue: payments.totalCollectedVolume || 0,
        totalReports: repList.length,
        pendingReports,
        totalAnnouncements: annList.length,
        totalPromotions: promosList.length,
        activePromotions: activePromos,
        promotionTotalValue: promoTotalValue,
        totalLostFound: lfList.length,
        totalPayments: payments.totalPayments || 0,
        totalCondoAccounts: Array.isArray(condoAccountsList) ? condoAccountsList.length : 0,
        totalOperationalFunds,
      });

    } catch (err) {
      console.error('Super Admin Dashboard error:', err);
      setError(err.message || 'Failed to load system dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleKeyDownNavigate = (route) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(route);
    }
  };

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
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
          <Typography color="error" variant="h6">Failed to load dashboard</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#6b7a8f' }}>{error}</Typography>
          <Box sx={{ mt: 2 }}>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: '#D3AD32',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
          Overview of all condominiums, administrative users, and system metrics
        </Typography>
      </Box>

      {/* Row 1 - Core System Entities (Clickable Drill-Downs) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Condos -> /super-admin/condos */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all registered condominiums">
            <StatsCard
              color="#4a6cf7"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/condos')}
              onKeyDown={handleKeyDownNavigate('/super-admin/condos')}
              aria-label="Navigate to Condominiums list"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Condos</Typography>
                    <Typography className="stat-value">{stats.totalCondos}</Typography>
                    <Typography className="stat-sub">
                      <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                      Registered properties
                    </Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(74, 108, 247, 0.1)' }}>
                    <ApartmentIcon sx={{ color: '#4a6cf7', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Total Users -> /super-admin/users */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all system users">
            <StatsCard
              color="#22c55e"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/users')}
              onKeyDown={handleKeyDownNavigate('/super-admin/users')}
              aria-label="Navigate to Users management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Users</Typography>
                    <Typography className="stat-value">{stats.totalUsers}</Typography>
                    <Typography className="stat-sub">
                      {stats.condoAdmins} admins | {stats.residents} residents
                    </Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <PeopleIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Condo Admins -> /super-admin/users?filter=CONDO_ADMIN */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all Condo Administrators">
            <StatsCard
              color="#8b5cf6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/users?filter=CONDO_ADMIN')}
              onKeyDown={handleKeyDownNavigate('/super-admin/users?filter=CONDO_ADMIN')}
              aria-label="Navigate to Condo Admins"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Condo Admins</Typography>
                    <Typography className="stat-value" sx={{ color: '#8b5cf6' }}>{stats.condoAdmins}</Typography>
                    <Typography className="stat-sub">Property managers</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <AdminIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Total Revenue -> /super-admin/payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View system revenue and payment records">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/payments')}
              onKeyDown={handleKeyDownNavigate('/super-admin/payments')}
              aria-label="Navigate to Payments"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Revenue</Typography>
                    <Typography className="stat-value" sx={{ color: '#D3AD32' }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography className="stat-sub">
                      {stats.totalPayments} transactions
                    </Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                    <PaymentIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* System Treasury & Condominium Accounts Hub */}
      <Paper 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 2, 
          cursor: 'pointer',
          border: '1px solid rgba(211, 173, 50, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }} 
        onClick={() => navigate('/super-admin/accounts')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(211, 173, 50, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountBalanceIcon sx={{ color: '#D3AD32', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#D3AD32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System-Wide Treasury & Condominium Accounts Hub
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mt: 0.2 }}>
              {formatCurrency(stats.totalRevenue)} Total Revenue Across All Condominiums
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Operational Funds: {formatCurrency(stats.totalOperationalFunds)} • {stats.totalCondoAccounts} registered condominium accounts across {stats.totalCondos} condominiums
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(211, 173, 50, 0.15)', px: 2.5, py: 1.2, borderRadius: '10px', border: '1px solid rgba(211, 173, 50, 0.4)' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#D3AD32' }}>View & Manage Accounts →</Typography>
        </Box>
      </Paper>

      {/* Row 2 - Property Structure & Community Modules */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Building Blocks -> /super-admin/blocks */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all building blocks across condominiums">
            <StatsCard
              color="#3b82f6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/blocks')}
              onKeyDown={handleKeyDownNavigate('/super-admin/blocks')}
              aria-label="Navigate to Blocks"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Blocks</Typography>
                    <Typography className="stat-value">{stats.totalBlocks}</Typography>
                    <Typography className="stat-sub">Across all condominiums</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                    <DomainIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Total Rooms / Units -> /super-admin/rooms */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all apartment rooms and occupancy">
            <StatsCard
              color="#10b981"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/rooms')}
              onKeyDown={handleKeyDownNavigate('/super-admin/rooms')}
              aria-label="Navigate to Rooms"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Rooms</Typography>
                    <Typography className="stat-value">{stats.totalRooms}</Typography>
                    <Typography className="stat-sub">Apartment units</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <MeetingRoomIcon sx={{ color: '#10b981', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Equb Management -> /super-admin/equbs */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View Equb rotating savings groups">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/equbs')}
              onKeyDown={handleKeyDownNavigate('/super-admin/equbs')}
              aria-label="Navigate to Equb Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Equb Groups</Typography>
                    <Typography className="stat-value" sx={{ color: '#D3AD32' }}>{stats.totalEqubs}</Typography>
                    <Typography className="stat-sub">Rotating savings</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                    <AccountBalanceIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Iddir Management -> /super-admin/iddirs */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View Iddir mutual aid groups">
            <StatsCard
              color="#0ea5e9"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/iddirs')}
              onKeyDown={handleKeyDownNavigate('/super-admin/iddirs')}
              aria-label="Navigate to Iddir Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Iddir Groups</Typography>
                    <Typography className="stat-value" sx={{ color: '#0ea5e9' }}>{stats.totalIddirs}</Typography>
                    <Typography className="stat-sub">Mutual aid groups</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                    <ShieldIcon sx={{ color: '#0ea5e9', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Row 3 - System-Wide Community Management (Promotions Value, Announcements, Reports) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* System Promotions & Total Advertising Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all system-wide promotions and total advertising revenue">
            <StatsCard
              color="#22c55e"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/promotions')}
              onKeyDown={handleKeyDownNavigate('/super-admin/promotions')}
              aria-label="Navigate to Promotions"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Promotion Value</Typography>
                    <Typography className="stat-value" sx={{ color: '#22c55e', fontSize: '1.4rem' }}>
                      {formatCurrency(stats.promotionTotalValue)}
                    </Typography>
                    <Typography className="stat-sub">
                      {stats.totalPromotions} promotions ({stats.activePromotions} active)
                    </Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <StoreIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* System Announcements */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all announcements broadcast across condominiums">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/announcements')}
              onKeyDown={handleKeyDownNavigate('/super-admin/announcements')}
              aria-label="Navigate to Announcements"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Announcements</Typography>
                    <Typography className="stat-value" sx={{ color: '#D3AD32' }}>{stats.totalAnnouncements}</Typography>
                    <Typography className="stat-sub">Broadcast notifications</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                    <CampaignIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Resident Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all maintenance and issue reports across condominiums">
            <StatsCard
              color="#ef4444"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/reports')}
              onKeyDown={handleKeyDownNavigate('/super-admin/reports')}
              aria-label="Navigate to Reports"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">System Reports</Typography>
                    <Typography className="stat-value" sx={{ color: '#ef4444' }}>{stats.totalReports}</Typography>
                    <Typography className="stat-sub">{stats.pendingReports} pending resolution</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <ReportIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Lost & Found */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all lost & found items across condominiums">
            <StatsCard
              color="#3b82f6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/super-admin/lost-found')}
              onKeyDown={handleKeyDownNavigate('/super-admin/lost-found')}
              aria-label="Navigate to Lost & Found"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Lost & Found</Typography>
                    <Typography className="stat-value" sx={{ color: '#3b82f6' }}>{stats.totalLostFound}</Typography>
                    <Typography className="stat-sub">Community listings</Typography>
                  </Box>
                  <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                    <SearchIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
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
                <RechartsTooltip 
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
                <RechartsTooltip 
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

      {/* Quick Stats Summary (Interactive Drill-Downs) */}
      <Paper sx={{ 
        mt: 3, 
        p: 2, 
        borderRadius: '16px', 
        bgcolor: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Tooltip title="Click to view Condominiums">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/condos')}
            onKeyDown={handleKeyDownNavigate('/super-admin/condos')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Condos</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4a6cf7' }}>{stats.totalCondos}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view Blocks">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/blocks')}
            onKeyDown={handleKeyDownNavigate('/super-admin/blocks')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Blocks</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.totalBlocks}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view Rooms">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/rooms')}
            onKeyDown={handleKeyDownNavigate('/super-admin/rooms')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Rooms</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>{stats.totalRooms}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view Users">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/users')}
            onKeyDown={handleKeyDownNavigate('/super-admin/users')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Users</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.totalUsers}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view Revenue & Payments">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/payments')}
            onKeyDown={handleKeyDownNavigate('/super-admin/payments')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Revenue</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(stats.totalRevenue)}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view Equb & Iddir Hub">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/super-admin/equb-iddir')}
            onKeyDown={handleKeyDownNavigate('/super-admin/equb-iddir')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Equb & Iddir</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>
              {stats.totalEqubs + stats.totalIddirs}
            </Typography>
          </SummaryItem>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default Dashboard;
