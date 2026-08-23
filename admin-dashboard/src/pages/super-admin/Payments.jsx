// src/pages/super-admin/Payments.jsx
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
  useTheme,
  Zoom,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
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
  Legend,
} from 'recharts';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)',
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7a8f',
    padding: '10px 14px',
    borderBottom: '2px solid #e9ecef',
  },
  '& .MuiTableCell-body': {
    padding: '10px 14px',
    fontSize: '0.8rem',
    color: '#2d3436',
    borderBottom: '1px solid #f1f3f5',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  '.stat-icon': {
    width: 36,
    height: 36,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: color || '#f0f4ff',
  },
  '.stat-value': {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  '.stat-label': {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#6b7a8f',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

// Mock Data - Condo Focused
const MOCK_CONDOS = [
  {
    id: '1',
    name: 'Ye Kondominium 01',
    code: 'YEKONDO-001',
    totalPayments: 125000,
    totalTransactions: 25,
    breakdown: {
      equb: { amount: 50000, count: 10 },
      iddir: { amount: 30000, count: 6 },
      serviceCharge: { amount: 25000, count: 5 },
      guardFee: { amount: 20000, count: 4 },
    },
    monthlyData: [
      { month: 'Jan', amount: 15000 },
      { month: 'Feb', amount: 18000 },
      { month: 'Mar', amount: 20000 },
      { month: 'Apr', amount: 22000 },
      { month: 'May', amount: 25000 },
      { month: 'Jun', amount: 25000 },
    ],
    recentTransactions: [
      { id: 't1', reference: 'HX-20260820-001', amount: 500, purpose: 'Equb Contribution', status: 'completed', date: '2026-08-20' },
      { id: 't2', reference: 'HX-20260820-002', amount: 1000, purpose: 'Iddir Contribution', status: 'completed', date: '2026-08-20' },
      { id: 't3', reference: 'HX-20260819-003', amount: 750, purpose: 'Service Charge', status: 'pending', date: '2026-08-19' },
    ],
  },
  {
    id: '2',
    name: 'Sunrise Condominium',
    code: 'SUNRISE-001',
    totalPayments: 87000,
    totalTransactions: 18,
    breakdown: {
      equb: { amount: 35000, count: 7 },
      iddir: { amount: 22000, count: 5 },
      serviceCharge: { amount: 18000, count: 4 },
      guardFee: { amount: 12000, count: 2 },
    },
    monthlyData: [
      { month: 'Jan', amount: 10000 },
      { month: 'Feb', amount: 12000 },
      { month: 'Mar', amount: 14000 },
      { month: 'Apr', amount: 16000 },
      { month: 'May', amount: 17000 },
      { month: 'Jun', amount: 18000 },
    ],
    recentTransactions: [
      { id: 't4', reference: 'HX-20260819-004', amount: 200, purpose: 'Guard Fee', status: 'completed', date: '2026-08-19' },
      { id: 't5', reference: 'HX-20260818-005', amount: 300, purpose: 'Equb Contribution', status: 'rejected', date: '2026-08-18' },
    ],
  },
  {
    id: '3',
    name: 'Green Valley Towers',
    code: 'GV-002',
    totalPayments: 58000,
    totalTransactions: 12,
    breakdown: {
      equb: { amount: 20000, count: 4 },
      iddir: { amount: 15000, count: 3 },
      serviceCharge: { amount: 13000, count: 3 },
      guardFee: { amount: 10000, count: 2 },
    },
    monthlyData: [
      { month: 'Jan', amount: 8000 },
      { month: 'Feb', amount: 9000 },
      { month: 'Mar', amount: 10000 },
      { month: 'Apr', amount: 10000 },
      { month: 'May', amount: 11000 },
      { month: 'Jun', amount: 10000 },
    ],
    recentTransactions: [
      { id: 't6', reference: 'HX-20260818-006', amount: 600, purpose: 'Service Charge', status: 'pending', date: '2026-08-18' },
    ],
  },
];

const Payments = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [condos, setCondos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalTransactions: 0,
    totalEqub: 0,
    totalIddir: 0,
    totalServiceCharge: 0,
  });
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCondos(MOCK_CONDOS);
      setTotalItems(MOCK_CONDOS.length);
      
      const totals = MOCK_CONDOS.reduce((acc, condo) => ({
        totalPayments: acc.totalPayments + condo.totalPayments,
        totalTransactions: acc.totalTransactions + condo.totalTransactions,
        totalEqub: acc.totalEqub + condo.breakdown.equb.amount,
        totalIddir: acc.totalIddir + condo.breakdown.iddir.amount,
        totalServiceCharge: acc.totalServiceCharge + condo.breakdown.serviceCharge.amount,
      }), {
        totalPayments: 0,
        totalTransactions: 0,
        totalEqub: 0,
        totalIddir: 0,
        totalServiceCharge: 0,
      });
      
      setStats(totals);
      
    } catch (error) {
      toast.error('Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCondos = condos.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCondos = filteredCondos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleViewDetails = (condo) => {
    setSelectedCondo(condo);
    setOpenDetailModal(true);
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || 0}`;

  // Chart Data
  const dailyChartData = [
    { day: 'Mon', amount: 5000 },
    { day: 'Tue', amount: 8000 },
    { day: 'Wed', amount: 12000 },
    { day: 'Thu', amount: 7000 },
    { day: 'Fri', amount: 15000 },
    { day: 'Sat', amount: 3000 },
    { day: 'Sun', amount: 2000 },
  ];

  const purposeData = [
    { name: 'Equb', value: stats.totalEqub },
    { name: 'Iddir', value: stats.totalIddir },
    { name: 'Service Charge', value: stats.totalServiceCharge },
    { name: 'Guard Fee', value: stats.totalPayments - stats.totalEqub - stats.totalIddir - stats.totalServiceCharge },
  ];

  const COLORS = ['#D3AD32', '#4a6cf7', '#22c55e', '#8b5cf6'];

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.5rem' }}>
          Payment Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f', fontSize: '0.8rem' }}>
          Monitor payments and transactions across all condominiums
        </Typography>
      </Box>

      {/* Stats Cards - Fixed Grid */}
     // Stats Cards - Equal sizes, clean design
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Payments
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
              {formatCurrency(stats.totalPayments)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(107, 114, 128, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PaymentIcon sx={{ color: '#6b7280', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Transactions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
              {stats.totalTransactions}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(59, 130, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ReceiptIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Equb Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32', fontSize: '1.1rem' }}>
              {formatCurrency(stats.totalEqub)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(211, 173, 50, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AccountBalanceIcon sx={{ color: '#D3AD32', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Iddir Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6', fontSize: '1.1rem' }}>
              {formatCurrency(stats.totalIddir)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(139, 92, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AccountBalanceIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Service Charges
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e', fontSize: '1.1rem' }}>
              {formatCurrency(stats.totalServiceCharge)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(34, 197, 94, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MoneyIcon sx={{ color: '#22c55e', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a2e' }}>
              Daily Transaction Volume
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D3AD32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D3AD32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="day" stroke="#6b7a8f" fontSize={11} />
                <YAxis stroke="#6b7a8f" fontSize={11} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#D3AD32" fill="url(#colorVolume)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a2e' }}>
              Payment Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={purposeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Amount']} />
                <Legend verticalAlign="bottom" height={30} fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Condo Cards */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e', fontSize: '1rem' }}>
        Condominium Payment Overview
      </Typography>
      
      {/* Search */}
      <Paper sx={{ mb: 2, p: 1.5, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            fullWidth
            placeholder="Search by condominium name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f', fontSize: 18 }} /></InputAdornment>,
              sx: { borderRadius: '8px', fontSize: '0.8rem' }
            }}
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ 
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', 
              color: '#fff', 
              textTransform: 'none', 
              borderRadius: '8px',
              fontSize: '0.75rem',
              px: 2,
              '&:hover': { background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Condo Cards Grid */}
      <Grid container spacing={2}>
        {paginatedCondos.map((condo) => (
          <Grid item xs={12} key={condo.id}>
            <Paper sx={{ 
              borderRadius: '12px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
              border: '1px solid rgba(0,0,0,0.04)',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}>
              {/* Condo Header */}
              <Box sx={{ 
                p: 2, 
                bgcolor: '#fafafa', 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '10px', 
                    background: 'rgba(211, 173, 50, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ApartmentIcon sx={{ color: '#D3AD32', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {condo.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                      Code: {condo.code} • {formatCurrency(condo.totalPayments)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip 
                    label={`${condo.totalTransactions} Txns`}
                    size="small"
                    sx={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', fontSize: '0.65rem', height: 22 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewDetails(condo)}
                    sx={{ color: '#6b7a8f', '&:hover': { color: '#D3AD32' } }}
                  >
                    <FaEye size={14} />
                  </IconButton>
                </Box>
              </Box>

              {/* Breakdown Section */}
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7a8f', mb: 1, display: 'block' }}>
                      Payment Breakdown
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(211, 173, 50, 0.05)', borderRadius: '6px', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f', fontSize: '0.6rem' }}>Equb</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32', fontSize: '0.8rem' }}>{formatCurrency(condo.breakdown.equb.amount)}</Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.55rem' }}>{condo.breakdown.equb.count}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(74, 108, 247, 0.05)', borderRadius: '6px', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f', fontSize: '0.6rem' }}>Iddir</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4a6cf7', fontSize: '0.8rem' }}>{formatCurrency(condo.breakdown.iddir.amount)}</Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.55rem' }}>{condo.breakdown.iddir.count}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f', fontSize: '0.6rem' }}>Service</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e', fontSize: '0.8rem' }}>{formatCurrency(condo.breakdown.serviceCharge.amount)}</Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.55rem' }}>{condo.breakdown.serviceCharge.count}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: '6px', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f', fontSize: '0.6rem' }}>Guard</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#8b5cf6', fontSize: '0.8rem' }}>{formatCurrency(condo.breakdown.guardFee.amount)}</Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.55rem' }}>{condo.breakdown.guardFee.count}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Detail Modal */}
      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 2.5,
          color: '#fff',
        }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.1rem' }}>
            Payment Details - {selectedCondo?.name}
          </DialogTitle>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {selectedCondo?.code} • {formatCurrency(selectedCondo?.totalPayments)}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {selectedCondo && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7a8f', mb: 1.5, display: 'block' }}>
                    Payment Breakdown
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(211, 173, 50, 0.05)', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Equb</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(selectedCondo.breakdown.equb.amount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{selectedCondo.breakdown.equb.count} txns</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(74, 108, 247, 0.05)', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Iddir</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4a6cf7' }}>{formatCurrency(selectedCondo.breakdown.iddir.amount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{selectedCondo.breakdown.iddir.count} txns</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Service</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#22c55e' }}>{formatCurrency(selectedCondo.breakdown.serviceCharge.amount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{selectedCondo.breakdown.serviceCharge.count} txns</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Guard</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{formatCurrency(selectedCondo.breakdown.guardFee.amount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{selectedCondo.breakdown.guardFee.count} txns</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7a8f', mt: 2, mb: 1.5, display: 'block' }}>
                    Recent Transactions
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Reference</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Purpose</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCondo.recentTransactions.map((txn) => (
                          <TableRow key={txn.id} hover>
                            <TableCell sx={{ fontSize: '0.7rem' }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#D3AD32' }}>
                                {txn.reference}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={txn.purpose} 
                                size="small" 
                                sx={{ fontSize: '0.6rem', height: 20, backgroundColor: 'rgba(107, 114, 128, 0.08)', color: '#6b7280' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                                {formatCurrency(txn.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={txn.status} 
                                size="small" 
                                sx={{
                                  fontSize: '0.6rem', 
                                  height: 20,
                                  backgroundColor: txn.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 
                                                  txn.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 
                                                  'rgba(220, 38, 38, 0.1)',
                                  color: txn.status === 'completed' ? '#22c55e' : 
                                         txn.status === 'pending' ? '#f59e0b' : '#dc2626',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                                {new Date(txn.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;