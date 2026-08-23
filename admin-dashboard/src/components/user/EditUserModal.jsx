import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    maxWidth: '500px',
    width: '100%',
  },
}));

const EditUserModal = ({ isOpen, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'resident',
    isVerified: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'resident',
        isVerified: user.isVerified || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Updating user:', formData);
      console.log('👤 User ID:', user.id);
      console.log('🏢 Condo ID:', user.condoId);
      
      // Use fetch directly
      const response = await fetch(`https://backend-a3xi.onrender.com/api/users/${user.condoId}/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Update response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      toast.success('User updated successfully!');
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Update error:', error);
      const errorMessage = error.message || 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        p: 3,
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
            <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Edit User
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Update user information and role
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fff',
                '&:hover fieldset': { borderColor: '#D3AD32' },
              },
            }}
          />
          
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fff',
                '&:hover fieldset': { borderColor: '#D3AD32' },
              },
            }}
          />
          
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fff',
                '&:hover fieldset': { borderColor: '#D3AD32' },
              },
            }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
              sx={{
                borderRadius: '10px',
                backgroundColor: '#fff',
                '&:hover fieldset': { borderColor: '#D3AD32' },
              }}
            >
              <MenuItem value="resident">Resident</MenuItem>
              <MenuItem value="condo_admin">Condo Admin</MenuItem>
              <MenuItem value="guard">Guard</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.isVerified}
                onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#22c55e',
                    '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.08)' },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#22c55e',
                  },
                }}
              />
            }
            label="Verified"
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: '#6b7a8f',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
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
          {loading ? 'Updating...' : 'Update User'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditUserModal;