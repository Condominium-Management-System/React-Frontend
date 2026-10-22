// src/pages/super-admin/Condos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocationCity as LocationCityIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  Domain as DomainIcon,
  MeetingRoom as MeetingRoomIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FaRegEdit, FaRegTrashAlt, FaEye } from 'react-icons/fa';

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

const StatsCard = styled(Card)(({ active }) => ({
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

const StatusChip = styled(Chip)(({ status }) => ({
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
  const navigate = useNavigate();

  // State
  const [condos, setCondos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [viewingCondo, setViewingCondo] = useState(null);
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
      const response = await api.condos.getAll();
      const data = response.data.data || [];
      setCondos(data);

      setStats({
        total: data.length,
        active: data.filter((c) => c.activeStatus).length,
        inactive: data.filter((c) => !c.activeStatus).length,
        totalAdmins: data.reduce((sum, c) => sum + (c.maxAdmins || 0), 0),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch condos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondos();
  }, []);

  // Filter condos
  const filteredCondos = condos.filter((condo) => {
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
      const payload = {
        condoName: formData.condoName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        maxAdmins: Number(formData.maxAdmins) || 1,
        blockNumbers: Array.isArray(formData.blockNumbers) ? formData.blockNumbers : [],
      };
      if (editingCondo) {
        await api.condos.update(editingCondo.id, payload);
        toast.success('Condo updated successfully');
      } else {
        await api.condos.create(payload);
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
      toast.success('Condo status updated');
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

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard active={filterType === 'ALL'} onClick={() => handleStatsClick('ALL')}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Condos</Typography>
                  <Typography className="stat-value">{stats.total}</Typography>
                  <Typography className="stat-sub">Registered properties</Typography>
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
                  <Typography className="stat-sub">Operational</Typography>
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
                  <Typography className="stat-sub">Suspended</Typography>
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
                  <Typography className="stat-label">Max Admin Seats</Typography>
                  <Typography className="stat-value">{stats.totalAdmins}</Typography>
                  <Typography className="stat-sub">System-wide capacity</Typography>
                </Box>
                <Box className="stat-icon">
                  <PeopleIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search condominium by name, code or city..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table */}
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Condo Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="center">Max Admins</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCondos.length > 0 ? (
              paginatedCondos.map((condo) => (
                <TableRow key={condo.id}>
                  <TableCell>
                    <Chip
                      label={condo.condoCode}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(211, 173, 50, 0.1)',
                        color: '#D3AD32',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ApartmentIcon sx={{ fontSize: 18, color: '#D3AD32' }} />
                      <Typography variant="body2" fontWeight={600} color="#2d3436">
                        {condo.condoName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationCityIcon sx={{ fontSize: 16, color: '#6b7a8f' }} />
                      <Typography variant="body2" color="#6b7a8f">
                        {condo.city || '—'}, {condo.address || ''}
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
                      <Tooltip title="Manage Blocks">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/super-admin/blocks?condoId=${condo.id}`)}
                          sx={{
                            color: '#4a6cf7',
                            '&:hover': {
                              backgroundColor: 'rgba(74, 108, 247, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <DomainIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Rooms">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/super-admin/rooms?condoId=${condo.id}`)}
                          sx={{
                            color: '#D3AD32',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 173, 50, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <MeetingRoomIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setViewingCondo(condo)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': {
                              color: '#D3AD32',
                              backgroundColor: 'rgba(211, 173, 50, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          <FaEye size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={condo.activeStatus ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(condo.id)}
                          sx={{
                            color: condo.activeStatus ? '#22c55e' : '#dc2626',
                            '&:hover': {
                              backgroundColor: condo.activeStatus ? 'rgba(34, 197, 94, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            borderRadius: '8px',
                            padding: '6px',
                          }}
                        >
                          {condo.activeStatus ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
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
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #f1f3f5' }}
          />
        )}
      </StyledTableContainer>

      {/* Create / Edit Dialog */}
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
          },
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            />
            <TextField
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            />
            <TextField
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            />
            <TextField
              label="Max Admins"
              type="number"
              value={formData.maxAdmins}
              onChange={(e) => setFormData({ ...formData, maxAdmins: parseInt(e.target.value) || 1 })}
              fullWidth
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#6b7a8f', fontWeight: 600, textTransform: 'none', borderRadius: '10px', px: 3 }}
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
              },
            }}
          >
            {editingCondo ? 'Update Condo' : 'Create Condo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Condo Details Dialog */}
      <Dialog
        open={Boolean(viewingCondo)}
        onClose={() => setViewingCondo(null)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.4rem' }}>
            🏢 Condominium Details
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Full system specifications and registration data
          </Typography>
        </Box>
        {viewingCondo && (
          <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">Condominium Name</Typography>
                <Typography variant="h6" fontWeight={700} color="#1a1a2e">{viewingCondo.condoName}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={`Code: ${viewingCondo.condoCode}`} size="small" sx={{ bgcolor: 'rgba(211, 173, 50, 0.12)', color: '#D3AD32', fontWeight: 600 }} />
                  <Chip label={viewingCondo.activeStatus ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: viewingCondo.activeStatus ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: viewingCondo.activeStatus ? '#22c55e' : '#ef4444', fontWeight: 600 }} />
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                    <Typography variant="caption" color="#6b7a8f">City & Address</Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a1a2e">{viewingCondo.city || '—'}</Typography>
                    <Typography variant="body2" color="#6b7a8f">{viewingCondo.address || '—'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                    <Typography variant="caption" color="#6b7a8f">Max Admins Allowed</Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a1a2e">{viewingCondo.maxAdmins || 1} Admins</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">System Identifiers</Typography>
                <Typography variant="body2" color="#1a1a2e"><strong>ID:</strong> {viewingCondo.id}</Typography>
                <Typography variant="body2" color="#1a1a2e" sx={{ mt: 0.5 }}>
                  <strong>Registered:</strong> {new Date(viewingCondo.registrationDate || viewingCondo.createdAt).toLocaleDateString()}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setViewingCondo(null)} variant="contained" sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', textTransform: 'none', borderRadius: '10px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Condos;
