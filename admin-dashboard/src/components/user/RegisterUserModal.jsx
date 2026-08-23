import React, { useState } from 'react';
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
  Grid,
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    maxWidth: '600px',
    width: '100%',
  },
}));

const RegisterUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    fan: '',
    condoCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.password || 
          !formData.phoneNumber || !formData.fan || !formData.condoCode) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        fan: formData.fan,
        condoCode: formData.condoCode,
      };

      console.log('📝 Registering user:', userData);

      // Use fetch directly
      const response = await fetch('https://backend-a3xi.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('User registered successfully!');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        fan: '',
        condoCode: '',
      });
      
      // Call onSuccess callback to refresh user list
      if (onSuccess) onSuccess();
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = error.message || 'Failed to register user';
      
      // Check for specific error messages
      if (errorMessage.includes('duplicate') || errorMessage.includes('already')) {
        errorMessage = 'User with this email, phone or FAN already exists';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
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
            <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Register New User
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Create a new user account in the system
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
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., John Doe"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            
            <TextField
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., john@example.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            
            <TextField
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Min 8 characters"
              helperText="Password must be at least 8 characters"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number *"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="e.g., 0912345678"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#fff',
                      '&:hover fieldset': { borderColor: '#D3AD32' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="FAN Number *"
                  name="fan"
                  value={formData.fan}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="16 digits"
                  helperText="Exactly 16 digits"
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
            
            <TextField
              label="Condominium Code *"
              name="condoCode"
              value={formData.condoCode}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., YEKONDO-001"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': { borderColor: '#D3AD32' },
                },
              }}
            />
            
            <Typography variant="caption" sx={{ color: '#6b7a8f', textAlign: 'center' }}>
              Note: New users are registered as "Resident" by default. 
              You can change their role after registration using the Edit button.
            </Typography>
          </Box>
        </form>
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
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(211, 173, 50, 0.3)',
            },
            transition: 'all 0.3s ease',
            '&:disabled': {
              opacity: 0.7,
              cursor: 'not-allowed',
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