// src/pages/condo-admin/Residents.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Alert,
  Switch,
  FormControlLabel,
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
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  MonetizationOn as MoneyIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye } from 'react-icons/fa';

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
  '.stat-sub': {
    fontSize: '0.6rem',
    color: '#9ca3af',
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

// Mock Data
const MOCK_RESIDENTS = [
  {
    id: '1',
    fullName: 'Abebe Kebede',
    email: 'abebe.kebede@gmail.com',
    phoneNumber: '0912345678',
    block: 'A',
    roomNo: '101',
    isVerified: true,
    isInEqub: true,
    isInIddir: true,
    isGetEqub: true,
    revenue: '5000.00',
    condoCode: 'HX-2737',
    createdAt: '2024-01-15T10:30:00.000Z',
    role: 'resident',
  },
  {
    id: '2',
    fullName: 'Meron Tesfaye',
    email: 'meron.tesfaye@gmail.com',
    phoneNumber: '0923456789',
    block: 'A',
    roomNo: '102',
    isVerified: true,
    isInEqub: true,
    isInIddir: false,
    isGetEqub: false,
    revenue: '3000.00',
    condoCode: 'HX-2737',
    createdAt: '2024-02-20T14:15:00.000Z',
    role: 'resident',
  },
  {
    id: '3',
    fullName: 'Dawit Hailu',
    email: 'dawit.hailu@gmail.com',
    phoneNumber: '0934567890',
    block: 'B',
    roomNo: '201',
    isVerified: false,
    isInEqub: false,
    isInIddir: true,
    isGetEqub: false,
    revenue: '0.00',
    condoCode: 'HX-2737',
    createdAt: '2024-03-10T09:45:00.000Z',
    role: 'resident',
  },
  {
    id: '4',
    fullName: 'Tigist Worku',
    email: 'tigist.worku@gmail.com',
    phoneNumber: '0945678901',
    block: 'B',
    roomNo: '202',
    isVerified: true,
    isInEqub: false,
    isInIddir: true,
    isGetEqub: true,
    revenue: '7000.00',
    condoCode: 'HX-2737',
    createdAt: '2024-04-05T11:20:00.000Z',
    role: 'resident',
  },
  {
    id: '5',
    fullName: 'Biruk Ayele',
    email: 'biruk.ayele@gmail.com',
    phoneNumber: '0956789012',
    block: 'C',
    roomNo: '301',
    isVerified: true,
    isInEqub: true,
    isInIddir: true,
    isGetEqub: false,
    revenue: '4500.00',
    condoCode: 'HX-2737',
    createdAt: '2024-05-12T16:00:00.000Z',
    role: 'resident',
  },
  {
    id: '6',
    fullName: 'Hana Belay',
    email: 'hana.belay@gmail.com',
    phoneNumber: '0967890123',
    block: 'C',
    roomNo: '302',
    isVerified: false,
    isInEqub: false,
    isInIddir: false,
    isGetEqub: false,
    revenue: '0.00',
    condoCode: 'HX-2737',
    createdAt: '2024-06-18T13:30:00.000Z',
    role: 'resident',
  },
  {
    id: '7',
    fullName: 'Solomon Desta',
    email: 'solomon.desta@gmail.com',
    phoneNumber: '0978901234',
    block: 'D',
    roomNo: '401',
    isVerified: true,
    isInEqub: true,
    isInIddir: false,
    isGetEqub: true,
    revenue: '6000.00',
    condoCode: 'HX-2737',
    createdAt: '2024-07-22T10:00:00.000Z',
    role: 'resident',
  },
  {
    id: '8',
    fullName: 'Zewditu Girma',
    email: 'zewditu.girma@gmail.com',
    phoneNumber: '0989012345',
    block: 'D',
    roomNo: '402',
    isVerified: true,
    isInEqub: false,
    isInIddir: true,
    isGetEqub: false,
    revenue: '3500.00',
    condoCode: 'HX-2737',
    createdAt: '2024-08-30T15:45:00.000Z',
    role: 'resident',
  },
  {
    id: '9',
    fullName: 'Henok Tesfaye',
    email: 'henok.tesfaye@gmail.com',
    phoneNumber: '0990123456',
    block: 'E',
    roomNo: '501',
    isVerified: true,
    isInEqub: true,
    isInIddir: true,
    isGetEqub: true,
    revenue: '5500.00',
    condoCode: 'HX-2737',
    createdAt: '2024-09-14T08:30:00.000Z',
    role: 'resident',
  },
  {
    id: '10',
    fullName: 'Selamawit Gebre',
    email: 'selamawit.gebre@gmail.com',
    phoneNumber: '0901234567',
    block: 'E',
    roomNo: '502',
    isVerified: false,
    isInEqub: false,
    isInIddir: false,
    isGetEqub: false,
    revenue: '0.00',
    condoCode: 'HX-2737',
    createdAt: '2024-10-01T12:00:00.000Z',
    role: 'resident',
  },
];

const Residents = () => {
  const theme = useTheme();
  
  // State
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
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
  const [selectedResident, setSelectedResident] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [residentDetails, setResidentDetails] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    block: '',
    roomNo: '',
    role: 'resident',
    isVerified: true,
  });

  // Fetch residents
  const fetchResidents = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const residentsData = MOCK_RESIDENTS;
      setResidents(residentsData);
      setTotalItems(residentsData.length);
      setStats({
        total: residentsData.length,
        verified: residentsData.filter(u => u.isVerified).length,
        pending: residentsData.filter(u => !u.isVerified).length,
        inEqub: residentsData.filter(u => u.isInEqub).length,
        inIddir: residentsData.filter(u => u.isInIddir).length,
      });
      
    } catch (error) {
      console.error('❌ Error fetching residents:', error);
      toast.error('Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Handle register resident
  const handleRegisterResident = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newResident = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        block: formData.block,
        roomNo: formData.roomNo,
        isVerified: formData.isVerified,
        isInEqub: false,
        isInIddir: false,
        isGetEqub: false,
        revenue: '0.00',
        condoCode: 'HX-2737',
        createdAt: new Date().toISOString(),
        role: 'resident',
      };
      
      setResidents([newResident, ...residents]);
      toast.success('Resident registered successfully!');
      setOpenRegisterModal(false);
      resetForm();
      fetchResidents();
    } catch (error) {
      toast.error('Failed to register resident');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      block: '',
      roomNo: '',
      role: 'resident',
      isVerified: true,
    });
  };

  // Filter residents
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.phoneNumber?.includes(searchTerm) ||
      resident.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.block?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'VERIFIED' && resident.isVerified) ||
      (filterStatus === 'PENDING' && !resident.isVerified);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedResidents = filteredResidents.slice(
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

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setResidentDetails(resident);
    setOpenDetailModal(true);
  };

  const handleTabChange = (event, newValue) => {
    setDetailTab(newValue);
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
      {/* Header with Register Button */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Resident Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage all residents in your condominium
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => {
              resetForm();
              setOpenRegisterModal(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
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
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total</Typography>
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
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Verified</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>{stats.verified}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <VerifiedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(245, 158, 11, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Pending</Typography>
                  <Typography className="stat-value" sx={{ color: '#f59e0b' }}>{stats.pending}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <CancelIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(59, 130, 246, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">In Equb</Typography>
                  <Typography className="stat-value" sx={{ color: '#3b82f6' }}>{stats.inEqub}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <MoneyIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard color="rgba(139, 92, 246, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">In Iddir</Typography>
                  <Typography className="stat-value" sx={{ color: '#8b5cf6' }}>{stats.inIddir}</Typography>
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
            placeholder="Search by name, email, phone, room or block..."
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
              <TableCell>Block/Room</TableCell>
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
                          ID: {resident.id?.slice(0, 8)}
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
                        Block {resident.block || '—'}
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        Room {resident.roomNo || '—'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={resident.isVerified ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={resident.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: resident.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={resident.isInEqub ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={resident.isInEqub ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isInEqub ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: resident.isInEqub ? '#22c55e' : '#6b7280',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={resident.isInIddir ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={resident.isInIddir ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: resident.isInIddir ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
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
                      No residents found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'No residents in your condominium'}
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
          count={filteredResidents.length}
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

      {/* Resident Detail Modal */}
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
                Resident Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                View complete resident information
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
          {residentDetails && (
            <Box>
              {/* Profile Header */}
              <Box sx={{ 
                p: 4, 
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f1f3f5',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: '#D3AD32',
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  {residentDetails.fullName?.charAt(0) || 'R'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    {residentDetails.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Chip
                      icon={residentDetails.isVerified ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                      label={residentDetails.isVerified ? 'Verified' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: residentDetails.isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: residentDetails.isVerified ? '#22c55e' : '#f59e0b',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={`ID: ${residentDetails.id?.slice(0, 8)}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(107, 114, 128, 0.08)', color: '#6b7280' }}
                    />
                  </Box>
                </Box>
              </Box>

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
                  <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
                  <Tab label="Property" icon={<HomeIcon />} iconPosition="start" />
                  <Tab label="Memberships" icon={<GroupIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>
                {detailTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Personal Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><PersonIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText 
                                primary="Full Name" 
                                secondary={residentDetails.fullName}
                                primaryTypographyProps={{ variant: 'caption', color: '#6b7a8f' }}
                                secondaryTypographyProps={{ variant: 'body2', color: '#1a1a2e' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><EmailIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText 
                                primary="Email" 
                                secondary={residentDetails.email}
                                primaryTypographyProps={{ variant: 'caption', color: '#6b7a8f' }}
                                secondaryTypographyProps={{ variant: 'body2', color: '#1a1a2e' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><PhoneIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText 
                                primary="Phone Number" 
                                secondary={residentDetails.phoneNumber || 'Not provided'}
                                primaryTypographyProps={{ variant: 'caption', color: '#6b7a8f' }}
                                secondaryTypographyProps={{ variant: 'body2', color: '#1a1a2e' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><EventIcon sx={{ color: '#6b7a8f' }} /></ListItemIcon>
                              <ListItemText 
                                primary="Registered" 
                                secondary={new Date(residentDetails.createdAt).toLocaleDateString()}
                                primaryTypographyProps={{ variant: 'caption', color: '#6b7a8f' }}
                                secondaryTypographyProps={{ variant: 'body2', color: '#1a1a2e' }}
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="#6b7a8f">Verification Status</Typography>
                              <Chip
                                icon={residentDetails.isVerified ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                                label={residentDetails.isVerified ? 'Verified' : 'Pending'}
                                size="small"
                                sx={{
                                  backgroundColor: residentDetails.isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                  color: residentDetails.isVerified ? '#22c55e' : '#f59e0b',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="#6b7a8f">Equb Status</Typography>
                              <Chip
                                icon={residentDetails.isInEqub ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                                label={residentDetails.isInEqub ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                  backgroundColor: residentDetails.isInEqub ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                  color: residentDetails.isInEqub ? '#22c55e' : '#6b7280',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="#6b7a8f">Iddir Status</Typography>
                              <Chip
                                icon={residentDetails.isInIddir ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                                label={residentDetails.isInIddir ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                  backgroundColor: residentDetails.isInIddir ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                  color: residentDetails.isInIddir ? '#22c55e' : '#6b7280',
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
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Property Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                                <ApartmentIcon sx={{ color: '#D3AD32' }} />
                                <Box>
                                  <Typography variant="caption" color="#6b7a8f">Condominium</Typography>
                                  <Typography variant="body2" fontWeight={500}>{residentDetails.condoCode || '—'}</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                                <HomeIcon sx={{ color: '#D3AD32' }} />
                                <Box>
                                  <Typography variant="caption" color="#6b7a8f">Block & Room</Typography>
                                  <Typography variant="body2" fontWeight={500}>Block {residentDetails.block || '—'}, Room {residentDetails.roomNo || '—'}</Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                  </Grid>
                )}

                {detailTab === 2 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Equb Information
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                              <Typography variant="body2" color="#6b7a8f">Status</Typography>
                              <Chip
                                icon={residentDetails.isInEqub ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                                label={residentDetails.isInEqub ? 'Active Member' : 'Not a Member'}
                                size="small"
                                sx={{
                                  backgroundColor: residentDetails.isInEqub ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                  color: residentDetails.isInEqub ? '#22c55e' : '#6b7280',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                              <Typography variant="body2" color="#6b7a8f">Revenue</Typography>
                              <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                                {residentDetails.revenue ? `ETB ${residentDetails.revenue}` : '—'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </DetailCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailCard>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ color: '#6b7a8f', mb: 2, fontWeight: 600 }}>
                            Iddir Information
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                              <Typography variant="body2" color="#6b7a8f">Status</Typography>
                              <Chip
                                icon={residentDetails.isInIddir ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                                label={residentDetails.isInIddir ? 'Active Member' : 'Not a Member'}
                                size="small"
                                sx={{
                                  backgroundColor: residentDetails.isInIddir ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                  color: residentDetails.isInIddir ? '#22c55e' : '#6b7280',
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
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Register Resident Modal */}
      <Dialog 
        open={openRegisterModal} 
        onClose={() => setOpenRegisterModal(false)} 
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
            <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Register New Resident
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Add a new resident to the condominium
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              fullWidth
              required
              placeholder="e.g., John Doe"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
              required
              placeholder="e.g., john@example.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            <TextField
              label="Phone Number *"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              fullWidth
              required
              placeholder="e.g., 0912345678"
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
                  label="Block *"
                  value={formData.block}
                  onChange={(e) => setFormData({...formData, block: e.target.value})}
                  fullWidth
                  required
                  placeholder="e.g., A"
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
                  label="Room Number *"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                  fullWidth
                  required
                  placeholder="e.g., 101"
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#22c55e',
                      '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.08)' },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#22c55e',
                    },
                  }}
                />
              }
              label="Verified"
            />
            <Alert severity="info" sx={{ borderRadius: '10px' }}>
              New residents will be added to your condominium (HX-2737)
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenRegisterModal(false)}>Cancel</Button>
          <Button
            onClick={handleRegisterResident}
            variant="contained"
            startIcon={<PersonAddIcon />}
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
            Register Resident
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Residents;