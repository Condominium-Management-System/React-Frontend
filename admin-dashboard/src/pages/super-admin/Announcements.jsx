// src/pages/super-admin/Announcements.jsx
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
  useTheme,
  Zoom,
  Tooltip,
  Switch,
  FormControlLabel,
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

// Mock Data
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Emergency: Power Outage Notice',
    body: 'There will be a scheduled power outage on August 22 from 2:00 AM to 6:00 AM for maintenance.',
    announcementType: 'emergency',
    isPinned: true,
    expiryDate: '2026-08-23T00:00:00.000Z',
    createdAt: '2026-08-21T08:30:00.000Z',
    createdBy: { fullName: 'Super Admin', role: 'super_admin' },
    targetCondo: 'All Condos',
  },
  {
    id: '2',
    title: 'Monthly Maintenance Schedule',
    body: 'Please be informed that the monthly maintenance will take place on August 25-27.',
    announcementType: 'general',
    isPinned: true,
    expiryDate: '2026-08-28T00:00:00.000Z',
    createdAt: '2026-08-20T10:00:00.000Z',
    createdBy: { fullName: 'Super Admin', role: 'super_admin' },
    targetCondo: 'All Condos',
  },
  {
    id: '3',
    title: 'Community Meeting - September 2026',
    body: 'The quarterly community meeting will be held on September 5, 2026 at the community hall.',
    announcementType: 'event',
    isPinned: false,
    expiryDate: '2026-09-06T00:00:00.000Z',
    createdAt: '2026-08-19T14:00:00.000Z',
    createdBy: { fullName: 'Super Admin', role: 'super_admin' },
    targetCondo: 'YEKONDO-001',
  },
];

const Announcements = () => {
  const theme = useTheme();
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
    byType: { general: 0, emergency: 0, event: 0, celebration: 0, mourning: 0 },
  });
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
    targetCondo: 'ALL',
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      setTotalItems(MOCK_ANNOUNCEMENTS.length);
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
        },
      });
      
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ann.body?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || ann.announcementType === typeFilter;
    return matchesSearch && matchesType;
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        createdBy: { fullName: 'Super Admin', role: 'super_admin' },
        targetCondo: formData.targetCondo === 'ALL' ? 'All Condos' : formData.targetCondo,
      };
      if (editingAnnouncement) {
        const updated = announcements.map(a => a.id === editingAnnouncement.id ? { ...a, ...newAnnouncement } : a);
        setAnnouncements(updated);
        toast.success('Announcement updated!');
      } else {
        setAnnouncements([newAnnouncement, ...announcements]);
        toast.success('Announcement created!');
      }
      setOpenModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Announcement deleted!');
      fetchAnnouncements();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleTogglePin = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = announcements.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a);
      setAnnouncements(updated);
      toast.success(updated.find(a => a.id === id)?.isPinned ? 'Pinned!' : 'Unpinned!');
      fetchAnnouncements();
    } catch (error) { toast.error('Failed to toggle pin'); }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({ title: '', body: '', announcementType: 'general', expiryDate: '', isPinned: false, targetCondo: 'ALL' });
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Announcements</Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Manage system-wide announcements</Typography></Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenModal(true); }}
          sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '12px', px: 3 }}>
          New Announcement
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography></Box>
                <Box className="stat-icon"><AnnouncementIcon sx={{ color: '#6b7280', fontSize: 20 }} /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(211, 173, 50, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Pinned</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#D3AD32' }}>{stats.pinned}</Typography></Box>
                <Box className="stat-icon"><PinIcon sx={{ color: '#D3AD32', fontSize: 20 }} /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Active</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.active}</Typography></Box>
                <Box className="stat-icon"><CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expired</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#6b7280' }}>{stats.expired}</Typography></Box>
                <Box className="stat-icon"><ScheduleIcon sx={{ color: '#6b7280', fontSize: 20 }} /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(220, 38, 38, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Emergency</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{stats.byType.emergency}</Typography></Box>
                <Box className="stat-icon"><WarningIcon sx={{ color: '#dc2626', fontSize: 20 }} /></Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f' }} /></InputAdornment>, sx: { borderRadius: '10px' } }} size="small" />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type" sx={{ borderRadius: '10px' }}>
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="general">General</MenuItem><MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="event">Event</MenuItem><MenuItem value="celebration">Celebration</MenuItem><MenuItem value="mourning">Mourning</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead><TableRow>
            <TableCell>Title</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell>
            <TableCell>Target</TableCell><TableCell>Expires</TableCell><TableCell align="right">Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {paginatedAnnouncements.map((ann) => (
              <TableRow key={ann.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ann.isPinned && <PinIcon sx={{ fontSize: 14, color: '#D3AD32' }} />}
                    <Box><Typography variant="body2" fontWeight={500}>{ann.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{ann.body?.substring(0, 50)}...</Typography></Box>
                  </Box>
                </TableCell>
                <TableCell><Chip icon={getTypeIcon(ann.announcementType)} label={ann.announcementType} size="small" sx={{ backgroundColor: getTypeColor(ann.announcementType), fontWeight: 500, textTransform: 'capitalize' }} /></TableCell>
                <TableCell><Chip label={ann.expiryDate && new Date(ann.expiryDate) < new Date() ? 'Expired' : 'Active'} size="small" sx={{ backgroundColor: ann.expiryDate && new Date(ann.expiryDate) < new Date() ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: ann.expiryDate && new Date(ann.expiryDate) < new Date() ? '#6b7280' : '#22c55e', fontWeight: 600 }} /></TableCell>
                <TableCell><Chip label={ann.targetCondo || 'All Condos'} size="small" sx={{ backgroundColor: 'rgba(211, 173, 50, 0.08)', color: '#D3AD32' }} /></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: '#6b7a8f' }}>{ann.expiryDate ? new Date(ann.expiryDate).toLocaleDateString() : 'Never'}</Typography></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title={ann.isPinned ? 'Unpin' : 'Pin'}>
                      <IconButton size="small" onClick={() => handleTogglePin(ann.id)} sx={{ color: ann.isPinned ? '#D3AD32' : '#6b7a8f' }}><PinIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="View"><IconButton size="small" onClick={() => { setSelectedAnnouncement(ann); setOpenDetailModal(true); }} sx={{ color: '#6b7a8f' }}><FaEye size={16} /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingAnnouncement(ann); setFormData({ title: ann.title, body: ann.body, announcementType: ann.announcementType, expiryDate: ann.expiryDate?.split('T')[0] || '', isPinned: ann.isPinned, targetCondo: ann.targetCondo === 'All Condos' ? 'ALL' : ann.targetCondo }); setOpenModal(true); }} sx={{ color: '#6b7a8f' }}><FaRegEdit size={16} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(ann.id)} sx={{ color: '#6b7a8f' }}><FaRegTrashAlt size={16} /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredAnnouncements.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </StyledTableContainer>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>{editingAnnouncement ? '✏️ Edit Announcement' : '📢 Create Announcement'}</DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{editingAnnouncement ? 'Update announcement' : 'Create a new system-wide announcement'}</Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            <TextField label="Body *" value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} fullWidth required multiline rows={4} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            <Grid container spacing={2}>
              <Grid item xs={6}><FormControl fullWidth><InputLabel>Type *</InputLabel><Select value={formData.announcementType} onChange={(e) => setFormData({...formData, announcementType: e.target.value})} label="Type *" sx={{ borderRadius: '10px', bgcolor: '#fff' }}><MenuItem value="general">General</MenuItem><MenuItem value="emergency">Emergency</MenuItem><MenuItem value="event">Event</MenuItem><MenuItem value="celebration">Celebration</MenuItem><MenuItem value="mourning">Mourning</MenuItem></Select></FormControl></Grid>
              <Grid item xs={6}><TextField label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
            </Grid>
            <FormControl fullWidth><InputLabel>Target Condo</InputLabel><Select value={formData.targetCondo} onChange={(e) => setFormData({...formData, targetCondo: e.target.value})} label="Target Condo" sx={{ borderRadius: '10px', bgcolor: '#fff' }}><MenuItem value="ALL">All Condos</MenuItem><MenuItem value="YEKONDO-001">YEKONDO-001</MenuItem><MenuItem value="SUNRISE-001">SUNRISE-001</MenuItem></Select></FormControl>
            <FormControlLabel control={<Switch checked={formData.isPinned} onChange={(e) => setFormData({...formData, isPinned: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#D3AD32' } }} />} label="Pin this announcement" />
            <Alert severity="info" sx={{ borderRadius: '10px' }}>This announcement will be sent to condo admins of the selected condominium(s).</Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 4 }}>{editingAnnouncement ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>Announcement Details</DialogTitle>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedAnnouncement && (
            <Box>
              {selectedAnnouncement.isPinned && <Chip icon={<PinIcon sx={{ fontSize: 14 }} />} label="Pinned" size="small" sx={{ backgroundColor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32', fontWeight: 600, mb: 2 }} />}
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>{selectedAnnouncement.title}</Typography>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 2 }}>{selectedAnnouncement.body}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Type</Typography><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedAnnouncement.announcementType}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Target</Typography><Chip label={selectedAnnouncement.targetCondo || 'All Condos'} size="small" sx={{ backgroundColor: 'rgba(211, 173, 50, 0.08)', color: '#D3AD32' }} /></Grid>
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography><Chip label={selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() ? 'Expired' : 'Active'} size="small" sx={{ backgroundColor: selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: selectedAnnouncement.expiryDate && new Date(selectedAnnouncement.expiryDate) < new Date() ? '#6b7280' : '#22c55e' }} /></Grid>
                {selectedAnnouncement.expiryDate && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expires</Typography><Typography variant="body2">{new Date(selectedAnnouncement.expiryDate).toLocaleDateString()}</Typography></Grid>}
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created</Typography><Typography variant="body2">{new Date(selectedAnnouncement.createdAt).toLocaleString()}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Created By</Typography><Typography variant="body2">{selectedAnnouncement.createdBy?.fullName} ({selectedAnnouncement.createdBy?.role})</Typography></Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}><Button onClick={() => setOpenDetailModal(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;