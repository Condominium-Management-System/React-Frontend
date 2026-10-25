// src/pages/condo-admin/EqubManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Zoom,
  Tooltip,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Close as CloseIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Apartment as ApartmentIcon,
  Casino as CasinoIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaUserPlus, FaUserMinus, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

// Styled Components
const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
  background: '#ffffff',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)',
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7a8f',
    padding: '14px 20px',
    borderBottom: '2px solid #e9ecef',
  },
  '& .MuiTableCell-body': {
    padding: '14px 20px',
    fontSize: '0.875rem',
    color: '#2d3436',
    borderBottom: '1px solid #f1f3f5',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

const StatsCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color' })(({ color, active }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: `1px solid ${active ? color : 'rgba(0,0,0,0.04)'}`,
  background: active ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` : '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  },
  '.stat-icon': {
    width: 44,
    height: 44,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: color ? `${color}15` : '#f0f4ff',
    color: color || '#4a6cf7',
  },
}));

const EqubManagement = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const activeCondoId = user?.condoId;

  // Main State
  const [equbs, setEqubs] = useState([]);
  const [condos, setCondos] = useState([]);
  const [selectedCondoFilter, setSelectedCondoFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search inside Modals
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [winnerSearchTerm, setWinnerSearchTerm] = useState('');
  const [residentSearchTerm, setResidentSearchTerm] = useState('');

  // Modal States
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingEqub, setEditingEqub] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // Member Modal State
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [selectedEqubForMember, setSelectedEqubForMember] = useState(null);
  const [condoResidents, setCondoResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [submittingMember, setSubmittingMember] = useState(false);

  // Lottery / Winner Modal State
  const [openDrawModal, setOpenDrawModal] = useState(false);
  const [selectedEqubForDraw, setSelectedEqubForDraw] = useState(null);
  const [selectedWinnerUserId, setSelectedWinnerUserId] = useState('');
  const [drawingWinner, setDrawingWinner] = useState(false);
  const [winnerCelebration, setWinnerCelebration] = useState(null);
  // Payout & Source Account States
  const [condoSourceAccounts, setCondoSourceAccounts] = useState([]);
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState('');
  const [winnerAccounts, setWinnerAccounts] = useState([]);
  const [selectedDestAccountId, setSelectedDestAccountId] = useState('');
  const [loadingWinnerAccounts, setLoadingWinnerAccounts] = useState(false);


  // Form State
  const [formData, setFormData] = useState({
    condoId: '',
    name: '',
    contributionAmount: 5000,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load Condominiums if Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      api.condos.getAll().then((res) => {
        setCondos(res.data?.data || []);
      }).catch((err) => {
        console.error('Failed to load condominiums:', err);
      });
    }
  }, [isSuperAdmin]);

  // Fetch Equbs from Backend API
  const fetchEqubs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (isSuperAdmin) {
        if (selectedCondoFilter !== 'ALL') params.condoId = selectedCondoFilter;
      } else if (activeCondoId) {
        params.condoId = activeCondoId;
      }
      const res = await api.equbs.getAll(params);
      const data = res.data.equbs || res.data.data || [];
      setEqubs(data);

      // If details modal is open, refresh selectedEqub without triggering infinite effect loop
      setSelectedEqub((prev) => {
        if (!prev) return null;
        const refreshed = data.find((e) => e.id === prev.id);
        return refreshed ? { ...prev, ...refreshed } : prev;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch Equbs from server');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, selectedCondoFilter, activeCondoId]);

  useEffect(() => {
    fetchEqubs();
  }, [fetchEqubs]);

  // Fetch Condo Residents for Member Add Modal
  const fetchResidents = async (condoIdToUse) => {
    const targetCondo = condoIdToUse || activeCondoId;
    if (!targetCondo) {
      setCondoResidents([]);
      return;
    }
    try {
      setLoadingResidents(true);
      const res = await api.users.getAll(targetCondo);
      const residents = (res.data.data || res.data.users || []).filter((u) => u.role === 'resident');
      setCondoResidents(residents);
    } catch (err) {
      toast.error('Failed to load residents for selection');
    } finally {
      setLoadingResidents(false);
    }
  };

  // Filter Equbs
  const filteredEqubs = equbs.filter((equb) => {
    const q = searchTerm.toLowerCase();
    const matchesCondo = selectedCondoFilter === 'ALL' || equb.condoId === selectedCondoFilter;
    const matchesSearch =
      equb.name?.toLowerCase().includes(q) ||
      equb.condo?.condoName?.toLowerCase().includes(q) ||
      equb.condo?.condoCode?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || equb.status === statusFilter;
    return matchesCondo && matchesSearch && matchesStatus;
  });

  const paginatedEqubs = filteredEqubs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Stats Calculations
  const totalEqubs = equbs.length;
  const activeEqubs = equbs.filter((e) => e.status === 'active').length;
  const totalMembers = equbs.reduce((sum, e) => sum + (e.noMembers || e.members?.length || 0), 0);
  const totalMoneyCollected = equbs.reduce((sum, e) => {
    const memberPaidSum = e.members?.reduce((mSum, m) => mSum + Number(m.totalPaid || 0), 0) || 0;
    return sum + memberPaidSum;
  }, 0);

  // Handle Create / Edit Equb
  const handleOpenCreate = () => {
    setEditingEqub(null);
    setFormData({
      condoId: selectedCondoFilter !== 'ALL' ? selectedCondoFilter : (condos[0]?.id || ''),
      name: '',
      contributionAmount: 5000,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setOpenCreateModal(true);
  };

  const handleOpenEdit = (equb) => {
    setEditingEqub(equb);
    setFormData({
      condoId: equb.condoId,
      name: equb.name,
      contributionAmount: Number(equb.contributionAmount),
      startDate: new Date(equb.startDate).toISOString().split('T')[0],
      dueDate: new Date(equb.dueDate).toISOString().split('T')[0],
      status: equb.status,
    });
    setOpenCreateModal(true);
  };

  const handleSubmitEqub = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter an Equb name');
      return;
    }

    const condoIdToUse = isSuperAdmin ? formData.condoId : activeCondoId;
    if (isSuperAdmin && !condoIdToUse) {
      toast.error('Please select a Condominium');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        contributionAmount: Number(formData.contributionAmount),
        condoId: condoIdToUse,
      };

      if (editingEqub) {
        await api.equbs.update(editingEqub.id, payload);
        toast.success('Equb updated successfully!');
      } else {
        await api.equbs.create(payload);
        toast.success('Equb created successfully!');
      }

      setOpenCreateModal(false);
      fetchEqubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Equb');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Equb
  const handleDeleteEqub = async (equb) => {
    if (!window.confirm(`Are you sure you want to delete "${equb.name}"?`)) return;
    try {
      await api.equbs.delete(equb.id);
      toast.success('Equb deleted successfully!');
      fetchEqubs();
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = err.response.data?.message || 'This Equb has active members or financial history.';
        const shouldCancel = window.confirm(
          `${msg}\n\nWould you like to cancel this Equb instead to preserve audit records?`
        );
        if (shouldCancel) {
          try {
            await api.equbs.update(equb.id, { status: 'cancelled' });
            toast.success(`Equb "${equb.name}" marked as cancelled.`);
            fetchEqubs();
          } catch (updateErr) {
            toast.error(updateErr.response?.data?.message || 'Failed to cancel Equb');
          }
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete Equb');
      }
    }
  };

  const handleViewDetails = async (equb) => {
    setDetailTab(0);
    setSelectedEqub(equb);
    setOpenDetailModal(true);
    setLoadingDetail(true);
    try {
      const res = await api.equbs.getById(equb.id);
      const data = res.data?.data || res.data?.equb || res.data;
      if (data) {
        setSelectedEqub(data);
      }
    } catch (err) {
      console.error('Failed to load full Equb details:', err);
      toast.error('Could not load detailed Equb profile from server');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Add Member Modal
  const handleOpenAddMember = (equb) => {
    setSelectedEqubForMember(equb);
    setSelectedResidentId('');
    setResidentSearchTerm('');
    fetchResidents(equb.condoId);
    setOpenAddMemberModal(true);
  };

  const handleAddMemberSubmit = async () => {
    if (!selectedResidentId) {
      toast.error('Please select a resident to add');
      return;
    }
    try {
      setSubmittingMember(true);
      await api.equbs.addMember(selectedEqubForMember.id, selectedResidentId);
      toast.success('Resident added to Equb successfully!');
      setOpenAddMemberModal(false);
      fetchEqubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member to Equb');
    } finally {
      setSubmittingMember(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (equbId, userId, memberName) => {
    if (!window.confirm(`Remove ${memberName || 'this resident'} from the Equb? Their historical payment and rotation records will be preserved.`)) return;
    try {
      const res = await api.equbs.removeMember(equbId, userId);
      toast.success(res.data?.message || 'Member removed from Equb');
      fetchEqubs();
      // If detail modal is open, refresh detailed view
      try {
        const refreshed = await api.equbs.getById(equbId);
        const data = refreshed.data?.data || refreshed.data?.equb || refreshed.data;
        if (data) setSelectedEqub(data);
      } catch (err) {
        // ignore
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Record Member Contribution
  const handleRecordContribution = async (equb, member) => {
    const fixedAmount = Number(equb.contributionAmount);
    if (!window.confirm(`Record contribution payment of ETB ${fixedAmount.toLocaleString()} for ${member.user?.fullName}?`)) return;
    try {
      await api.equbs.recordPayment(equb.id, member.userId, { amount: fixedAmount });
      toast.success(`Recorded ETB ${fixedAmount.toLocaleString()} contribution!`);
      fetchEqubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record contribution');
    }
  };

  // Open Draw / Lottery Modal
  const loadCondoAccounts = async () => {
    try {
      const res = await api.condoAccounts.getAll();
      const list = res.data?.data || res.data || [];
      const safe = Array.isArray(list) ? list : [];
      setCondoSourceAccounts(safe);
      const defaultAcc = safe.find((a) => a.isDefault) || safe[0];
      if (defaultAcc) setSelectedSourceAccountId(defaultAcc.id);
    } catch (err) {
      console.warn('Could not load condo source accounts:', err.message);
    }
  };

  const loadWinnerAccounts = async (userId) => {
    if (!userId) {
      setWinnerAccounts([]);
      setSelectedDestAccountId('');
      return;
    }
    try {
      setLoadingWinnerAccounts(true);
      const res = await api.accounts.getRecipientAccounts(userId);
      const list = res.data?.data || res.data || [];
      const safe = Array.isArray(list) ? list : [];
      setWinnerAccounts(safe);
      const defaultAcc = safe.find((a) => a.isDefault) || safe[0];
      if (defaultAcc) setSelectedDestAccountId(defaultAcc.id);
      else setSelectedDestAccountId('');
    } catch (err) {
      console.warn('Could not load recipient accounts:', err.message);
      setWinnerAccounts([]);
      setSelectedDestAccountId('');
    } finally {
      setLoadingWinnerAccounts(false);
    }
  };

  const handleOpenDraw = (equb) => {
    setSelectedEqubForDraw(equb);
    setSelectedWinnerUserId('');
    setWinnerAccounts([]);
    setSelectedDestAccountId('');
    loadCondoAccounts();
    setOpenDrawModal(true);
  };

  const handleExecuteDraw = async () => {
    try {
      setDrawingWinner(true);
      const payload = {
        winnerUserId: selectedWinnerUserId || undefined,
        sourceCondoAccountId: selectedSourceAccountId || undefined,
        destinationAccountId: selectedDestAccountId || undefined,
      };
      const res = await api.equbs.drawWinner(selectedEqubForDraw.id, payload);
      const payout = res.data.data;

      setOpenDrawModal(false);
      setWinnerCelebration({
        equbName: selectedEqubForDraw.name,
        winnerName: payout.winner?.fullName || 'Winner',
        amount: Number(payout.amount),
        roundNumber: payout.roundNumber,
        reference: payout.selectionReference,
        sourceAccount: payout.sourceAccount,
        destinationAccount: payout.destinationAccount,
      });

      toast.success('🎉 Equb winner drawn and payout disbursed successfully!');
      fetchEqubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to draw Equb winner');
    } finally {
      setDrawingWinner(false);
    }
  };

  const getStatusChip = (status) => {
    const map = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Active' },
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending' },
      completed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Completed' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Cancelled' },
    };
    const c = map[status] || map.pending;
    return (
      <Chip
        label={c.label}
        size="small"
        sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, borderRadius: '6px' }}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ p: 1, bgcolor: '#D3AD32', borderRadius: '10px', color: '#fff', display: 'flex' }}>
              <AccountBalanceIcon />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#1a1a2e">
              Equb Management
            </Typography>
          </Box>
          <Typography variant="body2" color="#6b7a8f">
            Manage condominium rotating savings, member contributions, and lottery rotation payouts for{' '}
            <strong>{user?.condoName || 'your condominium'}</strong> ({user?.condoCode || 'Condo'})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEqubs}
            disabled={loading}
            sx={{ borderRadius: '10px', borderColor: '#e0e0e0', color: '#6b7a8f', textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Create Equb
          </Button>
        </Box>
      </Box>

      {/* Condominium Banner */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#D3AD32', width: 48, height: 48 }}>
            <ApartmentIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {user?.condoName || 'Condominium Community Equb'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Condo Code: <strong style={{ color: '#D3AD32' }}>{user?.condoCode || 'N/A'}</strong> | All members contribute the same fixed amount per rotation cycle
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#D3AD32" active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL EQUBS</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{totalEqubs}</Typography>
              </Box>
              <Box className="stat-icon"><AccountBalanceIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#22c55e" active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>ACTIVE ROTATIONS</Typography>
                <Typography variant="h5" fontWeight={700} color="#22c55e" sx={{ mt: 0.5 }}>{activeEqubs}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><TrendingUpIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4a6cf7">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>REGISTERED MEMBERS</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{totalMembers}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(74, 108, 247, 0.1)', color: '#4a6cf7' }}><PeopleIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#c49a2b">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL COLLECTED POOL</Typography>
                <Typography variant="h5" fontWeight={700} color="#D3AD32" sx={{ mt: 0.5 }}>
                  ETB {totalMoneyCollected.toLocaleString()}
                </Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32' }}><MoneyIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search Equb by name, condominium, or code..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: '220px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6b7a8f' }} />
              </InputAdornment>
            ),
          }}
        />

        {isSuperAdmin && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Condominium</InputLabel>
            <Select
              value={selectedCondoFilter}
              label="Condominium"
              onChange={(e) => setSelectedCondoFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Condominiums</MenuItem>
              {condos.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.condoName} ({c.condoCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Equbs Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equb Name</TableCell>
                <TableCell>Condominium</TableCell>
                <TableCell align="right">Fixed Contribution</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="right">Rotation Jackpot (Pot)</TableCell>
                <TableCell align="right">Total Collected</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEqubs.length > 0 ? (
                paginatedEqubs.map((equb) => {
                  const membersCount = equb.noMembers || equb.members?.length || 0;
                  const activeMembersCount = equb.members?.filter((m) => m.status === 'active').length || membersCount;
                  const contribution = Number(equb.contributionAmount || 0);
                  const jackpotAmount = activeMembersCount * contribution;
                  const collectedAmount = equb.members?.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0) || 0;

                  return (
                    <TableRow key={equb.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(211, 173, 50, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D3AD32' }}>
                            <AccountBalanceIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              {equb.name}
                            </Typography>
                            <Typography variant="caption" color="#6b7a8f">
                              Created: {new Date(equb.createdAt || equb.startDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                          {equb.condo?.condoName || user?.condoName || 'Condominium'}
                        </Typography>
                        <Chip
                          label={equb.condo?.condoCode || user?.condoCode || 'Condo'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#D3AD32">
                          ETB {contribution.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="#9ca3af">per member</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={`${activeMembersCount} Members`}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#22c55e">
                          ETB {jackpotAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="#22c55e">winner gets full pot</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                          ETB {collectedAmount.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {getStatusChip(equb.status)}
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details, Members & Payouts">
                            <IconButton size="small" onClick={() => handleViewDetails(equb)} sx={{ color: '#6b7a8f', '&:hover': { color: '#D3AD32' } }}>
                              <FaEye size={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Add Resident to Equb">
                            <IconButton size="small" onClick={() => handleOpenAddMember(equb)} sx={{ color: '#6b7a8f', '&:hover': { color: '#22c55e' } }}>
                              <FaUserPlus size={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Draw Lottery Winner for this Round">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDraw(equb)}
                                disabled={equb.status !== 'active'}
                                sx={{ color: '#6b7a8f', '&:hover': { color: '#f59e0b' } }}
                              >
                                <CasinoIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Edit Equb">
                            <IconButton size="small" onClick={() => handleOpenEdit(equb)} sx={{ color: '#6b7a8f', '&:hover': { color: '#4a6cf7' } }}>
                              <FaRegEdit size={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Equb">
                            <IconButton size="small" onClick={() => handleDeleteEqub(equb)} sx={{ color: '#6b7a8f', '&:hover': { color: '#ef4444' } }}>
                              <FaRegTrashAlt size={15} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">No Equbs Found</Typography>
                    <Typography variant="body2" color="#9ca3af">
                      Create an Equb to start managing rotating savings for your condominium
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredEqubs.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEqubs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          )}
        </StyledTableContainer>
      )}

      {/* Create / Edit Equb Modal */}
      <Dialog disableRestoreFocus open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <form onSubmit={handleSubmitEqub}>
          <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              {editingEqub ? 'Edit Equb Group' : 'Create New Equb Group'}
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              {isSuperAdmin
                ? 'Select the Condominium and configure fixed member contribution settings'
                : `Condominium: ${user?.condoName || 'Your Condominium'} (${user?.condoCode || 'Condo'})`}
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {isSuperAdmin && (
                <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                  <InputLabel>Target Condominium</InputLabel>
                  <Select
                    value={formData.condoId || ''}
                    label="Target Condominium"
                    disabled={Boolean(editingEqub)}
                    onChange={(e) => setFormData({ ...formData, condoId: e.target.value })}
                  >
                    {condos.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.condoName} ({c.condoCode}) - {c.city || 'City'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Equb Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Monthly Block A Family Equb"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Fixed Member Contribution Amount (ETB)"
                type="number"
                fullWidth
                required
                value={formData.contributionAmount}
                onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                helperText="All members in this Equb will pay this same fixed contribution"
                sx={{ bgcolor: '#fff' }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rotation Start Date"
                    type="date"
                    fullWidth
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rotation Due Date"
                    type="date"
                    fullWidth
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active (Ready to accept members and payments)</MenuItem>
                  <MenuItem value="pending">Pending (Draft / Not started)</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Button onClick={() => setOpenCreateModal(false)} disabled={submitting} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', px: 3 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : editingEqub ? 'Update Equb' : 'Create Equb'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Resident Member Modal */}
      <Dialog disableRestoreFocus open={openAddMemberModal} onClose={() => setOpenAddMemberModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            Add Resident to Equb
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Group: {selectedEqubForMember?.name} | Fixed Contribution: ETB {Number(selectedEqubForMember?.contributionAmount || 0).toLocaleString()}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px' }}>
            Residents can join multiple Equbs and Iddirs within their condominium. Each member pays the same fixed contribution of <strong>ETB {Number(selectedEqubForMember?.contributionAmount || 0).toLocaleString()}</strong>.
          </Alert>

          {loadingResidents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#D3AD32' }} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search resident by name, phone, unit, or FAN..."
                value={residentSearchTerm}
                onChange={(e) => setResidentSearchTerm(e.target.value)}
                sx={{ bgcolor: '#fff' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6b7a8f' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Select Condominium Resident</InputLabel>
                <Select
                  value={selectedResidentId}
                  label="Select Condominium Resident"
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                >
                  {condoResidents
                    .filter((r) => !selectedEqubForMember?.members?.some((m) => m.userId === r.id && m.status === 'active'))
                    .filter((r) => {
                      const q = residentSearchTerm.toLowerCase();
                      return (
                        r.fullName?.toLowerCase().includes(q) ||
                        r.phoneNumber?.toLowerCase().includes(q) ||
                        r.email?.toLowerCase().includes(q) ||
                        r.fan?.toLowerCase().includes(q) ||
                        String(r.block || '').toLowerCase().includes(q) ||
                        String(r.roomNo || '').toLowerCase().includes(q)
                      );
                    })
                    .map((resident) => (
                      <MenuItem key={resident.id} value={resident.id}>
                        {resident.fullName} - Unit: {resident.block || 'Block ?'} / Rm {resident.roomNo || '?'} ({resident.phoneNumber || resident.email})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenAddMemberModal(false)} disabled={submittingMember} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMemberSubmit}
            disabled={submittingMember || !selectedResidentId}
            sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', textTransform: 'none', px: 3 }}
          >
            {submittingMember ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Draw Winner / Lottery Modal */}
      <Dialog disableRestoreFocus open={openDrawModal} onClose={() => setOpenDrawModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CasinoIcon sx={{ color: '#f59e0b' }} />
            Draw Equb Winner / Rotation Payout
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {selectedEqubForDraw?.name}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {selectedEqubForDraw && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid rgba(211, 173, 50, 0.2)' }}>
                <Typography variant="caption" color="#6b7a8f" fontWeight={600}>FULL ROTATION POT (WINNER GETS ALL)</Typography>
                <Typography variant="h4" fontWeight={700} color="#22c55e" sx={{ mt: 0.5 }}>
                  ETB {(
                    (selectedEqubForDraw.members?.filter((m) => m.status === 'active').length || 0) *
                    Number(selectedEqubForDraw.contributionAmount || 0)
                  ).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="#6b7a8f">
                  Calculated from {selectedEqubForDraw.members?.filter((m) => m.status === 'active').length || 0} active members × ETB {Number(selectedEqubForDraw.contributionAmount || 0).toLocaleString()}
                </Typography>
              </Paper>

              <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                <strong>Rotation Rule:</strong> Once drawn, the winner receives the full collected pot for this round. They continue paying their fixed contribution, but must wait until all other members get their turn before winning again.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 1. Winner Selection */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                    1. Select Rotation Winner:
                  </Typography>
                  <FormControl fullWidth sx={{ bgcolor: '#fff' }} size="small">
                    <InputLabel>Lottery Draw Mode</InputLabel>
                    <Select
                      value={selectedWinnerUserId}
                      label="Lottery Draw Mode"
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedWinnerUserId(val);
                        loadWinnerAccounts(val);
                      }}
                    >
                      <MenuItem value="">
                        <em>🎲 Random Fair Draw (Pick randomly among remaining eligible members)</em>
                      </MenuItem>
                      {selectedEqubForDraw.members
                        ?.filter((m) => m.status === 'active' && !m.hasReceivedPayout)
                        .map((member) => (
                          <MenuItem key={member.userId} value={member.userId}>
                            Pick: {member.user?.fullName} (Unit: {member.user?.block || '?'}/{member.user?.roomNo || '?'})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* 2. Destination Account if specific winner selected */}
                {selectedWinnerUserId && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                      2. Winner Payout Destination Account:
                    </Typography>
                    {loadingWinnerAccounts ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                        <CircularProgress size={16} sx={{ color: '#D3AD32' }} />
                        <Typography variant="caption" color="#6b7a8f">Loading winner's verified payout accounts...</Typography>
                      </Box>
                    ) : winnerAccounts.length === 0 ? (
                      <Alert severity="warning" sx={{ borderRadius: '10px', py: 0.5 }}>
                        <strong>No Destination Account Registered:</strong> This resident has not added any bank or mobile money account to their profile. They must add a payout account in their profile before Equb funds can be transferred.
                      </Alert>
                    ) : (
                      <FormControl fullWidth sx={{ bgcolor: '#fff' }} size="small">
                        <InputLabel>Select Destination Account</InputLabel>
                        <Select
                          value={selectedDestAccountId}
                          label="Select Destination Account"
                          onChange={(e) => setSelectedDestAccountId(e.target.value)}
                        >
                          {winnerAccounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                              {acc.providerName || (acc.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr')} — {acc.maskedAccountNumber || `****${String(acc.accountNumber).slice(-4)}`} ({acc.accountName}){acc.isDefault ? ' [Primary Destination]' : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                )}

                {/* 3. Condominium Source Account */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                    {selectedWinnerUserId ? '3.' : '2.'} Condominium Funding Source Account:
                  </Typography>
                  {condoSourceAccounts.length === 0 ? (
                    <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5 }}>
                      <strong>No Source Account:</strong> No active condominium source account found. Please register a CBE or Telebirr account in Condo Accounts before processing payouts.
                    </Alert>
                  ) : (
                    <FormControl fullWidth sx={{ bgcolor: '#fff' }} size="small">
                      <InputLabel>Select Condominium Funding Source</InputLabel>
                      <Select
                        value={selectedSourceAccountId}
                        label="Select Condominium Funding Source"
                        onChange={(e) => setSelectedSourceAccountId(e.target.value)}
                      >
                        {condoSourceAccounts.map((acc) => (
                          <MenuItem key={acc.id} value={acc.id}>
                            {acc.accountName} — {acc.maskedAccountNumber || `****${String(acc.accountNumber).slice(-4)}`} (Avail: ETB {Number(acc.balance || 0).toLocaleString()}){acc.isDefault ? ' [Default Source]' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>

              <Paper sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #e9ecef' }}>
                <Typography variant="caption" color="#6b7a8f">ELIGIBLE MEMBERS REMAINING IN ROTATION CYCLE:</Typography>
                <Typography variant="body1" fontWeight={700} color="#1a1a2e">
                  {selectedEqubForDraw.members?.filter((m) => m.status === 'active' && !m.hasReceivedPayout).length || 0} out of {selectedEqubForDraw.members?.length || 0} members
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDrawModal(false)} disabled={drawingWinner} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteDraw}
            disabled={drawingWinner || selectedEqubForDraw?.members?.filter((m) => m.status === 'active' && !m.hasReceivedPayout).length === 0 || condoSourceAccounts.length === 0 || (Boolean(selectedWinnerUserId) && winnerAccounts.length === 0)}
            startIcon={<CasinoIcon />}
            sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            {drawingWinner ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Award Jackpot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Winner Celebration Modal */}
      <Dialog disableRestoreFocus open={Boolean(winnerCelebration)} onClose={() => setWinnerCelebration(null)} maxWidth="xs" fullWidth TransitionComponent={Zoom}>
        {winnerCelebration && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: '20px' }}>
            <Avatar sx={{ bgcolor: '#D3AD32', width: 72, height: 72, mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(211, 173, 50, 0.4)' }}>
              <TrophyIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} color="#1a1a2e" gutterBottom>
              🎉 Congratulations!
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#D3AD32">
              {winnerCelebration.winnerName}
            </Typography>
            <Typography variant="body2" color="#6b7a8f" sx={{ mb: 2.5 }}>
              has won Round {winnerCelebration.roundNumber} of <strong>{winnerCelebration.equbName}</strong>!
            </Typography>

            <Paper sx={{ p: 2.5, bgcolor: 'rgba(34, 197, 94, 0.08)', borderRadius: '12px', mb: 3 }}>
              <Typography variant="caption" color="#16a34a" fontWeight={700}>TOTAL JACKPOT AMOUNT AWARDED</Typography>
              <Typography variant="h4" fontWeight={800} color="#16a34a" sx={{ mt: 0.5 }}>
                ETB {winnerCelebration.amount.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #d1d5db', textAlign: 'left', fontSize: '0.75rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Funding Source:</span>
                  <span style={{ fontWeight: 700 }}>{winnerCelebration.sourceAccount?.accountName || 'Condo Source Account'} ({winnerCelebration.sourceAccount?.maskedAccountNumber || '****'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Destination:</span>
                  <span style={{ fontWeight: 700 }}>{winnerCelebration.destinationAccount?.providerName || 'Bank/Telebirr'} ({winnerCelebration.destinationAccount?.maskedAccountNumber || '****'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Official Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>{winnerCelebration.reference}</span>
                </div>
              </Box>
            </Paper>

            <Button
              variant="contained"
              onClick={() => setWinnerCelebration(null)}
              fullWidth
              sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', py: 1.2, textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
            >
              Done
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Equb Details Modal */}
      <Dialog
        disableRestoreFocus
        open={openDetailModal}
        onClose={() => {
          setOpenDetailModal(false);
          setDetailTab(0);
          setSelectedEqub(null);
        }}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.3rem' }}>
              Equb Rotation Details
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              {selectedEqub?.name} — {selectedEqub?.condo?.condoName || user?.condoName} ({selectedEqub?.condo?.condoCode || user?.condoCode})
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedEqub(null);
            }}
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa', minHeight: 400 }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
              <CircularProgress sx={{ color: '#D3AD32' }} size={42} />
              <Typography variant="body2" color="#6b7a8f" fontWeight={600}>
                Loading authoritative Equb rotation profile, members, and past winners...
              </Typography>
            </Box>
          ) : selectedEqub ? (
            <Box>
              {/* Summary Header */}
              <Grid container spacing={2} sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e9ecef' }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#6b7a8f">FIXED CONTRIBUTION</Typography>
                  <Typography variant="h6" fontWeight={700} color="#D3AD32">
                    ETB {Number(selectedEqub.contributionAmount || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#6b7a8f">ROTATION POT</Typography>
                  <Typography variant="h6" fontWeight={700} color="#22c55e">
                    ETB {(
                      (selectedEqub.members?.filter((m) => m.status === 'active').length || 0) *
                      Number(selectedEqub.contributionAmount || 0)
                    ).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#6b7a8f">TOTAL COLLECTED</Typography>
                  <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                    ETB {(selectedEqub.members?.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0) || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#6b7a8f">STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedEqub.status)}</Box>
                </Grid>
              </Grid>

              {/* Tabs */}
              <Tabs
                value={detailTab >= 0 && detailTab <= 2 ? detailTab : 0}
                onChange={(_, v) => setDetailTab(v)}
                sx={{ bgcolor: '#fff', borderBottom: '1px solid #e9ecef', px: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
              >
                <Tab label={`Members (${selectedEqub.members?.length || 0})`} icon={<PeopleIcon />} iconPosition="start" />
                <Tab label={`Past Winners (${selectedEqub.payouts?.length || 0})`} icon={<TrophyIcon />} iconPosition="start" />
                <Tab label="Condominium & Schedule" icon={<ApartmentIcon />} iconPosition="start" />
              </Tabs>

              {/* Tab 0: Members */}
              {detailTab === 0 && (() => {
                const filteredMembers = (selectedEqub.members || []).filter((member) => {
                  const q = memberSearchTerm.toLowerCase();
                  return (
                    member.user?.fullName?.toLowerCase().includes(q) ||
                    member.user?.phoneNumber?.toLowerCase().includes(q) ||
                    member.user?.email?.toLowerCase().includes(q) ||
                    member.user?.fan?.toLowerCase().includes(q) ||
                    String(member.user?.block || '').toLowerCase().includes(q) ||
                    String(member.user?.roomNo || '').toLowerCase().includes(q) ||
                    (member.hasReceivedPayout ? 'winner turn received' : 'waiting eligible').includes(q)
                  );
                });

                return (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">
                          All Registered Members (Fixed Contribution: ETB {Number(selectedEqub.contributionAmount).toLocaleString()})
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">
                          Showing {filteredMembers.length} of {selectedEqub.members?.length || 0} members
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddMember(selectedEqub)}
                        sx={{ bgcolor: '#D3AD32', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#c49a2b' } }}
                      >
                        Add Member
                      </Button>
                    </Box>

                    {/* Member Search Input */}
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Search member by name, phone, unit (block/room), FAN, or payout status..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      sx={{ mb: 2, bgcolor: '#fff' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#6b7a8f' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {filteredMembers.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {filteredMembers.map((member) => (
                          <Paper
                            key={member.id}
                            sx={{
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: '12px',
                              border: '1px solid #f1f3f5',
                              bgcolor: member.hasReceivedPayout ? 'rgba(211, 173, 50, 0.04)' : '#fff',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: member.hasReceivedPayout ? '#D3AD32' : '#4a6cf7', width: 40, height: 40 }}>
                                {member.user?.fullName?.charAt(0) || 'M'}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                                    {member.user?.fullName}
                                  </Typography>
                                  {member.status === 'inactive' ? (
                                    <Chip
                                      label="Inactive / Removed"
                                      size="small"
                                      sx={{ bgcolor: '#f1f3f5', color: '#6b7a8f', fontWeight: 600, height: 22 }}
                                    />
                                  ) : (
                                    <Chip
                                      label="Active"
                                      size="small"
                                      sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700, height: 22 }}
                                    />
                                  )}
                                  {member.hasReceivedPayout && (
                                    <Chip
                                      label="Winner (Turn Received)"
                                      size="small"
                                      icon={<TrophyIcon sx={{ fontSize: 13 }} />}
                                      sx={{ bgcolor: 'rgba(211, 173, 50, 0.15)', color: '#b08822', fontWeight: 700, height: 22 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="#6b7a8f">
                                  Unit: {member.user?.block || 'Block ?'} / Rm {member.user?.roomNo || '?'} | Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                  {member.leftAt && ` | Removed: ${new Date(member.leftAt).toLocaleDateString()}`}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="#6b7a8f">Total Contributed</Typography>
                                <Typography variant="body2" fontWeight={700} color="#D3AD32">
                                  ETB {Number(member.totalPaid || 0).toLocaleString()}
                                </Typography>
                              </Box>

                              {member.status === 'active' ? (
                                <Tooltip title={`Record contribution of ETB ${Number(selectedEqub.contributionAmount).toLocaleString()}`}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<PaymentIcon />}
                                    onClick={() => handleRecordContribution(selectedEqub, member)}
                                    sx={{ textTransform: 'none', borderRadius: '8px', color: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
                                  >
                                    Pay
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Member is inactive; contributions cannot be recorded">
                                  <span>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<PaymentIcon />}
                                      disabled
                                      sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                                    >
                                      Pay
                                    </Button>
                                  </span>
                                </Tooltip>
                              )}

                              {member.status === 'active' ? (
                                <Tooltip title="Remove Member">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveMember(selectedEqub.id, member.userId, member.user?.fullName)}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <FaUserMinus size={14} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Member is already inactive">
                                  <span>
                                    <IconButton size="small" disabled sx={{ color: '#9ca3af' }}>
                                      <FaUserMinus size={14} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
                        <Typography variant="body2" color="#6b7a8f">
                          {memberSearchTerm ? 'No members matching your search' : 'No members added yet.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })()}

              {/* Tab 1: Past Winners */}
              {detailTab === 1 && (() => {
                const filteredPayouts = (selectedEqub.payouts || []).filter((payout) => {
                  const q = winnerSearchTerm.toLowerCase();
                  return (
                    payout.winner?.fullName?.toLowerCase().includes(q) ||
                    payout.winner?.phoneNumber?.toLowerCase().includes(q) ||
                    payout.winner?.email?.toLowerCase().includes(q) ||
                    String(payout.roundNumber || '').toLowerCase().includes(q) ||
                    payout.selectionReference?.toLowerCase().includes(q) ||
                    payout.status?.toLowerCase().includes(q)
                  );
                });

                return (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">
                          Past Rotation Winners (Full Pot Recipients)
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">
                          Showing {filteredPayouts.length} of {selectedEqub.payouts?.length || 0} past winners
                        </Typography>
                      </Box>
                    </Box>

                    {/* Past Winners Search Input */}
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Search past winners by winner name, phone, round #, or reference..."
                      value={winnerSearchTerm}
                      onChange={(e) => setWinnerSearchTerm(e.target.value)}
                      sx={{ mb: 2, bgcolor: '#fff' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#6b7a8f' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {filteredPayouts.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {filteredPayouts.map((payout) => (
                          <Paper key={payout.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32' }}>
                                <TrophyIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                                  Round {payout.roundNumber}: {payout.winner?.fullName || 'Winner'}
                                </Typography>
                                <Typography variant="caption" color="#6b7a8f">
                                  Awarded on: {new Date(payout.selectedAt || payout.createdAt).toLocaleDateString()} | Ref: {payout.selectionReference}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="#16a34a">Jackpot Payout</Typography>
                              <Typography variant="h6" fontWeight={700} color="#16a34a">
                                ETB {Number(payout.amount).toLocaleString()}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <TrophyIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
                        <Typography variant="body2" color="#6b7a8f">
                          {winnerSearchTerm ? 'No past winners matching your search' : 'No rotation payouts completed yet.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })()}

              {/* Tab 2: Condominium Details & Schedule */}
              {detailTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                        <Typography variant="caption" color="#6b7a8f" fontWeight={600}>CONDOMINIUM</Typography>
                        <Typography variant="h6" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>
                          {selectedEqub.condo?.condoName || user?.condoName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="#6b7a8f">
                          Code: <strong>{selectedEqub.condo?.condoCode || user?.condoCode}</strong>
                        </Typography>
                        {selectedEqub.condo?.city && (
                          <Typography variant="body2" color="#6b7a8f">
                            Location: {selectedEqub.condo.city}, {selectedEqub.condo.subCity || ''} {selectedEqub.condo.woreda ? `(Woreda ${selectedEqub.condo.woreda})` : ''}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                        <Typography variant="caption" color="#6b7a8f" fontWeight={600}>ROTATION SCHEDULE</Typography>
                        <Typography variant="body2" color="#1a1a2e" sx={{ mt: 1 }}>
                          <strong>Start Date:</strong> {new Date(selectedEqub.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="#1a1a2e" sx={{ mt: 0.5 }}>
                          <strong>Due Date:</strong> {new Date(selectedEqub.dueDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="#1a1a2e" sx={{ mt: 0.5 }}>
                          <strong>Total Registered Members:</strong> {selectedEqub.members?.length || 0}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedEqub(null);
            }}
            variant="contained"
            sx={{ bgcolor: '#1a1a2e', color: '#fff', textTransform: 'none', px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EqubManagement;
