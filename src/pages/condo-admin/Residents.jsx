// src/pages/condo-admin/Residents.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  MonetizationOn as MoneyIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye, FaCheck } from 'react-icons/fa';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import RegisterUserModal from '../../components/user/RegisterUserModal';
import EditUserModal from '../../components/user/EditUserModal';

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
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  },
  '.stat-icon': {
    width: 36,
    height: 36,
    borderRadius: '8px',
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

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  '& .MuiCardContent-root': {
    padding: 24,
  },
}));

const Residents = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  // State
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    inEqub: 0,
    inIddir: 0,
  });

  // Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // Fetch residents from real API
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      const condoId = currentUser?.condoId;
      const response = await api.users.getAll(condoId, { role: 'resident' });
      const raw = response.data?.data || [];
      // Exact database definition: count only actual residents
      const data = raw.filter((u) => u.role === 'resident');

      setResidents(data);
      setStats({
        total: data.length,
        verified: data.filter((u) => u.isVerified).length,
        pending: data.filter((u) => !u.isVerified).length,
        inEqub: data.filter((u) => u.isInEqub).length,
        inIddir: data.filter((u) => u.isInIddir).length,
      });
    } catch (error) {
      console.error('❌ Error fetching residents:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  useEffect(() => {
    const statusParam = searchParams.get('status')?.toLowerCase();
    const filterParam = searchParams.get('filter')?.toLowerCase();
    if (statusParam === 'verified') setFilterStatus('VERIFIED');
    else if (statusParam === 'pending' || statusParam === 'unverified') setFilterStatus('PENDING');
    else if (filterParam === 'inequb' || filterParam === 'equb') setFilterStatus('IN_EQUB');
    else if (filterParam === 'iniddir' || filterParam === 'iddir') setFilterStatus('IN_IDDIR');
  }, [searchParams]);

  // Handle delete resident
  const handleDeleteResident = async (resident) => {
    if (!window.confirm(`Are you sure you want to remove resident ${resident.fullName}?`)) {
      return;
    }
    try {
      await api.users.delete(resident.id, currentUser?.condoId);
      toast.success('Resident removed successfully');
      fetchResidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove resident');
    }
  };

  // Handle verify resident
  const handleToggleVerify = async (resident) => {
    try {
      const newStatus = !resident.isVerified;
      await api.users.verify(resident.id, newStatus, currentUser?.condoId);
      toast.success(
        `${resident.fullName} ${newStatus ? 'verified' : 'unverified'} successfully`
      );
      fetchResidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setOpenEditModal(true);
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setDetailTab(0);
    setOpenDetailModal(true);
  };

  const handleTabChange = (_event, newValue) => {
    setDetailTab(newValue);
  };

  // Filter residents
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.phoneNumber?.includes(searchTerm) ||
      resident.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.block?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.fan?.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'VERIFIED' && resident.isVerified) ||
      (filterStatus === 'PENDING' && !resident.isVerified) ||
      (filterStatus === 'IN_EQUB' && resident.isInEqub) ||
      (filterStatus === 'IN_IDDIR' && resident.isInIddir);

    return matchesSearch && matchesStatus;
  });

  const paginatedResidents = filteredResidents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && residents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#D3AD32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Resident Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Condominium: <strong>{currentUser?.condoCode || 'Assigned Condo'}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenRegisterModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.2,
            }}
          >
            Register Resident
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchResidents}
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
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
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)" onClick={() => { setFilterStatus('ALL'); setPage(0); }} sx={{ cursor: 'pointer', border: filterStatus === 'ALL' ? '2px solid #6b7280' : '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Residents</Typography>
                  <Typography className="stat-value">{stats.total}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <PeopleIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(34, 197, 94, 0.1)" onClick={() => { setFilterStatus('VERIFIED'); setPage(0); }} sx={{ cursor: 'pointer', border: filterStatus === 'VERIFIED' ? '2px solid #22c55e' : '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Verified</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>
                    {stats.verified}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <VerifiedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(245, 158, 11, 0.1)" onClick={() => { setFilterStatus('PENDING'); setPage(0); }} sx={{ cursor: 'pointer', border: filterStatus === 'PENDING' ? '2px solid #f59e0b' : '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Pending</Typography>
                  <Typography className="stat-value" sx={{ color: '#f59e0b' }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <CancelIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(59, 130, 246, 0.1)" onClick={() => { setFilterStatus('IN_EQUB'); setPage(0); }} sx={{ cursor: 'pointer', border: filterStatus === 'IN_EQUB' ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">In Equb</Typography>
                  <Typography className="stat-value" sx={{ color: '#3b82f6' }}>
                    {stats.inEqub}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <MoneyIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(139, 92, 246, 0.1)" onClick={() => { setFilterStatus('IN_IDDIR'); setPage(0); }} sx={{ cursor: 'pointer', border: filterStatus === 'IN_IDDIR' ? '2px solid #8b5cf6' : '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">In Iddir</Typography>
                  <Typography className="stat-value" sx={{ color: '#8b5cf6' }}>
                    {stats.inIddir}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <GroupIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by resident name, email, phone, room, block, or FAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7a8f' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Resident</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Unit (Block / Room)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Equb</TableCell>
              <TableCell>Iddir</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResidents.length > 0 ? (
              paginatedResidents.map((resident) => (
                <TableRow key={resident.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#D3AD32' }}>
                        {resident.fullName?.charAt(0) || 'R'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                          {resident.fullName}
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">
                          FAN: {resident.fan || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="#2d3436">
                        {resident.email}
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {resident.phoneNumber || '—'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="#2d3436">
                        {resident.block ? `Block ${resident.block}` : 'Unassigned'}
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {resident.roomNo ? `Room ${resident.roomNo}` : 'No room'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        resident.isVerified ? (
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 14 }} />
                        )
                      }
                      label={resident.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isVerified
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                        color: resident.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resident.isInEqub ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isInEqub
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)',
                        color: resident.isInEqub ? '#22c55e' : '#6b7280',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resident.isInIddir ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isInIddir
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)',
                        color: resident.isInIddir ? '#22c55e' : '#6b7280',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewResident(resident)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': { color: '#D3AD32' },
                          }}
                        >
                          <FaEye size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={resident.isVerified ? 'Unverify' : 'Verify'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleVerify(resident)}
                          sx={{
                            color: resident.isVerified ? '#f59e0b' : '#22c55e',
                            '&:hover': {
                              backgroundColor: resident.isVerified
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(34, 197, 94, 0.08)',
                            },
                          }}
                        >
                          <FaCheck size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Resident">
                        <IconButton
                          size="small"
                          onClick={() => handleEditResident(resident)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': { color: '#4a6cf7' },
                          }}
                        >
                          <FaRegEdit size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Resident">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteResident(resident)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': { color: '#d32f2f' },
                          }}
                        >
                          <FaRegTrashAlt size={15} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No residents found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm
                        ? 'Try adjusting your search query'
                        : 'No residents registered in this condominium'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredResidents.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredResidents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </StyledTableContainer>

      {/* Resident Detail Modal */}
      <Dialog disableRestoreFocus 
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            p: 3,
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              Resident Profile
            </DialogTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Detailed resident information and associations
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenDetailModal(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          {selectedResident && (
            <Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: '#ffffff',
                  borderBottom: '1px solid #f1f3f5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: '#D3AD32',
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {selectedResident.fullName?.charAt(0) || 'R'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    {selectedResident.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Chip
                      label={selectedResident.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: selectedResident.isVerified
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                        color: selectedResident.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" color="#6b7a8f">
                      FAN: {selectedResident.fan || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ borderBottom: '1px solid #f1f3f5', bgcolor: '#ffffff' }}>
                <Tabs
                  value={detailTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                    '& .Mui-selected': { color: '#D3AD32' },
                    '& .MuiTabs-indicator': { backgroundColor: '#D3AD32' },
                  }}
                >
                  <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
                  <Tab label="Property" icon={<HomeIcon />} iconPosition="start" />
                  <Tab label="Memberships" icon={<GroupIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {detailTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Contact Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><EmailIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText
                                primary="Email"
                                secondary={selectedResident.email}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><PhoneIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText
                                primary="Phone Number"
                                secondary={selectedResident.phoneNumber || 'Not provided'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><EventIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText
                                primary="Registration Date"
                                secondary={
                                  selectedResident.createdAt
                                    ? new Date(selectedResident.createdAt).toLocaleDateString()
                                    : '—'
                                }
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Account Status
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="#6b7a8f">Role</Typography>
                              <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                {selectedResident.role || 'Resident'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="#6b7a8f">Verification</Typography>
                              <Chip
                                label={selectedResident.isVerified ? 'Verified' : 'Pending'}
                                size="small"
                                sx={{
                                  backgroundColor: selectedResident.isVerified
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : 'rgba(245, 158, 11, 0.1)',
                                  color: selectedResident.isVerified ? '#22c55e' : '#f59e0b',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                  </Grid>
                )}

                {detailTab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ApartmentIcon sx={{ color: '#D3AD32', fontSize: 32 }} />
                            <Box>
                              <Typography variant="caption" color="#6b7a8f">Condominium</Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {selectedResident.condoCode || currentUser?.condoCode || '—'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HomeIcon sx={{ color: '#D3AD32', fontSize: 32 }} />
                            <Box>
                              <Typography variant="caption" color="#6b7a8f">Unit Location</Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {selectedResident.block
                                  ? `Block ${selectedResident.block}, Room ${selectedResident.roomNo || '?'}`
                                  : 'Not Assigned'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                  </Grid>
                )}

                {detailTab === 2 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 1, fontWeight: 600 }}>
                            Equb Association
                          </Typography>
                          <Chip
                            label={selectedResident.isInEqub ? 'Active Member' : 'Not Enrolled'}
                            size="small"
                            sx={{
                              backgroundColor: selectedResident.isInEqub
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(107, 114, 128, 0.1)',
                              color: selectedResident.isInEqub ? '#22c55e' : '#6b7280',
                              fontWeight: 600,
                            }}
                          />
                        </CardContent>
                      </DetailCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 1, fontWeight: 600 }}>
                            Iddir Association
                          </Typography>
                          <Chip
                            label={selectedResident.isInIddir ? 'Active Member' : 'Not Enrolled'}
                            size="small"
                            sx={{
                              backgroundColor: selectedResident.isInIddir
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(107, 114, 128, 0.1)',
                              color: selectedResident.isInIddir ? '#22c55e' : '#6b7280',
                              fontWeight: 600,
                            }}
                          />
                        </CardContent>
                      </DetailCard>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)} sx={{ fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Resident Modal */}
      <RegisterUserModal
        isOpen={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
        onSuccess={fetchResidents}
        initialCondoCode={currentUser?.condoCode || ''}
      />

      {/* Edit Resident Modal */}
      <EditUserModal
        isOpen={openEditModal}
        user={selectedResident}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedResident(null);
        }}
        onSuccess={fetchResidents}
        canChangeRole={false}
      />
    </Box>
  );
};

export default Residents;
