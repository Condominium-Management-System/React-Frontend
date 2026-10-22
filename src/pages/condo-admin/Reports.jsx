// src/pages/condo-admin/Reports.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye, FaCheck } from 'react-icons/fa';

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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(status === 'reported' && {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  }),
  ...(status === 'assigned' && {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  }),
  ...(status === 'in_progress' && {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  }),
  ...(status === 'resolved' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  }),
  ...(status === 'closed' && {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
  }),
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(priority === 'emergency' && {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
  }),
  ...(priority === 'high' && {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  }),
  ...(priority === 'medium' && {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  }),
  ...(priority === 'low' && {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
  }),
}));

// Mock Data for Reports
const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Water Leak in Bathroom',
    description: 'There is a water leak from the bathroom ceiling in unit 101. Water is dripping continuously.',
    category: 'plumbing',
    priority: 'emergency',
    status: 'reported',
    createdAt: '2026-08-20T10:30:00.000Z',
    reporter: {
      fullName: 'Abebe Kebede',
      email: 'abebe@example.com',
      phoneNumber: '0912345678',
    },
    assignedTo: null,
    resolutionNotes: null,
    responses: [],
  },
  {
    id: '2',
    title: 'Noise from Room 6',
    description: 'Loud music coming from room 6 at 2 AM every night. Keeping residents awake.',
    category: 'noise',
    priority: 'high',
    status: 'assigned',
    createdAt: '2026-08-19T14:20:00.000Z',
    reporter: {
      fullName: 'Meron Tesfaye',
      email: 'meron@example.com',
      phoneNumber: '0923456789',
    },
    assignedTo: {
      fullName: 'Guard User',
    },
    resolutionNotes: null,
    responses: [
      {
        id: 'r1',
        message: 'I have contacted the resident in room 6 about the noise complaint.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-19T16:00:00.000Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Broken Elevator',
    description: 'The main elevator in Block A is not working. Residents are stuck using stairs.',
    category: 'structural',
    priority: 'emergency',
    status: 'in_progress',
    createdAt: '2026-08-18T09:00:00.000Z',
    reporter: {
      fullName: 'Dawit Hailu',
      email: 'dawit@example.com',
      phoneNumber: '0934567890',
    },
    assignedTo: {
      fullName: 'Maintenance Team',
    },
    resolutionNotes: 'Waiting for elevator parts to arrive.',
    responses: [
      {
        id: 'r2',
        message: 'Elevator technician has been called. Parts ordered.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-18T11:00:00.000Z',
      },
    ],
  },
  {
    id: '4',
    title: 'Electrical Short Circuit',
    description: 'Power outage in Block B, units 201-205. Sparking from the main panel.',
    category: 'electrical',
    priority: 'emergency',
    status: 'resolved',
    createdAt: '2026-08-17T13:45:00.000Z',
    reporter: {
      fullName: 'Tigist Worku',
      email: 'tigist@example.com',
      phoneNumber: '0945678901',
    },
    assignedTo: {
      fullName: 'Electrician Team',
    },
    resolutionNotes: 'Short circuit fixed. Power restored to all units.',
    responses: [
      {
        id: 'r3',
        message: 'Electrician is on site investigating the issue.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-17T14:30:00.000Z',
      },
      {
        id: 'r4',
        message: 'Power restored. All units working normally.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-17T18:00:00.000Z',
      },
    ],
  },
  {
    id: '5',
    title: 'Suspicious Person in Parking Lot',
    description: 'A suspicious person was seen loitering in the parking lot late at night.',
    category: 'security',
    priority: 'high',
    status: 'closed',
    createdAt: '2026-08-16T22:15:00.000Z',
    reporter: {
      fullName: 'Biruk Ayele',
      email: 'biruk@example.com',
      phoneNumber: '0956789012',
    },
    assignedTo: {
      fullName: 'Security Team',
    },
    resolutionNotes: 'Security patrol increased. No further incidents reported.',
    responses: [
      {
        id: 'r5',
        message: 'Security has been informed and is monitoring the area.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-16T23:00:00.000Z',
      },
      {
        id: 'r6',
        message: 'Area is secure. Increased patrols scheduled.',
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: '2026-08-17T06:00:00.000Z',
      },
    ],
  },
];

const Reports = () => {
  const theme = useTheme();
  
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  
  // Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openResponseModal, setOpenResponseModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusData, setStatusData] = useState({ status: '', resolutionNotes: '' });
  const [responseData, setResponseData] = useState({ message: '' });

  // Fetch reports - Using Mock Data
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data
      const reportsData = MOCK_REPORTS;
      console.log('📥 Mock Reports loaded:', reportsData.length);
      
      setReports(reportsData);
      setTotalItems(reportsData.length);
      
      // Calculate stats
      setStats({
        total: reportsData.length,
        reported: reportsData.filter(r => r.status === 'reported').length,
        assigned: reportsData.filter(r => r.status === 'assigned').length,
        inProgress: reportsData.filter(r => r.status === 'in_progress').length,
        resolved: reportsData.filter(r => r.status === 'resolved').length,
        closed: reportsData.filter(r => r.status === 'closed').length,
      });
      
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || report.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const updatedReports = reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: statusData.status, resolutionNotes: statusData.resolutionNotes || r.resolutionNotes }
          : r
      );
      setReports(updatedReports);
      
      // Update stats
      setStats({
        total: updatedReports.length,
        reported: updatedReports.filter(r => r.status === 'reported').length,
        assigned: updatedReports.filter(r => r.status === 'assigned').length,
        inProgress: updatedReports.filter(r => r.status === 'in_progress').length,
        resolved: updatedReports.filter(r => r.status === 'resolved').length,
        closed: updatedReports.filter(r => r.status === 'closed').length,
      });
      
      toast.success('Report status updated successfully');
      setOpenStatusModal(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Handle add response
  const handleAddResponse = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newResponse = {
        id: 'r' + Date.now(),
        message: responseData.message,
        isAdminResponse: true,
        user: { fullName: 'Admin User' },
        createdAt: new Date().toISOString(),
      };
      
      const updatedReports = reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, responses: [...(r.responses || []), newResponse] }
          : r
      );
      setReports(updatedReports);
      
      toast.success('Response added successfully');
      setOpenResponseModal(false);
      setResponseData({ message: '' });
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  // Handle view details
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setOpenDetailModal(true);
  };

  // Handle open status modal
  const handleOpenStatusModal = (report) => {
    setSelectedReport(report);
    setStatusData({ 
      status: report.status === 'reported' ? 'assigned' : 
              report.status === 'assigned' ? 'in_progress' :
              report.status === 'in_progress' ? 'resolved' : 'closed',
      resolutionNotes: report.resolutionNotes || '' 
    });
    setOpenStatusModal(true);
  };

  // Handle open response modal
  const handleOpenResponseModal = (report) => {
    setSelectedReport(report);
    setResponseData({ message: '' });
    setOpenResponseModal(true);
  };

  // Get status label
  const getStatusLabel = (status) => {
    return status.replace('_', ' ');
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
            Report Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage and respond to resident reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchReports}
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
                  <ReportIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Reported</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.reported}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>In Progress</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.inProgress}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <ScheduleIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Resolved</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.resolved}</Typography>
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Closed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#6b7280' }}>{stats.closed}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <CancelIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
            placeholder="Search by title, description or reporter name..."
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
              <MenuItem value="reported">Reported</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Priority"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Priority</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title / Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                        {report.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                        {report.description?.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.category}
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
                    <PriorityChip priority={report.priority} label={report.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={report.status} label={getStatusLabel(report.status)} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#D3AD32', fontSize: '0.65rem' }}>
                        {report.reporter?.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                        {report.reporter?.fullName || 'Anonymous'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(report)}
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
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenStatusModal(report)}
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
                      <Tooltip title="Add Response">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenResponseModal(report)}
                          sx={{ 
                            color: '#6b7a8f', 
                            '&:hover': { 
                              color: '#22c55e',
                              backgroundColor: 'rgba(34, 197, 94, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '10px',
                            padding: '8px',
                          }}
                        >
                          <MessageIcon sx={{ fontSize: 18 }} />
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
                    <ReportIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No reports found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'No reports in your condominium'}
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
          count={filteredReports.length}
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
                Report Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                View complete report information
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
          {selectedReport && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                {selectedReport.title}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Category</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedReport.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Priority</Typography>
                  <PriorityChip priority={selectedReport.priority} label={selectedReport.priority} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Status</Typography>
                  <StatusChip status={selectedReport.status} label={getStatusLabel(selectedReport.status)} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Reporter</Typography>
                  <Typography variant="body2">{selectedReport.reporter?.fullName || 'Anonymous'}</Typography>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>Description</Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px', mb: 2 }}>
                <Typography variant="body2">{selectedReport.description}</Typography>
              </Paper>
              {selectedReport.assignedTo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Assigned To</Typography>
                  <Typography variant="body2">{selectedReport.assignedTo.fullName}</Typography>
                </Box>
              )}
              {selectedReport.resolutionNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Resolution Notes</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                    <Typography variant="body2">{selectedReport.resolutionNotes}</Typography>
                  </Paper>
                </Box>
              )}
              {selectedReport.responses && selectedReport.responses.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>Responses</Typography>
                  {selectedReport.responses.map((response) => (
                    <Paper 
                      key={response.id} 
                      sx={{ 
                        p: 2, 
                        mb: 1, 
                        bgcolor: response.isAdminResponse ? 'rgba(211, 173, 50, 0.05)' : '#f8f9fa',
                        borderRadius: '8px',
                        border: response.isAdminResponse ? '1px solid rgba(211, 173, 50, 0.2)' : 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {response.user?.fullName || 'User'}
                          {response.isAdminResponse && ' (Admin)'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                          {new Date(response.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>{response.message}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog 
        open={openStatusModal} 
        onClose={() => setOpenStatusModal(false)} 
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
            Update Report Status
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Change the status of this report
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusData.status}
                onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                label="Status"
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                <MenuItem value="reported">Reported</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Resolution Notes"
              value={statusData.resolutionNotes}
              onChange={(e) => setStatusData({ ...statusData, resolutionNotes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Add notes about resolution..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenStatusModal(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
              },
              textTransform: 'none',
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Modal */}
      <Dialog 
        open={openResponseModal} 
        onClose={() => setOpenResponseModal(false)} 
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
            Add Response
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Respond to the resident about this report
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <TextField
            label="Message"
            value={responseData.message}
            onChange={(e) => setResponseData({ message: e.target.value })}
            multiline
            rows={4}
            fullWidth
            placeholder="Type your response here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fff',
                '&:hover fieldset': { borderColor: '#D3AD32' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenResponseModal(false)}>Cancel</Button>
          <Button
            onClick={handleAddResponse}
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
              },
              textTransform: 'none',
            }}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;