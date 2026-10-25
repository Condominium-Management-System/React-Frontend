// src/pages/super-admin/EqubIddirManagement.jsx
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
  AccountBalance as AccountBalanceIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  MonetizationOn as MoneyIcon,
  EmojiEvents as TrophyIcon,
  Apartment as ApartmentIcon,
  Add as AddIcon,
  Casino as CasinoIcon,
  Payment as PaymentIcon,
  VolunteerActivism as DisburseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaUserPlus, FaUserMinus, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { api } from '../../api/axiosConfig';

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
    color: color || '#D3AD32',
  },
}));

const EqubIddirManagement = () => {
  // Main State
  const [equbs, setEqubs] = useState([]);
  const [iddirs, setIddirs] = useState([]);
  const [condos, setCondos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCondoId, setSelectedCondoId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0); // 0 = Equbs, 1 = Iddirs

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create / Edit Modals
  const [openCreateEqubModal, setOpenCreateEqubModal] = useState(false);
  const [editingEqub, setEditingEqub] = useState(null);
  const [equbFormData, setEqubFormData] = useState({
    condoId: '',
    name: '',
    contributionAmount: 5000,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
  });

  const [openCreateIddirModal, setOpenCreateIddirModal] = useState(false);
  const [editingIddir, setEditingIddir] = useState(null);
  const [iddirFormData, setIddirFormData] = useState({
    condoId: '',
    name: '',
    contributionAmount: 500,
    startedDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  // Add Member Modal State (with Condominium input for Super Admin)
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [targetGroup, setTargetGroup] = useState(null); // Equb or Iddir object
  const [targetGroupType, setTargetGroupType] = useState('equb'); // 'equb' or 'iddir'
  const [memberCondoId, setMemberCondoId] = useState('');
  const [condoResidents, setCondoResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [memberModalResidentSearch, setMemberModalResidentSearch] = useState('');

  // Draw Winner / Lottery Modal State (Equb)
  const [openDrawModal, setOpenDrawModal] = useState(false);
  const [selectedEqubForDraw, setSelectedEqubForDraw] = useState(null);
  const [selectedWinnerUserId, setSelectedWinnerUserId] = useState('');
  const [drawingWinner, setDrawingWinner] = useState(false);
  const [winnerCelebration, setWinnerCelebration] = useState(null);

  // Non-Random Money Disbursement Modal State (Iddir)
  // "and also for edir one person will recieved the collected money but not random"
  const [openDisburseModal, setOpenDisburseModal] = useState(false);
  const [selectedIddirForDisburse, setSelectedIddirForDisburse] = useState(null);
  const [disburseRecipientId, setDisburseRecipientId] = useState('');
  const [disburseAmount, setDisburseAmount] = useState(0);
  const [disburseReason, setDisburseReason] = useState('Iddir Mutual Aid Benefit Payout');
  const [disbursing, setDisbursing] = useState(false);
  const [disbursementCelebration, setDisbursementCelebration] = useState(null);

  // Details Modal State
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState('equb'); // 'equb' or 'iddir'
  const [detailTab, setDetailTab] = useState(0); // 0 = Members, 1 = Winners / Beneficiaries
  const [detailSearch, setDetailSearch] = useState('');

  // Fetch Condos, Equbs, and Iddirs from Backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = selectedCondoId !== 'ALL' ? { condoId: selectedCondoId } : {};
      const [condoRes, equbRes, iddirRes] = await Promise.all([
        api.condos.getAll(),
        api.equbs.getAll(params),
        api.iddirs.getAll(params),
      ]);

      const loadedCondos = condoRes.data.data || [];
      const loadedEqubs = equbRes.data.equbs || equbRes.data.data || [];
      const loadedIddirs = iddirRes.data.iddirs || iddirRes.data.data || [];

      setCondos(loadedCondos);
      setEqubs(loadedEqubs);
      setIddirs(loadedIddirs);

      // Refresh selected entity without retriggering callback dependency
      setSelectedEntity((prev) => {
        if (!prev) return null;
        const list = prev.rotationFrequency ? loadedEqubs : loadedIddirs;
        const refreshed = list.find((item) => item.id === prev.id);
        return refreshed ? { ...prev, ...refreshed } : prev;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch Equbs and Iddirs');
    } finally {
      setLoading(false);
    }
  }, [selectedCondoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch Residents when Condominium is selected in Add Member Modal
  const fetchResidentsForCondo = async (condoId) => {
    if (!condoId) {
      setCondoResidents([]);
      return;
    }
    try {
      setLoadingResidents(true);
      const res = await api.users.getAll(condoId);
      const residents = (res.data.data || res.data.users || []).filter((u) => u.role === 'resident');
      setCondoResidents(residents);
    } catch (err) {
      toast.error('Failed to load residents for condominium');
    } finally {
      setLoadingResidents(false);
    }
  };

  // Overall calculations across all condominiums
  const totalEqubsCount = equbs.length;
  const totalIddirsCount = iddirs.length;
  const totalEqubPool = equbs.reduce((sum, e) => {
    const activeCount = e.members?.filter((m) => m.status === 'active').length || e.noMembers || 0;
    return sum + activeCount * Number(e.contributionAmount || 0);
  }, 0);
  const totalIddirFund = iddirs.reduce((sum, i) => {
    const memberPaidSum = i.members?.reduce((mSum, m) => mSum + Number(m.totalPaid || 0), 0) || 0;
    return sum + memberPaidSum;
  }, 0);

  // Filter lists based on search
  const filteredEqubs = equbs.filter((e) => {
    const query = searchTerm.toLowerCase();
    const matchesCondo = selectedCondoId === 'ALL' || e.condoId === selectedCondoId;
    const matchesSearch =
      e.name?.toLowerCase().includes(query) ||
      e.condo?.condoName?.toLowerCase().includes(query) ||
      e.condo?.condoCode?.toLowerCase().includes(query);
    return matchesCondo && matchesSearch;
  });

  const filteredIddirs = iddirs.filter((i) => {
    const query = searchTerm.toLowerCase();
    const matchesCondo = selectedCondoId === 'ALL' || i.condoId === selectedCondoId;
    const matchesSearch =
      i.name?.toLowerCase().includes(query) ||
      i.condo?.condoName?.toLowerCase().includes(query) ||
      i.condo?.condoCode?.toLowerCase().includes(query);
    return matchesCondo && matchesSearch;
  });

  const activeList = currentTab === 0 ? filteredEqubs : filteredIddirs;
  const paginatedList = activeList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Open Details Modal
  const handleOpenDetails = async (item, type) => {
    setSelectedEntity(item);
    setEntityType(type);
    setDetailTab(0);
    setDetailSearch('');
    setOpenDetailModal(true);
    setLoadingDetail(true);
    try {
      if (type === 'equb') {
        const res = await api.equbs.getById(item.id);
        const data = res.data?.data || res.data?.equb || res.data;
        if (data) setSelectedEntity(data);
      } else {
        const res = await api.iddirs.getById(item.id);
        const data = res.data?.data || res.data?.iddir || res.data;
        if (data) setSelectedEntity(data);
      }
    } catch (err) {
      console.error('Failed to load complete group profile:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Create Equb Modal
  const handleOpenCreateEqub = () => {
    setEditingEqub(null);
    setEqubFormData({
      condoId: selectedCondoId !== 'ALL' ? selectedCondoId : condos[0]?.id || '',
      name: '',
      contributionAmount: 5000,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setOpenCreateEqubModal(true);
  };

  const handleOpenEditEqub = (equb) => {
    setEditingEqub(equb);
    setEqubFormData({
      condoId: equb.condoId,
      name: equb.name,
      contributionAmount: Number(equb.contributionAmount),
      startDate: new Date(equb.startDate).toISOString().split('T')[0],
      dueDate: new Date(equb.dueDate).toISOString().split('T')[0],
      status: equb.status,
    });
    setOpenCreateEqubModal(true);
  };

  const handleSubmitEqub = async (e) => {
    e.preventDefault();
    if (!equbFormData.condoId) {
      toast.error('Please select a Condominium');
      return;
    }
    if (!equbFormData.name.trim()) {
      toast.error('Please enter an Equb name');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...equbFormData,
        contributionAmount: Number(equbFormData.contributionAmount),
      };

      if (editingEqub) {
        await api.equbs.update(editingEqub.id, payload);
        toast.success('Equb updated successfully!');
      } else {
        await api.equbs.create(payload);
        toast.success('Equb created successfully!');
      }

      setOpenCreateEqubModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Equb');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Create Iddir Modal
  const handleOpenCreateIddir = () => {
    setEditingIddir(null);
    setIddirFormData({
      condoId: selectedCondoId !== 'ALL' ? selectedCondoId : condos[0]?.id || '',
      name: '',
      contributionAmount: 500,
      startedDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setOpenCreateIddirModal(true);
  };

  const handleOpenEditIddir = (iddir) => {
    setEditingIddir(iddir);
    setIddirFormData({
      condoId: iddir.condoId,
      name: iddir.name,
      contributionAmount: Number(iddir.contributionAmount),
      startedDate: new Date(iddir.startedDate).toISOString().split('T')[0],
      status: iddir.status,
    });
    setOpenCreateIddirModal(true);
  };

  const handleSubmitIddir = async (e) => {
    e.preventDefault();
    if (!iddirFormData.condoId) {
      toast.error('Please select a Condominium');
      return;
    }
    if (!iddirFormData.name.trim()) {
      toast.error('Please enter an Iddir name');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...iddirFormData,
        contributionAmount: Number(iddirFormData.contributionAmount),
      };

      if (editingIddir) {
        await api.iddirs.update(editingIddir.id, payload);
        toast.success('Iddir updated successfully!');
      } else {
        await api.iddirs.create(payload);
        toast.success('Iddir created successfully!');
      }

      setOpenCreateIddirModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Iddir');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteItem = async (item, type) => {
    if (!window.confirm(`Are you sure you want to delete ${type === 'equb' ? 'Equb' : 'Iddir'} "${item.name}"?`)) return;
    try {
      if (type === 'equb') {
        await api.equbs.delete(item.id);
        toast.success('Equb deleted successfully!');
      } else {
        await api.iddirs.delete(item.id);
        toast.success('Iddir deleted successfully!');
      }
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = err.response.data?.message || `This ${type === 'equb' ? 'Equb' : 'Iddir'} has active members or financial history.`;
        const actionLabel = type === 'equb' ? 'cancel' : 'deactivate';
        const newStatus = type === 'equb' ? 'cancelled' : 'inactive';
        const shouldChangeStatus = window.confirm(
          `${msg}\n\nWould you like to ${actionLabel} this group instead to preserve audit records?`
        );
        if (shouldChangeStatus) {
          try {
            if (type === 'equb') {
              await api.equbs.update(item.id, { status: newStatus });
            } else {
              await api.iddirs.update(item.id, { status: newStatus });
            }
            toast.success(`${type === 'equb' ? 'Equb' : 'Iddir'} "${item.name}" marked as ${newStatus}.`);
            fetchData();
          } catch (updateErr) {
            toast.error(updateErr.response?.data?.message || `Failed to ${actionLabel} group`);
          }
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  // Open Add Member Modal (with Condominium selection input)
  const handleOpenAddMember = (item, type) => {
    setTargetGroup(item);
    setTargetGroupType(type);
    const condoId = item.condoId || (selectedCondoId !== 'ALL' ? selectedCondoId : condos[0]?.id || '');
    setMemberCondoId(condoId);
    setSelectedResidentId('');
    setMemberModalResidentSearch('');
    fetchResidentsForCondo(condoId);
    setOpenAddMemberModal(true);
  };

  const handleAddMemberSubmit = async () => {
    if (!selectedResidentId) {
      toast.error('Please select a resident to add');
      return;
    }
    try {
      setSubmittingMember(true);
      if (targetGroupType === 'equb') {
        await api.equbs.addMember(targetGroup.id, selectedResidentId);
        toast.success('Resident added to Equb successfully!');
      } else {
        await api.iddirs.addMember(targetGroup.id, selectedResidentId);
        toast.success('Resident added to Iddir successfully!');
      }
      setOpenAddMemberModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmittingMember(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (groupId, userId, type, memberName) => {
    if (!window.confirm(`Remove ${memberName || 'this resident'} from the ${type === 'equb' ? 'Equb' : 'Iddir'}? Their historical records will be preserved.`)) return;
    try {
      if (type === 'equb') {
        const res = await api.equbs.removeMember(groupId, userId);
        toast.success(res.data?.message || 'Member removed from Equb');
      } else {
        const res = await api.iddirs.removeMember(groupId, userId);
        toast.success(res.data?.message || 'Member removed from Iddir');
      }
      fetchData();
      try {
        const res = type === 'equb' ? await api.equbs.getById(groupId) : await api.iddirs.getById(groupId);
        const data = res.data?.data || res.data?.equb || res.data?.iddir || res.data;
        if (data) setSelectedEntity(data);
      } catch (err) {
        // ignore
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Record Member Contribution Payment
  const handleRecordContribution = async (group, member, type) => {
    const fixedAmount = Number(group.contributionAmount);
    if (!window.confirm(`Record contribution of ETB ${fixedAmount.toLocaleString()} for ${member.user?.fullName}?`)) return;
    try {
      if (type === 'equb') {
        await api.equbs.recordPayment(group.id, member.userId, { amount: fixedAmount });
      } else {
        await api.iddirs.recordPayment(group.id, member.userId, { amount: fixedAmount });
      }
      toast.success(`Recorded ETB ${fixedAmount.toLocaleString()} contribution!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record contribution');
    }
  };

  // Draw Winner / Lottery (Equb)
  const handleOpenDraw = (equb) => {
    setSelectedEqubForDraw(equb);
    setSelectedWinnerUserId('');
    setOpenDrawModal(true);
  };

  const handleExecuteDraw = async () => {
    try {
      setDrawingWinner(true);
      const payload = selectedWinnerUserId ? { winnerUserId: selectedWinnerUserId } : {};
      const res = await api.equbs.drawWinner(selectedEqubForDraw.id, payload);
      const payout = res.data.data;

      setOpenDrawModal(false);
      setWinnerCelebration({
        equbName: selectedEqubForDraw.name,
        winnerName: payout.winner?.fullName || 'Winner',
        amount: Number(payout.amount),
        roundNumber: payout.roundNumber,
        reference: payout.selectionReference,
      });

      toast.success('🎉 Winner drawn successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to draw Equb winner');
    } finally {
      setDrawingWinner(false);
    }
  };

  // Open Non-Random Money Disbursement Modal (Iddir)
  const handleOpenDisburse = (iddir, preselectedUserId = '') => {
    setSelectedIddirForDisburse(iddir);
    setDisburseRecipientId(preselectedUserId);
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
      });

      toast.success('Iddir funds disbursed to member successfully!');
      setOpenDisburseModal(false);
      setDisbursementCelebration({
        recipientName: res.data?.data?.recipient?.fullName || 'Member',
        amount: res.data?.data?.amount || amount,
        reference: res.data?.data?.reference || `IDDIR-DISB-${Date.now().toString().slice(-6)}`,
        iddirName: selectedIddirForDisburse.name,
        reason: disburseReason,
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disburse Iddir funds');
    } finally {
      setDisbursing(false);
    }
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
              Equb & Iddir Central Management
            </Typography>
          </Box>
          <Typography variant="body2" color="#6b7a8f">
            Super Administrator overview of all community savings (Equb) and mutual aid funds (Iddir) across all condominiums
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
            sx={{ borderRadius: '10px', borderColor: '#e0e0e0', color: '#6b7a8f', textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateEqub}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Create Equb
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateIddir}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Create Iddir
          </Button>
        </Box>
      </Box>

      {/* Global Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#D3AD32" active={currentTab === 0} onClick={() => setCurrentTab(0)}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL EQUBS (SYSTEM-WIDE)</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{totalEqubsCount}</Typography>
              </Box>
              <Box className="stat-icon"><AccountBalanceIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#1a1a2e" active={currentTab === 1} onClick={() => setCurrentTab(1)}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL IDDIRS (SYSTEM-WIDE)</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{totalIddirsCount}</Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(26, 26, 46, 0.1)', color: '#1a1a2e' }}><ShieldIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#22c55e">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>ACTIVE EQUB JACKPOT POOL</Typography>
                <Typography variant="h5" fontWeight={700} color="#22c55e" sx={{ mt: 0.5 }}>
                  ETB {totalEqubPool.toLocaleString()}
                </Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><TrophyIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#3b82f6">
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL IDDIR FUNDS COLLECTED</Typography>
                <Typography variant="h5" fontWeight={700} color="#3b82f6" sx={{ mt: 0.5 }}>
                  ETB {totalIddirFund.toLocaleString()}
                </Typography>
              </Box>
              <Box className="stat-icon" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><MoneyIcon /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Control Bar: Tabs, Condominium Filter, and Search */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Tabs
              value={currentTab === 1 ? 1 : 0}
              onChange={(_, val) => {
                setCurrentTab(val);
                setPage(0);
              }}
              textColor="inherit"
              TabIndicatorProps={{ sx: { bgcolor: currentTab === 0 ? '#D3AD32' : '#1a1a2e', height: 3, borderRadius: '2px' } }}
            >
              <Tab
                label={`Equb Savings (${filteredEqubs.length})`}
                icon={<AccountBalanceIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }}
              />
              <Tab
                label={`Iddir Mutual Aid (${filteredIddirs.length})`}
                icon={<ShieldIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }}
              />
            </Tabs>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Condominium</InputLabel>
              <Select
                value={selectedCondoId}
                label="Filter by Condominium"
                onChange={(e) => {
                  setSelectedCondoId(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="ALL">All Condominiums</MenuItem>
                {condos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name, condo code, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : (
        <>
          {currentTab === 0 ? (
            /* EQUBS TABLE */
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equb Name</TableCell>
                    <TableCell>Condominium Information</TableCell>
                    <TableCell align="right">Fixed Contribution</TableCell>
                    <TableCell align="center">Active Members</TableCell>
                    <TableCell align="right">Jackpot Pot (Turn Winner)</TableCell>
                    <TableCell align="right">Total Collected</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedList.length > 0 ? (
                    paginatedList.map((equb) => {
                      const activeCount = equb.members?.filter((m) => m.status === 'active').length || equb.noMembers || 0;
                      const contribution = Number(equb.contributionAmount || 0);
                      const jackpot = activeCount * contribution;
                      const collected = equb.members?.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0) || 0;

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
                                  Started: {new Date(equb.startDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              {equb.condo?.condoName || 'Condominium'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                              <Chip
                                label={equb.condo?.condoCode || 'Condo'}
                                size="small"
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#b08822' }}
                              />
                              {equb.condo?.city && (
                                <Typography variant="caption" color="#6b7a8f">
                                  {equb.condo.city}, {equb.condo.subCity || ''}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                              ETB {contribution.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="#9ca3af">fixed / member</Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip label={`${activeCount} Members`} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="#22c55e">
                              ETB {jackpot.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="#22c55e">winner gets full pot</Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              ETB {collected.toLocaleString()}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={equb.status}
                              size="small"
                              sx={{
                                bgcolor: equb.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: equb.status === 'active' ? '#22c55e' : '#f59e0b',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="View Details & Roster">
                                <IconButton size="small" onClick={() => handleOpenDetails(equb, 'equb')} sx={{ color: '#D3AD32' }}>
                                  <FaEye size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Add Resident to Equb">
                                <IconButton size="small" onClick={() => handleOpenAddMember(equb, 'equb')} sx={{ color: '#22c55e' }}>
                                  <FaUserPlus size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Draw Lottery Winner for this Round">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDraw(equb)}
                                    disabled={equb.status !== 'active'}
                                    sx={{ color: '#f59e0b' }}
                                  >
                                    <CasinoIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Edit Equb">
                                <IconButton size="small" onClick={() => handleOpenEditEqub(equb)} sx={{ color: '#4a6cf7' }}>
                                  <FaRegEdit size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Equb">
                                <IconButton size="small" onClick={() => handleDeleteItem(equb, 'equb')} sx={{ color: '#ef4444' }}>
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
                        <AccountBalanceIcon sx={{ fontSize: 44, color: '#d1d5db', mb: 1 }} />
                        <Typography variant="h6" color="#6b7a8f">No Equb Groups Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          ) : (
            /* IDDIRS TABLE */
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Iddir Group</TableCell>
                    <TableCell>Condominium Information</TableCell>
                    <TableCell align="right">Fixed Monthly Fee</TableCell>
                    <TableCell align="center">Active Members</TableCell>
                    <TableCell align="right">Monthly Expected Pool</TableCell>
                    <TableCell align="right">Total Fund Collected</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedList.length > 0 ? (
                    paginatedList.map((iddir) => {
                      const activeCount = iddir.members?.filter((m) => m.status === 'active').length || iddir.noMembers || 0;
                      const contribution = Number(iddir.contributionAmount || 0);
                      const monthly = activeCount * contribution;
                      const collected = iddir.members?.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0) || 0;

                      return (
                        <TableRow key={iddir.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(26, 26, 46, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e' }}>
                                <ShieldIcon fontSize="small" />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                                  {iddir.name}
                                </Typography>
                                <Typography variant="caption" color="#6b7a8f">
                                  Established: {new Date(iddir.startedDate || iddir.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              {iddir.condo?.condoName || 'Condominium'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                              <Chip
                                label={iddir.condo?.condoCode || 'Condo'}
                                size="small"
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }}
                              />
                              {iddir.condo?.city && (
                                <Typography variant="caption" color="#6b7a8f">
                                  {iddir.condo.city}, {iddir.condo.subCity || ''}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                              ETB {contribution.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="#9ca3af">monthly / member</Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip label={`${activeCount} Members`} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="#4a6cf7">
                              ETB {monthly.toLocaleString()}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="#10b981">
                              ETB {collected.toLocaleString()}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={iddir.status}
                              size="small"
                              sx={{
                                bgcolor: iddir.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                color: iddir.status === 'active' ? '#22c55e' : '#6b7280',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="View Details & Roster">
                                <IconButton size="small" onClick={() => handleOpenDetails(iddir, 'iddir')} sx={{ color: '#1a1a2e' }}>
                                  <FaEye size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Add Resident to Iddir">
                                <IconButton size="small" onClick={() => handleOpenAddMember(iddir, 'iddir')} sx={{ color: '#22c55e' }}>
                                  <FaUserPlus size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Disburse Funds (Non-Random Payout)">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDisburse(iddir)}
                                    disabled={iddir.status !== 'active'}
                                    sx={{ color: '#10b981' }}
                                  >
                                    <DisburseIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Edit Iddir">
                                <IconButton size="small" onClick={() => handleOpenEditIddir(iddir)} sx={{ color: '#4a6cf7' }}>
                                  <FaRegEdit size={15} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Iddir">
                                <IconButton size="small" onClick={() => handleDeleteItem(iddir, 'iddir')} sx={{ color: '#ef4444' }}>
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
                        <ShieldIcon sx={{ fontSize: 44, color: '#d1d5db', mb: 1 }} />
                        <Typography variant="h6" color="#6b7a8f">No Iddir Groups Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={activeList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}

      {/* Create / Edit Equb Modal */}
      <Dialog disableRestoreFocus open={openCreateEqubModal} onClose={() => setOpenCreateEqubModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <form onSubmit={handleSubmitEqub}>
          <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              {editingEqub ? 'Edit Equb Group' : 'Create New Equb Group'}
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Select the Condominium and configure fixed rotation savings rules
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Condominium Select Input */}
              <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                <InputLabel>Target Condominium</InputLabel>
                <Select
                  value={equbFormData.condoId}
                  label="Target Condominium"
                  disabled={Boolean(editingEqub)}
                  onChange={(e) => setEqubFormData({ ...equbFormData, condoId: e.target.value })}
                >
                  {condos.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.condoName} ({c.condoCode}) - {c.city || 'City'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Equb Name"
                fullWidth
                required
                value={equbFormData.name}
                onChange={(e) => setEqubFormData({ ...equbFormData, name: e.target.value })}
                placeholder="e.g. Block A Monthly Equb"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Fixed Contribution Amount (ETB)"
                type="number"
                fullWidth
                required
                value={equbFormData.contributionAmount}
                onChange={(e) => setEqubFormData({ ...equbFormData, contributionAmount: e.target.value })}
                helperText="Every member of this Equb contributes this exact same amount"
                sx={{ bgcolor: '#fff' }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    required
                    value={equbFormData.startDate}
                    onChange={(e) => setEqubFormData({ ...equbFormData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Due Date"
                    type="date"
                    fullWidth
                    required
                    value={equbFormData.dueDate}
                    onChange={(e) => setEqubFormData({ ...equbFormData, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={equbFormData.status}
                  label="Status"
                  onChange={(e) => setEqubFormData({ ...equbFormData, status: e.target.value })}
                >
                  <MenuItem value="active">Active (Collecting contributions)</MenuItem>
                  <MenuItem value="completed">Completed (All rounds done)</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Button onClick={() => setOpenCreateEqubModal(false)} disabled={submitting} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
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

      {/* Create / Edit Iddir Modal */}
      <Dialog disableRestoreFocus open={openCreateIddirModal} onClose={() => setOpenCreateIddirModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <form onSubmit={handleSubmitIddir}>
          <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              {editingIddir ? 'Edit Iddir Group' : 'Create New Iddir Group'}
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Select the Condominium and configure fixed monthly mutual aid contribution
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Condominium Select Input */}
              <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                <InputLabel>Target Condominium</InputLabel>
                <Select
                  value={iddirFormData.condoId}
                  label="Target Condominium"
                  disabled={Boolean(editingIddir)}
                  onChange={(e) => setIddirFormData({ ...iddirFormData, condoId: e.target.value })}
                >
                  {condos.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.condoName} ({c.condoCode}) - {c.city || 'City'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Iddir Name"
                fullWidth
                required
                value={iddirFormData.name}
                onChange={(e) => setIddirFormData({ ...iddirFormData, name: e.target.value })}
                placeholder="e.g. Community Mutual Aid & Funeral Iddir"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Fixed Monthly Contribution (ETB)"
                type="number"
                fullWidth
                required
                value={iddirFormData.contributionAmount}
                onChange={(e) => setIddirFormData({ ...iddirFormData, contributionAmount: e.target.value })}
                helperText="Every member of this Iddir contributes this exact same monthly amount"
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                label="Started / Establishment Date"
                type="date"
                fullWidth
                required
                value={iddirFormData.startedDate}
                onChange={(e) => setIddirFormData({ ...iddirFormData, startedDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: '#fff' }}
              />

              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={iddirFormData.status}
                  label="Status"
                  onChange={(e) => setIddirFormData({ ...iddirFormData, status: e.target.value })}
                >
                  <MenuItem value="active">Active (Collecting contributions)</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Button onClick={() => setOpenCreateIddirModal(false)} disabled={submitting} sx={{ color: '#6b7a8f', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', textTransform: 'none', px: 3 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : editingIddir ? 'Update Iddir' : 'Create Iddir'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Member Modal (with Condominium selection input for Super Admin) */}
      <Dialog disableRestoreFocus open={openAddMemberModal} onClose={() => setOpenAddMemberModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            Add Resident to {targetGroupType === 'equb' ? 'Equb Group' : 'Iddir Group'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Group: {targetGroup?.name} | Fixed Contribution: ETB {Number(targetGroup?.contributionAmount || 0).toLocaleString()}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert severity="info" sx={{ borderRadius: '10px' }}>
              Residents can join multiple Equbs and Iddirs within their condominium. Each member pays the same fixed contribution of <strong>ETB {Number(targetGroup?.contributionAmount || 0).toLocaleString()}</strong>.
            </Alert>

            {/* Condominium Selector Input */}
            <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
              <InputLabel>Condominium</InputLabel>
              <Select
                value={memberCondoId}
                label="Condominium"
                disabled={Boolean(targetGroup?.condoId)}
                onChange={(e) => {
                  setMemberCondoId(e.target.value);
                  setSelectedResidentId('');
                  fetchResidentsForCondo(e.target.value);
                }}
              >
                {condos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search candidate residents by name, room, or phone..."
              value={memberModalResidentSearch}
              onChange={(e) => setMemberModalResidentSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#fff', borderRadius: '8px' }}
            />

            {/* Resident Selector */}
            {loadingResidents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress sx={{ color: '#D3AD32' }} />
              </Box>
            ) : (
              <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                <InputLabel>Select Resident Member</InputLabel>
                <Select
                  value={selectedResidentId}
                  label="Select Resident Member"
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                >
                  {condoResidents
                    .filter((r) => !targetGroup?.members?.some((m) => m.userId === r.id && m.status === 'active'))
                    .filter((r) => {
                      if (!memberModalResidentSearch) return true;
                      const q = memberModalResidentSearch.toLowerCase();
                      return (
                        r.fullName?.toLowerCase().includes(q) ||
                        r.phoneNumber?.includes(q) ||
                        r.block?.toLowerCase().includes(q) ||
                        r.roomNo?.toLowerCase().includes(q)
                      );
                    })
                    .map((resident) => (
                      <MenuItem key={resident.id} value={resident.id}>
                        {resident.fullName} - Unit: {resident.block || 'Block ?'} / Rm {resident.roomNo || '?'} ({resident.phoneNumber || resident.email})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
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

      {/* Draw Winner / Lottery Modal (Equb) */}
      <Dialog disableRestoreFocus open={openDrawModal} onClose={() => setOpenDrawModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CasinoIcon sx={{ color: '#f59e0b' }} />
            Draw Equb Winner / Rotation Payout
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {selectedEqubForDraw?.name} ({selectedEqubForDraw?.condo?.condoName})
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

              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="#1a1a2e" gutterBottom>
                  Select Winner Method:
                </Typography>
                <FormControl fullWidth sx={{ bgcolor: '#fff' }}>
                  <InputLabel>Lottery Draw Mode</InputLabel>
                  <Select
                    value={selectedWinnerUserId}
                    label="Lottery Draw Mode"
                    onChange={(e) => setSelectedWinnerUserId(e.target.value)}
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

              <Paper sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">ELIGIBLE MEMBERS REMAINING TO WIN:</Typography>
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
            disabled={drawingWinner || selectedEqubForDraw?.members?.filter((m) => m.status === 'active' && !m.hasReceivedPayout).length === 0}
            startIcon={<CasinoIcon />}
            sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            {drawingWinner ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Award Jackpot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Non-Random Money Disbursement Modal (Iddir) */}
      <Dialog disableRestoreFocus 
        open={openDisburseModal}
        onClose={() => setOpenDisburseModal(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DisburseIcon sx={{ color: '#10b981' }} />
            Disburse Iddir Funds to Beneficiary Member
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {selectedIddirForDisburse?.name} ({selectedIddirForDisburse?.condo?.condoName})
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
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="#6b7a8f" fontWeight={600}>TOTAL COLLECTED POOL</Typography>
                      <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                        ETB {collected.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="#6b7a8f" fontWeight={600}>CURRENT AVAILABLE BALANCE</Typography>
                      <Typography variant="h5" fontWeight={800} color="#10b981">
                        ETB {available.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: '10px' }}>
                  <strong>Non-Random Payout Rule:</strong> Iddir disbursements are granted to a specific qualified member (bereavement, medical emergency, or scheduled mutual aid claim). Select the recipient and specify the benefit amount.
                </Alert>

                <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                  <InputLabel>Select Recipient Member *</InputLabel>
                  <Select
                    value={disburseRecipientId}
                    label="Select Recipient Member *"
                    onChange={(e) => setDisburseRecipientId(e.target.value)}
                  >
                    {selectedIddirForDisburse.members
                      ?.filter((m) => m.status === 'active')
                      .map((member) => (
                        <MenuItem key={member.userId} value={member.userId}>
                          {member.user?.fullName} — Unit: {member.user?.block || 'Block ?'}/{member.user?.roomNo || '?'} (Contributed: ETB {Number(member.totalPaid || 0).toLocaleString()})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Disbursement Amount (ETB) *"
                  type="number"
                  fullWidth
                  required
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Math.max(0, Number(e.target.value)))}
                  helperText={`Maximum available to disburse: ETB ${available.toLocaleString()}`}
                  inputProps={{ min: 1, max: available }}
                  sx={{ bgcolor: '#fff' }}
                />

                <TextField
                  label="Purpose / Reason for Disbursement *"
                  fullWidth
                  required
                  value={disburseReason}
                  onChange={(e) => setDisburseReason(e.target.value)}
                  placeholder="e.g. Bereavement Assistance, Medical Emergency, Community Aid"
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
            disabled={disbursing || !disburseRecipientId || Number(disburseAmount) <= 0}
            startIcon={<DisburseIcon />}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              textTransform: 'none',
              px: 3,
              fontWeight: 700,
            }}
          >
            {disbursing ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Disburse Funds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Winner Celebration Modal (Equb) */}
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
              <Typography variant="caption" color="#6b7a8f" sx={{ display: 'block', mt: 1 }}>
                Ref: {winnerCelebration.reference}
              </Typography>
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

      {/* Disbursement Celebration / Receipt Modal (Iddir) */}
      <Dialog disableRestoreFocus open={Boolean(disbursementCelebration)} onClose={() => setDisbursementCelebration(null)} maxWidth="xs" fullWidth TransitionComponent={Zoom}>
        {disbursementCelebration && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: '20px' }}>
            <Avatar sx={{ bgcolor: '#10b981', width: 72, height: 72, mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
              <DisburseIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} color="#1a1a2e" gutterBottom>
              Disbursement Confirmed!
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#10b981">
              {disbursementCelebration.recipientName}
            </Typography>
            <Typography variant="body2" color="#6b7a8f" sx={{ mb: 2.5 }}>
              has received mutual aid from <strong>{disbursementCelebration.iddirName}</strong>
            </Typography>

            <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', mb: 3 }}>
              <Typography variant="caption" color="#059669" fontWeight={700}>DISBURSED AID AMOUNT</Typography>
              <Typography variant="h4" fontWeight={800} color="#059669" sx={{ mt: 0.5 }}>
                ETB {Number(disbursementCelebration.amount).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="#6b7a8f" sx={{ display: 'block', mt: 1 }}>
                Reason: {disbursementCelebration.reason}
              </Typography>
              <Typography variant="caption" color="#9ca3af" sx={{ display: 'block' }}>
                Ref: {disbursementCelebration.reference}
              </Typography>
            </Paper>

            <Button
              variant="contained"
              onClick={() => setDisbursementCelebration(null)}
              fullWidth
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', py: 1.2, textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
            >
              Done
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Detailed Profile Modal Dialog */}
      <Dialog
        disableRestoreFocus
        open={openDetailModal}
        onClose={() => {
          setOpenDetailModal(false);
          setDetailTab(0);
          setSelectedEntity(null);
        }}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.3rem' }}>
              {entityType === 'equb' ? '🏢 Equb Savings Detailed Profile' : '🛡️ Iddir Mutual Aid Detailed Profile'}
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              {selectedEntity?.name} — {selectedEntity?.condo?.condoName} ({selectedEntity?.condo?.condoCode})
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedEntity(null);
            }}
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {selectedEntity && (() => {
            const isEqub = entityType === 'equb';
            const totalCollected = (selectedEntity.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
            const totalDisbursed = (selectedEntity.members || []).reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
            const availableBalance = Math.max(0, totalCollected - totalDisbursed);
            const activeCount = (selectedEntity.members || []).filter((m) => m.status === 'active').length;
            const fullPot = activeCount * Number(selectedEntity.contributionAmount || 0);

            // Filter members by search
            const filteredMembers = (selectedEntity.members || []).filter((m) => {
              if (!detailSearch) return true;
              const q = detailSearch.toLowerCase();
              return (
                m.user?.fullName?.toLowerCase().includes(q) ||
                m.user?.phoneNumber?.includes(q) ||
                m.user?.block?.toLowerCase().includes(q) ||
                m.user?.roomNo?.toLowerCase().includes(q) ||
                m.user?.fan?.includes(q)
              );
            });

            // Filter beneficiaries (Iddir) or payouts (Equb)
            const filteredBeneficiaries = (selectedEntity.members || [])
              .filter((m) => Number(m.totalReceived || 0) > 0)
              .filter((m) => {
                if (!detailSearch) return true;
                const q = detailSearch.toLowerCase();
                return (
                  m.user?.fullName?.toLowerCase().includes(q) ||
                  m.user?.phoneNumber?.includes(q) ||
                  m.user?.block?.toLowerCase().includes(q) ||
                  m.user?.roomNo?.toLowerCase().includes(q)
                );
              });

            const filteredPayouts = (selectedEntity.payouts || []).filter((p) => {
              if (!detailSearch) return true;
              const q = detailSearch.toLowerCase();
              return (
                p.winner?.fullName?.toLowerCase().includes(q) ||
                p.selectionReference?.toLowerCase().includes(q) ||
                String(p.roundNumber).includes(q)
              );
            });

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Condominium Profile Card */}
                <Paper sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ApartmentIcon sx={{ color: '#D3AD32' }} /> Condominium Site Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="#6b7a8f">Condominium Name</Typography>
                      <Typography variant="body2" fontWeight={700} color="#1a1a2e">{selectedEntity.condo?.condoName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="#6b7a8f">Condo Code</Typography>
                      <Typography variant="body2" fontWeight={700} color="#D3AD32">{selectedEntity.condo?.condoCode || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="#6b7a8f">City & Location</Typography>
                      <Typography variant="body2" color="#1a1a2e">
                        {selectedEntity.condo?.city || 'Addis Ababa'}, {selectedEntity.condo?.subCity || ''}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Fund / Rotation Pot Metrics */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={isEqub ? 4 : 3}>
                    <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                      <Typography variant="caption" color="#6b7a8f">FIXED CONTRIBUTION</Typography>
                      <Typography variant="h6" fontWeight={700} color="#D3AD32">
                        ETB {Number(selectedEntity.contributionAmount || 0).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={isEqub ? 4 : 3}>
                    <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                      <Typography variant="caption" color="#6b7a8f">
                        {isEqub ? 'FULL ROTATION POT (JACKPOT)' : 'EXPECTED MONTHLY POOL'}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#22c55e">
                        ETB {fullPot.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={isEqub ? 4 : 3}>
                    <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                      <Typography variant="caption" color="#6b7a8f">TOTAL COLLECTED POOL</Typography>
                      <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                        ETB {totalCollected.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>

                  {!isEqub && (
                    <Grid item xs={12} sm={3}>
                      <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                        <Typography variant="caption" color="#6b7a8f">AVAILABLE FUND</Typography>
                        <Typography variant="h6" fontWeight={800} color="#10b981">
                          ETB {availableBalance.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* Sub-Tabs: Members vs Winners/Beneficiaries */}
                <Paper sx={{ borderRadius: '14px', bgcolor: '#fff', overflow: 'hidden' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Tabs
                      value={detailTab === 1 ? 1 : 0}
                      onChange={(_, val) => setDetailTab(val)}
                      textColor="inherit"
                      TabIndicatorProps={{ sx: { bgcolor: isEqub ? '#D3AD32' : '#1a1a2e', height: 3 } }}
                    >
                      <Tab
                        label={`Members (${selectedEntity.members?.length || 0})`}
                        sx={{ fontWeight: 700, textTransform: 'none' }}
                      />
                      <Tab
                        label={isEqub ? `Past Winners (${selectedEntity.payouts?.length || 0})` : `Disbursed Beneficiaries (${filteredBeneficiaries.length})`}
                        sx={{ fontWeight: 700, textTransform: 'none' }}
                      />
                    </Tabs>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!isEqub && (
                        <Button
                          size="small"
                          startIcon={<DisburseIcon />}
                          onClick={() => handleOpenDisburse(selectedEntity)}
                          sx={{ bgcolor: '#10b981', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#059669' } }}
                        >
                          Disburse Funds
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddMember(selectedEntity, entityType)}
                        sx={{ bgcolor: isEqub ? '#D3AD32' : '#1a1a2e', color: '#fff', textTransform: 'none', fontWeight: 600 }}
                      >
                        Add Member
                      </Button>
                    </Box>
                  </Box>

                  {/* Search within Detail Modal */}
                  <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #f1f3f5' }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Search in ${detailTab === 0 ? 'members' : (isEqub ? 'winners' : 'beneficiaries')} by name, room, or phone...`}
                      value={detailSearch}
                      onChange={(e) => setDetailSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>

                  {/* Tab 0: Members List */}
                  {detailTab === 0 && (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '340px', overflowY: 'auto' }}>
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <Box
                            key={member.id}
                            sx={{
                              p: 1.5,
                              borderRadius: '10px',
                              bgcolor: '#f8f9fa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: isEqub ? '#D3AD32' : '#1a1a2e', fontWeight: 700 }}>
                                {member.user?.fullName?.charAt(0) || 'M'}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                                    {member.user?.fullName}
                                  </Typography>
                                  {member.status === 'inactive' ? (
                                    <Chip
                                      label="Inactive / Removed"
                                      size="small"
                                      sx={{ bgcolor: '#f1f3f5', color: '#6b7a8f', fontWeight: 600, height: 20 }}
                                    />
                                  ) : (
                                    <Chip
                                      label="Active"
                                      size="small"
                                      sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700, height: 20 }}
                                    />
                                  )}
                                  {isEqub && member.hasReceivedPayout && (
                                    <Chip
                                      label="Turn Winner"
                                      size="small"
                                      icon={<TrophyIcon sx={{ fontSize: 13 }} />}
                                      sx={{ bgcolor: 'rgba(211, 173, 50, 0.15)', color: '#b08822', fontWeight: 700, height: 20 }}
                                    />
                                  )}
                                  {!isEqub && Number(member.totalReceived || 0) > 0 && (
                                    <Chip
                                      label={`Beneficiary (ETB ${Number(member.totalReceived).toLocaleString()})`}
                                      size="small"
                                      sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 700, height: 20 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="#6b7a8f">
                                  Unit: {member.user?.block || 'Block ?'} / Rm {member.user?.roomNo || '?'} | Phone: {member.user?.phoneNumber || 'N/A'}
                                  {member.leftAt && ` | Removed: ${new Date(member.leftAt).toLocaleDateString()}`}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="#6b7a8f">Total Paid</Typography>
                                <Typography variant="body2" fontWeight={700} color="#16a34a">
                                  ETB {Number(member.totalPaid || 0).toLocaleString()}
                                </Typography>
                              </Box>

                              {member.status === 'active' ? (
                                <Tooltip title={`Record contribution payment of ETB ${Number(selectedEntity.contributionAmount).toLocaleString()}`}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<PaymentIcon />}
                                    onClick={() => handleRecordContribution(selectedEntity, member, entityType)}
                                    sx={{ textTransform: 'none', borderRadius: '8px', color: '#16a34a', borderColor: '#16a34a', fontWeight: 600, minWidth: 'auto', px: 1.5 }}
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
                                      sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, minWidth: 'auto', px: 1.5 }}
                                    >
                                      Pay
                                    </Button>
                                  </span>
                                </Tooltip>
                              )}

                              {!isEqub && (
                                member.status === 'active' ? (
                                  <Tooltip title="Disburse Funds directly to this member">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<DisburseIcon />}
                                      onClick={() => handleOpenDisburse(selectedEntity, member.userId)}
                                      sx={{ textTransform: 'none', borderRadius: '8px', color: '#10b981', borderColor: '#10b981', fontWeight: 600, minWidth: 'auto', px: 1.5 }}
                                    >
                                      Disburse
                                    </Button>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Member is inactive; cannot disburse funds">
                                    <span>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        disabled
                                        sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, minWidth: 'auto', px: 1.5 }}
                                      >
                                        Disburse
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )
                              )}

                              {member.status === 'active' ? (
                                <Tooltip title="Remove Member">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveMember(selectedEntity.id, member.userId, entityType, member.user?.fullName)}
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
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="#6b7a8f" align="center" sx={{ py: 3 }}>
                          No members matching "{detailSearch}"
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Tab 1: Past Winners (Equb) or Beneficiaries (Iddir) */}
                  {detailTab === 1 && (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '340px', overflowY: 'auto' }}>
                      {isEqub ? (
                        filteredPayouts.length > 0 ? (
                          filteredPayouts.map((p) => (
                            <Box key={p.id} sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(34, 197, 94, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                                  Round {p.roundNumber}: {p.winner?.fullName || 'Winner'}
                                </Typography>
                                <Typography variant="caption" color="#6b7a8f">
                                  Awarded: {new Date(p.selectedAt || p.createdAt).toLocaleDateString()} | Ref: {p.selectionReference}
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={800} color="#16a34a">
                                ETB {Number(p.amount).toLocaleString()}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="#6b7a8f" align="center" sx={{ py: 3 }}>
                            No past winners recorded yet.
                          </Typography>
                        )
                      ) : (
                        filteredBeneficiaries.length > 0 ? (
                          filteredBeneficiaries.map((b) => (
                            <Box key={b.id} sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                                  {b.user?.fullName}
                                </Typography>
                                <Typography variant="caption" color="#6b7a8f">
                                  Unit: {b.user?.block || 'Block ?'} / Rm {b.user?.roomNo || '?'} | Phone: {b.user?.phoneNumber || 'N/A'}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="#6b7a8f">Total Disbursed</Typography>
                                <Typography variant="body1" fontWeight={800} color="#10b981">
                                  ETB {Number(b.totalReceived).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="#6b7a8f" align="center" sx={{ py: 3 }}>
                            No disbursements recorded yet.
                          </Typography>
                        )
                      )}
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => {
              setOpenDetailModal(false);
              setDetailTab(0);
              setSelectedEntity(null);
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

export default EqubIddirManagement;
