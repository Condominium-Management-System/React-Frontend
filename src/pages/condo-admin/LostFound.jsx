// src/pages/condo-admin/LostFound.jsx
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
  Image as ImageIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye, FaCheck } from 'react-icons/fa';

// Styled Components with Shadows
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
  cursor: 'pointer',
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

const TypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(type === 'lost' && {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
  }),
  ...(type === 'found' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  }),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  borderRadius: '20px',
  ...(status === 'open' && {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  }),
  ...(status === 'matched' && {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  }),
  ...(status === 'claimed' && {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  }),
  ...(status === 'archived' && {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
  }),
}));

// Mock Data
const MOCK_ITEMS = [
  {
    id: '1',
    type: 'lost',
    itemName: 'Black Leather Wallet',
    description: 'Lost my black leather wallet near the main gate. Contains ID card and some cash.',
    category: 'other',
    location: 'Main Gate Area',
    dateLostFound: '2026-08-20T10:30:00.000Z',
    status: 'open',
    photoUrl: null,
    user: { fullName: 'Abebe Kebede', email: 'abebe@example.com', phoneNumber: '0912345678' },
    createdAt: '2026-08-20T10:30:00.000Z',
  },
  {
    id: '2',
    type: 'found',
    itemName: 'iPhone 14 Pro',
    description: 'Found an iPhone 14 Pro in the parking lot. It has a blue case.',
    category: 'electronics',
    location: 'Parking Lot B',
    dateLostFound: '2026-08-19T14:20:00.000Z',
    status: 'matched',
    photoUrl: null,
    user: { fullName: 'Meron Tesfaye', email: 'meron@example.com', phoneNumber: '0923456789' },
    claimedBy: { fullName: 'Tigist Worku', email: 'tigist@example.com' },
    createdAt: '2026-08-19T14:20:00.000Z',
  },
  {
    id: '3',
    type: 'lost',
    itemName: 'Blue Umbrella',
    description: 'Lost my blue umbrella in the lobby. It has a wooden handle.',
    category: 'other',
    location: 'Main Lobby',
    dateLostFound: '2026-08-18T09:00:00.000Z',
    status: 'claimed',
    photoUrl: null,
    user: { fullName: 'Dawit Hailu', email: 'dawit@example.com', phoneNumber: '0934567890' },
    claimedBy: { fullName: 'Biruk Ayele', email: 'biruk@example.com' },
    verifiedBy: { fullName: 'Admin User' },
    createdAt: '2026-08-18T09:00:00.000Z',
  },
  {
    id: '4',
    type: 'found',
    itemName: 'Set of Keys',
    description: 'Found a set of keys near the elevator on the 3rd floor.',
    category: 'keys',
    location: '3rd Floor Elevator',
    dateLostFound: '2026-08-17T13:45:00.000Z',
    status: 'open',
    photoUrl: null,
    user: { fullName: 'Tigist Worku', email: 'tigist@example.com', phoneNumber: '0945678901' },
    createdAt: '2026-08-17T13:45:00.000Z',
  },
  {
    id: '5',
    type: 'lost',
    itemName: 'Gold Ring',
    description: 'Lost my gold ring with a small diamond. Very sentimental value.',
    category: 'jewelry',
    location: 'Swimming Pool Area',
    dateLostFound: '2026-08-16T22:15:00.000Z',
    status: 'archived',
    photoUrl: null,
    user: { fullName: 'Biruk Ayele', email: 'biruk@example.com', phoneNumber: '0956789012' },
    createdAt: '2026-08-16T22:15:00.000Z',
  },
];

const LostFound = () => {
  const theme = useTheme();
  
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    open: 0,
    matched: 0,
    claimed: 0,
    archived: 0,
  });
  
  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    type: 'lost',
    itemName: '',
    description: '',
    category: 'other',
    location: '',
    dateLostFound: '',
    photo: null,
  });

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setItems(MOCK_ITEMS);
      setTotalItems(MOCK_ITEMS.length);
      
      // Calculate stats
      setStats({
        total: MOCK_ITEMS.length,
        lost: MOCK_ITEMS.filter(i => i.type === 'lost').length,
        found: MOCK_ITEMS.filter(i => i.type === 'found').length,
        open: MOCK_ITEMS.filter(i => i.status === 'open').length,
        matched: MOCK_ITEMS.filter(i => i.status === 'matched').length,
        claimed: MOCK_ITEMS.filter(i => i.status === 'claimed').length,
        archived: MOCK_ITEMS.filter(i => i.status === 'archived').length,
      });
      
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      toast.error('Failed to fetch lost & found items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const paginatedItems = filteredItems.slice(
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
      
      const newItem = {
        id: Date.now().toString(),
        type: formData.type,
        itemName: formData.itemName,
        description: formData.description,
        category: formData.category,
        location: formData.location || null,
        dateLostFound: formData.dateLostFound || new Date().toISOString(),
        status: 'open',
        photoUrl: formData.photo ? URL.createObjectURL(formData.photo) : null,
        user: { fullName: 'Admin User' },
        createdAt: new Date().toISOString(),
      };
      
      if (editingItem) {
        const updated = items.map(i => 
          i.id === editingItem.id ? { ...i, ...newItem } : i
        );
        setItems(updated);
        toast.success('Item updated successfully!');
      } else {
        setItems([newItem, ...items]);
        toast.success('Item posted successfully!');
      }
      
      setOpenModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  // Handle verify claim
  const handleVerifyClaim = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = items.map(i => 
        i.id === id ? { ...i, status: 'claimed', verifiedBy: { fullName: 'Admin User' } } : i
      );
      setItems(updated);
      toast.success('Claim verified successfully!');
      fetchItems();
    } catch (error) {
      toast.error('Failed to verify claim');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      type: 'lost',
      itemName: '',
      description: '',
      category: 'other',
      location: '',
      dateLostFound: '',
      photo: null,
    });
    setSelectedImage(null);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, photo: file});
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      electronics: '#3b82f6',
      documents: '#8b5cf6',
      keys: '#f59e0b',
      clothing: '#ec4899',
      jewelry: '#d946ef',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
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
            Lost & Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage lost and found items in your condominium
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
          Post New Item
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
                  <ImageIcon sx={{ color: '#6b7280', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Lost</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{stats.lost}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(220, 38, 38, 0.1)' }}>
                  <CancelIcon sx={{ color: '#dc2626', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Found</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.found}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Matched</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.matched}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <VerifiedIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatsCard color="rgba(139, 92, 246, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Claimed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{stats.claimed}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <VerifiedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, description or location..."
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
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
              <MenuItem value="found">Found</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="matched">Matched</MenuItem>
              <MenuItem value="claimed">Claimed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {item.photoUrl ? (
                      <Avatar 
                        src={item.photoUrl} 
                        variant="rounded" 
                        sx={{ width: 44, height: 44, borderRadius: '8px' }}
                      />
                    ) : (
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '8px', 
                        bgcolor: 'rgba(107, 114, 128, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <ImageIcon sx={{ color: '#6b7a8f', fontSize: 20 }} />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                        {item.itemName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                        {item.description?.substring(0, 40)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <TypeChip type={item.type} label={item.type.toUpperCase()} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.category}
                    size="small"
                    sx={{
                      backgroundColor: `${getCategoryColor(item.category)}15`,
                      color: getCategoryColor(item.category),
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: '#6b7a8f' }} />
                    <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                      {item.location || '—'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip status={item.status} label={item.status} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#6b7a8f', fontSize: '0.75rem' }}>
                    {new Date(item.dateLostFound).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {item.status === 'matched' && (
                      <Tooltip title="Verify Claim">
                        <IconButton
                          size="small"
                          onClick={() => handleVerifyClaim(item.id)}
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
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(item);
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
                          setEditingItem(item);
                          setFormData({
                            type: item.type,
                            itemName: item.itemName,
                            description: item.description,
                            category: item.category,
                            location: item.location || '',
                            dateLostFound: item.dateLostFound?.split('T')[0] || '',
                            photo: null,
                          });
                          setSelectedImage(item.photoUrl);
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
                        onClick={() => handleDelete(item.id)}
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
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ImageIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No items found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search' : 'Post a new lost or found item'}
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
          count={filteredItems.length}
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
            {editingItem ? '✏️ Edit Item' : '📝 Post New Item'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingItem ? 'Update lost or found item details' : 'Add a new lost or found item'}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type *</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    label="Type *"
                    sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                  >
                    <MenuItem value="lost">Lost</MenuItem>
                    <MenuItem value="found">Found</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    label="Category *"
                    sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                  >
                    <MenuItem value="electronics">Electronics</MenuItem>
                    <MenuItem value="documents">Documents</MenuItem>
                    <MenuItem value="keys">Keys</MenuItem>
                    <MenuItem value="clothing">Clothing</MenuItem>
                    <MenuItem value="jewelry">Jewelry</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Item Name *"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
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
              label="Description *"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              fullWidth
              required
              multiline
              rows={3}
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
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  fullWidth
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
                  label="Date *"
                  type="date"
                  value={formData.dateLostFound}
                  onChange={(e) => setFormData({...formData, dateLostFound: e.target.value})}
                  fullWidth
                  required
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
            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <Box sx={{ 
                  border: '2px dashed #d1d5db', 
                  borderRadius: '10px', 
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: '#fff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#D3AD32',
                    bgcolor: 'rgba(211, 173, 50, 0.02)',
                  }
                }}>
                  {selectedImage ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img src={selectedImage} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                      <Typography variant="body2" color="#6b7a8f">Click to change image</Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedImage(null); 
                          setFormData({...formData, photo: null}); 
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <UploadIcon sx={{ fontSize: 30, color: '#6b7a8f', mb: 1 }} />
                      <Typography variant="body2" color="#6b7a8f">Click to upload image</Typography>
                    </Box>
                  )}
                </Box>
              </label>
            </Box>
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
            {editingItem ? 'Update' : 'Post'}
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
            Item Details
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            View complete item information
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          {selectedItem && (
            <Box>
              {selectedItem.photoUrl && (
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={selectedItem.photoUrl} 
                    alt={selectedItem.itemName} 
                    style={{ 
                      width: '100%', 
                      maxHeight: 250, 
                      objectFit: 'cover', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }} 
                  />
                </Box>
              )}
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                {selectedItem.itemName}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Type</Typography>
                  <TypeChip type={selectedItem.type} label={selectedItem.type.toUpperCase()} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Status</Typography>
                  <StatusChip status={selectedItem.status} label={selectedItem.status} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Description</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px', mt: 0.5 }}>
                    <Typography variant="body2">{selectedItem.description}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Category</Typography>
                  <Chip 
                    label={selectedItem.category}
                    size="small"
                    sx={{
                      backgroundColor: `${getCategoryColor(selectedItem.category)}15`,
                      color: getCategoryColor(selectedItem.category),
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      mt: 0.5,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Location</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedItem.location || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Date Lost/Found</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {new Date(selectedItem.dateLostFound).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Reported By</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedItem.user?.fullName || 'Unknown'}
                  </Typography>
                </Grid>
                {selectedItem.claimedBy && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Claim Information</Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Claimed By</Typography>
                        <Typography variant="body2">{selectedItem.claimedBy.fullName}</Typography>
                      </Grid>
                      {selectedItem.verifiedBy && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Verified By</Typography>
                          <Typography variant="body2">{selectedItem.verifiedBy.fullName}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}
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

export default LostFound;