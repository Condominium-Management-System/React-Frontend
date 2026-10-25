// src/pages/condo-admin/Payments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon,
  Add as AddIcon,
  AccountBalance as BankIcon,
  } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

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
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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

const Payments = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalCollectedVolume: '0.00',
  });

  // Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openCreatePaymentModal, setOpenCreatePaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Group & Resident Options for Simulated Transfer Creation
  const [residents, setResidents] = useState([]);
  const [equbs, setEqubs] = useState([]);
  const [iddirs, setIddirs] = useState([]);
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    paymentType: 'equb',
    groupId: '',
    amount: 5000,
    paymentMethod: 'bank_transfer',
    senderBankName: 'Commercial Bank of Ethiopia (CBE)',
    senderAccountNumber: '',
    referenceNo: '',
    monthYear: new Date().toISOString().slice(0, 7),
    adminNotes: 'Simulated bank transfer contribution',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get('status')?.toLowerCase();
    if (statusParam === 'pending') setStatusFilter('pending');
    else if (statusParam === 'approved') setStatusFilter('approved');
    else if (statusParam === 'rejected') setStatusFilter('rejected');
  }, [searchParams]);

  // Fetch payments from live backend
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const condoId = currentUser?.condoId;
      const params = {
        condoId,
        page: page + 1,
        limit: rowsPerPage,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(typeFilter !== 'ALL' ? { paymentType: typeFilter } : {}),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      };

      const [paymentsRes, statsRes] = await Promise.all([
        api.payments.getAll(params),
        api.payments.getStatistics({ condoId }),
      ]);

      const data = paymentsRes.data?.data;
      const list = Array.isArray(data) ? data : data?.payments || [];
      const totalCount = data?.pagination?.total ?? list.length;

      setPayments(list);
      setTotalItems(totalCount);

      const statData = statsRes.data?.data || {};
      setStats({
        total: statData.totalPayments || totalCount,
        pending: statData.pendingPayments || 0,
        approved: statData.approvedPayments || 0,
        rejected: statData.rejectedPayments || 0,
        totalCollectedVolume: statData.totalCollectedVolume || '0.00',
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [currentUser, page, rowsPerPage, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Fetch groups and residents for the Simulated Bank Transfer Modal
  const fetchGroupAndResidentOptions = useCallback(async () => {
    try {
      const condoId = currentUser?.condoId;
      const [resUsers, resEqubs, resIddirs] = await Promise.all([
        api.users.getAll(condoId, { role: 'resident' }),
        api.equbs.getAll(condoId ? { condoId } : {}),
        api.iddirs.getAll(condoId ? { condoId } : {}),
      ]);

      const userList = (resUsers.data?.data || []).filter((u) => u.role === 'resident');
      const equbList = resEqubs.data?.equbs || resEqubs.data?.data || [];
      const iddirList = resIddirs.data?.iddirs || resIddirs.data?.data || [];

      setResidents(userList);
      setEqubs(equbList);
      setIddirs(iddirList);
    } catch (e) {
      console.error('Failed to load group options:', e);
    }
  }, [currentUser]);

  const handleOpenCreateModal = () => {
    fetchGroupAndResidentOptions();
    setCreateFormData({
      userId: residents[0]?.id || '',
      paymentType: 'equb',
      groupId: equbs[0]?.id || '',
      amount: equbs[0]?.contributionAmount ? Number(equbs[0].contributionAmount) : 5000,
      paymentMethod: 'bank_transfer',
      senderBankName: 'Commercial Bank of Ethiopia (CBE)',
      senderAccountNumber: '1000' + Math.floor(1000000000 + Math.random() * 9000000000),
      referenceNo: 'CBE-TRX-' + Math.floor(100000 + Math.random() * 900000),
      monthYear: new Date().toISOString().slice(0, 7),
      adminNotes: 'Simulated bank transfer payment submitted for review',
    });
    setOpenCreatePaymentModal(true);
  };

  const handleCreatePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.userId) {
      toast.error('Please select a resident member');
      return;
    }
    if (createFormData.amount <= 0) {
      toast.error('Please enter a valid contribution amount');
      return;
    }

    try {
      setSubmittingPayment(true);
      const payload = {
        userId: createFormData.userId,
        paymentType: createFormData.paymentType,
        amount: Number(createFormData.amount),
        paymentMethod: createFormData.paymentMethod,
        senderBankName: createFormData.senderBankName,
        senderAccountNumber: createFormData.senderAccountNumber,
        referenceNo: createFormData.referenceNo || undefined,
        monthYear: createFormData.monthYear,
        adminNotes: createFormData.adminNotes,
        ...(createFormData.paymentType === 'equb' ? { equbId: createFormData.groupId } : {}),
        ...(createFormData.paymentType === 'iddir' ? { iddirId: createFormData.groupId } : {}),
      };

      await api.payments.create(payload);
      toast.success('Simulated bank transfer payment submitted successfully (Pending Review)');
      setOpenCreatePaymentModal(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Approve Payment Action
  const handleApprove = async () => {
    if (!selectedPayment) return;
    try {
      setProcessingAction(true);
      await api.payments.approve(selectedPayment.id, { adminNotes });
      toast.success('Payment approved successfully! Member balance updated.');
      setOpenApproveModal(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payment');
    } finally {
      setProcessingAction(false);
    }
  };

  // Reject Payment Action
  const handleReject = async () => {
    if (!selectedPayment) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting this payment');
      return;
    }
    try {
      setProcessingAction(true);
      await api.payments.reject(selectedPayment.id, { adminNotes: rejectReason.trim() });
      toast.success('Payment marked as rejected');
      setOpenRejectModal(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject payment');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
            label="Approved"
            size="small"
            sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 700 }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<CancelIcon sx={{ fontSize: 14 }} />}
            label="Rejected"
            size="small"
            sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 700 }}
          />
        );
      case 'pending':
      default:
        return (
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            label="Pending Review"
            size="small"
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}
          />
        );
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ p: 1, bgcolor: '#D3AD32', borderRadius: '10px', color: '#fff', display: 'flex' }}>
              <PaymentIcon />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#1a1a2e">
              Payment & Transaction Management
            </Typography>
          </Box>
          <Typography variant="body2" color="#6b7a8f">
            Review, verify, and approve simulated bank transfers for Equb and Iddir contributions ({currentUser?.condoCode || 'My Condo'})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPayments}
            disabled={loading}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
            }}
          >
            Record Bank Transfer
          </Button>
        </Box>
      </Box>

      {/* Stats Cards (Interactive Drill-Downs) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            color="#4a6cf7"
            active={statusFilter === 'ALL'}
            onClick={() => { setStatusFilter('ALL'); setPage(0); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL PAYMENTS</Typography>
                  <Typography variant="h5" fontWeight={700} color="#1a1a2e" sx={{ mt: 0.5 }}>{stats.total}</Typography>
                </Box>
                <Box className="stat-icon"><PaymentIcon /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            color="#f59e0b"
            active={statusFilter === 'pending'}
            onClick={() => { setStatusFilter('pending'); setPage(0); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>PENDING REVIEW</Typography>
                  <Typography variant="h5" fontWeight={700} color="#f59e0b" sx={{ mt: 0.5 }}>{stats.pending}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><ScheduleIcon /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            color="#22c55e"
            active={statusFilter === 'approved'}
            onClick={() => { setStatusFilter('approved'); setPage(0); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>APPROVED PAYMENTS</Typography>
                  <Typography variant="h5" fontWeight={700} color="#22c55e" sx={{ mt: 0.5 }}>{stats.approved}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><CheckCircleIcon /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            color="#ef4444"
            active={statusFilter === 'rejected'}
            onClick={() => { setStatusFilter('rejected'); setPage(0); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>REJECTED</Typography>
                  <Typography variant="h5" fontWeight={700} color="#ef4444" sx={{ mt: 0.5 }}>{stats.rejected}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><CancelIcon /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            color="#10b981"
            onClick={() => { setStatusFilter('approved'); setPage(0); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL COLLECTED (ETB)</Typography>
                  <Typography variant="h6" fontWeight={800} color="#10b981" sx={{ mt: 0.5 }}>
                    ETB {Number(stats.totalCollectedVolume).toLocaleString()}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><MoneyIcon /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by payer, reference, phone, or unit..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
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

          <Grid item xs={6} sm={3} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="pending">Pending Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="equb">Equb Contribution</MenuItem>
                <MenuItem value="iddir">Iddir Contribution</MenuItem>
                <MenuItem value="guard_fee">Guard Fee</MenuItem>
                <MenuItem value="service_charge">Service Charge</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference / Ref No</TableCell>
                  <TableCell>Payer & Unit</TableCell>
                  <TableCell>Purpose & Target</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map((p) => {
                    const isPending = p.status === 'pending';
                    const reference = p.transaction?.referenceNo || `HX-${p.id.slice(0, 8).toUpperCase()}`;

                    return (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                            {reference}
                          </Typography>
                          <Typography variant="caption" color="#6b7a8f">
                            {p.monthYear ? `Period: ${p.monthYear}` : 'Direct Contribution'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                            {p.user?.fullName || 'Resident'}
                          </Typography>
                          <Typography variant="caption" color="#6b7a8f">
                            Unit: {p.user?.block || 'Block ?'}/Rm {p.user?.roomNo || '?'} ({p.user?.phoneNumber || 'N/A'})
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={(p.paymentType || 'other').toUpperCase()}
                            size="small"
                            sx={{ height: 22, fontWeight: 700, bgcolor: p.paymentType === 'equb' ? 'rgba(211, 173, 50, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: p.paymentType === 'equb' ? '#b08822' : '#2563eb' }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#4b5563' }}>
                            {p.equb?.name || p.iddir?.name || 'General Community Pool'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BankIcon sx={{ fontSize: 16, color: '#6b7a8f' }} />
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {p.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                            </Typography>
                          </Box>
                          {p.transaction?.senderAccNo && (
                            <Typography variant="caption" color="#9ca3af">
                              Acc: {p.transaction.senderAccNo}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                            ETB {Number(p.amount).toLocaleString()}
                          </Typography>
                          {Number(p.serviceFee) > 0 && (
                            <Typography variant="caption" color="#9ca3af">
                              + Fee: ETB {Number(p.serviceFee).toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="#4b5563">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="#9ca3af">
                            {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {getStatusChip(p.status)}
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="View Transaction Details">
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedPayment(p); setOpenDetailModal(true); }}
                                sx={{ color: '#4a6cf7' }}
                              >
                                <FaEye size={15} />
                              </IconButton>
                            </Tooltip>

                            {isPending && (
                              <>
                                <Tooltip title="Approve Payment">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setAdminNotes('');
                                      setOpenApproveModal(true);
                                    }}
                                    sx={{ color: '#22c55e' }}
                                  >
                                    <FaCheck size={14} />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Reject Payment">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setRejectReason('');
                                      setOpenRejectModal(true);
                                    }}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <FaTimes size={14} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <PaymentIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                      <Typography variant="h6" color="#6b7a8f">No payments matching your filters</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalItems}
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

      {/* Record Simulated Bank Transfer Modal */}
      <Dialog disableRestoreFocus 
        open={openCreatePaymentModal}
        onClose={() => setOpenCreatePaymentModal(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        <form onSubmit={handleCreatePaymentSubmit}>
          <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BankIcon sx={{ color: '#10b981' }} />
              Submit Simulated Bank Transfer Contribution
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Record an Equb or Iddir member transfer for administrative review and pool credit
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                <strong>Simulated Transfer:</strong> All transfers and payouts are simulated for condominium community accounting. No actual bank funds are moved.
              </Alert>

              {/* Resident Member Selection */}
              <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                <InputLabel>Select Resident Member</InputLabel>
                <Select
                  value={createFormData.userId}
                  label="Select Resident Member"
                  onChange={(e) => setCreateFormData({ ...createFormData, userId: e.target.value })}
                >
                  {residents.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.fullName} — Unit {r.block || '?'}/{r.roomNo || '?'} ({r.phoneNumber || r.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                    <InputLabel>Payment Purpose</InputLabel>
                    <Select
                      value={createFormData.paymentType}
                      label="Payment Purpose"
                      onChange={(e) => {
                        const type = e.target.value;
                        const defaultGroup = type === 'equb' ? equbs[0] : iddirs[0];
                        setCreateFormData({
                          ...createFormData,
                          paymentType: type,
                          groupId: defaultGroup?.id || '',
                          amount: defaultGroup?.contributionAmount ? Number(defaultGroup.contributionAmount) : 5000,
                        });
                      }}
                    >
                      <MenuItem value="equb">Equb Savings Contribution</MenuItem>
                      <MenuItem value="iddir">Iddir Mutual Aid Fee</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={{ bgcolor: '#fff' }}>
                    <InputLabel>Target Group</InputLabel>
                    <Select
                      value={createFormData.groupId}
                      label="Target Group"
                      onChange={(e) => {
                        const gId = e.target.value;
                        const g = (createFormData.paymentType === 'equb' ? equbs : iddirs).find((item) => item.id === gId);
                        setCreateFormData({
                          ...createFormData,
                          groupId: gId,
                          amount: g?.contributionAmount ? Number(g.contributionAmount) : createFormData.amount,
                        });
                      }}
                    >
                      {(createFormData.paymentType === 'equb' ? equbs : iddirs).map((g) => (
                        <MenuItem key={g.id} value={g.id}>
                          {g.name} (ETB {Number(g.contributionAmount).toLocaleString()})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contribution Amount (ETB)"
                    type="number"
                    fullWidth
                    required
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: Number(e.target.value) })}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Payment Period (Month)"
                    type="month"
                    fullWidth
                    value={createFormData.monthYear}
                    onChange={(e) => setCreateFormData({ ...createFormData, monthYear: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Sender Bank / Method"
                    fullWidth
                    value={createFormData.senderBankName}
                    onChange={(e) => setCreateFormData({ ...createFormData, senderBankName: e.target.value })}
                    placeholder="e.g. CBE, Telebirr, Awash"
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Sender Account / Phone No"
                    fullWidth
                    value={createFormData.senderAccountNumber}
                    onChange={(e) => setCreateFormData({ ...createFormData, senderAccountNumber: e.target.value })}
                    placeholder="100012345678"
                    sx={{ bgcolor: '#fff' }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Simulated Bank Transfer Reference"
                fullWidth
                value={createFormData.referenceNo}
                onChange={(e) => setCreateFormData({ ...createFormData, referenceNo: e.target.value })}
                placeholder="e.g. CBE-TRX-123456"
                helperText="Unique reference from the bank transfer receipt"
                sx={{ bgcolor: '#fff' }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Button onClick={() => setOpenCreatePaymentModal(false)} disabled={submittingPayment} sx={{ color: '#6b7a8f' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingPayment}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', px: 3, fontWeight: 700 }}
            >
              {submittingPayment ? <CircularProgress size={20} color="inherit" /> : 'Submit for Review'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog disableRestoreFocus 
        open={openApproveModal}
        onClose={() => setOpenApproveModal(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Approve Payment?
              </Typography>
              <Typography variant="caption" color="#6b7a8f">
                Ref: {selectedPayment?.transaction?.referenceNo || selectedPayment?.id?.slice(0, 8)}
              </Typography>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
            Confirming this will mark the payment as <strong>Approved</strong> and automatically credit{' '}
            <strong>ETB {Number(selectedPayment?.amount || 0).toLocaleString()}</strong> to the member's paid contribution balance.
          </Alert>

          <TextField
            label="Admin Notes (Optional)"
            fullWidth
            multiline
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Verified against CBE bank statement..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => setOpenApproveModal(false)} disabled={processingAction} sx={{ color: '#6b7a8f' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApprove}
              disabled={processingAction}
              sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, fontWeight: 700 }}
            >
              {processingAction ? <CircularProgress size={20} color="inherit" /> : 'Confirm Approval'}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog disableRestoreFocus 
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <CancelIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Reject Payment
              </Typography>
              <Typography variant="caption" color="#6b7a8f">
                Ref: {selectedPayment?.transaction?.referenceNo || selectedPayment?.id?.slice(0, 8)}
              </Typography>
            </Box>
          </Box>

          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            Please provide a clear reason for rejection. The payment will be excluded from the collected pool and will not credit the member.
          </Alert>

          <TextField
            label="Rejection Reason *"
            fullWidth
            required
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Bank statement reference does not match deposit..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => setOpenRejectModal(false)} disabled={processingAction} sx={{ color: '#6b7a8f' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleReject}
              disabled={processingAction || !rejectReason.trim()}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontWeight: 700 }}
            >
              {processingAction ? <CircularProgress size={20} color="inherit" /> : 'Confirm Rejection'}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog disableRestoreFocus 
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              Transaction Inspection & Audit
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Ref: {selectedPayment?.transaction?.referenceNo || selectedPayment?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenDetailModal(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {selectedPayment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">STATUS</Typography>
                    <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedPayment.status)}</Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">TOTAL AMOUNT</Typography>
                    <Typography variant="h6" fontWeight={800} color="#1a1a2e" sx={{ mt: 0.5 }}>
                      ETB {Number(selectedPayment.totalAmount || selectedPayment.amount).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                  Payer & Resident Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Full Name</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedPayment.user?.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Phone Number</Typography>
                    <Typography variant="body2">{selectedPayment.user?.phoneNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Block & Room</Typography>
                    <Typography variant="body2">Block {selectedPayment.user?.block || '?'}, Room {selectedPayment.user?.roomNo || '?'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">FAN Identifier</Typography>
                    <Typography variant="body2">{selectedPayment.user?.fan || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                  Financial & Gateway Metadata
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Base Amount</Typography>
                    <Typography variant="body2">ETB {Number(selectedPayment.amount).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Service Fee (0.34%)</Typography>
                    <Typography variant="body2">ETB {Number(selectedPayment.serviceFee || 0).toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Payment Method</Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {selectedPayment.paymentMethod?.replace('_', ' ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Sender Account / Reference</Typography>
                    <Typography variant="body2">{selectedPayment.transaction?.senderAccNo || 'Direct Deposit'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {selectedPayment.adminNotes && (
                <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                  <Typography variant="caption" color="#6b7a8f">ADMINISTRATIVE NOTES / REASON</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#1a1a2e' }}>
                    {selectedPayment.adminNotes}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)} variant="contained" sx={{ bgcolor: '#1a1a2e', textTransform: 'none', px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;
