// src/pages/condo-admin/LostFound.jsx
import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  SearchOff as SearchOffIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import ItemTelegramChatModal from '../../components/chat/ItemTelegramChatModal';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaEye, FaCheck } from 'react-icons/fa';
import { lostFoundService } from '../../services/lostFoundService';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

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
  height: 24,
  borderRadius: '6px',
  ...(type === 'lost' && {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
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

const LostFound = () => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  
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

  // Chat Modal State
  const [openChatModal, setOpenChatModal] = useState(false);
  const [chatItem, setChatItem] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Fetch items from real API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await lostFoundService.getAll({ limit: 100 });
      const itemsData = res?.items || res || [];
      
      setItems(itemsData);
      setTotalItems(itemsData.length);
      
      const statsData = await lostFoundService.getStats(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch lost & found items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (openChatModal) {
      scrollToBottom();
    }
  }, [chatMessages, openChatModal]);

  // Open Chat for an Item
  const handleOpenItemChat = (item) => {
    if (!item) return;
    setChatItem(item);
    setOpenChatModal(true);
  };

  // Send Chat Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !chatItem || !chatPartner) return;

    const content = chatInput.trim();
    setChatInput('');

    try {
      const newMsg = await chatService.sendMessage({
        receiverId: chatPartner.id,
        lostFoundId: chatItem.id,
        content: content,
        type: 'message'
      });

      setChatMessages(prev => [...prev, newMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setChatInput(content); // Restore input on error
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const paginatedItems = filteredItems.slice(
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

  // Handle submit (Create or Update)
  const handleSubmit = async () => {
    try {
      if (!formData.itemName || !formData.description) {
        toast.error('Item name and description are required');
        return;
      }

      const payload = {
        type: formData.type,
        itemName: formData.itemName,
        description: formData.description,
        category: formData.category,
        location: formData.location || undefined,
        dateLostFound: formData.dateLostFound ? new Date(formData.dateLostFound).toISOString() : new Date().toISOString(),
      };

      if (editingItem) {
        await lostFoundService.update(editingItem.id, payload);
        toast.success('Item updated successfully!');
      } else {
        await lostFoundService.create(payload);
        toast.success('Item posted successfully!');
      }
      
      setOpenModal(false);
      resetForm();
      await fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await lostFoundService.delete(id);
      toast.success('Item deleted successfully!');
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  // Handle verify claim
  const handleVerifyClaim = async (id) => {
    try {
      await lostFoundService.verifyClaim(id);
      toast.success('Claim verified successfully!');
      await fetchItems();
    } catch (error) {
      console.error('Error verifying claim:', error);
      toast.error(error.response?.data?.message || 'Failed to verify claim');
    }
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, photo: file});
      setSelectedImage(URL.createObjectURL(file));
    }
  };

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
            Manage lost and found items in your condominium and communicate with reporters
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchItems}
            sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#d1d5db', color: '#1a1a2e' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
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
            Report Item
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total Items</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{stats.total}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(239, 68, 68, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Lost</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>{stats.lost}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Found</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.found}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Open</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.open}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(59, 130, 246, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Matched</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.matched}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="rgba(139, 92, 246, 0.1)">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Claimed</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{stats.claimed}</Typography>
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
            placeholder="Search by item name, description, reporter or location..."
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
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
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
                    <TypeChip type={item.type} label={item.type?.toUpperCase()} size="small" />
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
                      {/* Chat About This Item button */}
                      <Tooltip title="Chat About This Item">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenItemChat(item)}
                          sx={{ 
                            color: '#8b5cf6', 
                            '&:hover': { 
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '10px',
                            padding: '8px',
                          }}
                        >
                          <ChatIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

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
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
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
                    <SearchOffIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="#6b7a8f">
                      No items found
                    </Typography>
                    <Typography variant="body2" color="#9ca3af">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No lost or found items recorded yet.'}
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

      {/* Create / Edit Modal */}
      <Dialog disableRestoreFocus  
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {editingItem ? 'Edit Lost / Found Item' : 'Report Lost / Found Item'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Item Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                label="Item Type"
              >
                <MenuItem value="lost">Lost Item</MenuItem>
                <MenuItem value="found">Found Item</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Item Name"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              required
            />

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                label="Category"
              >
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="documents">Documents & Cards</MenuItem>
                <MenuItem value="keys">Keys</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="jewelry">Jewelry</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Location"
              placeholder="e.g. Near main gate, elevator, lobby"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />

            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date Lost / Found"
              InputLabelProps={{ shrink: true }}
              value={formData.dateLostFound}
              onChange={(e) => setFormData({...formData, dateLostFound: e.target.value})}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
            }}
          >
            {editingItem ? 'Update Item' : 'Submit Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog disableRestoreFocus  
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Item Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                  {selectedItem.itemName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TypeChip type={selectedItem.type} label={selectedItem.type?.toUpperCase()} size="small" />
                  <StatusChip status={selectedItem.status} label={selectedItem.status} size="small" />
                </Box>
              </Box>

              <Typography variant="body2" color="#4b5563">
                {selectedItem.description}
              </Typography>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#6b7a8f">Category</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedItem.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#6b7a8f">Location</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedItem.location || 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#6b7a8f">Date</Typography>
                  <Typography variant="body2" fontWeight={500}>{new Date(selectedItem.dateLostFound).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#6b7a8f">Reporter</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedItem.user?.fullName || 'Anonymous'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={() => {
              setOpenDetailModal(false);
              handleOpenItemChat(selectedItem);
            }}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            Chat About This Item
          </Button>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Telegram-style Community Item Chat Modal */}
      <ItemTelegramChatModal
        open={openChatModal}
        onClose={() => setOpenChatModal(false)}
        item={chatItem}
      />
    </Box>
  );
};

export default LostFound;
