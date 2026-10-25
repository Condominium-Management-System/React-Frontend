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
  Zoom,
  Tooltip,
  Divider,
  Tab,
  Tabs,
  } from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Warning as WarningIcon,
  Group as GroupIcon,
  AccountBalance as SavingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { api } from '../../api/axiosConfig';
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
  ...(status === 'approved' && {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#16a34a',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  }),
  ...(status === 'rejected' && {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#dc2626',
    border: '1px solid rgba(239, 68, 68, 0.3)',
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

const Reports = () => {
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    equbRequests: 0,
    iddirRequests: 0,
  });
  
  // Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openResponseModal, setOpenResponseModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusData, setStatusData] = useState({ status: '', resolutionNotes: '' });
  const [responseData, setResponseData] = useState({ message: '' });

  // Fetch reports - Real Database Integration
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getAdminAll({ limit: 100 });
      const reportsData = res.data?.data?.items || res.data?.data || [];
      
      setReports(reportsData);
      setTotalItems(reportsData.length);
      
      // Calculate stats directly from real database records
      setStats({
        total: reportsData.length,
        reported: reportsData.filter(r => r.status === 'reported').length,
        assigned: reportsData.filter(r => r.status === 'assigned').length,
        inProgress: reportsData.filter(r => r.status === 'in_progress').length,
        resolved: reportsData.filter(r => r.status === 'resolved' || r.status === 'approved').length,
        closed: reportsData.filter(r => r.status === 'closed' || r.status === 'rejected').length,
        equbRequests: reportsData.filter(r => r.category === 'equb_membership').length,
        iddirRequests: reportsData.filter(r => r.category === 'iddir_membership').length,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch reports');
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
      (report.title && report.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.reporter?.fullName && report.reporter.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.equb?.name && report.equb.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.iddir?.name && report.iddir.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || report.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || report.category === categoryFilter;

    // Tabs filter
    let matchesTab = true;
    if (activeTab === 1) {
      // Community Membership Requests
      matchesTab = report.category === 'equb_membership' || report.category === 'iddir_membership';
    } else if (activeTab === 2) {
      // Maintenance & Repairs
      matchesTab = report.category === 'maintenance';
    } else if (activeTab === 3) {
      // General Complaints & Other
      matchesTab = report.category !== 'equb_membership' && report.category !== 'iddir_membership' && report.category !== 'maintenance';
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesTab;
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

  // Handle quick decision for community membership requests
  const handleQuickDecision = async (reportId, newStatus, customNotes) => {
    try {
      setProcessingId(reportId);
      const defaultNotes = newStatus === 'approved' 
        ? 'Community group membership approved and activated by condo administration.'
        : 'Community group membership request declined by condo administration.';
      
      const resolutionNotes = customNotes || defaultNotes;
      
      await api.reports.updateStatus(reportId, {
        status: newStatus,
        resolutionNotes
      });
      
      toast.success(newStatus === 'approved' ? 'Membership approved and activated in group!' : 'Request marked as declined.');
      
      // Update selectedReport state if currently viewing in modal
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => ({
          ...prev,
          status: newStatus,
          resolutionNotes
        }));
      }

      await fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle status update modal submission
  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    try {
      await api.reports.updateStatus(selectedReport.id, {
        status: statusData.status,
        resolutionNotes: statusData.resolutionNotes || undefined
      });
      toast.success('Report status updated successfully');
      setOpenStatusModal(false);
      setSelectedReport(null);
      await fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle add response
  const handleAddResponse = async () => {
    if (!selectedReport || !responseData.message?.trim()) {
      toast.error('Response message cannot be empty');
      return;
    }
    try {
      await api.reports.addResponse(selectedReport.id, {
        message: responseData.message.trim()
      });
      toast.success('Response added successfully');
      setOpenResponseModal(false);
      setResponseData({ message: '' });
      setSelectedReport(null);
      await fetchReports();
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error(error.response?.data?.message || 'Failed to add response');
    }
  };

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.reports.delete(reportId);
      toast.success('Report deleted successfully');
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error.response?.data?.message || 'Failed to delete report');
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
    let nextStatus = 'assigned';
    if (report.status === 'reported') nextStatus = 'assigned';
    else if (report.status === 'assigned') nextStatus = 'in_progress';
    else if (report.status === 'in_progress') {
      nextStatus = (report.category === 'equb_membership' || report.category === 'iddir_membership') ? 'approved' : 'resolved';
    } else {
      nextStatus = 'closed';
    }

    setStatusData({ 
      status: nextStatus,
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
    if (!status) return 'Unknown';
    if (status === 'approved') return 'Approved & Active';
    if (status === 'rejected') return 'Declined';
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
            Report & Request Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage resident issues, maintenance, and Equb / Iddir membership requests
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
        <Grid item xs={6} sm={4} md={2}>
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

        <Grid item xs={6} sm={4} md={2}>
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

        <Grid item xs={6} sm={4} md={2}>
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

        <Grid item xs={6} sm={4} md={2}>
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

        <Grid item xs={6} sm={4} md={2}>
          <StatsCard 
            color="rgba(217, 119, 6, 0.1)" 
            onClick={() => { setActiveTab(1); setCategoryFilter('equb_membership'); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>Equb Requests</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#b45309' }}>{stats.equbRequests}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                  <SavingsIcon sx={{ color: '#b45309', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatsCard 
            color="rgba(79, 70, 229, 0.1)" 
            onClick={() => { setActiveTab(1); setCategoryFilter('iddir_membership'); }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#4338ca', fontWeight: 600 }}>Iddir Requests</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4338ca' }}>{stats.iddirRequests}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(79, 70, 229, 0.15)' }}>
                  <GroupIcon sx={{ color: '#4338ca', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs Filter */}
      <Paper sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            setPage(0);
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            px: 2,
            borderBottom: '1px solid #f1f3f5',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 1.8,
            },
            '& .Mui-selected': {
              color: '#c49a2b !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#c49a2b',
              height: 3,
            }
          }}
        >
          <Tab label={`All Reports (${reports.length})`} />
          <Tab 
            label={`Community Membership Requests (${stats.equbRequests + stats.iddirRequests})`} 
            sx={{ fontWeight: (stats.equbRequests + stats.iddirRequests > 0) ? 700 : 500 }}
          />
          <Tab label="Maintenance & Repairs" />
          <Tab label="Complaints & Other" />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by title, description, reporter name, or group..."
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
              label="Category"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="equb_membership">Equb Membership</MenuItem>
              <MenuItem value="iddir_membership">Iddir Membership</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="noise">Noise</MenuItem>
              <MenuItem value="facility">Facility</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="rules">Rules Violation</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              label="Status"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="reported">Reported</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
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
              <TableCell>Title / Scope</TableCell>
              <TableCell>Category & Associated Group</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applicant / Reporter</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => {
                const isEqub = report.category === 'equb_membership';
                const isIddir = report.category === 'iddir_membership';
                const isMembershipRequest = isEqub || isIddir;
                const isPendingDecision = report.status === 'reported' || report.status === 'assigned' || report.status === 'in_progress';

                return (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                          {report.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                          {report.description && report.description.length > 70 
                            ? `${report.description.substring(0, 70)}...` 
                            : report.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {isEqub ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip 
                            icon={<SavingsIcon sx={{ fontSize: '14px !important', color: '#b45309 !important' }} />}
                            label="Equb Join Request"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              color: '#b45309',
                              fontWeight: 600,
                              width: 'fit-content'
                            }}
                          />
                          {report.equb?.name && (
                            <Typography variant="caption" sx={{ color: '#78716c', fontWeight: 600 }}>
                              Group: {report.equb.name}
                            </Typography>
                          )}
                        </Box>
                      ) : isIddir ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip 
                            icon={<GroupIcon sx={{ fontSize: '14px !important', color: '#4338ca !important' }} />}
                            label="Iddir Join Request"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(99, 102, 241, 0.12)',
                              color: '#4338ca',
                              fontWeight: 600,
                              width: 'fit-content'
                            }}
                          />
                          {report.iddir?.name && (
                            <Typography variant="caption" sx={{ color: '#78716c', fontWeight: 600 }}>
                              Group: {report.iddir.name}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Chip 
                          label={report.category?.replace('_', ' ')}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(107, 114, 128, 0.08)',
                            color: '#6b7280',
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={report.priority} label={report.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={report.status} label={getStatusLabel(report.status)} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 26, height: 26, bgcolor: '#D3AD32', fontSize: '0.7rem' }}>
                          {report.reporter?.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 500, lineHeight: 1.2 }}>
                            {report.reporter?.fullName || 'Resident'}
                          </Typography>
                          {report.reporter?.unitNumber && (
                            <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                              Unit {report.reporter.unitNumber}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                        {/* Quick Action Button for Community Membership */}
                        {isMembershipRequest && isPendingDecision && (
                          <Tooltip title="Approve & Activate Membership">
                            <IconButton
                              size="small"
                              disabled={processingId === report.id}
                              onClick={() => handleQuickDecision(report.id, 'approved')}
                              sx={{ 
                                color: '#16a34a', 
                                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                                '&:hover': { 
                                  backgroundColor: 'rgba(22, 163, 74, 0.18)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                borderRadius: '8px',
                                padding: '6px',
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

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
                              borderRadius: '8px',
                              padding: '6px',
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
                              borderRadius: '8px',
                              padding: '6px',
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
                              borderRadius: '8px',
                              padding: '6px',
                            }}
                          >
                            <MessageIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Report">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteReport(report.id)}
                            sx={{ 
                              color: '#6b7a8f', 
                              '&:hover': { 
                                color: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                              borderRadius: '8px',
                              padding: '6px',
                            }}
                          >
                            <FaRegTrashAlt size={15} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReportIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No reports or requests found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No entries matching current filter'}
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
          count={totalItems || filteredReports.length}
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
        disableRestoreFocus  
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
                Report & Request Details
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                Review full report information and take action
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
        
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fa' }}>
          {selectedReport && (
            <Box>
              {/* Community Group Request Banner if applicable */}
              {(selectedReport.category === 'equb_membership' || selectedReport.category === 'iddir_membership') && (
                <Paper 
                  sx={{ 
                    p: 2.5, 
                    mb: 3, 
                    bgcolor: selectedReport.category === 'equb_membership' ? '#fffbeb' : '#eef2ff', 
                    border: '1px solid',
                    borderColor: selectedReport.category === 'equb_membership' ? '#fde68a' : '#c7d2fe', 
                    borderRadius: '14px' 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {selectedReport.category === 'equb_membership' ? (
                        <SavingsIcon sx={{ color: '#d97706', fontSize: 32 }} />
                      ) : (
                        <GroupIcon sx={{ color: '#4f46e5', fontSize: 32 }} />
                      )}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color={selectedReport.category === 'equb_membership' ? '#78350f' : '#312e81'}>
                          {selectedReport.category === 'equb_membership' ? 'Equb Group Join Request' : 'Iddir Group Join Request'}
                        </Typography>
                        <Typography variant="body2" color={selectedReport.category === 'equb_membership' ? '#92400e' : '#3730a3'}>
                          Review applicant and authorize community membership
                        </Typography>
                      </Box>
                    </Box>
                    <StatusChip status={selectedReport.status} label={getStatusLabel(selectedReport.status)} />
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: selectedReport.category === 'equb_membership' ? '#fde68a' : '#c7d2fe' }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Target Group</Typography>
                      <Typography variant="body1" fontWeight={700} color="#1c1917">
                        {selectedReport.category === 'equb_membership' 
                          ? selectedReport.equb?.name || 'Equb Group' 
                          : selectedReport.iddir?.name || 'Iddir Group'}
                      </Typography>
                      {selectedReport.category === 'equb_membership' && selectedReport.equb && (
                        <Typography variant="caption" color="#78716c" display="block">
                          Type: {selectedReport.equb.type} • Contribution: {Number(selectedReport.equb.contributionAmount || 0).toLocaleString()} ETB
                        </Typography>
                      )}
                      {selectedReport.category === 'iddir_membership' && selectedReport.iddir && (
                        <Typography variant="caption" color="#78716c" display="block">
                          Monthly Contribution: {Number(selectedReport.iddir.monthlyContribution || 0).toLocaleString()} ETB
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Applicant Resident</Typography>
                      <Typography variant="body1" fontWeight={600} color="#1c1917">
                        {selectedReport.reporter?.fullName || 'Resident'}
                      </Typography>
                      <Typography variant="caption" color="#78716c" display="block">
                        Unit: {selectedReport.reporter?.unitNumber || 'N/A'} • Phone: {selectedReport.reporter?.phoneNumber || 'N/A'} • Email: {selectedReport.reporter?.email || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Direct Action Buttons for Pending Membership Requests */}
                  {(selectedReport.status === 'reported' || selectedReport.status === 'assigned' || selectedReport.status === 'in_progress') && (
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #e2e8f0', display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        disabled={processingId === selectedReport.id}
                        onClick={() => handleQuickDecision(selectedReport.id, 'rejected')}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
                      >
                        Decline Request
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        disabled={processingId === selectedReport.id}
                        onClick={() => handleQuickDecision(selectedReport.id, 'approved')}
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600, 
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                          }
                        }}
                      >
                        {processingId === selectedReport.id ? 'Activating...' : 'Approve & Activate Membership'}
                      </Button>
                    </Box>
                  )}
                </Paper>
              )}

              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                {selectedReport.title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Category</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {selectedReport.category?.replace('_', ' ')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <PriorityChip priority={selectedReport.priority} label={selectedReport.priority} />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={selectedReport.status} label={getStatusLabel(selectedReport.status)} />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Reporter</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedReport.reporter?.fullName || 'Resident'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 0.5, fontWeight: 500 }}>Description</Typography>
              <Paper sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #e9ecef', mb: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
                  {selectedReport.description}
                </Typography>
              </Paper>

              {selectedReport.assignedTo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Assigned Staff</Typography>
                  <Typography variant="body2">{selectedReport.assignedTo.fullName}</Typography>
                </Box>
              )}

              {selectedReport.resolutionNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500, mb: 0.5 }}>Resolution Notes</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                    <Typography variant="body2" sx={{ color: '#374151' }}>{selectedReport.resolutionNotes}</Typography>
                  </Paper>
                </Box>
              )}

              {selectedReport.responses && selectedReport.responses.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: '#1a1a2e', fontWeight: 600, mb: 1 }}>
                    Communication History ({selectedReport.responses.length})
                  </Typography>
                  {selectedReport.responses.map((response) => (
                    <Paper 
                      key={response.id} 
                      sx={{ 
                        p: 2, 
                        mb: 1.5, 
                        bgcolor: response.isAdminResponse ? 'rgba(211, 173, 50, 0.08)' : '#ffffff',
                        borderRadius: '10px',
                        border: response.isAdminResponse ? '1px solid rgba(211, 173, 50, 0.3)' : '1px solid #e9ecef',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600} color={response.isAdminResponse ? '#92400e' : '#1a1a2e'}>
                          {response.user?.fullName || 'User'}
                          {response.isAdminResponse && ' (Admin)'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                          {new Date(response.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#374151' }}>{response.message}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenDetailModal(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog 
        disableRestoreFocus  
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
            Change the status and provide resolution documentation
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
                <MenuItem value="approved">Approved & Active (Activate Membership)</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected / Declined</MenuItem>
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
              placeholder="Add notes about resolution, actions taken, or reason for decision..."
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
          <Button onClick={() => setOpenStatusModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
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
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Modal */}
      <Dialog 
        disableRestoreFocus  
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
            Respond to the resident regarding this report or request
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
            placeholder="Type your official response here..."
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
          <Button onClick={() => setOpenResponseModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
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
              fontWeight: 600,
              borderRadius: '10px',
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
