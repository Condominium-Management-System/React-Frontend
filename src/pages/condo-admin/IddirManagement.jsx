// src/pages/condo-admin/IddirManagement.jsx
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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  MonetizationOn as MoneyIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
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
    color: color || '#10b981',
  },
}));

const IddirManagement = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const activeCondoId = user?.condoId;

  // Main State
  const [iddirs, setIddirs] = useState([]);
  const [condos, setCondos] = useState([]);
  const [selectedCondoFilter, setSelectedCondoFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search inside Modals
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [beneficiarySearchTerm, setBeneficiarySearchTerm] = useState('');
  const [residentSearchTerm, setResidentSearchTerm] = useState('');

  // Modal States
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingIddir, setEditingIddir] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedIddir, setSelectedIddir] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // Member Modal State
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [selectedIddirForMember, setSelectedIddirForMember] = useState(null);
  const [condoResidents, setCondoResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [submittingMember, setSubmittingMember] = useState(false);

  // Non-Random Disbursement Modal State ("for edir one person will recieved the collected money but not random")
  const [openDisburseModal, setOpenDisburseModal] = useState(false);
  const [selectedIddirForDisburse, setSelectedIddirForDisburse] = useState(null);
  const [disburseRecipientId, setDisburseRecipientId] = useState('');
  const [disburseAmount, setDisburseAmount] = useState(0);
  const [disburseReason, setDisburseReason] = useState('Mutual Aid Benefit Payout');
  const [disbursing, setDisbursing] = useState(false);
  const [disbursementCelebration, setDisbursementCelebration] = useState(null);
  // Payout & Source Account States
  const [condoSourceAccounts, setCondoSourceAccounts] = useState([]);
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState('');
  const [recipientAccounts, setRecipientAccounts] = useState([]);
  const [selectedDestAccountId, setSelectedDestAccountId] = useState('');
  const [loadingRecipientAccounts, setLoadingRecipientAccounts] = useState(false);


  // Form State
  const [formData, setFormData] = useState({
    condoId: '',
    name: '',
    contributionAmount: 500,
    startedDate: new Date().toISOString().split('T')[0],
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

  // Fetch Iddirs from Backend API
  const fetchIddirs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (isSuperAdmin) {
        if (selectedCondoFilter !== 'ALL') params.condoId = selectedCondoFilter;
      } else if (activeCondoId) {
        params.condoId = activeCondoId;
      }
      const res = await api.iddirs.getAll(params);
      const data = res.data.iddirs || res.data.data || [];
      setIddirs(data);

      setSelectedIddir((prev) => {
        if (!prev) return null;
        const refreshed = data.find((i) => i.id === prev.id);
        return refreshed ? { ...prev, ...refreshed } : prev;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch Iddirs from server');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, selectedCondoFilter, activeCondoId]);

  useEffect(() => {
    fetchIddirs();
  }, [fetchIddirs]);

  // Fetch Residents for Add Member Modal
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

  // Filter Iddirs
  const filteredIddirs = iddirs.filter((iddir) => {
    const q = searchTerm.toLowerCase();
    const matchesCondo = selectedCondoFilter === 'ALL' || iddir.condoId === selectedCondoFilter;
    const matchesSearch =
      iddir.name?.toLowerCase().includes(q) ||
      iddir.condo?.condoName?.toLowerCase().includes(q) ||
      iddir.condo?.condoCode?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || iddir.status === statusFilter;
    return matchesCondo && matchesSearch && matchesStatus;
  });

  const paginatedIddirs = filteredIddirs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Stats Calculations
  const totalIddirs = iddirs.length;
  const activeIddirs = iddirs.filter((i) => i.status === 'active').length;
  const totalMembers = iddirs.reduce((sum, i) => sum + (i.noMembers || i.members?.length || 0), 0);
  const totalFundCollected = iddirs.reduce((sum, i) => {
    const memberPaidSum = i.members?.reduce((mSum, m) => mSum + Number(m.totalPaid || 0), 0) || 0;
    return sum + memberPaidSum;
  }, 0);
  const totalFundDisbursed = iddirs.reduce((sum, i) => {
    const memberRecSum = i.members?.reduce((mSum, m) => mSum + Number(m.totalReceived || 0), 0) || 0;
    return sum + memberRecSum;
  }, 0);
  const totalAvailableBalance = Math.max(0, totalFundCollected - totalFundDisbursed);

  // Handle Create / Edit
  const handleOpenCreate = () => {
    setEditingIddir(null);
    setFormData({
      condoId: selectedCondoFilter !== 'ALL' ? selectedCondoFilter : (condos[0]?.id || ''),
      name: '',
      contributionAmount: 500,
      startedDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setOpenCreateModal(true);
  };

  const handleOpenEdit = (iddir) => {
    setEditingIddir(iddir);
    setFormData({
      condoId: iddir.condoId,
      name: iddir.name,
      contributionAmount: Number(iddir.contributionAmount),
      startedDate: new Date(iddir.startedDate).toISOString().split('T')[0],
      status: iddir.status,
    });
    setOpenCreateModal(true);
  };

  const handleSubmitIddir = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter an Iddir name');
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

      if (editingIddir) {
        await api.iddirs.update(editingIddir.id, payload);
        toast.success('Iddir updated successfully!');
      } else {
        await api.iddirs.create(payload);
        toast.success('Iddir created successfully!');
      }

      setOpenCreateModal(false);
      fetchIddirs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Iddir');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteIddir = async (iddir) => {
    if (!window.confirm(`Are you sure you want to delete "${iddir.name}"?`)) return;
    try {
      await api.iddirs.delete(iddir.id);
      toast.success('Iddir deleted successfully!');
      fetchIddirs();
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = err.response.data?.message || 'This Iddir has active members or financial history.';
        const shouldDeactivate = window.confirm(
          `${msg}\n\nWould you like to deactivate this Iddir instead to preserve audit records?`
        );
        if (shouldDeactivate) {
          try {
            await api.iddirs.update(iddir.id, { status: 'inactive' });
            toast.success(`Iddir "${iddir.name}" marked as inactive.`);
            fetchIddirs();
          } catch (updateErr) {
            toast.error(updateErr.response?.data?.message || 'Failed to deactivate Iddir');
          }
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete Iddir');
      }
    }
  };

  // Handle View Details
  const handleViewDetails = async (iddir) => {
    setDetailTab(0);
    setSelectedIddir(iddir);
    setOpenDetailModal(true);
    setLoadingDetail(true);
    try {
      const res = await api.iddirs.getById(iddir.id);
      const data = res.data?.data || res.data?.iddir || res.data;
      if (data) {
        setSelectedIddir(data);
      }
    } catch (err) {
      console.error('Failed to load full Iddir details:', err);
      toast.error('Could not load detailed Iddir profile from server');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add Member
  const handleOpenAddMember = (iddir) => {
    setSelectedIddirForMember(iddir);
    setSelectedResidentId('');
    setResidentSearchTerm('');
    fetchResidents(iddir.condoId);
    setOpenAddMemberModal(true);
  };

  const handleAddMemberSubmit = async () => {
    if (!selectedResidentId) {
      toast.error('Please select a resident to add');
      return;
    }
    try {
      setSubmittingMember(true);
      await api.iddirs.addMember(selectedIddirForMember.id, selectedResidentId);
      toast.success('Resident added to Iddir successfully!');
      setOpenAddMemberModal(false);
      fetchIddirs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member to Iddir');
    } finally {
      setSubmittingMember(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (iddirId, userId, memberName) => {
    if (!window.confirm(`Remove ${memberName || 'this resident'} from the Iddir? Their historical aid and contribution records will be preserved.`)) return;
    try {
      const res = await api.iddirs.removeMember(iddirId, userId);
      toast.success(res.data?.message || 'Member removed from Iddir');
      fetchIddirs();
      try {
        const refreshed = await api.iddirs.getById(iddirId);
        const data = refreshed.data?.data || refreshed.data?.iddir || refreshed.data;
        if (data) setSelectedIddir(data);
      } catch (err) {
        // ignore
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Record Member Contribution
  const handleRecordContribution = async (iddir, member) => {
    const fixedAmount = Number(iddir.contributionAmount);
    if (!window.confirm(`Record monthly contribution of ETB ${fixedAmount.toLocaleString()} for ${member.user?.fullName}?`)) return;
    try {
      await api.iddirs.recordPayment(iddir.id, member.userId, { amount: fixedAmount });
      toast.success(`Recorded ETB ${fixedAmount.toLocaleString()} contribution!`);
      fetchIddirs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record contribution');
    }
  };

  // Open Non-Random Money Disbursement Modal
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

  const loadRecipientAccounts = async (userId) => {
    if (!userId) {
      setRecipientAccounts([]);
      setSelectedDestAccountId('');
      return;
    }
    try {
      setLoadingRecipientAccounts(true);
      const res = await api.accounts.getRecipientAccounts(userId);
      const list = res.data?.data || res.data || [];
      const safe = Array.isArray(list) ? list : [];
      setRecipientAccounts(safe);
      const defaultAcc = safe.find((a) => a.isDefault) || safe[0];
      if (defaultAcc) setSelectedDestAccountId(defaultAcc.id);
      else setSelectedDestAccountId('');
    } catch (err) {
      console.warn('Could not load recipient accounts:', err.message);
      setRecipientAccounts([]);
      setSelectedDestAccountId('');
    } finally {
      setLoadingRecipientAccounts(false);
    }
  };

  const handleOpenDisburse = (iddir, preselectedUserId = '') => {
    setSelectedIddirForDisburse(iddir);
    setDisburseRecipientId(preselectedUserId);
    setRecipientAccounts([]);
    setSelectedDestAccountId('');
    loadCondoAccounts();
    if (preselectedUserId) {
      loadRecipientAccounts(preselectedUserId);
    }
    const collected = (iddir.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
    const disbursed = (iddir.members || []).reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
    const available = Math.max(0, collected - disbursed);
    setDisburseAmount(available);
    setDisburseReason('Iddir Mutual Aid Benefit Payout');
    setOpenDisburseModal(true);
  };

  // Execute Non-Random Disbursement
  const handleExecuteDisburse = async () => {
    if (!disburseRecipientId) {
      toast.error('Please select a recipient member to receive the money');
      return;
    }
    const amount = Number(disburseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive disbursement amount');
      return;
    }

    try {
      setDisbursing(true);
      const res = await api.iddirs.disburse(selectedIddirForDisburse.id, {
        recipientUserId: disburseRecipientId,
        amount,
        reason: disburseReason,
        sourceCondoAccountId: selectedSourceAccountId || undefined,
        destinationAccountId: selectedDestAccountId || undefined,
      });

      toast.success('Iddir funds disbursed to member successfully!');
      setOpenDisburseModal(false);
      setDisbursementCelebration({
        recipientName: res.data?.data?.recipient?.fullName || 'Member',
        amount: res.data?.data?.amount || amount,
        reference: res.data?.data?.reference || `HX-IDDIR-${Date.now().toString().slice(-6)}`,
        iddirName: selectedIddirForDisburse.name,
        reason: disburseReason,
        sourceAccount: res.data?.data?.sourceAccount,
        recipientAccount: res.data?.data?.recipientAccount,
      });
      fetchIddirs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disburse Iddir funds');
    } finally {
      setDisbursing(false);
    }
  };

  const getStatusChip = (status) => {
    const isActive = status === 'active';
    return (
      <Chip
        icon={isActive ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <CancelIcon sx={{ fontSize: 13 }} />}
        label={isActive ? 'Active' : 'Inactive'}
        size="small"
        sx={{
          bgcolor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          color: isActive ? '#22c55e' : '#6b7280',
          fontWeight: 700,
          borderRadius: '6px',
        }}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ p: 1, bgcolor: '#1a1a2e', borderRadius: '10px', color: '#fff', display: 'flex' }}>
              <ShieldIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              Iddir Mutual Aid Management
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Equal monthly member contributions, emergency aid fund tracking, and selected member disbursements
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchIddirs}
            disabled={loading}
            sx={{ borderRadius: '10px', color: '#6b7a8f', borderColor: '#e5e7eb', textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            Create New Iddir
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#10b981">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL IDDIRS</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{totalIddirs}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><ShieldIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#3b82f6">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>ACTIVE IDDIRS</Typography>
                <Typography variant="h5" fontWeight={700} color="#3b82f6" sx={{ mt: 0.5 }}>{activeIddirs}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><CheckCircleIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#8b5cf6">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL MEMBERS</Typography>
                <Typography variant="h5" fontWeight={700} color="#8b5cf6" sx={{ mt: 0.5 }}>{totalMembers}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><PeopleIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#10b981">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>AVAILABLE FUND BALANCE</Typography>
                <Typography variant="h5" fontWeight={700} color="#10b981" sx={{ mt: 0.5 }}>
                  ETB {totalAvailableBalance.toLocaleString()}
                </Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><MoneyIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search Iddir by name, condominium, or code..."
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
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Iddirs Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Iddir Name</TableCell>
                <TableCell>Condominium</TableCell>
                <TableCell align="right">Equal Monthly Fee</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="right">Total Collected</TableCell>
                <TableCell align="right">Total Disbursed</TableCell>
                <TableCell align="right">Available Fund</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedIddirs.length > 0 ? (
                paginatedIddirs.map((iddir) => {
                  const membersCount = iddir.noMembers || iddir.members?.length || 0;
                  const activeMembersCount = iddir.members?.filter((m) => m.status === 'active').length || membersCount;
                  const collected = iddir.members?.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0) || 0;
                  const disbursed = iddir.members?.reduce((sum, m) => sum + Number(m.totalReceived || 0), 0) || 0;
                  const available = Math.max(0, collected - disbursed);

                  return (
                    <TableRow key={iddir.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                            <ShieldIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              {iddir.name}
                            </Typography>
                            <Typography variant="caption" color="#6b7a8f">
                              Started: {new Date(iddir.startedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                          {iddir.condo?.condoName || user?.condoName || 'Condominium'}
                        </Typography>
                        <Chip
                          label={iddir.condo?.condoCode || user?.condoCode || 'Condo'}
                          size="small"
                          sx={{ bgcolor: '#f1f3f5', color: '#6b7a8f', fontSize: '0.65rem', height: 20 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                          ETB {Number(iddir.contributionAmount).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">per member</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={`${activeMembersCount} members`}
                          size="small"
                          sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                          ETB {collected.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#ef4444">
                          ETB {disbursed.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#10b981">
                          ETB {available.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {getStatusChip(iddir.status)}
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {/* Disburse Money Button (NOT RANDOM) */}
                          <Tooltip title="Disburse collected money to selected member (Not random)">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDisburse(iddir)}
                                disabled={available <= 0}
                                sx={{
                                  color: available > 0 ? '#10b981' : '#d1d5db',
                                  bgcolor: available > 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {/* Add Member Button */}
                          <Tooltip title="Add Resident Member">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenAddMember(iddir)}
                              sx={{ color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                            >
                              <FaUserPlus size={14} />
                            </IconButton>
                          </Tooltip>

                          {/* View Details */}
                          <Tooltip title="View Detailed Fund Profile">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(iddir)}
                              sx={{ color: '#1a1a2e', bgcolor: '#f1f3f5' }}
                            >
                              <FaEye size={14} />
                            </IconButton>
                          </Tooltip>

                          {/* Edit */}
                          <Tooltip title="Edit Iddir">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(iddir)}
                              sx={{ color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' }}
                            >
                              <FaRegEdit size={14} />
                            </IconButton>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title="Delete Iddir">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteIddir(iddir)}
                              sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }}
                            >
                              <FaRegTrashAlt size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <ShieldIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">No Iddir Groups Found</Typography>
                    <Typography variant="body2" color="#9ca3af">Create an Iddir to start organizing mutual aid contributions.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredIddirs.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredIddirs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          )}
        </StyledTableContainer>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth disableRestoreFocus TransitionComponent={Zoom}>
        <form onSubmit={handleSubmitIddir}>
          <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              {editingIddir ? 'Edit Iddir Mutual Aid Group' : 'Create New Iddir Group'}
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              {isSuperAdmin
                ? 'Select the Condominium and configure fixed monthly member contribution'
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
                    disabled={Boolean(editingIddir)}
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
                label="Iddir Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Block C Bereavement & Mutual Aid Iddir"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Fixed Monthly Member Contribution (ETB)"
                type="number"
                fullWidth
                required
                value={formData.contributionAmount}
                onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                helperText="Every member of this Iddir pays this same fixed monthly contribution"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Initiation / Start Date"
                type="date"
                fullWidth
                required
                value={formData.startedDate}
                onChange={(e) => setFormData({ ...formData, startedDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: '#fff' }}
              />

              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active (Collecting contributions & disbursing aid)</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', textTransform: 'none', px: 3 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : editingIddir ? 'Update Iddir' : 'Create Iddir'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Resident Member Modal */}
      <Dialog open={openAddMemberModal} onClose={() => setOpenAddMemberModal(false)} maxWidth="sm" fullWidth disableRestoreFocus TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            Add Resident to Iddir
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Group: {selectedIddirForMember?.name} | Equal Monthly Fee: ETB {Number(selectedIddirForMember?.contributionAmount || 0).toLocaleString()}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px' }}>
            Residents can join multiple Iddirs and Equbs within their condominium. Each member pays the same fixed contribution of <strong>ETB {Number(selectedIddirForMember?.contributionAmount || 0).toLocaleString()}</strong>.
          </Alert>

          {loadingResidents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#10b981' }} />
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
                    .filter((r) => !selectedIddirForMember?.members?.some((m) => m.userId === r.id && m.status === 'active'))
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
            sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', textTransform: 'none', px: 3 }}
          >
            {submittingMember ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disburse Iddir Fund to Selected Member Modal (NOT RANDOM) */}
      <Dialog open={openDisburseModal} onClose={() => setOpenDisburseModal(false)} maxWidth="sm" fullWidth disableRestoreFocus TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon sx={{ color: '#10b981' }} />
            Disburse Iddir Fund to Selected Member
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {selectedIddirForDisburse?.name} (Non-random disbursement to recipient)
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {selectedIddirForDisburse && (() => {
            const collected = (selectedIddirForDisburse.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
            const disbursed = (selectedIddirForDisburse.members || []).reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
            const available = Math.max(0, collected - disbursed);

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Typography variant="caption" color="#6b7a8f" fontWeight={600}>CURRENT AVAILABLE FUND IN IDDIR</Typography>
                  <Typography variant="h4" fontWeight={700} color="#10b981" sx={{ mt: 0.5 }}>
                    ETB {available.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="#6b7a8f">
                    Total collected: ETB {collected.toLocaleString()} | Previously disbursed: ETB {disbursed.toLocaleString()}
                  </Typography>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: '10px' }}>
                  <strong>Selected Recipient Rule:</strong> Unlike Equb rotation lottery, Iddir funds are disbursed directly to a chosen beneficiary member (e.g. for bereavement, mutual aid, or scheduled medical support).
                </Alert>

                <FormControl fullWidth required sx={{ bgcolor: '#fff' }} size="small">
                  <InputLabel>1. Select Beneficiary Member (Recipient) *</InputLabel>
                  <Select
                    value={disburseRecipientId}
                    label="1. Select Beneficiary Member (Recipient) *"
                    onChange={(e) => {
                      const val = e.target.value;
                      setDisburseRecipientId(val);
                      loadRecipientAccounts(val);
                    }}
                  >
                    {selectedIddirForDisburse.members
                      ?.filter((m) => m.status === 'active')
                      .map((member) => (
                        <MenuItem key={member.userId} value={member.userId}>
                          {member.user?.fullName} — Unit: {member.user?.block || '?'}/{member.user?.roomNo || '?'} (Contributed: ETB {Number(member.totalPaid || 0).toLocaleString()} | Previously Received: ETB {Number(member.totalReceived || 0).toLocaleString()})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {/* 2. Beneficiary Destination Account */}
                {disburseRecipientId && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                      2. Beneficiary Payout Destination Account:
                    </Typography>
                    {loadingRecipientAccounts ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                        <CircularProgress size={16} sx={{ color: '#10b981' }} />
                        <Typography variant="caption" color="#6b7a8f">Loading member's verified destination accounts...</Typography>
                      </Box>
                    ) : recipientAccounts.length === 0 ? (
                      <Alert severity="warning" sx={{ borderRadius: '10px', py: 0.5 }}>
                        <strong>No Destination Account Registered:</strong> This beneficiary has not registered any bank or mobile money account. They must add a payout account in their profile before Iddir funds can be disbursed.
                      </Alert>
                    ) : (
                      <FormControl fullWidth sx={{ bgcolor: '#fff' }} size="small">
                        <InputLabel>Select Destination Account</InputLabel>
                        <Select
                          value={selectedDestAccountId}
                          label="Select Destination Account"
                          onChange={(e) => setSelectedDestAccountId(e.target.value)}
                        >
                          {recipientAccounts.map((acc) => (
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
                    3. Condominium Funding Source Account:
                  </Typography>
                  {condoSourceAccounts.length === 0 ? (
                    <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5 }}>
                      <strong>No Source Account:</strong> No active condominium source account found. Please register a CBE or Telebirr account in Condo Accounts before disbursing money.
                    </Alert>
                  ) : (
                    <FormControl fullWidth sx={{ bgcolor: '#fff' }} size="small">
                      <InputLabel>Select Condominium Source Account</InputLabel>
                      <Select
                        value={selectedSourceAccountId}
                        label="Select Condominium Source Account"
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

                <TextField
                  label="Disbursement Amount (ETB) *"
                  type="number"
                  fullWidth
                  required
                  size="small"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(e.target.value)}
                  helperText={`Maximum available to disburse: ETB ${available.toLocaleString()}`}
                  sx={{ bgcolor: '#fff' }}
                />

                <TextField
                  label="Purpose / Reason for Disbursement"
                  fullWidth
                  size="small"
                  value={disburseReason}
                  onChange={(e) => setDisburseReason(e.target.value)}
                  placeholder="e.g. Bereavement support / Mutual aid benefit"
                  sx={{ bgcolor: '#fff' }}
                />
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDisburseModal(false)} disabled={disbursing} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteDisburse}
            disabled={disbursing || !disburseRecipientId || Number(disburseAmount) <= 0 || condoSourceAccounts.length === 0 || recipientAccounts.length === 0}
            startIcon={<PaymentIcon />}
            sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            {disbursing ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Disburse Funds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disbursement Receipt & Celebration Modal */}
      <Dialog open={Boolean(disbursementCelebration)} onClose={() => setDisbursementCelebration(null)} maxWidth="xs" fullWidth disableRestoreFocus TransitionComponent={Zoom}>
        {disbursementCelebration && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: '20px' }}>
            <Avatar sx={{ bgcolor: '#10b981', width: 72, height: 72, mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
              <PaymentIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} color="#1a1a2e" gutterBottom>
              Disbursement Confirmed
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#10b981">
              {disbursementCelebration.recipientName}
            </Typography>
            <Typography variant="body2" color="#6b7a8f" sx={{ mb: 2.5 }}>
              has received the collected money from <strong>{disbursementCelebration.iddirName}</strong>
            </Typography>

            <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', mb: 3 }}>
              <Typography variant="caption" color="#10b981" fontWeight={700}>AMOUNT DISBURSED</Typography>
              <Typography variant="h4" fontWeight={800} color="#10b981" sx={{ mt: 0.5 }}>
                ETB {disbursementCelebration.amount.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #d1d5db', textAlign: 'left', fontSize: '0.75rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Funding Source:</span>
                  <span style={{ fontWeight: 700 }}>{disbursementCelebration.sourceAccount?.accountName || 'Condo Source Account'} ({disbursementCelebration.sourceAccount?.maskedAccountNumber || '****'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Destination:</span>
                  <span style={{ fontWeight: 700 }}>{disbursementCelebration.recipientAccount?.bankName || 'Bank/Telebirr'} ({disbursementCelebration.recipientAccount?.maskedAccountNumber || '****'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Purpose:</span>
                  <span style={{ fontWeight: 600 }}>{disbursementCelebration.reason}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Official Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>{disbursementCelebration.reference}</span>
                </div>
              </Box>
            </Paper>

            <Button
              variant="contained"
              onClick={() => setDisbursementCelebration(null)}
              fullWidth
              sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', py: 1.2, textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
            >
              Done
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Details Modal */}
      <Dialog
        disableRestoreFocus
        open={openDetailModal}
        onClose={() => {
          setOpenDetailModal(false);
          setDetailTab(0);
          setSelectedIddir(null);
        }}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.3rem' }}>
              Iddir Mutual Aid Profile & Fund Tracking
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              {selectedIddir?.name} — {selectedIddir?.condo?.condoName || user?.condoName} ({selectedIddir?.condo?.condoCode || user?.condoCode})
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedIddir(null);
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
                Loading authoritative Iddir profile, members, and payment records...
              </Typography>
            </Box>
          ) : selectedIddir ? (() => {
            const activeCount = selectedIddir.members?.filter((m) => m.status === 'active').length || 0;
            const expected = selectedIddir.expectedContribution !== undefined
              ? Number(selectedIddir.expectedContribution)
              : activeCount * Number(selectedIddir.contributionAmount || 0);

            const approvedPayments = (selectedIddir.payments || []).filter((p) => p.status === 'approved');
            const totalCollectedFromPayments = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalPaidSumFromMembers = (selectedIddir.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
            const collected = selectedIddir.totalCollected !== undefined
              ? Number(selectedIddir.totalCollected)
              : (approvedPayments.length > 0 ? totalCollectedFromPayments : totalPaidSumFromMembers);

            const disbursed = selectedIddir.totalDisbursed !== undefined
              ? Number(selectedIddir.totalDisbursed)
              : (selectedIddir.members || []).reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);

            const available = Math.max(0, collected - disbursed);

            return (
              <Box>
                {/* Summary Header */}
                <Grid container spacing={2} sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e9ecef' }}>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="#6b7a8f">EQUAL MONTHLY FEE</Typography>
                    <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                      ETB {Number(selectedIddir.contributionAmount || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="#6b7a8f">MONTHLY POOL</Typography>
                    <Typography variant="h6" fontWeight={700} color="#3b82f6">
                      ETB {expected.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="#6b7a8f">TOTAL COLLECTED</Typography>
                    <Typography variant="h6" fontWeight={700} color="#10b981">
                      ETB {collected.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="#6b7a8f">TOTAL DISBURSED</Typography>
                    <Typography variant="h6" fontWeight={700} color="#ef4444">
                      ETB {disbursed.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="#6b7a8f">AVAILABLE BALANCE</Typography>
                    <Typography variant="h6" fontWeight={800} color="#10b981">
                      ETB {available.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Tabs */}
                <Tabs
                  value={detailTab >= 0 && detailTab <= 3 ? detailTab : 0}
                  onChange={(_, v) => setDetailTab(v)}
                  sx={{ bgcolor: '#fff', borderBottom: '1px solid #e9ecef', px: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
                >
                  <Tab label={`Members (${selectedIddir.members?.length || 0})`} icon={<PeopleIcon />} iconPosition="start" />
                  <Tab label={`Benefit Recipients (${selectedIddir.members?.filter((m) => Number(m.totalReceived || 0) > 0).length || 0})`} icon={<PaymentIcon />} iconPosition="start" />
                  <Tab label={`Payment Records (${selectedIddir.payments?.length || 0})`} icon={<PaymentIcon />} iconPosition="start" />
                  <Tab label="Condominium & Fund Overview" icon={<ApartmentIcon />} iconPosition="start" />
                </Tabs>

                {/* Tab 0: Members */}
                {detailTab === 0 && (() => {
                  const filteredMembers = (selectedIddir.members || []).filter((member) => {
                    const q = memberSearchTerm.toLowerCase();
                    return (
                      member.user?.fullName?.toLowerCase().includes(q) ||
                      member.user?.phoneNumber?.toLowerCase().includes(q) ||
                      member.user?.email?.toLowerCase().includes(q) ||
                      member.user?.fan?.toLowerCase().includes(q) ||
                      String(member.user?.block || '').toLowerCase().includes(q) ||
                      String(member.user?.roomNo || '').toLowerCase().includes(q) ||
                      (Number(member.totalReceived || 0) > 0 ? 'recipient benefit' : '').includes(q)
                    );
                  });

                  return (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">
                            Registered Members (Fixed Monthly Fee: ETB {Number(selectedIddir.contributionAmount).toLocaleString()})
                          </Typography>
                          <Typography variant="caption" color="#6b7a8f">
                            Showing {filteredMembers.length} of {selectedIddir.members?.length || 0} members
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleOpenDisburse(selectedIddir)}
                            disabled={available <= 0}
                            sx={{ bgcolor: '#10b981', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#059669' } }}
                          >
                            Disburse Collected Money
                          </Button>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenAddMember(selectedIddir)}
                            sx={{ bgcolor: '#1a1a2e', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#16213e' } }}
                          >
                            Add Member
                          </Button>
                        </Box>
                      </Box>

                      {/* Member Search Bar */}
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Search members by name, phone, unit (block/room), FAN, or benefit status..."
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
                                bgcolor: Number(member.totalReceived || 0) > 0 ? 'rgba(16, 185, 129, 0.04)' : '#fff',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: Number(member.totalReceived || 0) > 0 ? '#10b981' : '#1a1a2e', width: 40, height: 40 }}>
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
                                    {Number(member.totalReceived || 0) > 0 && (
                                      <Chip
                                        label={`Beneficiary (ETB ${Number(member.totalReceived).toLocaleString()})`}
                                        size="small"
                                        icon={<PaymentIcon sx={{ fontSize: 13 }} />}
                                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 700, height: 22 }}
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
                                  <Typography variant="body2" fontWeight={700} color="#10b981">
                                    ETB {Number(member.totalPaid || 0).toLocaleString()}
                                  </Typography>
                                </Box>

                                {/* Pay contribution */}
                                {member.status === 'active' ? (
                                  <Tooltip title={`Record contribution of ETB ${Number(selectedIddir.contributionAmount).toLocaleString()}`}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handleRecordContribution(selectedIddir, member)}
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

                                {/* Disburse to this specific member */}
                                {member.status === 'active' ? (
                                  <Tooltip title={`Disburse collected money to ${member.user?.fullName}`}>
                                    <span>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleOpenDisburse(selectedIddir, member.userId)}
                                        disabled={available <= 0}
                                        sx={{ textTransform: 'none', borderRadius: '8px', color: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
                                      >
                                        Disburse
                                      </Button>
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Member is inactive; cannot disburse funds">
                                    <span>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        disabled
                                        sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                                      >
                                        Disburse
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )}

                                {/* Remove */}
                                {member.status === 'active' ? (
                                  <Tooltip title="Remove Member">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveMember(selectedIddir.id, member.userId, member.user?.fullName)}
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

                {/* Tab 1: Benefit Recipients / Disbursements */}
                {detailTab === 1 && (() => {
                  const recipients = (selectedIddir.members || [])
                    .filter((m) => Number(m.totalReceived || 0) > 0)
                    .filter((m) => {
                      const q = beneficiarySearchTerm.toLowerCase();
                      return (
                        m.user?.fullName?.toLowerCase().includes(q) ||
                        m.user?.phoneNumber?.toLowerCase().includes(q) ||
                        m.user?.email?.toLowerCase().includes(q) ||
                        String(m.user?.block || '').toLowerCase().includes(q) ||
                        String(m.user?.roomNo || '').toLowerCase().includes(q)
                      );
                    });

                  return (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">
                            Beneficiary Members (Received Mutual Aid Payouts)
                          </Typography>
                          <Typography variant="caption" color="#6b7a8f">
                            Showing {recipients.length} members who received funds
                          </Typography>
                        </Box>
                      </Box>

                      {/* Beneficiary Search Bar */}
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Search beneficiary by name, phone, unit, or FAN..."
                        value={beneficiarySearchTerm}
                        onChange={(e) => setBeneficiarySearchTerm(e.target.value)}
                        sx={{ mb: 2, bgcolor: '#fff' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#6b7a8f' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {recipients.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {recipients.map((m) => (
                            <Paper key={m.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                  <PaymentIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                                    {m.user?.fullName}
                                  </Typography>
                                  <Typography variant="caption" color="#6b7a8f">
                                    Unit: {m.user?.block || 'Block ?'} / Rm {m.user?.roomNo || '?'} | Phone: {m.user?.phoneNumber || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="#10b981" fontWeight={600}>Total Aid Received</Typography>
                                <Typography variant="h6" fontWeight={700} color="#10b981">
                                  ETB {Number(m.totalReceived || 0).toLocaleString()}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <PaymentIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
                          <Typography variant="body2" color="#6b7a8f">
                            {beneficiarySearchTerm ? 'No beneficiaries matching your search' : 'No fund disbursements completed yet.'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}

                {/* Tab 2: Payment Records */}
                {detailTab === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" sx={{ mb: 2 }}>
                      Contribution Payment History ({selectedIddir.payments?.length || 0})
                    </Typography>
                    {selectedIddir.payments && selectedIddir.payments.length > 0 ? (
                      <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, color: '#6b7a8f' }}>Resident</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#6b7a8f' }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#6b7a8f' }}>Reference</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#6b7a8f' }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#6b7a8f' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedIddir.payments.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>{p.user?.fullName || 'Resident'}</Typography>
                                  <Typography variant="caption" color="#6b7a8f">
                                    Unit: {p.user?.block || 'Block ?'} / Rm {p.user?.roomNo || '?'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700} color="#10b981">
                                    ETB {Number(p.amount).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                    {p.transaction?.referenceNo || p.id.slice(0, 8)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" color="#6b7a8f">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={p.status || 'approved'}
                                    size="small"
                                    sx={{
                                      bgcolor: p.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(211, 173, 50, 0.1)',
                                      color: p.status === 'approved' ? '#10b981' : '#b08822',
                                      fontWeight: 600,
                                      height: 22,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <PaymentIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
                        <Typography variant="body2" color="#6b7a8f">
                          No contribution records recorded yet for this Iddir.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Tab 3: Condominium Details & Overview */}
                {detailTab === 3 && (
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                          <Typography variant="caption" color="#6b7a8f" fontWeight={600}>CONDOMINIUM INFORMATION</Typography>
                          <Typography variant="h6" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>
                            {selectedIddir.condo?.condoName || user?.condoName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="#6b7a8f">
                            Code: <strong>{selectedIddir.condo?.condoCode || user?.condoCode}</strong>
                          </Typography>
                          {selectedIddir.condo?.city && (
                            <Typography variant="body2" color="#6b7a8f">
                              City/Subcity: {selectedIddir.condo.city}, {selectedIddir.condo.subCity || ''}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                          <Typography variant="caption" color="#6b7a8f" fontWeight={600}>MUTUAL AID FUND BALANCE</Typography>
                          <Typography variant="h5" fontWeight={800} color="#10b981" sx={{ mt: 0.5 }}>
                            ETB {available.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="#6b7a8f" sx={{ mt: 1 }}>
                            Total Active Members: <strong>{activeCount}</strong>
                          </Typography>
                          <Typography variant="body2" color="#6b7a8f">
                            Established Date: {new Date(selectedIddir.startedDate).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            );
          })() : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="#ef4444">
                No Iddir information found or an error occurred.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedIddir(null);
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

export default IddirManagement;
