// src/pages/common/Rooms.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MeetingRoom as MeetingRoomIcon,
  Layers as LayersIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FaRegEdit, FaRegTrashAlt, FaDoorOpen, FaUserCheck, FaEye } from 'react-icons/fa';

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

const StatsCard = styled(Card)(({ color, active }) => ({
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

const StatusChip = styled(Chip)(({ roomstatus }) => {
  if (roomstatus === 'free') {
    return {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      color: '#16a34a',
      fontWeight: 600,
    };
  }
  if (roomstatus === 'occupied') {
    return {
      backgroundColor: 'rgba(74, 108, 247, 0.12)',
      color: '#4a6cf7',
      fontWeight: 600,
    };
  }
  return {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#ca8a04',
    fontWeight: 600,
  };
});

const ROOM_MODELS = [
  { value: 'studio', label: 'Studio' },
  { value: 'one_bedroom', label: '1 Bedroom' },
  { value: 'two_bedroom', label: '2 Bedroom' },
  { value: 'three_bedroom', label: '3 Bedroom' },
];

const Rooms = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = user?.role === 'super_admin';
  const urlCondoId = searchParams.get('condoId') || '';
  const urlBlockId = searchParams.get('blockId') || '';

  // Main Data States
  const [rooms, setRooms] = useState([]);
  const [condos, setCondos] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCondoId, setSelectedCondoId] = useState(isSuperAdmin ? urlCondoId : (user?.condoId || ''));
  const [selectedBlockId, setSelectedBlockId] = useState(urlBlockId || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    condoId: '',
    blockId: '',
    roomNo: '',
    floorNo: 1,
    price: 3000,
    model: 'one_bedroom',
    status: 'free',
    occupiedById: '',
  });

  // Quick Status Menu
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedRoomForStatus, setSelectedRoomForStatus] = useState(null);

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
  const fetchBlocks = useCallback(async (condoId) => {
    try {
      if (!condoId) {
        setBlocks([]);
        return;
      }
      const res = await api.blocks.getAll(condoId);
      const raw = res.data?.data;
      if (Array.isArray(raw)) {
        setBlocks(raw);
      } else if (raw?.blocks && Array.isArray(raw.blocks)) {
        setBlocks(raw.blocks);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
      setBlocks([]);
    }
  }, []);

  // Fetch Residents
  const fetchResidents = useCallback(async (condoId) => {
    try {
      const res = await api.users.getAll(condoId || undefined);
      const raw = res.data?.data || [];
      const residentUsers = raw.filter((u) => u.role === 'resident' || u.role === 'condo_admin');
      setResidents(residentUsers);
    } catch (err) {
      console.error('Failed to fetch residents:', err);
      setResidents([]);
    }
  }, []);

  // Fetch Rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const condoIdToUse = isSuperAdmin ? selectedCondoId : (user?.condoId || '');
      const params = {};
      if (selectedBlockId) params.blockId = selectedBlockId;

      const res = await api.rooms.getAll(condoIdToUse || undefined, params);
      const list = res.data?.data || [];
      setRooms(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, selectedCondoId, selectedBlockId, user]);

  useEffect(() => {
    fetchCondos();
  }, [fetchCondos]);

  useEffect(() => {
    const activeCondo = isSuperAdmin ? selectedCondoId : user?.condoId;
    if (activeCondo) {
      fetchBlocks(activeCondo);
      fetchResidents(activeCondo);
    }
  }, [isSuperAdmin, selectedCondoId, user, fetchBlocks, fetchResidents]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCondoFilterChange = (newCondoId) => {
    setSelectedCondoId(newCondoId);
    setSelectedBlockId('');
    setPage(0);
    const newParams = {};
    if (newCondoId) newParams.condoId = newCondoId;
    setSearchParams(newParams);
  };

  const handleBlockFilterChange = (newBlockId) => {
    setSelectedBlockId(newBlockId);
    setPage(0);
    const newParams = {};
    if (selectedCondoId) newParams.condoId = selectedCondoId;
    if (newBlockId) newParams.blockId = newBlockId;
    setSearchParams(newParams);
  };

  const handleOpenCreate = () => {
    setEditingRoom(null);
    const initialCondo = selectedCondoId || user?.condoId || (condos[0]?.id || '');
    setFormData({
      condoId: initialCondo,
      blockId: selectedBlockId || (blocks[0]?.id || ''),
      roomNo: '',
      floorNo: 1,
      price: 3500,
      model: 'one_bedroom',
      status: 'free',
      occupiedById: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      condoId: room.condoId || selectedCondoId || user?.condoId || '',
      blockId: room.blockId || '',
      roomNo: room.roomNo || '',
      floorNo: room.floorNo || 1,
      price: Number(room.price) || 3000,
      model: room.model || 'one_bedroom',
      status: room.status || 'free',
      occupiedById: room.occupiedById || '',
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomNo.trim()) {
      toast.warning('Please enter a room number');
      return;
    }
    const condoId = isSuperAdmin ? (formData.condoId || selectedCondoId) : user?.condoId;
    if (!condoId) {
      toast.warning('Please select a condominium');
      return;
    }
    if (!formData.blockId) {
      toast.warning('Please select a block');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        condoId,
        blockId: formData.blockId,
        roomNo: formData.roomNo.trim(),
        floorNo: Number(formData.floorNo) || 1,
        price: Number(formData.price) || 0,
        model: formData.model,
        status: formData.status,
        occupiedById: formData.status === 'free' ? null : (formData.occupiedById || null),
      };

      if (editingRoom) {
        await api.rooms.update(condoId, editingRoom.id, payload);
        toast.success('Room updated successfully');
      } else {
        await api.rooms.create(condoId, payload);
        toast.success('Room created successfully');
      }

      setOpenDialog(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Are you sure you want to delete Room "${room.roomNo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const condoId = room.condoId || selectedCondoId || user?.condoId;
      await api.rooms.delete(condoId, room.id);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    if (!selectedRoomForStatus) return;
    try {
      const condoId = selectedRoomForStatus.condoId || selectedCondoId || user?.condoId;
      await api.rooms.updateStatus(condoId, selectedRoomForStatus.id, {
        status: newStatus,
        occupiedById: newStatus === 'free' ? null : selectedRoomForStatus.occupiedById,
      });
      toast.success(`Room status changed to ${newStatus}`);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusAnchorEl(null);
      setSelectedRoomForStatus(null);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.block?.blockNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.occupiedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.condo?.condoName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesModel = modelFilter === 'ALL' || r.model === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

  const totalCount = rooms.length;
  const freeCount = rooms.filter((r) => r.status === 'free').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const reservedCount = rooms.filter((r) => r.status === 'reserved').length;

  const paginatedRooms = filteredRooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Room Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Manage condominium apartments, occupancy status, and resident assignments
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
          Add New Room
        </Button>
      </Box>

      {/* Stats Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#1a1a2e" active={statusFilter === 'ALL'} onClick={() => { setStatusFilter('ALL'); setPage(0); }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Rooms</Typography>
                  <Typography className="stat-value">{totalCount}</Typography>
                  <Typography className="stat-sub">Across active filters</Typography>
                </Box>
                <Box className="stat-icon">
                  <MeetingRoomIcon />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#22c55e" active={statusFilter === 'free'} onClick={() => { setStatusFilter('free'); setPage(0); }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Free (Vacant)</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>{freeCount}</Typography>
                  <Typography className="stat-sub">Available for lease</Typography>
                </Box>
                <Box className="stat-icon">
                  <FaDoorOpen size={22} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4a6cf7" active={statusFilter === 'occupied'} onClick={() => { setStatusFilter('occupied'); setPage(0); }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Occupied</Typography>
                  <Typography className="stat-value" sx={{ color: '#4a6cf7' }}>{occupiedCount}</Typography>
                  <Typography className="stat-sub">Active residents</Typography>
                </Box>
                <Box className="stat-icon">
                  <FaUserCheck size={20} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#eab308" active={statusFilter === 'reserved'} onClick={() => { setStatusFilter('reserved'); setPage(0); }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Reserved</Typography>
                  <Typography className="stat-value" sx={{ color: '#ca8a04' }}>{reservedCount}</Typography>
                  <Typography className="stat-sub">Pending allocation</Typography>
                </Box>
                <Box className="stat-icon">
                  <CheckCircleIcon />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search room, resident or block..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ flex: { xs: '1 1 100%', md: '1 1 240px' }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />

        {isSuperAdmin && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Condominium</InputLabel>
            <Select
              value={selectedCondoId}
              label="Condominium"
              onChange={(e) => handleCondoFilterChange(e.target.value)}
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

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Block</InputLabel>
          <Select
            value={selectedBlockId}
            label="Block"
            onChange={(e) => handleBlockFilterChange(e.target.value)}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="">
              <em>All Blocks</em>
            </MenuItem>
            {blocks.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.blockNo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={modelFilter}
            label="Model"
            onChange={(e) => {
              setModelFilter(e.target.value);
              setPage(0);
            }}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="ALL">All Models</MenuItem>
            {ROOM_MODELS.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton
          onClick={fetchRooms}
          sx={{
            bgcolor: 'rgba(0,0,0,0.04)',
            borderRadius: '10px',
            p: 1,
            ml: 'auto',
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
                <TableCell>Room Number</TableCell>
                <TableCell>Location / Block</TableCell>
                <TableCell align="center">Floor</TableCell>
                <TableCell align="center">Model</TableCell>
                <TableCell align="center">Monthly Price</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Occupant</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRooms.length > 0 ? (
                paginatedRooms.map((room) => {
                  const condoInfo = room.condo || condos.find((c) => c.id === room.condoId);
                  const blockInfo = room.block || blocks.find((b) => b.id === room.blockId);
                  const modelObj = ROOM_MODELS.find((m) => m.value === room.model);

                  return (
                    <TableRow key={room.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(211, 173, 50, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D3AD32' }}>
                            <MeetingRoomIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                              Unit {room.roomNo}
                            </Typography>
                            <Typography variant="caption" color="#9ca3af">
                              ID: {room.id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="#2d3436">
                            {blockInfo?.blockNo ? `Block ${blockInfo.blockNo}` : '—'}
                          </Typography>
                          {condoInfo && (
                            <Chip
                              label={condoInfo.condoCode || condoInfo.condoName}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f1f5f9' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<LayersIcon sx={{ fontSize: 13 }} />}
                          label={`Floor ${room.floorNo}`}
                          size="small"
                          sx={{ height: 22, fontSize: '0.75rem', bgcolor: '#f8f9fa' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={modelObj?.label || room.model}
                          size="small"
                          sx={{ height: 22, fontSize: '0.75rem', bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                          ETB {Number(room.price || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Click to quickly change status">
                          <StatusChip
                            roomstatus={room.status}
                            label={room.status}
                            size="small"
                            onClick={(e) => {
                              setSelectedRoomForStatus(room);
                              setStatusAnchorEl(e.currentTarget);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {room.occupiedBy ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 16, color: '#4a6cf7' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={500} color="#1a1a2e">
                                {room.occupiedBy.fullName}
                              </Typography>
                              <Typography variant="caption" color="#9ca3af">
                                {room.occupiedBy.phoneNumber || room.occupiedBy.email}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Chip label="Vacant" size="small" sx={{ height: 20, fontSize: '0.7rem', color: '#9ca3af', bgcolor: '#f1f5f9' }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingRoom(room)}
                              sx={{
                                color: '#6b7a8f',
                                '&:hover': { color: '#D3AD32', bgcolor: 'rgba(211, 173, 50, 0.08)' },
                              }}
                            >
                              <FaEye size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Room">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(room)}
                              sx={{
                                color: '#6b7a8f',
                                '&:hover': { color: '#D3AD32', bgcolor: 'rgba(211, 173, 50, 0.08)' },
                              }}
                            >
                              <FaRegEdit size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Room">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(room)}
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
                  <TableCell colSpan={8}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <MeetingRoomIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                      <Typography variant="h6" color="#6b7a8f">
                        No rooms found
                      </Typography>
                      <Typography variant="body2" color="#9ca3af">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add New Room" to register a unit'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredRooms.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRooms.length}
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

      {/* Quick Status Menu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
      >
        <MenuItem onClick={() => handleQuickStatusChange('free')} sx={{ color: '#16a34a', fontWeight: 600 }}>
          Set Free (Vacant)
        </MenuItem>
        <MenuItem onClick={() => handleQuickStatusChange('occupied')} sx={{ color: '#4a6cf7', fontWeight: 600 }}>
          Set Occupied
        </MenuItem>
        <MenuItem onClick={() => handleQuickStatusChange('reserved')} sx={{ color: '#ca8a04', fontWeight: 600 }}>
          Set Reserved
        </MenuItem>
      </Menu>

      {/* Create / Edit Dialog */}
      <Dialog
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
            {editingRoom ? '✏️ Edit Room' : '🚪 Add New Room'}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {editingRoom ? 'Update room specifications and resident assignment' : 'Register a new apartment unit in the condominium'}
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
                    onChange={(e) => {
                      const newCondo = e.target.value;
                      setFormData({ ...formData, condoId: newCondo, blockId: '' });
                      fetchBlocks(newCondo);
                      fetchResidents(newCondo);
                    }}
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

              <FormControl fullWidth required>
                <InputLabel>Building Block</InputLabel>
                <Select
                  value={formData.blockId}
                  label="Building Block"
                  onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                  sx={{ bgcolor: '#fff', borderRadius: '12px' }}
                >
                  {blocks.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.blockNo} ({b.noFloors} floors, cap: {b.configuredRooms || b.noRooms})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Room Number *"
                    placeholder="e.g. 101, 204"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    fullWidth
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Floor Number *"
                    type="number"
                    value={formData.floorNo}
                    onChange={(e) => setFormData({ ...formData, floorNo: parseInt(e.target.value) || 0 })}
                    fullWidth
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Room Model</InputLabel>
                    <Select
                      value={formData.model}
                      label="Room Model"
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      sx={{ bgcolor: '#fff', borderRadius: '12px' }}
                    >
                      {ROOM_MODELS.map((m) => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Monthly Price (ETB)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      sx={{ bgcolor: '#fff', borderRadius: '12px' }}
                    >
                      <MenuItem value="free">Free (Vacant)</MenuItem>
                      <MenuItem value="occupied">Occupied</MenuItem>
                      <MenuItem value="reserved">Reserved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={formData.status === 'free'}>
                    <InputLabel>Assigned Resident</InputLabel>
                    <Select
                      value={formData.occupiedById || ''}
                      label="Assigned Resident"
                      onChange={(e) => setFormData({ ...formData, occupiedById: e.target.value })}
                      sx={{ bgcolor: '#fff', borderRadius: '12px' }}
                    >
                      <MenuItem value="">
                        <em>None / Unassigned</em>
                      </MenuItem>
                      {residents.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.fullName} ({u.phoneNumber || u.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
              {submitting ? <CircularProgress size={20} color="inherit" /> : editingRoom ? 'Update Room' : 'Create Room'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Room Details Dialog */}
      <Dialog
        open={Boolean(viewingRoom)}
        onClose={() => setViewingRoom(null)}
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
            🚪 Apartment Unit Details
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Room specifications, lease pricing, and occupant information
          </Typography>
        </Box>
        {viewingRoom && (
          <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="#6b7a8f">Apartment Unit</Typography>
                    <Typography variant="h5" fontWeight={700} color="#1a1a2e">Room {viewingRoom.roomNo}</Typography>
                  </Box>
                  <StatusChip
                    roomstatus={viewingRoom.status}
                    label={viewingRoom.status?.toUpperCase()}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={`Floor ${viewingRoom.floorNo}`}
                    size="small"
                    sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                  />
                  <Chip
                    label={ROOM_MODELS.find((m) => m.value === viewingRoom.model)?.label || viewingRoom.model}
                    size="small"
                    sx={{ bgcolor: 'rgba(74, 108, 247, 0.1)', color: '#4a6cf7', fontWeight: 600 }}
                  />
                  <Chip
                    label={`ETB ${Number(viewingRoom.price || 0).toLocaleString()}/mo`}
                    size="small"
                    sx={{ bgcolor: 'rgba(211, 173, 50, 0.12)', color: '#D3AD32', fontWeight: 700 }}
                  />
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                    <Typography variant="caption" color="#6b7a8f">Building & Block</Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a1a2e">
                      {viewingRoom.block?.blockNo ? `Block ${viewingRoom.block.blockNo}` : (blocks.find((b) => b.id === viewingRoom.blockId)?.blockNo || '—')}
                    </Typography>
                    <Typography variant="body2" color="#6b7a8f">
                      {viewingRoom.condo?.condoName || (condos.find((c) => c.id === viewingRoom.condoId)?.condoName || 'Condominium')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                    <Typography variant="caption" color="#6b7a8f">Occupant Status</Typography>
                    {viewingRoom.occupiedBy ? (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body1" fontWeight={600} color="#1a1a2e">
                          {viewingRoom.occupiedBy.fullName}
                        </Typography>
                        <Typography variant="caption" color="#6b7a8f">
                          {viewingRoom.occupiedBy.phoneNumber || viewingRoom.occupiedBy.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="#22c55e" fontWeight={600} sx={{ mt: 0.5 }}>
                        Vacant (Available)
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="caption" color="#6b7a8f">System Identifiers</Typography>
                <Typography variant="body2" color="#1a1a2e"><strong>Room ID:</strong> {viewingRoom.id}</Typography>
                <Typography variant="body2" color="#1a1a2e" sx={{ mt: 0.5 }}>
                  <strong>Created At:</strong> {new Date(viewingRoom.createdAt).toLocaleDateString()}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => setViewingRoom(null)}
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

export default Rooms;
