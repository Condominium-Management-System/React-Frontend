// src/components/user/EditUserModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';
import { api } from '../../api/axiosConfig';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    maxWidth: '560px',
    width: '100%',
  },
}));

const EditUserModal = ({ isOpen, user, onClose, onSuccess, canChangeRole = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic lists
  const [condos, setCondos] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    condoId: '',
    condoCode: '',
    block: '',
    roomNo: '',
    role: 'resident',
    isVerified: false,
  });

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
    if (!condoId) {
      setBlocks([]);
      return;
    }
    try {
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
    }
  }, []);

  // Fetch Rooms
  const fetchRooms = useCallback(async (condoId, blockId) => {
    if (!condoId || !blockId) {
      setRooms([]);
      return;
    }
    try {
      const res = await api.rooms.getAll(condoId, { blockId });
      const raw = res.data?.data || [];
      setRooms(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setRooms([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCondos();
    }
  }, [isOpen, fetchCondos]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        condoId: user.condoId || '',
        condoCode: user.condoCode || '',
        block: user.block || '',
        roomNo: user.roomNo || '',
        role: user.role || 'resident',
        isVerified: !!user.isVerified,
      });

      if (user.condoId) {
        fetchBlocks(user.condoId);
      }
    }
  }, [user, fetchBlocks]);

  useEffect(() => {
    if (formData.condoId && selectedBlockId) {
      fetchRooms(formData.condoId, selectedBlockId);
    }
  }, [formData.condoId, selectedBlockId, fetchRooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCondoChange = (e) => {
    const condoId = e.target.value;
    const selected = condos.find((c) => c.id === condoId);
    setFormData((prev) => ({
      ...prev,
      condoId,
      condoCode: selected ? selected.condoCode : '',
      block: '',
      roomNo: '',
    }));
    setSelectedBlockId('');
    setSelectedRoomId('');
    fetchBlocks(condoId);
  };

  const handleBlockChange = (e) => {
    const blockId = e.target.value;
    const selected = blocks.find((b) => b.id === blockId);
    setSelectedBlockId(blockId);
    setFormData((prev) => ({
      ...prev,
      block: selected ? selected.blockNo : '',
      roomNo: '',
    }));
    setSelectedRoomId('');
    if (formData.condoId && blockId) {
      fetchRooms(formData.condoId, blockId);
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const selected = rooms.find((r) => r.id === roomId);
    setSelectedRoomId(roomId);
    setFormData((prev) => ({
      ...prev,
      roomNo: selected ? selected.roomNo : '',
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        condoId: formData.condoId || undefined,
        condoCode: formData.condoCode || undefined,
        block: formData.block?.trim() || null,
        roomNo: formData.roomNo?.trim() || null,
        isVerified: formData.isVerified,
      };

      await api.users.update(user.id, updateData, user.condoId || formData.condoId);

      // If role changed and role change is allowed
      if (canChangeRole && formData.role && formData.role !== user.role) {
        await api.users.updateRole(user.id, formData.role, user.condoId || formData.condoId);
      }

      // If room was chosen, update that room's status to occupied by this user
      if (selectedRoomId && formData.condoId) {
        try {
          await api.rooms.updateStatus(formData.condoId, selectedRoomId, {
            status: 'occupied',
            occupiedById: user.id,
          });
        } catch (e) {
          console.warn('Could not auto-assign room:', e);
        }
      }

      toast.success('User updated successfully!');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update user';
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
            <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Edit User Profile
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Update user information, condo assignment, and unit allocation
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
              />
            </Grid>
          </Grid>

          {canChangeRole && (
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                <MenuItem value="resident">Resident</MenuItem>
                <MenuItem value="condo_admin">Condo Admin</MenuItem>
                <MenuItem value="guard">Guard</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Condominium selection if Super Admin */}
          {canChangeRole && (
            <FormControl fullWidth>
              <InputLabel>Condominium</InputLabel>
              <Select
                value={formData.condoId}
                label="Condominium"
                onChange={handleCondoChange}
                sx={{ borderRadius: '10px', bgcolor: '#fff' }}
              >
                <MenuItem value="">
                  <em>None / Unassigned</em>
                </MenuItem>
                {condos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Dynamic Block & Room dropdowns */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Block</InputLabel>
                <Select
                  value={selectedBlockId}
                  label="Block"
                  onChange={handleBlockChange}
                  sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                >
                  <MenuItem value="">
                    <em>{formData.block ? `Current: ${formData.block}` : 'None'}</em>
                  </MenuItem>
                  {blocks.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.blockNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!selectedBlockId && !formData.block}>
                <InputLabel>Room</InputLabel>
                <Select
                  value={selectedRoomId}
                  label="Room"
                  onChange={handleRoomChange}
                  sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                >
                  <MenuItem value="">
                    <em>{formData.roomNo ? `Current: Unit ${formData.roomNo}` : 'None'}</em>
                  </MenuItem>
                  {rooms.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      Unit {r.roomNo} ({r.model}, {r.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))
                }
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Account Verified
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                  Enable full system access for this resident
                </Typography>
              </Box>
            }
          />
        </Box>
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
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditUserModal;
