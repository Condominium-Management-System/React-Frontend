// src/pages/super-admin/Users.jsx
import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
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
import { FaRegEdit, FaRegTrashAlt, FaCheck } from 'react-icons/fa';
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

const StatsCard = styled(Card)(({ theme, color, active }) => ({
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
  const theme = useTheme();
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    admins: 0,
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Modal States
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    isVerified: false,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      const data = response.data.data || [];
      setUsers(data);
      
      setStats({
        total: data.length,
        verified: data.filter(u => u.isVerified).length,
        pending: data.filter(u => !u.isVerified).length,
        admins: data.filter(u => u.role === 'super_admin' || u.role === 'condo_admin').length,
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
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    
    const matchesFilter = 
      filterType === 'ALL' ||
      (filterType === 'VERIFIED' && user.isVerified) ||
      (filterType === 'PENDING' && !user.isVerified) ||
      (filterType === 'ADMINS' && (user.role === 'super_admin' || user.role === 'condo_admin'));
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle stats click
  const handleStatsClick = (filter) => {
    setFilterType(filter);
    setPage(0);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isVerified: user.isVerified,
    });
    setOpenEditModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
    try {
      await api.users.delete(user.condoId, user.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Handle verify user
  const handleVerifyUser = async (user) => {
    try {
      await api.users.verify(user.condoId, user.id);
      toast.success(`${user.fullName} verified successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return <AdminIcon sx={{ fontSize: 16 }} />;
      case 'condo_admin': return <SecurityIcon sx={{ fontSize: 16 }} />;
      default: return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'condo_admin': return 'Condo Admin';
      case 'guard': return 'Guard';
      default: return 'Resident';
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
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage all system users and their roles
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
                  <Typography className="stat-sub">All users</Typography>
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
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>{stats.verified}</Typography>
                  <Typography className="stat-sub">Active users</Typography>
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
                  <Typography className="stat-value" sx={{ color: '#f59e0b' }}>{stats.pending}</Typography>
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
                  <Typography className="stat-value" sx={{ color: '#8b5cf6' }}>{stats.admins}</Typography>
                  <Typography className="stat-sub">System administrators</Typography>
                </Box>
                <Box className="stat-icon">
                  <AdminIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email or phone..."
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
          {filterType !== 'ALL' && (
            <Button
              variant="outlined"
              onClick={() => handleStatsClick('ALL')}
              sx={{
                borderRadius: '10px',
                borderColor: '#D3AD32',
                color: '#D3AD32',
                '&:hover': { borderColor: '#c49a2b', backgroundColor: 'rgba(211, 173, 50, 0.08)' },
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
              <TableCell>Condo</TableCell>
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
                          ID: {user.id?.slice(0, 8)}
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
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#D3AD32' }}>
                      {user.condoCode || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={user.isVerified ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={user.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: user.isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: user.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {!user.isVerified && (
                        <Tooltip title="Verify User">
                          <IconButton
                            size="small"
                            onClick={() => handleVerifyUser(user)}
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
                      )}
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
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
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user)}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'No users match the selected filter'}
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
      />
    </Box>
  );
};

export default Users;