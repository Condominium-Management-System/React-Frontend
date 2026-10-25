// src/pages/super-admin/Users.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  CircularProgress,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FaRegEdit, FaRegTrashAlt, FaCheck, FaEye } from 'react-icons/fa';
import RegisterUserModal from '../../components/user/RegisterUserModal';
import EditUserModal from '../../components/user/EditUserModal';

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

const StatsCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color' })(({ theme, color, active }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: `1px solid ${active ? color : 'rgba(0,0,0,0.04)'}`,
  background: active ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` : '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
    borderColor: color,
  },
  '.stat-icon': {
    width: 48,
    height: 48,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${color}20`,
    color: color,
  },
  '.stat-value': {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  '.stat-label': {
    color: '#6b7a8f',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  '.stat-sub': {
    color: '#9ca3af',
    fontSize: '0.75rem',
  },
}));

const RoleChip = styled(Chip)(({ theme, role }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(role === 'super_admin' && {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  }),
  ...(role === 'condo_admin' && {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  }),
  ...(role === 'guard' && {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  }),
  ...(role === 'resident' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  }),
}));

const Users = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter')?.toUpperCase() || (searchParams.get('role') ? searchParams.get('role').toUpperCase() : 'ALL');

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    admins: 0,
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    const qFilter = searchParams.get('filter')?.toUpperCase() || (searchParams.get('role') ? searchParams.get('role').toUpperCase() : null);
    if (qFilter) {
      setFilterType(qFilter);
    }
  }, [searchParams]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      const data = response.data.data || [];
      setUsers(data);

      setStats({
        total: data.length,
        verified: data.filter((u) => u.isVerified).length,
        pending: data.filter((u) => !u.isVerified).length,
        admins: data.filter(
          (u) => u.role === 'super_admin' || u.role === 'condo_admin'
        ).length,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user.condoCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'VERIFIED' && user.isVerified) ||
      (filterType === 'PENDING' && !user.isVerified) ||
      (filterType === 'ADMINS' &&
        (user.role === 'super_admin' || user.role === 'condo_admin')) ||
      (filterType === 'CONDO_ADMIN' && user.role === 'condo_admin') ||
      (filterType === 'SUPER_ADMIN' && user.role === 'super_admin') ||
      (filterType === 'RESIDENTS' && user.role === 'resident') ||
      (filterType === 'RESIDENT' && user.role === 'resident');

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleStatsClick = (filter) => {
    setFilterType(filter);
    setPage(0);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
    try {
      await api.users.delete(user.id, user.condoId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleVerifyUser = async (user) => {
    try {
      const newStatus = !user.isVerified;
      await api.users.verify(user.id, newStatus, user.condoId);
      toast.success(
        `${user.fullName} ${newStatus ? 'verified' : 'unverified'} successfully`
      );
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <AdminIcon sx={{ fontSize: 16 }} />;
      case 'condo_admin':
        return <SecurityIcon sx={{ fontSize: 16 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'condo_admin':
        return 'Condo Admin';
      case 'guard':
        return 'Guard';
      default:
        return 'Resident';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
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
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage all system users, condominium assignments, and roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setIsRegisterModalOpen(true)}
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
            borderRadius: '12px',
            px: 3,
            py: 1.5,
          }}
        >
          Register New User
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            color="#6b7280"
            active={filterType === 'ALL'}
            onClick={() => handleStatsClick('ALL')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Users</Typography>
                  <Typography className="stat-value">{stats.total}</Typography>
                  <Typography className="stat-sub">All registered accounts</Typography>
                </Box>
                <Box className="stat-icon">
                  <PeopleIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            color="#22c55e"
            active={filterType === 'VERIFIED'}
            onClick={() => handleStatsClick('VERIFIED')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Verified</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>
                    {stats.verified}
                  </Typography>
                  <Typography className="stat-sub">Active verified users</Typography>
                </Box>
                <Box className="stat-icon">
                  <VerifiedIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            color="#f59e0b"
            active={filterType === 'PENDING'}
            onClick={() => handleStatsClick('PENDING')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Pending</Typography>
                  <Typography className="stat-value" sx={{ color: '#f59e0b' }}>
                    {stats.pending}
                  </Typography>
                  <Typography className="stat-sub">Awaiting verification</Typography>
                </Box>
                <Box className="stat-icon">
                  <PendingIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            color="#8b5cf6"
            active={filterType === 'ADMINS'}
            onClick={() => handleStatsClick('ADMINS')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Admins</Typography>
                  <Typography className="stat-value" sx={{ color: '#8b5cf6' }}>
                    {stats.admins}
                  </Typography>
                  <Typography className="stat-sub">Super & Condo Admins</Typography>
                </Box>
                <Box className="stat-icon">
                  <AdminIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email, phone, or condo code..."
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
          {filterType !== 'ALL' && (
            <Button
              variant="outlined"
              onClick={() => handleStatsClick('ALL')}
              sx={{
                borderRadius: '10px',
                borderColor: '#D3AD32',
                color: '#D3AD32',
                textTransform: 'none',
              }}
            >
              Clear Filter
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Condo Code</TableCell>
              <TableCell>Unit (Block / Room)</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#D3AD32' }}>
                        {user.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                          {user.fullName}
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">
                          FAN: {user.fan || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="#2d3436">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="#6b7a8f">
                      {user.phoneNumber || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <RoleChip
                      role={user.role}
                      icon={getRoleIcon(user.role)}
                      label={getRoleLabel(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', color: '#D3AD32', fontWeight: 600 }}
                    >
                      {user.condoCode || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="#6b7a8f">
                      {user.block ? `${user.block} - Rm ${user.roomNo || '?'}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={
                        user.isVerified ? (
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 14 }} />
                        )
                      }
                      label={user.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: user.isVerified
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                        color: user.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setViewingUser(user)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': { color: '#D3AD32' },
                          }}
                        >
                          <FaEye size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isVerified ? 'Unverify User' : 'Verify User'}>
                        <IconButton
                          size="small"
                          onClick={() => handleVerifyUser(user)}
                          sx={{
                            color: user.isVerified ? '#f59e0b' : '#22c55e',
                            '&:hover': {
                              backgroundColor: user.isVerified
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(34, 197, 94, 0.08)',
                            },
                          }}
                        >
                          <FaCheck size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{
                            color: '#6b7a8f',
                            '&:hover': { color: '#4a6cf7' },
                          }}
                        >
                          <FaRegEdit size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user)}
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
                <TableCell colSpan={8}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm
                        ? 'Try adjusting your search criteria'
                        : 'No users match the selected filter'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredUsers.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </StyledTableContainer>

      {/* Register User Modal */}
      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={openEditModal}
        user={selectedUser}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
        canChangeRole={true}
      />

      {/* User Details Dialog */}
      <Dialog disableRestoreFocus 
        open={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
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
            👤 Resident / User Profile
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Comprehensive resident account, unit assignment, and identity verification details
          </Typography>
        </Box>
        {viewingUser && (
          <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#D3AD32', fontSize: '1.5rem', fontWeight: 700 }}>
                  {viewingUser.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                    {viewingUser.fullName}
                  </Typography>
                  <Typography variant="body2" color="#6b7a8f">
                    {viewingUser.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <RoleChip
                      role={viewingUser.role}
                      icon={getRoleIcon(viewingUser.role)}
                      label={getRoleLabel(viewingUser.role)}
                      size="small"
                    />
                    <Chip
                      icon={viewingUser.isVerified ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={viewingUser.isVerified ? 'Verified' : 'Pending Verification'}
                      size="small"
                      sx={{
                        backgroundColor: viewingUser.isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: viewingUser.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                    <Typography variant="caption" color="#6b7a8f" fontWeight={600}>
                      PHONE NUMBER
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a1a2e" sx={{ mt: 0.5 }}>
                      {viewingUser.phoneNumber || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', height: '100%' }}>
                    <Typography variant="caption" color="#6b7a8f" fontWeight={600}>
                      FAN ID (DIGITAL ID)
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#D3AD32" sx={{ mt: 0.5 }}>
                      {viewingUser.fan || '—'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e" gutterBottom>
                  🏢 Condominium & Residence Allocation
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#6b7a8f">Condo Code</Typography>
                    <Typography variant="body2" fontWeight={700} color="#D3AD32" sx={{ fontFamily: 'monospace' }}>
                      {viewingUser.condoCode || 'None Assigned'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#6b7a8f">Block Number</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                      {viewingUser.block || 'None Assigned'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#6b7a8f">Room Number</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                      {viewingUser.roomNo ? `Room ${viewingUser.roomNo}` : 'None Assigned'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">SYSTEM ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#6b7a8f', wordBreak: 'break-all' }}>
                  {viewingUser.id}
                </Typography>
                {viewingUser.createdAt && (
                  <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mt: 1 }}>
                    Registered: {new Date(viewingUser.createdAt).toLocaleDateString()} at {new Date(viewingUser.createdAt).toLocaleTimeString()}
                  </Typography>
                )}
              </Paper>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => setViewingUser(null)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
