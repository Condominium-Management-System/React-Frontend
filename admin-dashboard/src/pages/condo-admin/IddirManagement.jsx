// src/pages/condo-admin/IddirManagement.jsx
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
  People as PeopleIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

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

// Mock Iddir Data
const MOCK_IDDIRS = [
  {
    id: '1',
    name: 'Wegeda Iddir',
    contributionAmount: 500,
    startedDate: '2026-01-01T00:00:00.000Z',
    status: 'active',
    noMembers: 25,
    members: [
      { id: 'm1', user: { fullName: 'Abebe Kebede' }, status: 'active', joinedAt: '2026-01-01', totalPaid: 3000, totalReceived: 0 },
      { id: 'm2', user: { fullName: 'Meron Tesfaye' }, status: 'active', joinedAt: '2026-01-01', totalPaid: 2500, totalReceived: 0 },
    ],
    payments: [],
    createdAt: '2025-12-20T10:00:00.000Z',
    createdBy: { fullName: 'Admin User' },
  },
  {
    id: '2',
    name: 'Kebele Iddir',
    contributionAmount: 1000,
    startedDate: '2025-06-01T00:00:00.000Z',
    status: 'active',
    noMembers: 15,
    members: [
      { id: 'm4', user: { fullName: 'Tigist Worku' }, status: 'active', joinedAt: '2025-06-01', totalPaid: 12000, totalReceived: 5000 },
    ],
    payments: [],
    createdAt: '2025-05-15T14:00:00.000Z',
    createdBy: { fullName: 'Admin User' },
  },
];

const IddirManagement = () => {
  const theme = useTheme();
  
  // State
  const [iddirs, setIddirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalMembers: 0,
    totalAmount: 0,
  });
  
  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingIddir, setEditingIddir] = useState(null);
  const [selectedIddir, setSelectedIddir] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    contributionAmount: '',
    startedDate: '',
    status: 'active',
  });

  // Fetch iddirs
  const fetchIddirs = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIddirs(MOCK_IDDIRS);
      setTotalItems(MOCK_IDDIRS.length);
      
      // Calculate stats
      const totalMembers = MOCK_IDDIRS.reduce((sum, i) => sum + i.noMembers, 0);
      const totalAmount = MOCK_IDDIRS.reduce((sum, i) => sum + i.contributionAmount, 0);
      
      setStats({
        total: MOCK_IDDIRS.length,
        active: MOCK_IDDIRS.filter(i => i.status === 'active').length,
        inactive: MOCK_IDDIRS.filter(i => i.status === 'inactive').length,
        totalMembers,
        totalAmount,
      });
      
    } catch (error) {
      console.error('❌ Error fetching iddirs:', error);
      toast.error('Failed to fetch iddirs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIddirs();
  }, []);

  // Filter iddirs
  const filteredIddirs = iddirs.filter(iddir => {
    const matchesSearch = 
      iddir.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || iddir.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedIddirs = filteredIddirs.slice(
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
      
      const newIddir = {
        id: editingIddir?.id || Date.now().toString(),
        name: formData.name,
        contributionAmount: parseFloat(formData.contributionAmount),
        startedDate: new Date(formData.startedDate).toISOString(),
        status: formData.status,
        noMembers: 0,
        members: [],
        payments: [],
        createdAt: new Date().toISOString(),
        createdBy: { fullName: 'Admin User' },
      };
      
      if (editingIddir) {
        const updated = iddirs.map(i => i.id === editingIddir.id ? { ...i, ...newIddir } : i);
        setIddirs(updated);
        toast.success('Iddir updated successfully!');
      } else {
        setIddirs([newIddir, ...iddirs]);
        toast.success('Iddir created successfully!');
      }
      
      setOpenModal(false);
      resetForm();
      fetchIddirs();
    } catch (error) {
      toast.error('Failed to save iddir');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this iddir?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = iddirs.filter(i => i.id !== id);
      setIddirs(updated);
      toast.success('Iddir deleted successfully!');
      fetchIddirs();
    } catch (error) {
      toast.error('Failed to delete iddir');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingIddir(null);
    setFormData({
      name: '',
      contributionAmount: '',
      startedDate: '',
      status: 'active',
    });
  };

  // Handle view details
  const handleViewDetails = (iddir) => {
    setSelectedIddir(iddir);
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
      inactive: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
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
            Iddir Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage Iddir (Social Insurance) in your condominium
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchIddirs}
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
            Create Iddir
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total Iddirs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <ShieldIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Inactive</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#6b7280' }}>{stats.inactive}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <CancelIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
            placeholder="Search iddir by name..."
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
              <MenuItem value="inactive">Inactive</MenuItem>
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
              <TableCell>Contribution</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Started Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedIddirs.map((iddir) => (
              <TableRow key={iddir.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                    {iddir.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                    {formatCurrency(iddir.contributionAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={<PeopleIcon sx={{ fontSize: 14 }} />}
                    label={iddir.noMembers}
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
                    {new Date(iddir.startedDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(iddir.status)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(iddir)}
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
                          setEditingIddir(iddir);
                          setFormData({
                            name: iddir.name,
                            contributionAmount: iddir.contributionAmount,
                            startedDate: iddir.startedDate?.split('T')[0] || '',
                            status: iddir.status,
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
                        onClick={() => handleDelete(iddir.id)}
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
            {paginatedIddirs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ShieldIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No iddirs found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'Create a new iddir'}
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
          count={filteredIddirs.length}
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
            {editingIddir ? '✏️ Edit Iddir' : '🛡️ Create Iddir'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingIddir ? 'Update iddir details' : 'Add a new iddir (social insurance)'}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Iddir Name *"
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
            <TextField
              label="Started Date *"
              type="date"
              value={formData.startedDate}
              onChange={(e) => setFormData({...formData, startedDate: e.target.value})}
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
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                label="Status"
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
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
            {editingIddir ? 'Update' : 'Create'}
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
                Iddir Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                {selectedIddir?.name}
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
          {selectedIddir && (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f3f5' }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Contribution</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>
                      {formatCurrency(selectedIddir.contributionAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Members</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      {selectedIddir.noMembers}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography>
                    {getStatusChip(selectedIddir.status)}
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
                  <Tab label="Payments" icon={<MoneyIcon />} iconPosition="start" />
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
                    {selectedIddir.members?.map((member) => (
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
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Paid</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                              {formatCurrency(member.totalPaid)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Received</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                              {formatCurrency(member.totalReceived)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={member.status}
                            size="small"
                            sx={{
                              backgroundColor: member.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                              color: member.status === 'active' ? '#22c55e' : '#6b7280',
                              fontWeight: 600,
                            }}
                          />
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
                      Payment History
                    </Typography>
                    {selectedIddir.payments?.length > 0 ? (
                      selectedIddir.payments.map((payment) => (
                        <Paper key={payment.id} sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #f1f3f5' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2">{payment.user?.fullName}</Typography>
                              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                              {formatCurrency(payment.amount)}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: '#6b7a8f', textAlign: 'center', py: 3 }}>
                        No payments recorded yet
                      </Typography>
                    )}
                  </Box>
                )}

                {detailTab === 2 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                      Iddir Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created By</Typography>
                          <Typography variant="body2">{selectedIddir.createdBy?.fullName}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created At</Typography>
                          <Typography variant="body2">{new Date(selectedIddir.createdAt).toLocaleString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Started Date</Typography>
                          <Typography variant="body2">{new Date(selectedIddir.startedDate).toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Contributions</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>
                            {formatCurrency(selectedIddir.members?.reduce((sum, m) => sum + m.totalPaid, 0) || 0)}
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

export default IddirManagement;