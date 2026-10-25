// src/pages/super-admin/Announcements.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Checkbox,
  ListItemText,
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
  Warning as WarningIcon,
  Celebration as CelebrationIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { announcementService } from '../../services/announcementService';
import { api } from '../../api/axiosConfig';
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

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [condoFilter, setCondoFilter] = useState('ALL');
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
    targetCondos: ['ALL'],
  });

  const [condos, setCondos] = useState([]);
  const [condosLoading, setCondosLoading] = useState(false);
  const [condosError, setCondosError] = useState(null);

  const fetchCondos = async () => {
    try {
      setCondosLoading(true);
      setCondosError(null);
      const res = await api.condos.getAll();
      const list = res.data?.data || [];
      setCondos(list);
    } catch (err) {
      console.error('Error fetching condos:', err);
      setCondosError('Failed to load condominiums');
    } finally {
      setCondosLoading(false);
    }
  };

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (condoFilter && condoFilter !== 'ALL') {
        params.condoId = condoFilter;
      }
      const data = await announcementService.getAll(params);
      const items = data?.items || data || [];
      setAnnouncements(items);
      setTotalItems(items.length);
      const statsData = await announcementService.getStats(items);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, [condoFilter]);

  useEffect(() => {
    fetchCondos();
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ann.body?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || ann.announcementType === typeFilter;
    const matchesCondo = condoFilter === 'ALL' || ann.condoId === condoFilter;
    return matchesSearch && matchesType && matchesCondo;
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSubmit = async () => {
    try {
      if (!formData.title?.trim() || !formData.body?.trim()) {
        toast.error('Title and body are required');
        return;
      }
      if (!formData.targetCondos || formData.targetCondos.length === 0) {
        toast.error('Please select at least one target condominium');
        return;
      }
      
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        announcementType: formData.announcementType,
        isPinned: formData.isPinned,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        condoIds: formData.targetCondos,
        condoId: formData.targetCondos[0] === 'ALL' ? (condos[0]?.id || null) : formData.targetCondos[0]
      };

      if (editingAnnouncement) {
        await announcementService.update(editingAnnouncement.id, {
          title: payload.title,
          body: payload.body,
          announcementType: payload.announcementType,
          isPinned: payload.isPinned,
          expiryDate: payload.expiryDate,
          condoId: payload.condoId
        });
        toast.success('Announcement updated successfully!');
      } else {
        await announcementService.create(payload);
        toast.success(
          formData.targetCondos.includes('ALL')
            ? 'Announcement broadcast to all condominiums!'
            : `Announcement posted to ${formData.targetCondos.length} condominium(s)!`
        );
      }
      setOpenModal(false);
      resetForm();
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      toast.success('Announcement deleted!');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const target = announcements.find(a => a.id === id);
      const newPinned = !target?.isPinned;
      await announcementService.update(id, { isPinned: newPinned });
      toast.success(newPinned ? 'Pinned!' : 'Unpinned!');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to toggle pin');
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({ 
      title: '', 
      body: '', 
      announcementType: 'general', 
      expiryDate: '', 
      isPinned: false, 
      targetCondos: ['ALL'] 
    });
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
      case 'emergency': return 'rgba(239, 68, 68, 0.1)';
      case 'event': return 'rgba(59, 130, 246, 0.1)';
      case 'celebration': return 'rgba(34, 197, 94, 0.1)';
      case 'mourning': return 'rgba(107, 114, 128, 0.1)';
      default: return 'rgba(211, 173, 50, 0.1)';
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography sx={{ color: '#D3AD32' }}>Loading announcements...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            System Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Publish and manage announcements across all condominiums
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchAnnouncements(); fetchCondos(); }}
            sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#d1d5db', color: '#1a1a2e' }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { resetForm(); setOpenModal(true); }}
            sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: '12px', px: 3 }}
          >
            Create Announcement
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><StatsCard color="rgba(107, 114, 128, 0.1)"><CardContent sx={{ p: 2 }}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.total}</Typography></CardContent></StatsCard></Grid>
        <Grid item xs={6} sm={3}><StatsCard color="rgba(211, 173, 50, 0.1)"><CardContent sx={{ p: 2 }}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Pinned</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#D3AD32' }}>{stats.pinned}</Typography></CardContent></StatsCard></Grid>
        <Grid item xs={6} sm={3}><StatsCard color="rgba(34, 197, 94, 0.1)"><CardContent sx={{ p: 2 }}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Active</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.active}</Typography></CardContent></StatsCard></Grid>
        <Grid item xs={6} sm={3}><StatsCard color="rgba(239, 68, 68, 0.1)"><CardContent sx={{ p: 2 }}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expired</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>{stats.expired}</Typography></CardContent></StatsCard></Grid>
      </Grid>

      {/* Filter Bar with Condominium selector */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by title or body..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f' }} /></InputAdornment>, sx: { borderRadius: '10px' } }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Filter by Type" sx={{ borderRadius: '10px' }}>
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="celebration">Celebration</MenuItem>
              <MenuItem value="mourning">Mourning</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Condominium</InputLabel>
            <Select value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} label="Filter by Condominium" sx={{ borderRadius: '10px' }}>
              <MenuItem value="ALL">All Condominiums</MenuItem>
              {condos.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.condoName} ({c.condoCode})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Condominium</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAnnouncements.length > 0 ? (
              paginatedAnnouncements.map((ann) => (
                <TableRow key={ann.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {ann.isPinned && <PinIcon sx={{ fontSize: 14, color: '#D3AD32' }} />}
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{ann.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{ann.body?.substring(0, 50)}...</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip icon={getTypeIcon(ann.announcementType)} label={ann.announcementType} size="small" sx={{ backgroundColor: getTypeColor(ann.announcementType), fontWeight: 500, textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<ApartmentIcon sx={{ fontSize: 14 }} />}
                      label={ann.condo?.condoName || 'Target Condo'} 
                      size="small" 
                      sx={{ backgroundColor: 'rgba(211, 173, 50, 0.08)', color: '#D3AD32', fontWeight: 500 }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={ann.expiryDate && new Date(ann.expiryDate) < new Date() ? 'Expired' : 'Active'} size="small" sx={{ backgroundColor: ann.expiryDate && new Date(ann.expiryDate) < new Date() ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: ann.expiryDate && new Date(ann.expiryDate) < new Date() ? '#6b7280' : '#22c55e', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6b7a8f' }}>{ann.expiryDate ? new Date(ann.expiryDate).toLocaleDateString() : 'Never'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={ann.isPinned ? 'Unpin' : 'Pin'}>
                        <IconButton size="small" onClick={() => handleTogglePin(ann.id)} sx={{ color: ann.isPinned ? '#D3AD32' : '#6b7a8f' }}>
                          <PinIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedAnnouncement(ann); setOpenDetailModal(true); }} sx={{ color: '#6b7a8f' }}>
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
                              isPinned: !!ann.isPinned, 
                              targetCondos: ann.condoId ? [ann.condoId] : ['ALL'] 
                            }); 
                            setOpenModal(true); 
                          }} 
                          sx={{ color: '#6b7a8f' }}
                        >
                          <FaRegEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(ann.id)} sx={{ color: '#ef4444' }}>
                          <FaRegTrashAlt size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="#6b7a8f">No announcements found matching the criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalItems || filteredAnnouncements.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </StyledTableContainer>

      {/* Create/Edit Modal with REAL Dynamic Condominium Selector */}
      <Dialog disableRestoreFocus open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>{editingAnnouncement ? '✏️ Edit Announcement' : '📢 Create Announcement'}</DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{editingAnnouncement ? 'Update announcement' : 'Publish an announcement to a condominium'}</Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            <TextField label="Body *" value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} fullWidth required multiline rows={4} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type *</InputLabel>
                  <Select value={formData.announcementType} onChange={(e) => setFormData({...formData, announcementType: e.target.value})} label="Type *" sx={{ borderRadius: '10px', bgcolor: '#fff' }}>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="celebration">Celebration</MenuItem>
                    <MenuItem value="mourning">Mourning</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
              </Grid>
            </Grid>

            {/* Dynamic Multi-Condominium Selector */}
              <FormControl fullWidth required>
                <InputLabel id="target-condo-multiselect-label">Target Condominium(s) *</InputLabel>
                <Select
                  labelId="target-condo-multiselect-label"
                  multiple
                  value={formData.targetCondos || ['ALL']}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes('ALL') && !formData.targetCondos.includes('ALL')) {
                      setFormData({ ...formData, targetCondos: ['ALL'] });
                    } else if (formData.targetCondos.includes('ALL')) {
                      const withoutAll = val.filter(v => v !== 'ALL');
                      setFormData({ ...formData, targetCondos: withoutAll.length > 0 ? withoutAll : ['ALL'] });
                    } else {
                      setFormData({ ...formData, targetCondos: typeof val === 'string' ? val.split(',') : val });
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.includes('ALL')) {
                      return <Chip size="small" label="All Condominiums (Broadcast)" sx={{ bgcolor: 'rgba(211, 173, 50, 0.15)', color: '#D3AD32', fontWeight: 600 }} />;
                    }
                    if (selected.length === 0) {
                      return <em>Select Condominium(s)</em>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((cId) => {
                          const c = condos.find(item => item.id === cId);
                          return (
                            <Chip
                              key={cId}
                              size="small"
                              label={c ? `${c.condoName} (${c.condoCode})` : cId}
                              sx={{ bgcolor: 'rgba(26, 26, 46, 0.08)', fontWeight: 500 }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                  label="Target Condominium(s) *"
                  sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                >
                  <MenuItem value="ALL">
                    <Checkbox checked={formData.targetCondos.includes('ALL')} />
                    <ListItemText primary="All Condominiums (Broadcast to All)" secondary="Deliver to all registered condominiums" />
                  </MenuItem>
                  {condosLoading ? (
                    <MenuItem disabled value="">Loading condominiums...</MenuItem>
                  ) : condos.length === 0 ? (
                    <MenuItem disabled value="">No condominiums available</MenuItem>
                  ) : (
                    condos.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={formData.targetCondos.includes('ALL') || formData.targetCondos.includes(c.id)} />
                        <ListItemText primary={`${c.condoName} (${c.condoCode})`} secondary={c.city || ''} />
                      </MenuItem>
                    ))
                  )}
                </Select>
                {condosError && (
                  <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="error">{condosError}</Typography>
                    <Button size="small" onClick={fetchCondos} sx={{ fontSize: '0.7rem', p: 0 }}>Retry</Button>
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: '#6b7a8f', mt: 0.5, display: 'block' }}>
                  Select one or more condominiums to target, or choose "All Condominiums" to broadcast system-wide.
                </Typography>
              </FormControl>

            <FormControlLabel control={<Switch checked={formData.isPinned} onChange={(e) => setFormData({...formData, isPinned: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#D3AD32' } }} />} label="Pin this announcement" />
            <Alert severity="info" sx={{ borderRadius: '10px' }}>This announcement will be delivered immediately to residents of the selected condominium.</Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 4 }}>{editingAnnouncement ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog disableRestoreFocus open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom}>
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
                <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Condominium</Typography><Chip label={selectedAnnouncement.condo?.condoName || 'Target Condo'} size="small" sx={{ backgroundColor: 'rgba(211, 173, 50, 0.08)', color: '#D3AD32' }} /></Grid>
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
