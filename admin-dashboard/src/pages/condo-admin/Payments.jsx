// src/pages/condo-admin/Payments.jsx
import React, { useState, useEffect } from 'react';
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
  useTheme,
  Zoom,
  Tooltip,
  Divider,
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
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

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },
  '.stat-icon': {
    width: 44,
    height: 44,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: color || '#f0f4ff',
  },
}));

// Mock Data
const MOCK_PAYMENTS = [
  {
    id: '1',
    user: { fullName: 'Abebe Kebede', email: 'abebe@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'iddir',
    amount: 500,
    serviceFee: 1.70,
    totalAmount: 501.70,
    paymentMethod: 'telebirr',
    status: 'approved',
    monthYear: '2026-08',
    createdAt: '2026-08-20T10:30:00.000Z',
    referenceNo: 'HX-20260820-ABC123',
    adminNotes: 'Payment verified and approved',
  },
  {
    id: '2',
    user: { fullName: 'Meron Tesfaye', email: 'meron@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'equb',
    amount: 1000,
    serviceFee: 3.40,
    totalAmount: 1003.40,
    paymentMethod: 'cbe',
    status: 'pending',
    monthYear: '2026-08',
    createdAt: '2026-08-19T14:20:00.000Z',
    referenceNo: 'HX-20260819-DEF456',
    adminNotes: null,
  },
  {
    id: '3',
    user: { fullName: 'Dawit Hailu', email: 'dawit@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'guard_fee',
    amount: 300,
    serviceFee: 1.02,
    totalAmount: 301.02,
    paymentMethod: 'cash',
    status: 'rejected',
    monthYear: '2026-07',
    createdAt: '2026-08-18T09:00:00.000Z',
    referenceNo: 'HX-20260818-GHI789',
    adminNotes: 'Payment amount could not be verified',
  },
  {
    id: '4',
    user: { fullName: 'Tigist Worku', email: 'tigist@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'service_charge',
    amount: 750,
    serviceFee: 2.55,
    totalAmount: 752.55,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    monthYear: '2026-08',
    createdAt: '2026-08-17T13:45:00.000Z',
    referenceNo: 'HX-20260817-JKL012',
    adminNotes: null,
  },
  {
    id: '5',
    user: { fullName: 'Biruk Ayele', email: 'biruk@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'iddir',
    amount: 500,
    serviceFee: 1.70,
    totalAmount: 501.70,
    paymentMethod: 'telebirr',
    status: 'pending',
    monthYear: '2026-08',
    createdAt: '2026-08-16T22:15:00.000Z',
    referenceNo: 'HX-20260816-MNO345',
    adminNotes: null,
  },
  {
    id: '6',
    user: { fullName: 'Hana Belay', email: 'hana@example.com' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
    paymentType: 'equb',
    amount: 1000,
    serviceFee: 3.40,
    totalAmount: 1003.40,
    paymentMethod: 'cbe',
    status: 'approved',
    monthYear: '2026-07',
    createdAt: '2026-08-15T11:00:00.000Z',
    referenceNo: 'HX-20260815-PQR678',
    adminNotes: 'Payment verified',
  },
];

const Payments = () => {
  const theme = useTheme();
  
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
    totalRevenue: 0,
  });
  
  // Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPayments(MOCK_PAYMENTS);
      setTotalItems(MOCK_PAYMENTS.length);
      
      // Calculate stats
      setStats({
        total: MOCK_PAYMENTS.length,
        pending: MOCK_PAYMENTS.filter(p => p.status === 'pending').length,
        approved: MOCK_PAYMENTS.filter(p => p.status === 'approved').length,
        rejected: MOCK_PAYMENTS.filter(p => p.status === 'rejected').length,
        totalRevenue: MOCK_PAYMENTS.reduce((sum, p) => sum + p.totalAmount, 0),
      });
      
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Approve payment
  const handleApprove = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const updatedPayments = payments.map(p => 
        p.id === selectedPayment.id 
          ? { 
              ...p, 
              status: 'approved', 
              adminNotes: adminNotes || 'Payment approved by admin',
              approvedAt: new Date().toISOString(),
            }
          : p
      );
      setPayments(updatedPayments);
      
      // Update stats
      const newStats = {
        total: updatedPayments.length,
        pending: updatedPayments.filter(p => p.status === 'pending').length,
        approved: updatedPayments.filter(p => p.status === 'approved').length,
        rejected: updatedPayments.filter(p => p.status === 'rejected').length,
        totalRevenue: updatedPayments.reduce((sum, p) => sum + p.totalAmount, 0),
      };
      setStats(newStats);
      
      toast.success(`Payment ${selectedPayment.referenceNo} approved successfully!`);
      setOpenApproveModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  // Reject payment
  const handleReject = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const updatedPayments = payments.map(p => 
        p.id === selectedPayment.id 
          ? { 
              ...p, 
              status: 'rejected', 
              adminNotes: adminNotes || 'Payment rejected by admin',
              rejectedAt: new Date().toISOString(),
            }
          : p
      );
      setPayments(updatedPayments);
      
      // Update stats
      const newStats = {
        total: updatedPayments.length,
        pending: updatedPayments.filter(p => p.status === 'pending').length,
        approved: updatedPayments.filter(p => p.status === 'approved').length,
        rejected: updatedPayments.filter(p => p.status === 'rejected').length,
        totalRevenue: updatedPayments.reduce((sum, p) => sum + p.totalAmount, 0),
      };
      setStats(newStats);
      
      toast.success(`Payment ${selectedPayment.referenceNo} rejected`);
      setOpenRejectModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || payment.paymentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setOpenDetailModal(true);
  };

  // Handle open approve modal
  const handleOpenApprove = (payment) => {
    setSelectedPayment(payment);
    setAdminNotes('');
    setOpenApproveModal(true);
  };

  // Handle open reject modal
  const handleOpenReject = (payment) => {
    setSelectedPayment(payment);
    setAdminNotes('');
    setOpenRejectModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `ETB ${amount?.toLocaleString() || 0}`;
  };

  // Get status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'approved':
        return <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Approved" size="small" sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 600 }} />;
      case 'pending':
        return <Chip icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label="Pending" size="small" sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600 }} />;
      case 'rejected':
        return <Chip icon={<CancelIcon sx={{ fontSize: 14 }} />} label="Rejected" size="small" sx={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch(type) {
      case 'iddir': return 'Iddir';
      case 'equb': return 'Equb';
      case 'guard_fee': return 'Guard Fee';
      case 'service_charge': return 'Service Charge';
      default: return type;
    }
  };

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Payment Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Track, approve and manage all payments in your condominium
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
          sx={{
            mt: { xs: 2, sm: 0 },
            background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
              transform: 'translateY(-2px)',
            },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <PaymentIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(245, 158, 11, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Pending</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <ScheduleIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Approved</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.approved}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(220, 38, 38, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Rejected</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{stats.rejected}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(220, 38, 38, 0.1)' }}>
                  <CancelIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(211, 173, 50, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Revenue</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                  <MoneyIcon sx={{ color: '#D3AD32', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, reference or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7a8f' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' }
            }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="iddir">Iddir</MenuItem>
              <MenuItem value="equb">Equb</MenuItem>
              <MenuItem value="guard_fee">Guard Fee</MenuItem>
              <MenuItem value="service_charge">Service Charge</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#D3AD32' }}>
                      {payment.referenceNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#D3AD32', fontSize: '0.65rem' }}>
                        {payment.user?.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2" color="#1a1a2e">
                        {payment.user?.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getTypeLabel(payment.paymentType)}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(107, 114, 128, 0.08)',
                        color: '#6b7280',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                      {formatCurrency(payment.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.paymentMethod}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(107, 114, 128, 0.08)',
                        color: '#6b7280',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {getStatusChip(payment.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6b7a8f', fontSize: '0.75rem' }}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {payment.status === 'pending' && (
                        <>
                          <Tooltip title="Approve Payment">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenApprove(payment)}
                              sx={{ 
                                color: '#22c55e', 
                                '&:hover': { 
                                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                borderRadius: '10px',
                                padding: '8px',
                              }}
                            >
                              <FaCheck size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Payment">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReject(payment)}
                              sx={{ 
                                color: '#dc2626', 
                                '&:hover': { 
                                  backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                borderRadius: '10px',
                                padding: '8px',
                              }}
                            >
                              <FaTimes size={16} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(payment)}
                          sx={{ 
                            color: '#6b7a8f', 
                            '&:hover': { 
                              color: '#D3AD32',
                              backgroundColor: 'rgba(211, 173, 50, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '10px',
                            padding: '8px',
                          }}
                        >
                          <FaEye size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PaymentIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No payments found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'No payments in your condominium'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #f1f3f5',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: '#6b7a8f',
            },
          }}
        />
      </StyledTableContainer>

      {/* Detail Modal */}
      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 3,
          color: '#fff',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
                Payment Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                View complete payment information
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setOpenDetailModal(false)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Reference</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#D3AD32' }}>
                    {selectedPayment.referenceNo}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>User</Typography>
                  <Typography variant="body2">{selectedPayment.user?.fullName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Email</Typography>
                  <Typography variant="body2">{selectedPayment.user?.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Payment Type</Typography>
                  <Typography variant="body2">{getTypeLabel(selectedPayment.paymentType)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Payment Method</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedPayment.paymentMethod}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Status</Typography>
                  {getStatusChip(selectedPayment.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Month/Year</Typography>
                  <Typography variant="body2">{selectedPayment.monthYear}</Typography>
                </Grid>
                {selectedPayment.adminNotes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Admin Notes</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                      <Typography variant="body2">{selectedPayment.adminNotes}</Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Amount Details</Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Base Amount</Typography>
                      <Typography variant="body2">{formatCurrency(selectedPayment.amount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2">Service Fee (0.34%)</Typography>
                      <Typography variant="body2">{formatCurrency(selectedPayment.serviceFee)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>Total</Typography>
                      <Typography variant="body2" fontWeight={700} color="#D3AD32">
                        {formatCurrency(selectedPayment.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Date</Typography>
                  <Typography variant="body2">{new Date(selectedPayment.createdAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Modal */}
      <Dialog 
        open={openApproveModal} 
        onClose={() => setOpenApproveModal(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 3,
          color: '#fff',
        }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#22c55e' }} />
            Approve Payment
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Confirm approval for this payment
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedPayment && (
            <Box>
              <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
                You are about to approve payment <strong>{selectedPayment.referenceNo}</strong> from <strong>{selectedPayment.user?.fullName}</strong>
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                <Typography variant="body2" color="#6b7a8f">Amount</Typography>
                <Typography variant="body2" fontWeight={700} color="#D3AD32">
                  {formatCurrency(selectedPayment.totalAmount)}
                </Typography>
              </Box>
              <TextField
                label="Admin Notes (Optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Add any notes about this approval..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    '&:hover fieldset': { borderColor: '#D3AD32' },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenApproveModal(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              },
              textTransform: 'none',
            }}
          >
            Approve Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog 
        open={openRejectModal} 
        onClose={() => setOpenRejectModal(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 3,
          color: '#fff',
        }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            <CancelIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#dc2626' }} />
            Reject Payment
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Confirm rejection for this payment
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedPayment && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
                You are about to reject payment <strong>{selectedPayment.referenceNo}</strong> from <strong>{selectedPayment.user?.fullName}</strong>
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                <Typography variant="body2" color="#6b7a8f">Amount</Typography>
                <Typography variant="body2" fontWeight={700} color="#D3AD32">
                  {formatCurrency(selectedPayment.totalAmount)}
                </Typography>
              </Box>
              <TextField
                label="Rejection Reason (Optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Provide reason for rejection..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    '&:hover fieldset': { borderColor: '#D3AD32' },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenRejectModal(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            startIcon={<CancelIcon />}
            sx={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              },
              textTransform: 'none',
            }}
          >
            Reject Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;