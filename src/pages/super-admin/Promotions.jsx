// src/pages/super-admin/Promotions.jsx
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
  CircularProgress,
  Avatar,
  Zoom,
  Tooltip,
  } from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Store as StoreIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MoneyIcon,
  
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { promotionService } from '../../services/promotionService';
import { api } from '../../api/axiosConfig';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye } from 'react-icons/fa';
import { MdOutlinePending, MdApproval } from 'react-icons/md';

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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(status === 'active' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  }),
  ...(status === 'pending' && {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  }),
  ...(status === 'approved' && {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  }),
  ...(status === 'rejected' && {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
  }),
  ...(status === 'expired' && {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
  }),
  ...(status === 'cancelled' && {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
  }),
}));

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [condos, setCondos] = useState([]);
  const [condosLoading, setCondosLoading] = useState(false);
  const [condoFilter, setCondoFilter] = useState('ALL');
  
  const fetchCondos = async () => {
    try {
      setCondosLoading(true);
      const res = await api.condos.getAll();
      setCondos(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching condos for promotions:', err);
    } finally {
      setCondosLoading(false);
    }
  };
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    expired: 0,
    rejected: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'shop',
    category: '',
    price: '',
    businessName: '',
    contactNumber: '',
    email: '',
    websiteUrl: '',
    expiresAt: '',
    image: null,
    targetCondos: ['ALL'],
  });
  const [reviewData, setReviewData] = useState({ 
    status: 'approved', 
    rejectionReason: '' 
  });

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { status: 'all', limit: 100 };
      if (condoFilter && condoFilter !== 'ALL' && condoFilter !== 'GLOBAL') {
        params.condoId = condoFilter;
      }
      const data = await promotionService.getAll(params);
      const items = data?.items || data || [];
      setPromotions(items);
      setTotalItems(items.length);
      const statsData = await promotionService.getStats(items);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, [condoFilter]);

  useEffect(() => { fetchCondos(); }, []);
  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || promo.type === typeFilter;
    const matchesStatus = statusFilter === '' || promo.status === statusFilter;
    const matchesCondo = condoFilter === 'ALL' ||
      (condoFilter === 'GLOBAL' && !promo.condoId) ||
      promo.condoId === condoFilter;
    return matchesSearch && matchesType && matchesStatus && matchesCondo;
  });

  const paginatedPromotions = filteredPromotions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.price || !formData.expiresAt) {
        toast.error('Title, price and expiry date are required');
        return;
      }
      if (!formData.targetCondos || formData.targetCondos.length === 0) {
        toast.error('Please select at least one condominium or All Condominiums');
        return;
      }
      const isGlobal = formData.targetCondos.includes('ALL');
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category || 'other',
        price: parseFloat(formData.price),
        businessName: formData.businessName || 'Business',
        contactNumber: formData.contactNumber || '0900000000',
        email: formData.email || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        expiresAt: formData.expiresAt?.includes('T') ? formData.expiresAt : new Date(formData.expiresAt + 'T23:59:59').toISOString(),
        condoIds: isGlobal ? ['ALL'] : formData.targetCondos,
        condoId: isGlobal ? null : formData.targetCondos[0],
      };
      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, payload);
        toast.success('Promotion updated successfully!');
      } else {
        await promotionService.create(payload);
        toast.success(
          isGlobal 
            ? 'Global promotion created successfully (visible across all condominiums)!'
            : `Promotion created for ${formData.targetCondos.length} condominium(s)!`
        );
      }
      setOpenModal(false);
      resetForm();
      await fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      const errorDetails = error.response?.data?.errors?.map(e => e.message).join(' | ');
      toast.error(errorDetails || error.response?.data?.message || 'Failed to save promotion');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await promotionService.delete(id);
      toast.success('Promotion deleted successfully!');
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error(error.response?.data?.message || 'Failed to delete promotion');
    }
  };

  const handleReview = async () => {
    if (!selectedPromotion) return;
    try {
      await promotionService.review(selectedPromotion.id, {
        status: reviewData.status,
        rejectionReason: reviewData.rejectionReason || undefined
      });
      toast.success(`Promotion ${reviewData.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setOpenReviewModal(false);
      await fetchPromotions();
    } catch (error) {
      console.error('Error reviewing promotion:', error);
      toast.error(error.response?.data?.message || 'Failed to review promotion');
    }
  };

  const resetForm = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      type: 'shop',
      category: '',
      price: '',
      businessName: '',
      contactNumber: '',
      email: '',
      websiteUrl: '',
      expiresAt: '',
      image: null,
      targetCondos: ['ALL'],
    });
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || 0}`;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Promotions Management</Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Manage all promotions and advertising campaigns</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenModal(true); }}
          sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '12px', px: 3 }}>
          Create Promotion
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography></Box>
              <Box className="stat-icon"><StoreIcon sx={{ color: '#6b7280', fontSize: 20 }} /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(211, 173, 50, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Value</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{formatCurrency(stats.totalRevenue)}</Typography></Box>
              <Box className="stat-icon"><MoneyIcon sx={{ color: '#D3AD32', fontSize: 20 }} /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(245, 158, 11, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Pending</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</Typography></Box>
              <Box className="stat-icon"><MdOutlinePending size={20} color="#f59e0b" /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Active</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.active}</Typography></Box>
              <Box className="stat-icon"><VerifiedIcon sx={{ color: '#22c55e', fontSize: 20 }} /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expired</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#6b7280' }}>{stats.expired}</Typography></Box>
              <Box className="stat-icon"><CancelIcon sx={{ color: '#6b7280', fontSize: 20 }} /></Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField fullWidth sx={{ flex: 1, minWidth: 200 }} placeholder="Search promotions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f' }} /></InputAdornment>, sx: { borderRadius: '10px' } }} size="small" />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type" sx={{ borderRadius: '10px' }}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" sx={{ borderRadius: '10px' }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Condominium</InputLabel>
            <Select disabled={condosLoading} value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} label="Filter by Condominium" sx={{ borderRadius: '10px' }}>
              <MenuItem value="ALL">All Condominiums</MenuItem>
              <MenuItem value="GLOBAL">Global (All Condominiums)</MenuItem>
              {condos.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.condoName} ({c.condoCode})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchPromotions}
            sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '10px' }}>
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Promotion</TableCell><TableCell>Condominium</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Type</TableCell>
              <TableCell>Price</TableCell><TableCell>Status</TableCell><TableCell>Views/Clicks</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPromotions.map((promo) => (
              <TableRow key={promo.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {promo.imageUrl ? <Avatar src={promo.imageUrl} variant="rounded" sx={{ width: 44, height: 44, borderRadius: '8px' }} />
                      : <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: 'rgba(107, 114, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon sx={{ color: '#6b7a8f', fontSize: 20 }} /></Box>}
                    <Box><Typography variant="body2" fontWeight={500}>{promo.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{promo.description?.substring(0, 40)}...</Typography></Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {promo.condo ? (
                    <Chip 
                      size="small" 
                      label={`${promo.condo.condoName} (${promo.condo.condoCode})`} 
                      sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 500 }} 
                    />
                  ) : (
                    <Chip 
                      size="small" 
                      label="All Condos (Global)" 
                      sx={{ bgcolor: 'rgba(211, 173, 50, 0.15)', color: '#D3AD32', fontWeight: 600 }} 
                    />
                  )}
                </TableCell>
                <TableCell><Box><Typography variant="body2">{promo.businessName}</Typography>
                <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{promo.contactNumber}</Typography></Box></TableCell>
                <TableCell><Chip label={promo.type} size="small" sx={{ backgroundColor: 'rgba(107, 114, 128, 0.08)', color: '#6b7280', textTransform: 'capitalize' }} /></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>{formatCurrency(promo.price)}</Typography></TableCell>
                <TableCell><StatusChip status={promo.status} label={promo.status} size="small" /></TableCell>
                <TableCell><Box sx={{ display: 'flex', gap: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><VisibilityIcon sx={{ fontSize: 14, color: '#6b7a8f' }} /><Typography variant="body2">{promo.views || 0}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TrendingUpIcon sx={{ fontSize: 14, color: '#6b7a8f' }} /><Typography variant="body2">{promo.clicks || 0}</Typography></Box></Box></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {promo.status === 'pending' && (
                      <Tooltip title="Review"><IconButton size="small" onClick={() => { setSelectedPromotion(promo); setReviewData({ status: 'approved', rejectionReason: '' }); setOpenReviewModal(true); }}
                        sx={{ color: '#f59e0b', '&:hover': { transform: 'scale(1.1)' } }}><MdApproval size={18} /></IconButton></Tooltip>)}
                    <Tooltip title="View"><IconButton size="small" onClick={() => { setSelectedPromotion(promo); setOpenDetailModal(true); }} sx={{ color: '#6b7a8f' }}><FaEye size={16} /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingPromotion(promo); setFormData({ title: promo.title, description: promo.description, type: promo.type, category: promo.category || '', price: promo.price, businessName: promo.businessName, contactNumber: promo.contactNumber, email: promo.email || '', websiteUrl: promo.websiteUrl || '', expiresAt: promo.expiresAt?.split('T')[0] || '', image: null, targetCondos: promo.condoId ? [promo.condoId] : ['ALL'] }); setOpenModal(true); }} sx={{ color: '#6b7a8f' }}><FaRegEdit size={16} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(promo.id)} sx={{ color: '#6b7a8f' }}><FaRegTrashAlt size={16} /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalItems || filteredPromotions.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </StyledTableContainer>

      {/* Create/Edit Modal */}
      <Dialog disableRestoreFocus  open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>{editingPromotion ? '✏️ Edit Promotion' : '📢 Create Promotion'}</DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{editingPromotion ? 'Update promotion details' : 'Add a new promotion campaign'}</Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            <TextField label="Description *" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} fullWidth required multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} />
            <Grid container spacing={2}>
              <Grid item xs={6}><FormControl fullWidth><InputLabel>Type *</InputLabel><Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} label="Type *" sx={{ borderRadius: '10px', bgcolor: '#fff' }}>
                <MenuItem value="shop">Shop</MenuItem><MenuItem value="technical">Technical</MenuItem><MenuItem value="service">Service</MenuItem>
                <MenuItem value="product">Product</MenuItem><MenuItem value="event">Event</MenuItem><MenuItem value="other">Other</MenuItem></Select></FormControl></Grid>
              <Grid item xs={6}><TextField label="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Price (ETB) *" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Expiry Date *" type="date" value={formData.expiresAt} onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} fullWidth required InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Business Name *" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Contact Number *" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={6}><TextField label="Website URL" value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }} /></Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="promo-target-condo-label">Target Condominium(s) *</InputLabel>
                  <Select
                    labelId="promo-target-condo-label"
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
                        return <Chip size="small" label="All Condominiums (Global Promotion)" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontWeight: 600 }} />;
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
                      <ListItemText primary="All Condominiums (Global Promotion)" secondary="Display across all condominiums" />
                    </MenuItem>
                    {condos.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={formData.targetCondos.includes('ALL') || formData.targetCondos.includes(c.id)} />
                        <ListItemText primary={`${c.condoName} (${c.condoCode})`} secondary={c.city || ''} />
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', mt: 0.5, display: 'block' }}>
                    Choose "All Condominiums" for a global campaign, or select specific condominiums.
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 4 }}>{editingPromotion ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog disableRestoreFocus  open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>Promotion Details</DialogTitle>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedPromotion && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 600, wordBreak: "break-word", overflowWrap: "anywhere" }}>{selectedPromotion.title}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" sx={{ color: '#6b7a8f' }}>Description</Typography><Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}><Typography variant="body2" sx={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-line" }}>{selectedPromotion.description}</Typography></Paper></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Type</Typography><Chip label={selectedPromotion.type} size="small" sx={{ textTransform: 'capitalize' }} /></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography><StatusChip status={selectedPromotion.status} label={selectedPromotion.status} size="small" /></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Price</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>{formatCurrency(selectedPromotion.price)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expires</Typography><Typography variant="body2">{new Date(selectedPromotion.expiresAt).toLocaleDateString()}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Business Information</Typography><Paper sx={{ p: 2, bgcolor: '#fff', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" fontWeight={500} sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{selectedPromotion.businessName}</Typography>
                <Typography variant="body2" sx={{ color: '#6b7a8f' }}>{selectedPromotion.contactNumber}</Typography>
                {selectedPromotion.email && <Typography variant="body2" sx={{ color: '#6b7a8f' }}>{selectedPromotion.email}</Typography>}
                {selectedPromotion.websiteUrl && <Typography variant="body2" sx={{ color: '#3b82f6', wordBreak: "break-all", overflowWrap: "anywhere" }}>{selectedPromotion.websiteUrl}</Typography>}
              </Paper></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Views</Typography><Typography variant="body2">{selectedPromotion.views || 0}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Clicks</Typography><Typography variant="body2">{selectedPromotion.clicks || 0}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenDetailModal(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Review Modal */}
      <Dialog disableRestoreFocus  open={openReviewModal} onClose={() => setOpenReviewModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <DialogTitle sx={{ fontWeight: 700 }}>Review Promotion</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 2 }}>Review: <strong>{selectedPromotion?.title}</strong></Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Decision *</InputLabel>
              <Select value={reviewData.status} onChange={(e) => setReviewData({...reviewData, status: e.target.value})} label="Decision *" sx={{ borderRadius: '10px' }}>
                <MenuItem value="approved">Approve</MenuItem><MenuItem value="rejected">Reject</MenuItem>
              </Select>
            </FormControl>
            {reviewData.status === 'rejected' && (
              <TextField label="Rejection Reason *" value={reviewData.rejectionReason} onChange={(e) => setReviewData({...reviewData, rejectionReason: e.target.value})} multiline rows={3} fullWidth required placeholder="Provide reason for rejection..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#D3AD32' } } }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setOpenReviewModal(false)}>Cancel</Button>
          <Button onClick={handleReview} variant="contained" sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none' }}>Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Promotions;