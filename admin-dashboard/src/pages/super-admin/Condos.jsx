// src/pages/super-admin/Condos.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useTheme,
  Zoom,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FaRegEdit, FaRegTrashAlt, FaEye } from 'react-icons/fa';
import { MdVerified, MdOutlineUnverified } from 'react-icons/md';

// Styled Components
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

// Stats Card
 // Stats Cards - White background (not blue/black)
const StatsCard = styled(Card)(({ theme, active }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  ...(active && {
    borderColor: '#D3AD32',
    boxShadow: '0 4px 16px rgba(211, 173, 50, 0.15)',
  }),
  '.stat-icon': {
    width: 36,
    height: 36,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.04)',
  },
  '.stat-value': {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  '.stat-label': {
    color: '#6b7a8f',
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  '.stat-sub': {
    color: '#9ca3af',
    fontSize: '0.65rem',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  borderRadius: '20px',
  ...(status === 'Active' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    '& .MuiChip-icon': { color: '#22c55e' },
  }),
  ...(status === 'Inactive' && {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
    '& .MuiChip-icon': { color: '#dc2626' },
  }),
}));

const Condos = () => {
  const theme = useTheme();
  
  // State
  const [condos, setCondos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalAdmins: 0,
  });
  const [formData, setFormData] = useState({
    condoName: '',
    address: '',
    city: '',
    maxAdmins: 1,
    blockNumbers: [],
  });

  // Fetch condos
  const fetchCondos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.condos.getAll();
      const data = response.data.data || [];
      setCondos(data);
      
      setStats({
        total: data.length,
        active: data.filter(c => c.activeStatus).length,
        inactive: data.filter(c => !c.activeStatus).length,
        totalAdmins: data.reduce((sum, c) => sum + (c.maxAdmins || 0), 0),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch condos');
      toast.error(err.response?.data?.message || 'Failed to fetch condos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondos();
  }, []);

  // Filter condos
  const filteredCondos = condos.filter(condo => {
    const matchesSearch = 
      condo.condoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.condoCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'ALL' ||
      (filterType === 'ACTIVE' && condo.activeStatus) ||
      (filterType === 'INACTIVE' && !condo.activeStatus);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const paginatedCondos = filteredCondos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle form submit
  const handleSubmit = async () => {
    try {
      if (editingCondo) {
        await api.condos.update(editingCondo.id, formData);
        toast.success('Condo updated successfully');
      } else {
        await api.condos.create(formData);
        toast.success('Condo created successfully');
      }
      setOpenDialog(false);
      setEditingCondo(null);
      setFormData({ condoName: '', address: '', city: '', maxAdmins: 1, blockNumbers: [] });
      fetchCondos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this condo?')) return;
    try {
      await api.condos.delete(id);
      toast.success('Condo deleted successfully');
      fetchCondos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      await api.condos.toggleStatus(id);
      toast.success('Status updated');
      fetchCondos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  // Handle stats card click
  const handleStatsClick = (filter) => {
    setFilterType(filter);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Condominium Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage all condominiums in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCondo(null);
            setFormData({ condoName: '', address: '', city: '', maxAdmins: 1, blockNumbers: [] });
            setOpenDialog(true);
          }}
          sx={{
            mt: { xs: 2, sm: 0 },
            background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(211, 173, 50, 0.3)',
            },
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          Register New Condo
        </Button>
      </Box>

    


<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard active={filterType === 'ALL'} onClick={() => handleStatsClick('ALL')}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography className="stat-label">Total Condos</Typography>
            <Typography className="stat-value">{stats.total}</Typography>
            <Typography className="stat-sub">+2 this quarter</Typography>
          </Box>
          <Box className="stat-icon">
            <ApartmentIcon sx={{ color: '#6b7280', fontSize: 18 }} />
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard active={filterType === 'ACTIVE'} onClick={() => handleStatsClick('ACTIVE')}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography className="stat-label">Active</Typography>
            <Typography className="stat-value" sx={{ color: '#22c55e' }}>{stats.active}</Typography>
            <Typography className="stat-sub">Running smoothly</Typography>
          </Box>
          <Box className="stat-icon">
            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard active={filterType === 'INACTIVE'} onClick={() => handleStatsClick('INACTIVE')}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography className="stat-label">Inactive</Typography>
            <Typography className="stat-value" sx={{ color: '#dc2626' }}>{stats.inactive}</Typography>
            <Typography className="stat-sub">Needs attention</Typography>
          </Box>
          <Box className="stat-icon">
            <CancelIcon sx={{ color: '#dc2626', fontSize: 18 }} />
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography className="stat-label">Total Admins</Typography>
            <Typography className="stat-value">{stats.totalAdmins}</Typography>
            <Typography className="stat-sub">Across {stats.total} condos</Typography>
          </Box>
          <Box className="stat-icon">
            <PeopleIcon sx={{ color: '#60a5fa', fontSize: 18 }} />
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  </Grid>
</Grid>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search condos by name, code or city..."
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
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="center">Admins</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCondos.length > 0 ? (
              paginatedCondos.map((condo) => (
                <TableRow key={condo.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#D3AD32' }}>
                      {condo.condoCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: 'rgba(211, 173, 50, 0.1)',
                          color: '#D3AD32',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {condo.condoName?.charAt(0) || 'C'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500} color="#2d3436">
                        {condo.condoName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationCityIcon sx={{ fontSize: 16, color: '#6b7a8f' }} />
                      <Typography variant="body2" color="#6b7a8f">
                        {condo.city || '—'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<PeopleIcon sx={{ fontSize: 14 }} />}
                      label={condo.maxAdmins || 1}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(211, 173, 50, 0.08)',
                        color: '#D3AD32',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip
                      status={condo.activeStatus ? 'Active' : 'Inactive'}
                      icon={condo.activeStatus ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={condo.activeStatus ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Toggle Status">
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(condo.id)}
                          sx={{ 
                            color: '#6b7a8f', 
                            '&:hover': { 
                              color: '#D3AD32',
                              backgroundColor: 'rgba(211, 173, 50, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <FaEye size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingCondo(condo);
                            setFormData({
                              condoName: condo.condoName,
                              address: condo.address,
                              city: condo.city,
                              maxAdmins: condo.maxAdmins || 1,
                              blockNumbers: condo.blockNumbers || [],
                            });
                            setOpenDialog(true);
                          }}
                          sx={{ 
                            color: '#6b7a8f', 
                            '&:hover': { 
                              color: '#4a6cf7',
                              backgroundColor: 'rgba(74, 108, 247, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <FaRegEdit size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(condo.id)}
                          sx={{ 
                            color: '#6b7a8f', 
                            '&:hover': { 
                              color: '#d32f2f',
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <FaRegTrashAlt size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ApartmentIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No condos found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'Click "Register New Condo" to add one'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredCondos.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCondos.length}
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
        )}
      </StyledTableContainer>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
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
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.5rem' }}>
            {editingCondo ? '✏️ Edit Condo' : '🏢 Register New Condo'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingCondo ? 'Update condominium details' : 'Add a new condominium to the system'}
          </Typography>
        </Box>
        
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Condo Name *"
              value={formData.condoName}
              onChange={(e) => setFormData({ ...formData, condoName: e.target.value })}
              fullWidth
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
              InputLabelProps={{ sx: { fontWeight: 500, color: '#6b7a8f' } }}
            />
            <TextField
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
              InputLabelProps={{ sx: { fontWeight: 500, color: '#6b7a8f' } }}
            />
            <TextField
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
              InputLabelProps={{ sx: { fontWeight: 500, color: '#6b7a8f' } }}
            />
            <TextField
              label="Max Admins"
              type="number"
              value={formData.maxAdmins}
              onChange={(e) => setFormData({ ...formData, maxAdmins: parseInt(e.target.value) || 1 })}
              fullWidth
              variant="outlined"
              InputProps={{ inputProps: { min: 1 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
              InputLabelProps={{ sx: { fontWeight: 500, color: '#6b7a8f' } }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{
              color: '#6b7a8f',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            Cancel
          </Button>
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
            {editingCondo ? 'Update Condo' : 'Create Condo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Condos;