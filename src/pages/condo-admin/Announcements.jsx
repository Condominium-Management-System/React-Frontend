// src/pages/condo-admin/Announcements.jsx
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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Announcement as AnnouncementIcon,
  Pin as PinIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Celebration as CelebrationIcon,
  Event as EventIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye } from 'react-icons/fa';

// Styled Components with Shadows
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', // Added shadow
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

// Stats Card with Shadow
const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)', // Added shadow
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', // Enhanced shadow on hover
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

// Mock Data
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Maintenance Schedule - August 2026',
    body: 'Please be informed that the monthly maintenance will take place on August 25-27. All residents are requested to cooperate.',
    announcementType: 'general',
    isPinned: true,
    expiryDate: '2026-08-28T00:00:00.000Z',
    createdAt: '2026-08-20T10:00:00.000Z',
    createdBy: { fullName: 'Admin User', role: 'condo_admin' },
  },
  {
    id: '2',
    title: 'Emergency: Power Outage Notice',
    body: 'There will be a scheduled power outage on August 22 from 2:00 AM to 6:00 AM for maintenance. Please prepare accordingly.',
    announcementType: 'emergency',
    isPinned: true,
    expiryDate: '2026-08-23T00:00:00.000Z',
    createdAt: '2026-08-21T08:30:00.000Z',
    createdBy: { fullName: 'Admin User', role: 'condo_admin' },
  },
  {
    id: '3',
    title: 'Community Meeting - September 2026',
    body: 'The quarterly community meeting will be held on September 5, 2026 at the community hall. All residents are invited to attend.',
    announcementType: 'event',
    isPinned: false,
    expiryDate: '2026-09-06T00:00:00.000Z',
    createdAt: '2026-08-19T14:00:00.000Z',
    createdBy: { fullName: 'Admin User', role: 'condo_admin' },
  },
  {
    id: '4',
    title: 'Condolence Message',
    body: 'The management extends its deepest condolences to the family of the late resident of Room 301. May his soul rest in peace.',
    announcementType: 'mourning',
    isPinned: false,
    expiryDate: null,
    createdAt: '2026-08-18T09:15:00.000Z',
    createdBy: { fullName: 'Admin User', role: 'condo_admin' },
  },
  {
    id: '5',
    title: 'Resident Appreciation Day',
    body: 'We are celebrating Resident Appreciation Day on August 30 with food, music, and activities for all residents!',
    announcementType: 'celebration',
    isPinned: false,
    expiryDate: '2026-08-31T00:00:00.000Z',
    createdAt: '2026-08-17T11:00:00.000Z',
    createdBy: { fullName: 'Admin User', role: 'condo_admin' },
  },
];

const Announcements = () => {
  const theme = useTheme();
  
  // State
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pinned: 0,
    active: 0,
    expired: 0,
    byType: {
      general: 0,
      emergency: 0,
      event: 0,
      celebration: 0,
      mourning: 0,
    }
  });
  
  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    announcementType: 'general',
    expiryDate: '',
    isPinned: false,
    image: null,
  });

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      setTotalItems(MOCK_ANNOUNCEMENTS.length);
      
      // Calculate stats
      const pinned = MOCK_ANNOUNCEMENTS.filter(a => a.isPinned).length;
      const active = MOCK_ANNOUNCEMENTS.filter(a => !a.expiryDate || new Date(a.expiryDate) > new Date()).length;
      const expired = MOCK_ANNOUNCEMENTS.filter(a => a.expiryDate && new Date(a.expiryDate) < new Date()).length;
      
      setStats({
        total: MOCK_ANNOUNCEMENTS.length,
        pinned,
        active,
        expired,
        byType: {
          general: MOCK_ANNOUNCEMENTS.filter(a => a.announcementType === 'general').length,
          emergency: MOCK_ANNOUNCEMENTS.filter(a => a.announcementType === 'emergency').length,
          event: MOCK_ANNOUNCEMENTS.filter(a => a.announcementType === 'event').length,
          celebration: MOCK_ANNOUNCEMENTS.filter(a => a.announcementType === 'celebration').length,
          mourning: MOCK_ANNOUNCEMENTS.filter(a => a.announcementType === 'mourning').length,
        }
      });
      
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = 
      ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.body?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || ann.announcementType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const paginatedAnnouncements = filteredAnnouncements.slice(
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

  // Handle submit
  const handleSubmit = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAnnouncement = {
        id: Date.now().toString(),
        title: formData.title,
        body: formData.body,
        announcementType: formData.announcementType,
        isPinned: formData.isPinned,
        expiryDate: formData.expiryDate || null,
        createdAt: new Date().toISOString(),
        createdBy: { fullName: 'Admin User', role: 'condo_admin' },
      };
      
      if (editingAnnouncement) {
        const updated = announcements.map(a => 
          a.id === editingAnnouncement.id ? { ...a, ...newAnnouncement } : a
        );
        setAnnouncements(updated);
        toast.success('Announcement updated successfully!');
      } else {
        setAnnouncements([newAnnouncement, ...announcements]);
        toast.success('Announcement created successfully!');
      }
      
      setOpenModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
      toast.success('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = announcements.map(a => 
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      );
      setAnnouncements(updated);
      toast.success(updated.find(a => a.id === id)?.isPinned ? 'Announcement pinned!' : 'Announcement unpinned!');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to toggle pin');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      body: '',
      announcementType: 'general',
      expiryDate: '',
      isPinned: false,
      image: null,
    });
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch(type) {
      case 'emergency': return <WarningIcon sx={{ fontSize: 16, color: '#dc2626' }} />;
      case 'event': return <EventIcon sx={{ fontSize: 16, color: '#3b82f6' }} />;
      case 'celebration': return <CelebrationIcon sx={{ fontSize: 16, color: '#22c55e' }} />;
      case 'mourning': return <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
      default: return <AnnouncementIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'emergency': return 'rgba(220, 38, 38, 0.1)';
      case 'event': return 'rgba(59, 130, 246, 0.1)';
      case 'celebration': return 'rgba(34, 197, 94, 0.1)';
      case 'mourning': return 'rgba(107, 114, 128, 0.1)';
      default: return 'rgba(107, 114, 128, 0.08)';
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
            Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Create and manage announcements for your condominium
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenModal(true);
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
            borderRadius: '12px',
            px: 3,
            py: 1.5,
          }}
        >
          Create Announcement
        </Button>
      </Box>

      {/* Stats Cards with Shadows */}
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
                  <AnnouncementIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Pinned</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#D3AD32' }}>{stats.pinned}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(211, 173, 50, 0.1)' }}>
                  <PinIcon sx={{ color: '#D3AD32', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Expired</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#6b7280' }}>{stats.expired}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <ScheduleIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(220, 38, 38, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Emergency</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{stats.byType.emergency}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(220, 38, 38, 0.1)' }}>
                  <WarningIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search announcements..."
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
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="celebration">Celebration</MenuItem>
              <MenuItem value="mourning">Mourning</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAnnouncements.map((ann) => (
              <TableRow key={ann.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ann.isPinned && <PinIcon sx={{ fontSize: 14, color: '#D3AD32' }} />}
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                        {ann.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                        {ann.body?.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(ann.announcementType)}
                    label={ann.announcementType}
                    size="small"
                    sx={{
                      backgroundColor: getTypeColor(ann.announcementType),
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ann.expiryDate && new Date(ann.expiryDate) < new Date() ? 'Expired' : 'Active'}
                    size="small"
                    sx={{
                      backgroundColor: ann.expiryDate && new Date(ann.expiryDate) < new Date() 
                        ? 'rgba(107, 114, 128, 0.1)' 
                        : 'rgba(34, 197, 94, 0.1)',
                      color: ann.expiryDate && new Date(ann.expiryDate) < new Date() 
                        ? '#6b7280' 
                        : '#22c55e',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                    {ann.expiryDate ? new Date(ann.expiryDate).toLocaleDateString() : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title={ann.isPinned ? 'Unpin' : 'Pin'}>
                      <IconButton
                        size="small"
                        onClick={() => handleTogglePin(ann.id)}
                        sx={{ 
                          color: ann.isPinned ? '#D3AD32' : '#6b7a8f',
                          '&:hover': { 
                            backgroundColor: 'rgba(211, 173, 50, 0.08)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          borderRadius: '10px',
                          padding: '8px',
                        }}
                      >
                        <PinIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAnnouncement(ann);
                          setOpenDetailModal(true);
                        }}
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
                          setEditingAnnouncement(ann);
                          setFormData({
                            title: ann.title,
                            body: ann.body,
                            announcementType: ann.announcementType,
                            expiryDate: ann.expiryDate?.split('T')[0] || '',
                            isPinned: ann.isPinned,
                            image: null,
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
                        onClick={() => handleDelete(ann.id)}
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
            {paginatedAnnouncements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AnnouncementIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No announcements found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'Create your first announcement'}
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
          count={filteredAnnouncements.length}
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
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            {editingAnnouncement ? '✏️ Edit Announcement' : '📢 Create Announcement'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement'}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
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
              label="Body *"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              fullWidth
              required
              multiline
              rows={4}
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
                <FormControl fullWidth>
                  <InputLabel>Type *</InputLabel>
                  <Select
                    value={formData.announcementType}
                    onChange={(e) => setFormData({...formData, announcementType: e.target.value})}
                    label="Type *"
                    sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="celebration">Celebration</MenuItem>
                    <MenuItem value="mourning">Mourning</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  fullWidth
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#D3AD32',
                      '&:hover': { backgroundColor: 'rgba(211, 173, 50, 0.08)' },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#D3AD32',
                    },
                  }}
                />
              }
              label="Pin this announcement"
            />
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
            {editingAnnouncement ? 'Update' : 'Create'}
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
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 3,
          color: '#fff',
        }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            Announcement Details
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            View complete announcement information
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedAnnouncement && (
            <Box>
              {selectedAnnouncement.isPinned && (
                <Chip 
                  icon={<PinIcon sx={{ fontSize: 14 }} />}
                  label="Pinned"
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(211, 173, 50, 0.1)',
                    color: '#D3AD32',
                    fontWeight: 600,
                    mb: 2,
                  }}
                />
              )}
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                {selectedAnnouncement.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 2 }}>
                {selectedAnnouncement.body}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Type</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {selectedAnnouncement.announcementType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography>
                  <Chip 
                    label={selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() ? 'Expired' : 'Active'}
                    size="small"
                    sx={{
                      backgroundColor: selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() 
                        ? 'rgba(107, 114, 128, 0.1)' 
                        : 'rgba(34, 197, 94, 0.1)',
                      color: selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() 
                        ? '#6b7280' 
                        : '#22c55e',
                      fontWeight: 600,
                    }}
                  />
                </Grid>
                {selectedAnnouncement.expiryDate && (
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expires</Typography>
                    <Typography variant="body2">
                      {new Date(selectedAnnouncement.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created</Typography>
                  <Typography variant="body2">
                    {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created By</Typography>
                  <Typography variant="body2">
                    {selectedAnnouncement.createdBy?.fullName} ({selectedAnnouncement.createdBy?.role})
                  </Typography>
                </Grid>
              </Grid>
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

export default Announcements;