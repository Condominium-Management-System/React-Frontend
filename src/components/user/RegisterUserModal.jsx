// src/components/user/RegisterUserModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';
import { api } from '../../api/axiosConfig';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    maxWidth: '620px',
    width: '100%',
  },
}));

const RegisterUserModal = ({ isOpen, onClose, onSuccess, initialCondoCode = '', initialCondoId = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic entity lists
  const [condos, setCondos] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    fan: '',
    role: 'resident',
    condoId: initialCondoId || '',
    condoCode: initialCondoCode || '',
    blockId: '',
    block: '',
    roomId: '',
    roomNo: '',
  });

  // Fetch Condominiums list
  const fetchCondos = useCallback(async () => {
    try {
      const res = await api.condos.getAll();
      const list = res.data?.data || [];
      setCondos(list);

      // If initialCondoCode is passed, find matching condo
      if (initialCondoCode && list.length > 0) {
        const matched = list.find(c => c.condoCode === initialCondoCode || c.id === initialCondoId);
        if (matched) {
          setFormData(prev => ({
            ...prev,
            condoId: matched.id,
            condoCode: matched.condoCode
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch condos:', err);
    }
  }, [initialCondoCode, initialCondoId]);

  // Fetch Blocks when condoId changes
  const fetchBlocks = useCallback(async (condoId) => {
    if (!condoId) {
      setBlocks([]);
      return;
    }
    try {
      setLoadingBlocks(true);
      const res = await api.blocks.getAll(condoId);
      const raw = res.data?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.blocks)
        ? raw.blocks
        : [];
      setBlocks(list);
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
      setBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  // Fetch Rooms when blockId changes
  const fetchRooms = useCallback(async (condoId, blockId) => {
    if (!condoId || !blockId) {
      setRooms([]);
      return;
    }
    try {
      setLoadingRooms(true);
      const res = await api.rooms.getAll(condoId, { blockId });
      const raw = res.data?.data || [];
      setRooms(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCondos();
    }
  }, [isOpen, fetchCondos]);

  useEffect(() => {
    if (formData.condoId) {
      fetchBlocks(formData.condoId);
    } else {
      setBlocks([]);
      setRooms([]);
    }
  }, [formData.condoId, fetchBlocks]);

  useEffect(() => {
    if (formData.condoId && formData.blockId) {
      fetchRooms(formData.condoId, formData.blockId);
    } else {
      setRooms([]);
    }
  }, [formData.condoId, formData.blockId, fetchRooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCondoSelect = (e) => {
    const condoId = e.target.value;
    const selected = condos.find((c) => c.id === condoId);
    setFormData((prev) => ({
      ...prev,
      condoId,
      condoCode: selected ? selected.condoCode : '',
      blockId: '',
      block: '',
      roomId: '',
      roomNo: '',
    }));
    setSelectedFloor('');
  };

  const handleBlockSelect = (e) => {
    const blockId = e.target.value;
    const selected = blocks.find((b) => b.id === blockId);
    setFormData((prev) => ({
      ...prev,
      blockId,
      block: selected ? selected.blockNo : '',
      roomId: '',
      roomNo: '',
    }));
    setSelectedFloor('');
  };

  const handleRoomSelect = (e) => {
    const roomId = e.target.value;
    const selected = rooms.find((r) => r.id === roomId);
    setFormData((prev) => ({
      ...prev,
      roomId,
      roomNo: selected ? selected.roomNo : '',
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.password ||
        !formData.phoneNumber ||
        !formData.fan ||
        !formData.condoCode
      ) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }

      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        fan: formData.fan.trim(),
        role: formData.role || 'resident',
        condoId: formData.condoId || undefined,
        condoCode: formData.condoCode.trim(),
        block: formData.block || undefined,
        roomNo: formData.roomNo || undefined,
        isVerified: true,
      };

      await api.users.create(userData);

      // If a specific room was assigned and user was created, update room status to occupied
      if (formData.roomId && formData.condoId) {
        try {
          await api.rooms.updateStatus(formData.condoId, formData.roomId, {
            status: 'occupied',
          });
        } catch (roomErr) {
          console.warn('Could not auto-occupy room:', roomErr);
        }
      }

      toast.success('User registered successfully!');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        fan: '',
        role: 'resident',
        condoId: initialCondoId || '',
        condoCode: initialCondoCode || '',
        blockId: '',
        block: '',
        roomId: '',
        roomNo: '',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to register user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          p: 3,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Register New User
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Create a user and assign to condominium, block, and room
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3.5, bgcolor: '#f8f9fa' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="e.g. Abebe Bikila"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>User Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="User Role"
                    onChange={handleChange}
                    sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                  >
                    <MenuItem value="resident">Resident</MenuItem>
                    <MenuItem value="condo_admin">Condo Admin</MenuItem>
                    <MenuItem value="guard">Guard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="user@example.com"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Min 8 characters"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number *"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="0911223344"
                  helperText="09... / 07... or +251..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="FAN Number (16 digits) *"
                  name="fan"
                  value={formData.fan}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="1000000000000001"
                  helperText="16 digits identifier"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
              </Grid>
            </Grid>

            {/* Condominium Dropdown */}
            <FormControl fullWidth required>
              <InputLabel>Condominium *</InputLabel>
              <Select
                value={formData.condoId}
                label="Condominium *"
                onChange={handleCondoSelect}
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                {condos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hierarchy-aware Block, Floor & Room Dynamic Selectors */}
            {(() => {
              const selectedBlock = blocks.find((b) => b.id === formData.blockId);
              const floorOptions = selectedBlock?.noFloors
                ? Array.from({ length: selectedBlock.noFloors }, (_, i) => i + 1)
                : [];
              const availableRooms = rooms.filter(
                (r) => !selectedFloor || Number(r.floorNo) === Number(selectedFloor)
              );

              return (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={!formData.condoId || loadingBlocks}>
                      <InputLabel>
                        {loadingBlocks ? 'Loading blocks...' : 'Select Block'}
                      </InputLabel>
                      <Select
                        value={formData.blockId}
                        label={loadingBlocks ? 'Loading blocks...' : 'Select Block'}
                        onChange={handleBlockSelect}
                        sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                      >
                        <MenuItem value="">
                          <em>None / Unassigned</em>
                        </MenuItem>
                        {blocks.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            Block {b.blockNo} ({b.noFloors} fl)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={!formData.blockId || floorOptions.length === 0}>
                      <InputLabel>Floor</InputLabel>
                      <Select
                        value={selectedFloor}
                        label="Floor"
                        onChange={(e) => {
                          setSelectedFloor(e.target.value);
                          setFormData((prev) => ({ ...prev, roomId: '', roomNo: '' }));
                        }}
                        sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                      >
                        <MenuItem value="">
                          <em>All Floors</em>
                        </MenuItem>
                        {floorOptions.map((f) => (
                          <MenuItem key={f} value={f}>
                            Floor {f}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={!formData.blockId || loadingRooms}>
                      <InputLabel>
                        {loadingRooms ? 'Loading rooms...' : 'Select Room'}
                      </InputLabel>
                      <Select
                        value={formData.roomId}
                        label={loadingRooms ? 'Loading rooms...' : 'Select Room'}
                        onChange={handleRoomSelect}
                        sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                      >
                        <MenuItem value="">
                          <em>None / Unassigned</em>
                        </MenuItem>
                        {availableRooms.map((r) => {
                          const isOccupied = r.status === 'occupied';
                          return (
                            <MenuItem key={r.id} value={r.id} disabled={isOccupied}>
                              Unit {r.roomNo} (Fl {r.floorNo}, {isOccupied ? 'Occupied' : 'Free'})
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              );
            })()}

            {formData.roomNo && (
              <Alert severity="info" sx={{ py: 0.5, borderRadius: '8px' }}>
                Selected Assignment: <strong>Block {formData.block}</strong>, <strong>Room {formData.roomNo}</strong> {selectedFloor ? `(Floor ${selectedFloor})` : ''}
              </Alert>
            )}
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#6b7a8f',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
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
            },
          }}
        >
          {loading ? 'Registering...' : 'Register User'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default RegisterUserModal;
