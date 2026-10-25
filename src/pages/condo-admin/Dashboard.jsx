// src/pages/condo-admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { promotionService } from '../../services/promotionService';
import { announcementService } from '../../services/announcementService';
import { useAuth } from '../../context/AuthContext';
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
  People as PeopleIcon,
  Payment as PaymentIcon,
  Report as ReportIcon,
  MeetingRoom as MeetingRoomIcon,
  Domain as DomainIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  Campaign as CampaignIcon,
Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  Shield as ShieldIcon,
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
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    borderColor: color || '#D3AD32',
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
  const { user } = useAuth();
  const navigate = useNavigate();

    const [stats, setStats] = useState({
    totalResidents: 0,
    totalUsers: 0,
    verifiedResidents: 0,
    pendingResidents: 0,
    inEqubResidents: 0,
    inIddirResidents: 0,
    totalBlocks: 0,
    totalRooms: 0,
    vacantRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalAnnouncements: 0,
    pinnedAnnouncements: 0,
    totalPromotions: 0,
    activePromotions: 0,
    pendingPromotions: 0,
    promotionTotalValue: 0,
    totalLostFound: 0,
    openLostFound: 0,
    totalEqubs: 0,
    totalIddirs: 0,
    condoAccountCount: 0,
    operationalFunds: 0,
    primaryAccountName: 'None Configured',
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const condoId = user?.condoId;

      // Fetch live data from backend for this condo
      const [usersRes, blocksRes, roomsRes, equbsRes, iddirsRes, promosRes, annRes, repRes, lfRes] = await Promise.all([
        api.users.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.blocks.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.rooms.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.equbs.getAll(condoId ? { condoId } : {}).catch(() => ({ data: { equbs: [] } })),
        api.iddirs.getAll(condoId ? { condoId } : {}).catch(() => ({ data: { iddirs: [] } })),
        promotionService.getAll(condoId ? { condoId, limit: 100 } : { limit: 100 }).catch(() => ({ items: [] })),
        announcementService.getAll(condoId ? { condoId, limit: 100 } : { limit: 100 }).catch(() => ({ items: [] })),
        api.reports.getAdminAll(condoId ? { condoId, limit: 100 } : { limit: 100 }).catch(() => ({ data: { data: [] } })),
        api.lostFound.getAll(condoId ? { condoId, limit: 100 } : { limit: 100 }).catch(() => ({ data: { data: [] } })),
      ]);

      const usersList = usersRes.data?.data || [];
      const blocksRaw = blocksRes.data?.data;
      const blocksList = Array.isArray(blocksRaw)
        ? blocksRaw
        : Array.isArray(blocksRaw?.blocks)
        ? blocksRaw.blocks
        : [];
      const roomsList = Array.isArray(roomsRes.data?.data) ? roomsRes.data.data : [];
      const equbsList = equbsRes.data?.equbs || equbsRes.data?.data || [];
      const iddirsList = iddirsRes.data?.iddirs || iddirsRes.data?.data || [];

      const residents = usersList.filter((u) => u.role === 'resident');
      const occupied = roomsList.filter((r) => r.status === 'occupied').length;
      const vacant = roomsList.filter((r) => r.status === 'free').length;
      const occupancyRate = roomsList.length > 0
        ? Math.round((occupied / roomsList.length) * 100)
        : 0;

      // Fetch Condominium Source/Destination Accounts
      let condoAccountCount = 0;
      let operationalFunds = 0;
      let primaryAccountName = 'None Configured';
      try {
        const condoAccRes = await api.condoAccounts.getAll();
        const accList = condoAccRes.data?.data || condoAccRes.data || [];
        if (Array.isArray(accList) && accList.length > 0) {
          condoAccountCount = accList.length;
          operationalFunds = accList.reduce((s, a) => s + Number(a.balance || 0), 0);
          const defAcc = accList.find(a => a.isDefault) || accList[0];
          primaryAccountName = `${defAcc.accountName} (${defAcc.maskedAccountNumber || defAcc.accountNumber?.slice(-4) || '••••'})`;
        }
      } catch (e) {
        // Safe fallback
      }

      // Optional payments
      let paymentStats = { totalPayments: 0, totalCollectedVolume: 0 };
      try {
        const payRes = await api.payments.getStatistics();
        if (payRes.data?.data) paymentStats = payRes.data.data;
      } catch (e) {
        // Safe fallback
      }

      const promosList = promosRes?.items || promosRes?.data?.items || (Array.isArray(promosRes) ? promosRes : []);
      const promoTotalValue = promosList.reduce((sum, p) => sum + (parseFloat(p.price) || Number(p.price) || 0), 0);
      const activePromos = promosList.filter((p) => p.status === 'active' || p.status === 'approved').length;
      const pendingPromos = promosList.filter((p) => p.status === 'pending').length;

      const annList = annRes?.items || annRes?.data?.items || (Array.isArray(annRes) ? annRes : []);
      const pinnedAnnouncements = annList.filter((a) => a.isPinned).length;

      const repRaw = repRes.data?.data;
      const repList = Array.isArray(repRaw) ? repRaw : repRaw?.items || [];
      const pendingReports = repList.filter((r) => r.status === 'reported' || r.status === 'pending').length;
      const resolvedReports = repList.filter((r) => r.status === 'resolved').length;

      const lfRaw = lfRes.data?.data;
      const lfList = Array.isArray(lfRaw) ? lfRaw : lfRaw?.items || [];
      const openLostFound = lfList.filter((i) => i.status === 'open').length;

      setStats({
        totalResidents: residents.length,
        totalUsers: usersList.length,
        verifiedResidents: residents.filter((r) => r.isVerified).length,
        pendingResidents: residents.filter((r) => !r.isVerified).length,
        inEqubResidents: residents.filter((r) => r.isInEqub).length,
        inIddirResidents: residents.filter((r) => r.isInIddir).length,
        totalBlocks: blocksList.length,
        totalRooms: roomsList.length,
        vacantRooms: vacant,
        occupiedRooms: occupied,
        occupancyRate,
        totalPayments: paymentStats.totalPayments || 0,
        totalRevenue: parseFloat(paymentStats.totalCollectedVolume) || 0,
        totalReports: repList.length,
        pendingReports,
        resolvedReports,
        totalAnnouncements: annList.length,
        pinnedAnnouncements,
        totalPromotions: promosList.length,
        activePromotions: activePromos,
        pendingPromotions: pendingPromos,
        promotionTotalValue: promoTotalValue,
        totalLostFound: lfList.length,
        openLostFound,
        totalEqubs: equbsList.length,
        totalIddirs: iddirsList.length,
        condoAccountCount,
        operationalFunds,
        primaryAccountName,
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

  const handleKeyDownNavigate = (route) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(route);
    }
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Condominium Operations Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Welcome back, {adminName} — Managing <strong>{condoCode}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Row 1 - Units & Resident Stats (Clickable Drill-Downs) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Residents -> /condo-admin/residents */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all registered residents">
            <StatsCard
              color="#4a6cf7"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/residents')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/residents')}
              aria-label="Navigate to Residents Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Residents</Typography>
                    <Typography className="stat-value">{stats.totalResidents}</Typography>
                    <Typography className="stat-sub">
                      <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                      {stats.verifiedResidents} verified | {stats.pendingResidents} pending
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <PeopleIcon sx={{ color: '#4a6cf7', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Building Blocks -> /condo-admin/blocks */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all building blocks">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/blocks')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/blocks')}
              aria-label="Navigate to Building Blocks"
            >
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
          </Tooltip>
        </Grid>

        {/* Total Rooms -> /condo-admin/rooms */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View room management">
            <StatsCard
              color="#22c55e"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/rooms')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/rooms')}
              aria-label="Navigate to Rooms Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Total Rooms</Typography>
                    <Typography className="stat-value">{stats.totalRooms}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/condo-admin/rooms?status=free');
                        }}
                        sx={{
                          color: '#16a34a',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {stats.vacantRooms} vacant
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>|</Typography>
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/condo-admin/rooms?status=occupied');
                        }}
                        sx={{
                          color: '#4a6cf7',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {stats.occupiedRooms} occupied
                      </Box>
                    </Box>
                  </Box>
                  <Box className="stat-icon">
                    <MeetingRoomIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Occupancy Rate -> /condo-admin/rooms?status=occupied */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View occupied rooms">
            <StatsCard
              color="#8b5cf6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/rooms?status=occupied')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/rooms?status=occupied')}
              aria-label="Navigate to Occupied Rooms"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Occupancy Rate</Typography>
                    <Typography className="stat-value">{stats.occupancyRate}%</Typography>
                    <Typography className="stat-sub">
                      {stats.occupancyRate > 0 ? `${stats.occupiedRooms} occupied units` : 'No occupied units'}
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <TrendingUpIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Row 2 - Condominium Accounts & Treasury Strip */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/condo-admin/accounts')}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(211, 173, 50, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountBalanceIcon sx={{ color: '#D3AD32', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#D3AD32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Condominium Treasury & Accounts (Scoped to {condoCode})
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mt: 0.2 }}>
              {formatCurrency(stats.operationalFunds)} Available Operational Funds
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Primary Account: {stats.primaryAccountName} • {stats.condoAccountCount} registered account(s)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: '10px' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#D3AD32' }}>Manage Accounts →</Typography>
        </Box>
      </Paper>

      {/* Row 2 - Financial & Community Modules */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Collected -> /condo-admin/payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View all payments and financial records">
            <StatsCard
              color="#22c55e"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/payments')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/payments')}
              aria-label="Navigate to Payments"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Revenue Collected</Typography>
                    <Typography className="stat-value" sx={{ color: '#22c55e' }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography className="stat-sub">
                      Reserves: {formatCurrency(stats.operationalFunds)} • {stats.primaryAccountName}
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <PaymentIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Total Payments -> /condo-admin/payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View payment transactions">
            <StatsCard
              color="#8b5cf6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/payments')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/payments')}
              aria-label="Navigate to Payment Transactions"
            >
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
          </Tooltip>
        </Grid>

        {/* Equb Rotations -> /condo-admin/equbs */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Manage Equb rotating savings groups">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/equbs')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/equbs')}
              aria-label="Navigate to Equb Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Active Equbs</Typography>
                    <Typography className="stat-value" sx={{ color: '#D3AD32' }}>{stats.totalEqubs}</Typography>
                    <Typography className="stat-sub">Rotating savings groups</Typography>
                  </Box>
                  <Box className="stat-icon">
                    <AccountBalanceIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Iddir Groups -> /condo-admin/iddirs */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Manage Iddir mutual aid groups">
            <StatsCard
              color="#3b82f6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/iddirs')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/iddirs')}
              aria-label="Navigate to Iddir Management"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Active Iddirs</Typography>
                    <Typography className="stat-value" sx={{ color: '#3b82f6' }}>{stats.totalIddirs}</Typography>
                    <Typography className="stat-sub">Mutual aid groups</Typography>
                  </Box>
                  <Box className="stat-icon">
                    <ShieldIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Row 3 - Condominium Community & Management (Promotions, Announcements, Reports) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Promotions & Total Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Manage condominium promotions and view total advertising value">
            <StatsCard
              color="#22c55e"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/promotions')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/promotions')}
              aria-label="Navigate to Promotions"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Promotions Value</Typography>
                    <Typography className="stat-value" sx={{ color: '#22c55e', fontSize: '1.4rem' }}>
                      {formatCurrency(stats.promotionTotalValue)}
                    </Typography>
                    <Typography className="stat-sub">
                      {stats.totalPromotions} promotions ({stats.activePromotions} active, {stats.pendingPromotions} pending)
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <StoreIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Announcements */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Manage announcements for your condominium">
            <StatsCard
              color="#D3AD32"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/announcements')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/announcements')}
              aria-label="Navigate to Announcements"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Announcements</Typography>
                    <Typography className="stat-value" sx={{ color: '#D3AD32' }}>{stats.totalAnnouncements}</Typography>
                    <Typography className="stat-sub">
                      {stats.pinnedAnnouncements} pinned notifications
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <CampaignIcon sx={{ color: '#D3AD32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Resident Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Review and resolve issues reported by residents">
            <StatsCard
              color="#ef4444"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/reports')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/reports')}
              aria-label="Navigate to Resident Reports"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Resident Reports</Typography>
                    <Typography className="stat-value" sx={{ color: '#ef4444' }}>{stats.totalReports}</Typography>
                    <Typography className="stat-sub">
                      {stats.pendingReports} pending | {stats.resolvedReports} resolved
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <ReportIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>

        {/* Lost & Found */}
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="View lost & found listings and community discussions">
            <StatsCard
              color="#3b82f6"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/condo-admin/lost-found')}
              onKeyDown={handleKeyDownNavigate('/condo-admin/lost-found')}
              aria-label="Navigate to Lost & Found"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography className="stat-label">Lost & Found</Typography>
                    <Typography className="stat-value" sx={{ color: '#3b82f6' }}>{stats.totalLostFound}</Typography>
                    <Typography className="stat-sub">
                      {stats.openLostFound} open items
                    </Typography>
                  </Box>
                  <Box className="stat-icon">
                    <SearchIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Summary Banner (Interactive Drill-Down Tiles) */}
      <Paper
        sx={{
          p: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Tooltip title="Click to view residents">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/residents')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/residents')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Residents</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalResidents}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view blocks">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/blocks')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/blocks')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Blocks</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#D3AD32' }}>{stats.totalBlocks}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view units">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/rooms')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/rooms')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Units</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4a6cf7' }}>{stats.totalRooms}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view occupied rooms">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/rooms?status=occupied')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/rooms?status=occupied')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Occupancy</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.occupancyRate}%</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to view payments">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/payments')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/payments')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Revenue</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(stats.totalRevenue)}</Typography>
          </SummaryItem>
        </Tooltip>

        <Tooltip title="Click to manage Equb & Iddir">
          <SummaryItem
            role="button"
            tabIndex={0}
            onClick={() => navigate('/condo-admin/equbs')}
            onKeyDown={handleKeyDownNavigate('/condo-admin/equbs')}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Equb & Iddir</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
              {stats.totalEqubs + stats.totalIddirs}
            </Typography>
          </SummaryItem>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default Dashboard;
