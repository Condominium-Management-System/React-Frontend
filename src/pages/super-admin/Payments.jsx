// src/pages/super-admin/Payments.jsx
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
  Apartment as ApartmentIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
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

const SuperAdminPayments = () => {
  const [searchParams] = useSearchParams();

  // State
  const [payments, setPayments] = useState([]);
  const [condos, setCondos] = useState([]);
  const [selectedCondoId, setSelectedCondoId] = useState('ALL');
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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get('status')?.toLowerCase();
    if (statusParam === 'pending') setStatusFilter('pending');
    else if (statusParam === 'approved') setStatusFilter('approved');
    else if (statusParam === 'rejected') setStatusFilter('rejected');
  }, [searchParams]);

  // Fetch Condos
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        const res = await api.condos.getAll();
        setCondos(res.data?.data || []);
      } catch (e) {
        console.error('Failed to load condos:', e);
      }
    };
    fetchCondos();
  }, []);

  // Fetch payments from live backend
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...(selectedCondoId !== 'ALL' ? { condoId: selectedCondoId } : {}),
        page: page + 1,
        limit: rowsPerPage,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(typeFilter !== 'ALL' ? { paymentType: typeFilter } : {}),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      };

      const statParams = selectedCondoId !== 'ALL' ? { condoId: selectedCondoId } : {};

      const [paymentsRes, statsRes] = await Promise.all([
        api.payments.getAll(params),
        api.payments.getStatistics(statParams),
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
      console.error('Error fetching system-wide payments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [selectedCondoId, page, rowsPerPage, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Approve Payment Action
  const handleApprove = async () => {
    if (!selectedPayment) return;
    try {
      setProcessingAction(true);
      await api.payments.approve(selectedPayment.id, { adminNotes });
      toast.success('Payment approved successfully! Member balance credited.');
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
              System-Wide Payments & Financial Review
            </Typography>
          </Box>
          <Typography variant="body2" color="#6b7a8f">
            Super Administrator oversight of all community contributions, bank transfer reviews, and collection pools across all condominiums
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
          disabled={loading}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
        >
          Refresh Data
        </Button>
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>SYSTEM PAYMENTS</Typography>
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
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Condominium</InputLabel>
              <Select
                value={selectedCondoId}
                label="Filter by Condominium"
                onChange={(e) => { setSelectedCondoId(e.target.value); setPage(0); }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="ALL">All Condominiums (System-Wide)</MenuItem>
                {condos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
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

          <Grid item xs={6} sm={3} md={2.5}>
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

          <Grid item xs={6} sm={3} md={2.5}>
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
                  <TableCell>Condominium</TableCell>
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
                            {p.condo?.condoName || 'Condominium'}
                          </Typography>
                          <Chip
                            label={p.condo?.condoCode || 'Condo'}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(26, 26, 46, 0.08)' }}
                          />
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
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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
                  Condominium & Payer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#6b7a8f">Condominium</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedPayment.condo?.condoName} ({selectedPayment.condo?.condoCode})</Typography>
                  </Grid>
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

export default SuperAdminPayments;
