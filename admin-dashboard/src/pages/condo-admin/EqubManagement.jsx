// src/pages/condo-admin/EqubManagement.jsx
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
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaUserPlus, FaUserMinus, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

// Styled Components
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
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  '& .MuiCardContent-root': {
    padding: 24,
  },
}));

// Mock Equb Data
const MOCK_EQUBS = [
  {
    id: '1',
    name: 'Monthly Family Equb',
    contributionAmount: 5000,
    startDate: '2026-01-15T00:00:00.000Z',
    dueDate: '2026-12-15T00:00:00.000Z',
    status: 'active',
    noMembers: 12,
    members: [
      { id: 'm1', userId: 'u1', user: { fullName: 'Abebe Kebede' }, status: 'active', joinedAt: '2026-01-15', totalPaid: 55000, hasReceivedPayout: true, payoutCount: 1 },
      { id: 'm2', userId: 'u2', user: { fullName: 'Meron Tesfaye' }, status: 'active', joinedAt: '2026-01-15', totalPaid: 45000, hasReceivedPayout: false, payoutCount: 0 },
    ],
    payouts: [
      { id: 'p1', winnerId: 'u4', winner: { fullName: 'Tigist Worku' }, amount: 50000, roundNumber: 1, status: 'paid', selectedAt: '2026-02-15', paidAt: '2026-02-16' },
    ],
    payments: [],
    createdAt: '2026-01-10T10:00:00.000Z',
    createdBy: { fullName: 'Admin User' },
  },
  {
    id: '2',
    name: 'Wegeda Equb',
    contributionAmount: 3000,
    startDate: '2026-03-01T00:00:00.000Z',
    dueDate: '2027-02-28T00:00:00.000Z',
    status: 'active',
    noMembers: 8,
    members: [
      { id: 'm6', userId: 'u6', user: { fullName: 'Hana Belay' }, status: 'active', joinedAt: '2026-03-01', totalPaid: 18000, hasReceivedPayout: false, payoutCount: 0 },
    ],
    payouts: [
      { id: 'p3', winnerId: 'u6', winner: { fullName: 'Hana Belay' }, amount: 24000, roundNumber: 1, status: 'paid', selectedAt: '2026-04-01', paidAt: '2026-04-02' },
    ],
    payments: [],
    createdAt: '2026-02-20T14:00:00.000Z',
    createdBy: { fullName: 'Admin User' },
  },
];

const EqubManagement = () => {
  const theme = useTheme();
  
  // State
  const [equbs, setEqubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalMembers: 0,
    totalAmount: 0,
  });
  
  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingEqub, setEditingEqub] = useState(null);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    contributionAmount: '',
    startDate: '',
    dueDate: '',
    status: 'pending',
  });

  // Fetch equbs
  const fetchEqubs = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setEqubs(MOCK_EQUBS);
      setTotalItems(MOCK_EQUBS.length);
      
      // Calculate stats
      const totalMembers = MOCK_EQUBS.reduce((sum, e) => sum + e.noMembers, 0);
      const totalAmount = MOCK_EQUBS.reduce((sum, e) => sum + e.contributionAmount, 0);
      
      setStats({
        total: MOCK_EQUBS.length,
        active: MOCK_EQUBS.filter(e => e.status === 'active').length,
        completed: MOCK_EQUBS.filter(e => e.status === 'completed').length,
        pending: MOCK_EQUBS.filter(e => e.status === 'pending').length,
        cancelled: MOCK_EQUBS.filter(e => e.status === 'cancelled').length,
        totalMembers,
        totalAmount,
      });
      
    } catch (error) {
      console.error('❌ Error fetching equbs:', error);
      toast.error('Failed to fetch equbs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEqubs();
  }, []);

  // Filter equbs
  const filteredEqubs = equbs.filter(equb => {
    const matchesSearch = 
      equb.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || equb.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedEqubs = filteredEqubs.slice(
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

  // Handle submit (Create/Update)
  const handleSubmit = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEqub = {
        id: editingEqub?.id || Date.now().toString(),
        name: formData.name,
        contributionAmount: parseFloat(formData.contributionAmount),
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        status: formData.status,
        noMembers: 0,
        members: [],
        payouts: [],
        payments: [],
        createdAt: new Date().toISOString(),
        createdBy: { fullName: 'Admin User' },
      };
      
      if (editingEqub) {
        const updated = equbs.map(e => e.id === editingEqub.id ? { ...e, ...newEqub } : e);
        setEqubs(updated);
        toast.success('Equb updated successfully!');
      } else {
        setEqubs([newEqub, ...equbs]);
        toast.success('Equb created successfully!');
      }
      
      setOpenModal(false);
      resetForm();
      fetchEqubs();
    } catch (error) {
      toast.error('Failed to save equb');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equb?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = equbs.filter(e => e.id !== id);
      setEqubs(updated);
      toast.success('Equb deleted successfully!');
      fetchEqubs();
    } catch (error) {
      toast.error('Failed to delete equb');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingEqub(null);
    setFormData({
      name: '',
      contributionAmount: '',
      startDate: '',
      dueDate: '',
      status: 'pending',
    });
  };

  // Handle view details
  const handleViewDetails = (equb) => {
    setSelectedEqub(equb);
    setDetailTab(0);
    setOpenDetailModal(true);
  };

  const handleTabChange = (event, newValue) => {
    setDetailTab(newValue);
  };

  const formatCurrency = (amount) => {
    return `ETB ${amount?.toLocaleString() || 0}`;
  };

  const getStatusChip = (status) => {
    const colors = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
      completed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      cancelled: { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' },
    };
    const c = colors[status] || { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    return <Chip label={status} size="small" sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600 }} />;
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
            Equb Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage Equb (Savings Circles) in your condominium
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchEqubs}
            sx={{
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
            }}
          >
            Create Equb
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total Equbs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <AccountBalanceIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Active</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.active}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(59, 130, 246, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Completed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.completed}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <TrendingUpIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Members</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.totalMembers}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <PeopleIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>
                    {formatCurrency(stats.totalAmount)}
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
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search equb by name..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEqubs.map((equb) => (
              <TableRow key={equb.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                    {equb.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                    {formatCurrency(equb.contributionAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={<PeopleIcon sx={{ fontSize: 14 }} />}
                    label={equb.noMembers}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(211, 173, 50, 0.08)',
                      color: '#D3AD32',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                    {new Date(equb.startDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                    {new Date(equb.dueDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(equb.status)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(equb)}
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
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingEqub(equb);
                          setFormData({
                            name: equb.name,
                            contributionAmount: equb.contributionAmount,
                            startDate: equb.startDate?.split('T')[0] || '',
                            dueDate: equb.dueDate?.split('T')[0] || '',
                            status: equb.status,
                          });
                          setOpenModal(true);
                        }}
                        sx={{ 
                          color: '#6b7a8f', 
                          '&:hover': { 
                            color: '#4a6cf7',
                            backgroundColor: 'rgba(74, 108, 247, 0.08)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          borderRadius: '10px',
                          padding: '8px',
                        }}
                      >
                        <FaRegEdit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(equb.id)}
                        sx={{ 
                          color: '#6b7a8f', 
                          '&:hover': { 
                            color: '#d32f2f',
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          borderRadius: '10px',
                          padding: '8px',
                        }}
                      >
                        <FaRegTrashAlt size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedEqubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No equbs found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'Create a new equb'}
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
          count={filteredEqubs.length}
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

      {/* Create/Edit Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
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
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            {editingEqub ? '✏️ Edit Equb' : '📊 Create Equb'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingEqub ? 'Update equb details' : 'Add a new equb (savings circle)'}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Equb Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            <TextField
              label="Contribution Amount (ETB) *"
              type="number"
              value={formData.contributionAmount}
              onChange={(e) => setFormData({...formData, contributionAmount: e.target.value})}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Date *"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#fff',
                      '&:hover fieldset': { borderColor: '#D3AD32' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Due Date *"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#fff',
                      '&:hover fieldset': { borderColor: '#D3AD32' },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                label="Status"
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              px: 4,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(211, 173, 50, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingEqub ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        maxWidth="md" 
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
                Equb Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                {selectedEqub?.name}
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
        
        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          {selectedEqub && (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f3f5' }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Contribution</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>
                      {formatCurrency(selectedEqub.contributionAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Members</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      {selectedEqub.noMembers}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography>
                    {getStatusChip(selectedEqub.status)}
                  </Box>
                </Grid>
              </Grid>

              {/* Tabs */}
              <Box sx={{ borderBottom: '1px solid #f1f3f5', bgcolor: '#ffffff' }}>
                <Tabs 
                  value={detailTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 48,
                    },
                    '& .Mui-selected': {
                      color: '#D3AD32',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#D3AD32',
                    },
                  }}
                >
                  <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" />
                  <Tab label="Winners" icon={<TrophyIcon />} iconPosition="start" />
                  <Tab label="History" icon={<ScheduleIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>
                {detailTab === 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                      All Members
                    </Typography>
                    {selectedEqub.members?.map((member) => (
                      <Paper 
                        key={member.id} 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: member.status === 'inactive' ? '#f8f9fa' : '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #f1f3f5',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#D3AD32' }}>
                            {member.user?.fullName?.charAt(0) || 'M'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {member.user?.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                              Joined: {new Date(member.joinedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                            {formatCurrency(member.totalPaid)}
                          </Typography>
                          <Chip 
                            label={member.status}
                            size="small"
                            sx={{
                              backgroundColor: member.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                              color: member.status === 'active' ? '#22c55e' : '#6b7280',
                              fontWeight: 600,
                            }}
                          />
                          {member.hasReceivedPayout && (
                            <Chip 
                              label="Winner"
                              size="small"
                              icon={<TrophyIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                backgroundColor: 'rgba(211, 173, 50, 0.1)',
                                color: '#D3AD32',
                                fontWeight: 600,
                              }}
                            />
                          )}
                          {member.leftAt && (
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                              Left: {new Date(member.leftAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {detailTab === 1 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                      Past Winners
                    </Typography>
                    {selectedEqub.payouts?.map((payout) => (
                      <Paper 
                        key={payout.id} 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: 'rgba(211, 173, 50, 0.03)',
                          borderRadius: '8px',
                          border: '1px solid rgba(211, 173, 50, 0.1)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#D3AD32' }}>
                            {payout.winner?.fullName?.charAt(0) || 'W'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {payout.winner?.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                              Round {payout.roundNumber} • Selected: {new Date(payout.selectedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#D3AD32' }}>
                            {formatCurrency(payout.amount)}
                          </Typography>
                          <Chip 
                            label={payout.status}
                            size="small"
                            sx={{
                              backgroundColor: payout.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: payout.status === 'paid' ? '#22c55e' : '#f59e0b',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Paper>
                    ))}
                    {selectedEqub.payouts?.length === 0 && (
                      <Typography variant="body2" sx={{ color: '#6b7a8f', textAlign: 'center', py: 3 }}>
                        No payouts recorded yet
                      </Typography>
                    )}
                  </Box>
                )}

                {detailTab === 2 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                      Equb Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created By</Typography>
                          <Typography variant="body2">{selectedEqub.createdBy?.fullName}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created At</Typography>
                          <Typography variant="body2">{new Date(selectedEqub.createdAt).toLocaleString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Start Date</Typography>
                          <Typography variant="body2">{new Date(selectedEqub.startDate).toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Due Date</Typography>
                          <Typography variant="body2">{new Date(selectedEqub.dueDate).toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Contributions</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                            {formatCurrency(selectedEqub.members?.reduce((sum, m) => sum + m.totalPaid, 0) || 0)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EqubManagement;