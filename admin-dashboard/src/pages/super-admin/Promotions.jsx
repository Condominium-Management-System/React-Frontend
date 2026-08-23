// src/pages/super-admin/Promotions.jsx
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
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
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

// Mock Data
const MOCK_PROMOTIONS = [
  {
    id: '1',
    title: 'Amazing Phone Deal',
    description: 'Get 30% off on all smartphones this week! Limited time offer.',
    type: 'shop',
    category: 'electronics',
    price: 500,
    businessName: 'Tech Store Ethiopia',
    contactNumber: '0912345678',
    email: 'info@techstore.com',
    websiteUrl: 'https://techstore.com',
    imageUrl: null,
    status: 'active',
    views: 150,
    clicks: 45,
    expiresAt: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-08-20T10:00:00.000Z',
    postedBy: { fullName: 'Super Admin' },
    condo: { condoName: 'All Condos', condoCode: 'GLOBAL' },
  },
  {
    id: '2',
    title: 'New Furniture Collection',
    description: 'Modern furniture for your home. 20% discount for condo residents.',
    type: 'shop',
    category: 'furniture',
    price: 300,
    businessName: 'Furniture Hub',
    contactNumber: '0923456789',
    email: 'info@furniturehub.com',
    websiteUrl: null,
    imageUrl: null,
    status: 'pending',
    views: 0,
    clicks: 0,
    expiresAt: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-08-21T14:00:00.000Z',
    postedBy: { fullName: 'Admin User' },
    condo: { condoName: 'Ye Kondominium 01', condoCode: 'YEKONDO-001' },
  },
  {
    id: '3',
    title: 'Kitchen Appliances Sale',
    description: 'Get the best kitchen appliances at unbeatable prices.',
    type: 'product',
    category: 'appliances',
    price: 1000,
    businessName: 'Appliance World',
    contactNumber: '0934567890',
    email: 'info@applianceworld.com',
    websiteUrl: 'https://applianceworld.com',
    imageUrl: null,
    status: 'approved',
    views: 80,
    clicks: 20,
    expiresAt: '2026-11-30T00:00:00.000Z',
    createdAt: '2026-08-19T09:00:00.000Z',
    postedBy: { fullName: 'Super Admin' },
    condo: { condoName: 'Sunrise Condominium', condoCode: 'SUNRISE-001' },
  },
  {
    id: '4',
    title: 'Laptop Discount',
    description: 'Special discount on all laptops for condo residents.',
    type: 'technical',
    category: 'electronics',
    price: 200,
    businessName: 'PC World',
    contactNumber: '0945678901',
    email: 'info@pcworld.com',
    websiteUrl: null,
    imageUrl: null,
    status: 'rejected',
    views: 0,
    clicks: 0,
    expiresAt: '2026-10-15T00:00:00.000Z',
    createdAt: '2026-08-18T16:00:00.000Z',
    postedBy: { fullName: 'Admin User' },
    condo: { condoName: 'Green Valley Towers', condoCode: 'GV-002' },
  },
  {
    id: '5',
    title: 'Home Cleaning Service',
    description: 'Professional home cleaning services at special rates.',
    type: 'service',
    category: 'services',
    price: 150,
    businessName: 'Clean Home',
    contactNumber: '0956789012',
    email: 'info@cleanhome.com',
    websiteUrl: 'https://cleanhome.com',
    imageUrl: null,
    status: 'expired',
    views: 200,
    clicks: 60,
    expiresAt: '2026-08-01T00:00:00.000Z',
    createdAt: '2026-07-15T11:00:00.000Z',
    postedBy: { fullName: 'Super Admin' },
    condo: { condoName: 'All Condos', condoCode: 'GLOBAL' },
  },
];

const Promotions = () => {
  const theme = useTheme();
  
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
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
  });
  const [reviewData, setReviewData] = useState({ 
    status: 'approved', 
    rejectionReason: '' 
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPromotions(MOCK_PROMOTIONS);
      setTotalItems(MOCK_PROMOTIONS.length);
      
      const statsData = {
        total: MOCK_PROMOTIONS.length,
        pending: MOCK_PROMOTIONS.filter(p => p.status === 'pending').length,
        approved: MOCK_PROMOTIONS.filter(p => p.status === 'approved').length,
        active: MOCK_PROMOTIONS.filter(p => p.status === 'active').length,
        expired: MOCK_PROMOTIONS.filter(p => p.status === 'expired').length,
        rejected: MOCK_PROMOTIONS.filter(p => p.status === 'rejected').length,
        cancelled: MOCK_PROMOTIONS.filter(p => p.status === 'cancelled').length,
        totalRevenue: MOCK_PROMOTIONS.reduce((sum, p) => sum + (p.price || 0), 0),
      };
      setStats(statsData);
      
      
    } catch (error) {
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || promo.type === typeFilter;
    const matchesStatus = statusFilter === '' || promo.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedPromotions = filteredPromotions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSubmit = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPromotion = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        price: parseFloat(formData.price),
        businessName: formData.businessName,
        contactNumber: formData.contactNumber,
        email: formData.email || null,
        websiteUrl: formData.websiteUrl || null,
        imageUrl: null,
        status: 'pending',
        views: 0,
        clicks: 0,
        expiresAt: new Date(formData.expiresAt).toISOString(),
        createdAt: new Date().toISOString(),
        postedBy: { fullName: 'Super Admin' },
        condo: { condoName: 'All Condos', condoCode: 'GLOBAL' },
      };
      
      if (editingPromotion) {
        const updated = promotions.map(p => p.id === editingPromotion.id ? { ...p, ...newPromotion } : p);
        setPromotions(updated);
        toast.success('Promotion updated!');
      } else {
        setPromotions([newPromotion, ...promotions]);
        toast.success('Promotion created!');
      }
      setOpenModal(false);
      resetForm();
      fetchPromotions();
    } catch (error) {
      toast.error('Failed to save promotion');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPromotions(promotions.filter(p => p.id !== id));
      toast.success('Promotion deleted!');
      fetchPromotions();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleReview = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = promotions.map(p => 
        p.id === selectedPromotion.id 
          ? { ...p, status: reviewData.status, rejectionReason: reviewData.rejectionReason || null }
          : p
      );
      setPromotions(updated);
      toast.success(`Promotion ${reviewData.status === 'approved' ? 'approved' : 'rejected'}!`);
      setOpenReviewModal(false);
      fetchPromotions();
    } catch (error) { toast.error('Failed to review'); }
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
              <Box><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Revenue</Typography>
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth placeholder="Search promotions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f' }} /></InputAdornment>, sx: { borderRadius: '10px' } }} size="small" />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type" sx={{ borderRadius: '10px' }}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="shop">Shop</MenuItem><MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="service">Service</MenuItem><MenuItem value="product">Product</MenuItem>
              <MenuItem value="event">Event</MenuItem><MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" sx={{ borderRadius: '10px' }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem><MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="active">Active</MenuItem><MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem>
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
              <TableCell>Promotion</TableCell><TableCell>Business</TableCell><TableCell>Type</TableCell>
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
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingPromotion(promo); setFormData({ title: promo.title, description: promo.description, type: promo.type, category: promo.category || '', price: promo.price, businessName: promo.businessName, contactNumber: promo.contactNumber, email: promo.email || '', websiteUrl: promo.websiteUrl || '', expiresAt: promo.expiresAt?.split('T')[0] || '', image: null }); setOpenModal(true); }} sx={{ color: '#6b7a8f' }}><FaRegEdit size={16} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(promo.id)} sx={{ color: '#6b7a8f' }}><FaRegTrashAlt size={16} /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredPromotions.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </StyledTableContainer>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
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
                <Box sx={{ border: '2px dashed #d1d5db', borderRadius: '10px', p: 2, textAlign: 'center', cursor: 'pointer', bgcolor: '#fff' }}>
                  <UploadIcon sx={{ fontSize: 30, color: '#6b7a8f', mb: 1 }} />
                  <Typography variant="body2" color="#6b7a8f">Click to upload promotion image</Typography>
                </Box>
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
      <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>Promotion Details</DialogTitle>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedPromotion && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedPromotion.title}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" sx={{ color: '#6b7a8f' }}>Description</Typography><Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}><Typography variant="body2">{selectedPromotion.description}</Typography></Paper></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Type</Typography><Chip label={selectedPromotion.type} size="small" sx={{ textTransform: 'capitalize' }} /></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography><StatusChip status={selectedPromotion.status} label={selectedPromotion.status} size="small" /></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Price</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: '#D3AD32' }}>{formatCurrency(selectedPromotion.price)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Expires</Typography><Typography variant="body2">{new Date(selectedPromotion.expiresAt).toLocaleDateString()}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Business Information</Typography><Paper sx={{ p: 2, bgcolor: '#fff', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" fontWeight={500}>{selectedPromotion.businessName}</Typography>
                <Typography variant="body2" sx={{ color: '#6b7a8f' }}>{selectedPromotion.contactNumber}</Typography>
                {selectedPromotion.email && <Typography variant="body2" sx={{ color: '#6b7a8f' }}>{selectedPromotion.email}</Typography>}
                {selectedPromotion.websiteUrl && <Typography variant="body2" sx={{ color: '#3b82f6' }}>{selectedPromotion.websiteUrl}</Typography>}
              </Paper></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Views</Typography><Typography variant="body2">{selectedPromotion.views || 0}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Clicks</Typography><Typography variant="body2">{selectedPromotion.clicks || 0}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenDetailModal(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={openReviewModal} onClose={() => setOpenReviewModal(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
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