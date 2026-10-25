// src/pages/common/Blocks.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Zoom,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Apartment as ApartmentIcon,
  MeetingRoom as MeetingRoomIcon,
  Domain as DomainIcon,
  Layers as LayersIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FaRegEdit, FaRegTrashAlt, FaDoorOpen, FaEye } from 'react-icons/fa';

// Styled Components
const StyledTableContainer = styled(TableContainer)(() => ({
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

const StatsCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color' })(({ color, active }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: `1px solid ${active ? color : 'rgba(0,0,0,0.04)'}`,
  background: active ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` : '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    borderColor: color,
  },
  '.stat-icon': {
    width: 44,
    height: 44,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${color}15`,
    color: color,
  },
  '.stat-value': {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1a1a2e',
    lineHeight: 1.2,
  },
  '.stat-label': {
    color: '#6b7a8f',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  '.stat-sub': {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '4px',
  },
}));

const Blocks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = user?.role === 'super_admin';
  const urlCondoId = searchParams.get('condoId') || '';

  // Data states
  const [blocks, setBlocks] = useState([]);
  const [condos, setCondos] = useState([]);
  const [selectedCondoId, setSelectedCondoId] = useState(isSuperAdmin ? urlCondoId : (user?.condoId || ''));
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [viewingBlock, setViewingBlock] = useState(null);
  const [formData, setFormData] = useState({
    condoId: '',
    blockNo: '',
    noFloors: 1,
    noRooms: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Condos
  const fetchCondos = useCallback(async () => {
    try {
      const res = await api.condos.getAll();
      setCondos(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch condos:', err);
    }
  }, []);

  // Fetch Blocks
  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const condoIdToUse = isSuperAdmin ? selectedCondoId : (user?.condoId || '');
      
      const res = await api.blocks.getAll(condoIdToUse || undefined);
      const rawData = res.data?.data;

      let list = [];
      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (rawData?.blocks && Array.isArray(rawData.blocks)) {
        list = rawData.blocks.map(b => ({
          ...b,
          condo: rawData.condo || b.condo
        }));
      }

      setBlocks(list);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch blocks');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, selectedCondoId, user]);

  useEffect(() => {
    fetchCondos();
  }, [fetchCondos]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleCondoChange = (newCondoId) => {
    setSelectedCondoId(newCondoId);
    setPage(0);
    if (newCondoId) {
      setSearchParams({ condoId: newCondoId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreate = () => {
    setEditingBlock(null);
    setFormData({
      condoId: selectedCondoId || user?.condoId || (condos[0]?.id || ''),
      blockNo: '',
      noFloors: 1,
      noRooms: 1,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (block) => {
    setEditingBlock(block);
    setFormData({
      condoId: block.condoId || selectedCondoId || user?.condoId || '',
      blockNo: block.blockNo || '',
      noFloors: block.noFloors || 1,
      noRooms: block.configuredRooms || block.noRooms || 1,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.blockNo.trim()) {
      toast.warning('Please enter a block number');
      return;
    }
    const condoId = isSuperAdmin ? (formData.condoId || selectedCondoId) : user?.condoId;
    if (!condoId) {
      toast.warning('Please select a condominium');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        condoId,
        blockNo: formData.blockNo.trim(),
        noFloors: Number(formData.noFloors) || 1,
        noRooms: Number(formData.noRooms) || 1,
      };

      if (editingBlock) {
        await api.blocks.update(condoId, editingBlock.id, payload);
        toast.success('Block updated successfully');
      } else {
        await api.blocks.create(condoId, payload);
        toast.success('Block created successfully');
      }

      setOpenDialog(false);
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (block) => {
    if (!window.confirm(`Are you sure you want to delete Block "${block.blockNo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const condoId = block.condoId || selectedCondoId || user?.condoId;
      await api.blocks.delete(condoId, block.id);
      toast.success('Block deleted successfully');
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete block');
    }
  };

  const handleViewRooms = (block) => {
    const basePath = isSuperAdmin ? '/super-admin/rooms' : '/condo-admin/rooms';
    const condoId = block.condoId || selectedCondoId || user?.condoId || '';
    navigate(`${basePath}?blockId=${block.id}&condoId=${condoId}`);
  };

  const filteredBlocks = blocks.filter((b) => {
    return (
      b.blockNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.condo?.condoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.condo?.condoCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalBlocks = blocks.length;
  const totalConfiguredRooms = blocks.reduce((sum, b) => sum + (b.configuredRooms || b.noRooms || 0), 0);
  const totalCreatedRooms = blocks.reduce((sum, b) => sum + (b.totalRooms || b.rooms?.total || 0), 0);
  const totalFreeRooms = blocks.reduce((sum, b) => sum + (b.rooms?.free ?? b.availableRooms ?? 0), 0);

  const paginatedBlocks = filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Block Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage condominium buildings, floors, and unit capacity
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(211, 173, 50, 0.3)',
            },
            textTransform: 'none',
            fontWeight: 600,
            px: 3.5,
            py: 1.25,
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          Add New Block
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4a6cf7" active>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Blocks</Typography>
                  <Typography className="stat-value">{totalBlocks}</Typography>
                  <Typography className="stat-sub">Registered buildings</Typography>
                </Box>
                <Box className="stat-icon">
                  <DomainIcon />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#D3AD32">
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Capacity (Planned)</Typography>
                  <Typography className="stat-value">{totalConfiguredRooms}</Typography>
                  <Typography className="stat-sub">Configured total rooms</Typography>
                </Box>
                <Box className="stat-icon">
                  <MeetingRoomIcon />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#22c55e">
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Created Rooms</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>{totalCreatedRooms}</Typography>
                  <Typography className="stat-sub">{totalFreeRooms} currently vacant</Typography>
                </Box>
                <Box className="stat-icon">
                  <FaDoorOpen size={22} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#8b5cf6">
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Condo Scope</Typography>
                  <Typography className="stat-value" sx={{ fontSize: '1.25rem', color: '#1a1a2e', mt: 0.5 }}>
                    {selectedCondoId ? (condos.find(c => c.id === selectedCondoId)?.condoCode || 'Selected') : 'All Condos'}
                  </Typography>
                  <Typography className="stat-sub">Active filter</Typography>
                </Box>
                <Box className="stat-icon">
                  <ApartmentIcon />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search block number or condo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />

        {isSuperAdmin && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filter by Condominium</InputLabel>
            <Select
              value={selectedCondoId}
              label="Filter by Condominium"
              onChange={(e) => handleCondoChange(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="">
                <em>All Condominiums</em>
              </MenuItem>
              {condos.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.condoName} ({c.condoCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <IconButton
          onClick={fetchBlocks}
          sx={{
            bgcolor: 'rgba(0,0,0,0.04)',
            borderRadius: '10px',
            p: 1,
            '&:hover': { bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32' },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Block Number</TableCell>
                <TableCell>Condominium</TableCell>
                <TableCell align="center">Floors</TableCell>
                <TableCell align="center">Configured Capacity</TableCell>
                <TableCell align="center">Created Units</TableCell>
                <TableCell align="center">Occupancy</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlocks.length > 0 ? (
                paginatedBlocks.map((block) => {
                  const condoInfo = block.condo || condos.find(c => c.id === block.condoId);
                  const occupancy = block.occupancyRate !== undefined
                    ? block.occupancyRate
                    : (block.rooms?.total ? Math.round(((block.rooms.occupied || 0) / block.rooms.total) * 100) : 0);

                  return (
                    <TableRow key={block.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(74, 108, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6cf7' }}>
                            <DomainIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              {block.blockNo}
                            </Typography>
                            <Typography variant="caption" color="#9ca3af">
                              ID: {block.id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {condoInfo ? (
                          <Box>
                            <Typography variant="body2" fontWeight={500} color="#2d3436">
                              {condoInfo.condoName}
                            </Typography>
                            <Chip
                              label={condoInfo.condoCode}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(211, 173, 50, 0.1)', color: '#D3AD32' }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="#9ca3af">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<LayersIcon sx={{ fontSize: 14 }} />}
                          label={`${block.noFloors || 1} Floors`}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                          {block.configuredRooms || block.noRooms || 0} Rooms
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Chip
                            label={`Total: ${block.totalRooms || block.rooms?.total || 0}`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#f8f9fa', border: '1px solid #e2e8f0' }}
                          />
                          {(block.rooms?.free !== undefined || block.availableRooms !== undefined) && (
                            <Chip
                              label={`Free: ${block.rooms?.free ?? block.availableRooms}`}
                              size="small"
                              sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${occupancy}%`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            height: 24,
                            bgcolor: occupancy > 80 ? 'rgba(239, 68, 68, 0.1)' : occupancy > 40 ? 'rgba(211, 173, 50, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: occupancy > 80 ? '#ef4444' : occupancy > 40 ? '#D3AD32' : '#22c55e',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingBlock(block)}
                              sx={{
                                color: '#6b7a8f',
                                '&:hover': { color: '#D3AD32', bgcolor: 'rgba(211, 173, 50, 0.08)' },
                              }}
                            >
                              <FaEye size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Rooms in this Block">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRooms(block)}
                              sx={{
                                color: '#4a6cf7',
                                '&:hover': { bgcolor: 'rgba(74, 108, 247, 0.1)' },
                              }}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Block">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(block)}
                              sx={{
                                color: '#6b7a8f',
                                '&:hover': { color: '#D3AD32', bgcolor: 'rgba(211, 173, 50, 0.08)' },
                              }}
                            >
                              <FaRegEdit size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Block">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(block)}
                              sx={{
                                color: '#6b7a8f',
                                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                              }}
                            >
                              <FaRegTrashAlt size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <DomainIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                      <Typography variant="h6" color="#6b7a8f">
                        No blocks found
                      </Typography>
                      <Typography variant="body2" color="#9ca3af">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add New Block" to register a block'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredBlocks.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBlocks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: '1px solid #f1f3f5' }}
            />
          )}
        </StyledTableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog disableRestoreFocus 
        open={openDialog}
        onClose={() => !submitting && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.4rem' }}>
            {editingBlock ? '✏️ Edit Block' : '🏢 Add New Block'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingBlock ? 'Update block configuration' : 'Register a new building block within a condominium'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {isSuperAdmin && (
                <FormControl fullWidth required>
                  <InputLabel>Condominium</InputLabel>
                  <Select
                    value={formData.condoId}
                    label="Condominium"
                    onChange={(e) => setFormData({ ...formData, condoId: e.target.value })}
                    sx={{ bgcolor: '#fff', borderRadius: '12px' }}
                  >
                    {condos.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.condoName} ({c.condoCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Block Number / Name *"
                placeholder="e.g. Block A or B-01"
                value={formData.blockNo}
                onChange={(e) => setFormData({ ...formData, blockNo: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    '&:hover fieldset': { borderColor: '#D3AD32' },
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Number of Floors *"
                    type="number"
                    value={formData.noFloors}
                    onChange={(e) => setFormData({ ...formData, noFloors: Math.max(1, parseInt(e.target.value) || 1) })}
                    fullWidth
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Planned Rooms Capacity *"
                    type="number"
                    value={formData.noRooms}
                    onChange={(e) => setFormData({ ...formData, noRooms: Math.max(1, parseInt(e.target.value) || 1) })}
                    fullWidth
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
              sx={{ color: '#6b7a8f', fontWeight: 600, textTransform: 'none', borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '10px',
                px: 3.5,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #c49a2b 0%, #b08822 100%)',
                },
              }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : editingBlock ? 'Update Block' : 'Create Block'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Block Details Dialog */}
      <Dialog disableRestoreFocus 
        open={Boolean(viewingBlock)}
        onClose={() => setViewingBlock(null)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.4rem' }}>
            🏢 Building Block Details
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Capacity, floor configuration, and occupancy statistics
          </Typography>
        </Box>
        {viewingBlock && (
          <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">Block Identifier</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a1a2e">{viewingBlock.blockNo}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={`${viewingBlock.noFloors || 1} Floors`}
                    size="small"
                    sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Planned: ${viewingBlock.configuredRooms || viewingBlock.noRooms || 0} Units`}
                    size="small"
                    sx={{ bgcolor: 'rgba(211, 173, 50, 0.12)', color: '#D3AD32', fontWeight: 600 }}
                  />
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                    <Typography variant="caption" color="#6b7a8f">Total Created</Typography>
                    <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                      {viewingBlock.totalRooms || viewingBlock.rooms?.total || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                    <Typography variant="caption" color="#6b7a8f">Vacant (Free)</Typography>
                    <Typography variant="h6" fontWeight={700} color="#22c55e">
                      {viewingBlock.rooms?.free ?? viewingBlock.availableRooms ?? 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff', textAlign: 'center' }}>
                    <Typography variant="caption" color="#6b7a8f">Occupied</Typography>
                    <Typography variant="h6" fontWeight={700} color="#4a6cf7">
                      {viewingBlock.rooms?.occupied ?? 0}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">System Identifiers</Typography>
                <Typography variant="body2" color="#1a1a2e"><strong>Block ID:</strong> {viewingBlock.id}</Typography>
                <Typography variant="body2" color="#1a1a2e" sx={{ mt: 0.5 }}>
                  <strong>Condo:</strong> {viewingBlock.condo?.condoName || viewingBlock.condoId || '—'}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => setViewingBlock(null)}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', textTransform: 'none', borderRadius: '10px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blocks;
