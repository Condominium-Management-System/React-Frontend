// src/pages/condo-admin/BlocksAndRooms.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Apartment as ApartmentIcon,
  Home as HomeIcon,
  MeetingRoom as MeetingRoomIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit, FaRegTrashAlt, FaUserCheck } from 'react-icons/fa';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

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
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  '.stat-icon': {
    width: 36,
    height: 36,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: color || '#f0f4ff',
  },
  '.stat-value': {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  '.stat-label': {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#6b7a8f',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const BlocksAndRooms = ({ condoIdProp = null, condoCodeProp = null }) => {
  const { user: currentUser } = useAuth();
  const condoId = condoIdProp || currentUser?.condoId;
  const condoCode = condoCodeProp || currentUser?.condoCode || 'Condo';

  const [tab, setTab] = useState(0); // 0: Blocks, 1: Rooms
  const [loading, setLoading] = useState(true);

  // Blocks state
  const [blocks, setBlocks] = useState([]);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({
    blockNo: '',
    noRooms: 1,
    noFloors: 1,
  });

  // Rooms state
  const [rooms, setRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    blockId: '',
    roomNo: '',
    floorNo: 1,
    price: 0,
    model: 'two_bedroom',
  });

  // Status & Assign Modal
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [statusRoom, setStatusRoom] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'free',
    occupiedById: '',
  });

  // Pagination
  const [blockPage, setBlockPage] = useState(0);
  const [blockRowsPerPage, setBlockRowsPerPage] = useState(10);
  const [roomPage, setRoomPage] = useState(0);
  const [roomRowsPerPage, setRoomRowsPerPage] = useState(10);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!condoId) return;
    try {
      setLoading(true);
      const [blocksRes, roomsRes, usersRes] = await Promise.all([
        api.blocks.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.rooms.getAll(condoId).catch(() => ({ data: { data: [] } })),
        api.users.getAll(condoId).catch(() => ({ data: { data: [] } })),
      ]);

      setBlocks(blocksRes.data?.data || []);
      setRooms(roomsRes.data?.data || []);
      setResidents(usersRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load blocks and rooms:', err);
      toast.error('Failed to load data for condominium');
    } finally {
      setLoading(false);
    }
  }, [condoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Block Form submit
  const handleSaveBlock = async () => {
    if (!blockForm.blockNo) {
      toast.error('Block number is required');
      return;
    }
    try {
      if (editingBlock) {
        await api.blocks.update(condoId, editingBlock.id, {
          blockNo: blockForm.blockNo,
          noRooms: Number(blockForm.noRooms),
          noFloors: Number(blockForm.noFloors),
        });
        toast.success('Block updated successfully');
      } else {
        await api.blocks.create(condoId, {
          blockNo: blockForm.blockNo,
          noRooms: Number(blockForm.noRooms),
          noFloors: Number(blockForm.noFloors),
        });
        toast.success('Block created successfully');
      }
      setOpenBlockModal(false);
      setEditingBlock(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block operation failed');
    }
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm(`Are you sure you want to delete block ${block.blockNo}?`)) return;
    try {
      await api.blocks.delete(condoId, block.id);
      toast.success('Block deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Handle Room Form submit
  const handleSaveRoom = async () => {
    if (!editingRoom && !roomForm.blockId) {
      toast.error('Please select a block');
      return;
    }
    if (!roomForm.roomNo) {
      toast.error('Room number is required');
      return;
    }
    try {
      if (editingRoom) {
        await api.rooms.update(condoId, editingRoom.id, {
          roomNo: roomForm.roomNo,
          floorNo: Number(roomForm.floorNo),
          price: Number(roomForm.price),
          model: roomForm.model,
        });
        toast.success('Room updated successfully');
      } else {
        await api.rooms.create(condoId, {
          blockId: roomForm.blockId,
          roomNo: roomForm.roomNo,
          floorNo: Number(roomForm.floorNo),
          price: Number(roomForm.price),
          model: roomForm.model,
        });
        toast.success('Room created successfully');
      }
      setOpenRoomModal(false);
      setEditingRoom(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Room operation failed');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNo}?`)) return;
    try {
      await api.rooms.delete(condoId, room.id);
      toast.success('Room deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusRoom) return;
    if (statusForm.status === 'occupied' && !statusForm.occupiedById) {
      toast.error('Please select an occupant for occupied room');
      return;
    }
    try {
      await api.rooms.updateStatus(condoId, statusRoom.id, {
        status: statusForm.status,
        occupiedById: statusForm.status === 'occupied' ? statusForm.occupiedById : null,
      });
      toast.success('Room status updated');
      setOpenStatusModal(false);
      setStatusRoom(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesBlock =
      selectedBlockFilter === 'ALL' || r.blockId === selectedBlockFilter;
    const matchesStatus =
      statusFilter === 'ALL' || r.status === statusFilter;
    return matchesBlock && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'reserved':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default:
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    }
  };

  if (loading && blocks.length === 0 && rooms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#D3AD32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Blocks & Rooms Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Condominium: <strong>{condoCode}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="rgba(107, 114, 128, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Blocks</Typography>
                  <Typography className="stat-value">{blocks.length}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                  <ApartmentIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="rgba(59, 130, 246, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Total Rooms</Typography>
                  <Typography className="stat-value">{rooms.length}</Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <MeetingRoomIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="rgba(34, 197, 94, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Available</Typography>
                  <Typography className="stat-value" sx={{ color: '#22c55e' }}>
                    {rooms.filter((r) => r.status === 'free').length}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <HomeIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="rgba(239, 68, 68, 0.1)">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography className="stat-label">Occupied</Typography>
                  <Typography className="stat-value" sx={{ color: '#ef4444' }}>
                    {rooms.filter((r) => r.status === 'occupied').length}
                  </Typography>
                </Box>
                <Box className="stat-icon" sx={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <HomeIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #e5e7eb', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
            '& .Mui-selected': { color: '#D3AD32' },
            '& .MuiTabs-indicator': { backgroundColor: '#D3AD32' },
          }}
        >
          <Tab label={`Blocks (${blocks.length})`} icon={<ApartmentIcon />} iconPosition="start" />
          <Tab label={`Rooms (${rooms.length})`} icon={<MeetingRoomIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Blocks */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingBlock(null);
                setBlockForm({ blockNo: '', noRooms: 10, noFloors: 4 });
                setOpenBlockModal(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 3,
              }}
            >
              Add Block
            </Button>
          </Box>

          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Block No</TableCell>
                  <TableCell>Floors</TableCell>
                  <TableCell>Configured Rooms</TableCell>
                  <TableCell>Actual Rooms Created</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Occupied</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blocks.length > 0 ? (
                  blocks
                    .slice(
                      blockPage * blockRowsPerPage,
                      blockPage * blockRowsPerPage + blockRowsPerPage
                    )
                    .map((block) => {
                      const blockRooms = rooms.filter((r) => r.blockId === block.id);
                      const freeCount = blockRooms.filter((r) => r.status === 'free').length;
                      const occCount = blockRooms.filter((r) => r.status === 'occupied').length;

                      return (
                        <TableRow key={block.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                              Block {block.blockNo}
                            </Typography>
                          </TableCell>
                          <TableCell>{block.noFloors} Floors</TableCell>
                          <TableCell>{block.noRooms} Rooms</TableCell>
                          <TableCell>{blockRooms.length}</TableCell>
                          <TableCell>
                            <Chip label={freeCount} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={occCount} size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Edit Block">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingBlock(block);
                                    setBlockForm({
                                      blockNo: block.blockNo,
                                      noRooms: block.noRooms,
                                      noFloors: block.noFloors,
                                    });
                                    setOpenBlockModal(true);
                                  }}
                                  sx={{ color: '#6b7a8f', '&:hover': { color: '#4a6cf7' } }}
                                >
                                  <FaRegEdit size={15} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Block">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteBlock(block)}
                                  sx={{ color: '#6b7a8f', '&:hover': { color: '#d32f2f' } }}
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
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#9ca3af' }}>
                      No blocks found. Click "Add Block" to create your first block.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {blocks.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={blocks.length}
                rowsPerPage={blockRowsPerPage}
                page={blockPage}
                onPageChange={(_e, p) => setBlockPage(p)}
                onRowsPerPageChange={(e) => {
                  setBlockRowsPerPage(parseInt(e.target.value, 10));
                  setBlockPage(0);
                }}
              />
            )}
          </StyledTableContainer>
        </Box>
      )}

      {/* Tab 1: Rooms */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Filter by Block</InputLabel>
                <Select
                  value={selectedBlockFilter}
                  onChange={(e) => setSelectedBlockFilter(e.target.value)}
                  label="Filter by Block"
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="ALL">All Blocks</MenuItem>
                  {blocks.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      Block {b.blockNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter Status"
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (blocks.length === 0) {
                  toast.error('Please create at least one block before adding rooms');
                  return;
                }
                setEditingRoom(null);
                setRoomForm({
                  blockId: blocks[0].id,
                  roomNo: '',
                  floorNo: 1,
                  price: 2500,
                  model: 'two_bedroom',
                });
                setOpenRoomModal(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 3,
              }}
            >
              Add Room
            </Button>
          </Box>

          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room No</TableCell>
                  <TableCell>Block</TableCell>
                  <TableCell>Floor</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Occupant</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.length > 0 ? (
                  filteredRooms
                    .slice(
                      roomPage * roomRowsPerPage,
                      roomPage * roomRowsPerPage + roomRowsPerPage
                    )
                    .map((room) => {
                      const blockObj = blocks.find((b) => b.id === room.blockId);
                      const statusStyle = getStatusColor(room.status);

                      return (
                        <TableRow key={room.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                              Room {room.roomNo}
                            </Typography>
                          </TableCell>
                          <TableCell>Block {blockObj?.blockNo || room.block?.blockNo || '—'}</TableCell>
                          <TableCell>Floor {room.floorNo}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {room.model?.replace('_', ' ')}
                          </TableCell>
                          <TableCell>ETB {room.price || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={room.status}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {room.occupiedBy ? (
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {room.occupiedBy.fullName}
                                </Typography>
                                <Typography variant="caption" color="#6b7a8f">
                                  {room.occupiedBy.phoneNumber || ''}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="#9ca3af">
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Update Status / Assign Occupant">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setStatusRoom(room);
                                    setStatusForm({
                                      status: room.status || 'free',
                                      occupiedById: room.occupiedById || '',
                                    });
                                    setOpenStatusModal(true);
                                  }}
                                  sx={{ color: '#D3AD32' }}
                                >
                                  <FaUserCheck size={14} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Room">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingRoom(room);
                                    setRoomForm({
                                      blockId: room.blockId,
                                      roomNo: room.roomNo,
                                      floorNo: room.floorNo,
                                      price: room.price,
                                      model: room.model,
                                    });
                                    setOpenRoomModal(true);
                                  }}
                                  sx={{ color: '#6b7a8f', '&:hover': { color: '#4a6cf7' } }}
                                >
                                  <FaRegEdit size={15} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Room">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteRoom(room)}
                                  sx={{ color: '#6b7a8f', '&:hover': { color: '#d32f2f' } }}
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
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#9ca3af' }}>
                      No rooms found matching the filter.
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
                rowsPerPage={roomRowsPerPage}
                page={roomPage}
                onPageChange={(_e, p) => setRoomPage(p)}
                onRowsPerPageChange={(e) => {
                  setRoomRowsPerPage(parseInt(e.target.value, 10));
                  setRoomPage(0);
                }}
              />
            )}
          </StyledTableContainer>
        </Box>
      )}

      {/* Block Dialog */}
      <Dialog open={openBlockModal} onClose={() => setOpenBlockModal(false)} maxWidth="xs" fullWidth>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            {editingBlock ? 'Edit Block' : 'Add New Block'}
          </DialogTitle>
          <IconButton onClick={() => setOpenBlockModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Block Number / Name *"
              value={blockForm.blockNo}
              onChange={(e) => setBlockForm({ ...blockForm, blockNo: e.target.value })}
              fullWidth
              placeholder="e.g., A, B, B-1"
            />
            <TextField
              label="Total Floors *"
              type="number"
              value={blockForm.noFloors}
              onChange={(e) => setBlockForm({ ...blockForm, noFloors: e.target.value })}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Planned Rooms Capacity *"
              type="number"
              value={blockForm.noRooms}
              onChange={(e) => setBlockForm({ ...blockForm, noRooms: e.target.value })}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenBlockModal(false)}>Cancel</Button>
          <Button onClick={handleSaveBlock} variant="contained" sx={{ bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' } }}>
            Save Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={openRoomModal} onClose={() => setOpenRoomModal(false)} maxWidth="xs" fullWidth>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
          <IconButton onClick={() => setOpenRoomModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {!editingRoom && (
              <FormControl fullWidth>
                <InputLabel>Block *</InputLabel>
                <Select
                  value={roomForm.blockId}
                  onChange={(e) => setRoomForm({ ...roomForm, blockId: e.target.value })}
                  label="Block *"
                >
                  {blocks.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      Block {b.blockNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Room Number *"
              value={roomForm.roomNo}
              onChange={(e) => setRoomForm({ ...roomForm, roomNo: e.target.value })}
              fullWidth
              placeholder="e.g., 101, 204"
            />
            <TextField
              label="Floor Number *"
              type="number"
              value={roomForm.floorNo}
              onChange={(e) => setRoomForm({ ...roomForm, floorNo: e.target.value })}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Price (ETB) *"
              type="number"
              value={roomForm.price}
              onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <FormControl fullWidth>
              <InputLabel>Room Model *</InputLabel>
              <Select
                value={roomForm.model}
                onChange={(e) => setRoomForm({ ...roomForm, model: e.target.value })}
                label="Room Model *"
              >
                <MenuItem value="studio">Studio</MenuItem>
                <MenuItem value="one_bedroom">1 Bedroom</MenuItem>
                <MenuItem value="two_bedroom">2 Bedroom</MenuItem>
                <MenuItem value="three_bedroom">3 Bedroom</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenRoomModal(false)}>Cancel</Button>
          <Button onClick={handleSaveRoom} variant="contained" sx={{ bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' } }}>
            Save Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status & Assign Occupant Dialog */}
      <Dialog open={openStatusModal} onClose={() => setOpenStatusModal(false)} maxWidth="xs" fullWidth>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            Room Status & Occupant
          </DialogTitle>
          <IconButton onClick={() => setOpenStatusModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Typography variant="body2" color="#6b7a8f">
              Room <strong>{statusRoom?.roomNo}</strong> (Block {blocks.find((b) => b.id === statusRoom?.blockId)?.blockNo || ''})
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Occupancy Status</InputLabel>
              <Select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                label="Occupancy Status"
              >
                <MenuItem value="free">Free (Vacant)</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
              </Select>
            </FormControl>

            {statusForm.status === 'occupied' && (
              <FormControl fullWidth>
                <InputLabel>Assign Occupant (Resident)</InputLabel>
                <Select
                  value={statusForm.occupiedById}
                  onChange={(e) => setStatusForm({ ...statusForm, occupiedById: e.target.value })}
                  label="Assign Occupant (Resident)"
                >
                  <MenuItem value="">
                    <em>Select Resident...</em>
                  </MenuItem>
                  {residents.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.fullName} ({r.phoneNumber || r.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenStatusModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" sx={{ bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' } }}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlocksAndRooms;
