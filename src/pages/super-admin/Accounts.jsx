// src/pages/super-admin/Accounts.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  Alert,
  Zoom,
  Divider,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  PhoneAndroid as PhoneIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  Apartment as ApartmentIcon,
  ReceiptLong as ReceiptIcon,
  Paid as PaidIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { api } from '../../api/axiosConfig';

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
}));

const StatsCard = styled(Card)(() => ({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.04)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },
}));

const SuperAdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [condos, setCondos] = useState([]);
  const [selectedCondoFilter, setSelectedCondoFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [systemRevenue, setSystemRevenue] = useState(0);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    condoId: '',
    accountName: '',
    accountNumber: '',
    paymentMethod: 'cbe',
    providerName: 'Commercial Bank of Ethiopia',
    balance: '',
    isDefault: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, condoRes, statsRes] = await Promise.allSettled([
        api.condoAccounts.getAll(),
        api.condos.getAll(),
        api.payments.getStatistics(),
      ]);

      if (accRes.status === 'fulfilled') {
        const list = accRes.value.data?.data || accRes.value.data || [];
        setAccounts(Array.isArray(list) ? list : []);
      }

      if (condoRes.status === 'fulfilled') {
        const cList = condoRes.value.data?.data || condoRes.value.data || [];
        setCondos(Array.isArray(cList) ? cList : []);
      }

      if (statsRes.status === 'fulfilled') {
        const st = statsRes.value.data?.data || {};
        setSystemRevenue(Number(st.totalCollectedVolume || st.totalBaseVolume || 0));
      }
    } catch (err) {
      console.error('Failed to load condominium accounts for Super Admin:', err);
      toast.error('Failed to load accounts data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter accounts by condominium
  const filteredAccounts = accounts.filter(acc => {
    if (selectedCondoFilter === 'ALL') return true;
    return acc.condoId === selectedCondoFilter;
  });

  const totalOperationalBalance = filteredAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      condoId: condos.length > 0 ? (selectedCondoFilter !== 'ALL' ? selectedCondoFilter : condos[0].id) : '',
      accountName: '',
      accountNumber: '',
      paymentMethod: 'cbe',
      providerName: 'Commercial Bank of Ethiopia',
      balance: '',
      isDefault: false,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setFormData({
      condoId: acc.condoId,
      accountName: acc.accountName || '',
      accountNumber: acc.accountNumber || '',
      paymentMethod: acc.paymentMethod || 'cbe',
      providerName: acc.providerName || '',
      balance: acc.balance !== undefined ? String(acc.balance) : '0',
      isDefault: Boolean(acc.isDefault),
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.condoId) {
      toast.error('Please select a condominium for this account');
      return;
    }

    if (!formData.accountName.trim()) {
      toast.error('Account holder or fund name is required');
      return;
    }

    if (!formData.accountNumber.trim() || formData.accountNumber.trim().length < 3) {
      toast.error('Valid account number is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        condoId: formData.condoId,
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        paymentMethod: formData.paymentMethod,
        providerName: formData.providerName || (formData.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr'),
        balance: formData.balance ? Number(formData.balance) : 0,
        isDefault: Boolean(formData.isDefault),
      };

      if (editingAccount) {
        await api.condoAccounts.update(editingAccount.id, payload);
        toast.success('Condominium account updated successfully');
      } else {
        await api.condoAccounts.create(payload);
        toast.success('Condominium account registered successfully');
      }

      setOpenModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving condominium account:', err);
      toast.error(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      await api.condoAccounts.setDefault(accountId);
      toast.success('Set as primary default destination for this condominium');
      fetchData();
    } catch (err) {
      console.error('Error setting default account:', err);
      toast.error(err.response?.data?.message || 'Failed to set default account');
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to deactivate this condominium account?')) return;
    try {
      await api.condoAccounts.delete(accountId);
      toast.success('Condominium account deactivated');
      fetchData();
    } catch (err) {
      console.error('Error deactivating account:', err);
      toast.error(err.response?.data?.message || 'Failed to deactivate account');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
            Condominium Accounts & Treasury
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            System-wide repository of official registered accounts scoped strictly to their respective condominiums
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: { xs: 2, sm: 0 }, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ textTransform: 'none', borderRadius: '12px', fontWeight: 600, color: '#6b7a8f', borderColor: '#d1d5db' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              background: '#D3AD32',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(211, 173, 50, 0.25)',
              '&:hover': { background: '#b89428' },
            }}
          >
            Register Condo Account
          </Button>
        </Box>
      </Box>

      {/* Condominium Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApartmentIcon sx={{ color: '#D3AD32' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Filter by Condominium:</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <Select
            value={selectedCondoFilter}
            onChange={(e) => setSelectedCondoFilter(e.target.value)}
            sx={{ borderRadius: '10px', fontSize: '0.875rem' }}
          >
            <MenuItem value="ALL">All Condominiums ({condos.length})</MenuItem>
            {condos.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.condoName} ({c.condoCode})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedCondoFilter !== 'ALL' && (
          <Button
            size="small"
            onClick={() => setSelectedCondoFilter('ALL')}
            sx={{ textTransform: 'none', color: '#6b7a8f', fontWeight: 600 }}
          >
            Reset Filter
          </Button>
        )}
      </Paper>

      {/* System Stats Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>SYSTEM TOTAL REVENUE (ALL CONDOS)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#D3AD32', mt: 0.5 }}>
                    ETB {systemRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>From approved dues and payments</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(211, 173, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PaidIcon sx={{ color: '#D3AD32', fontSize: 26 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>OPERATIONAL RESERVE FUNDS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                    ETB {totalOperationalBalance.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>{filteredAccounts.length} account(s) matching filter</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WalletIcon sx={{ color: '#10b981', fontSize: 26 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>COVERAGE STATUS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mt: 0.5 }}>
                    {condos.length} Condominiums Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                    Strict Multi-Tenant Account Isolation
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
                </Box>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Accounts Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Condominium</TableCell>
              <TableCell>Account Name & Provider</TableCell>
              <TableCell>Account Number (Masked)</TableCell>
              <TableCell>Method / Type</TableCell>
              <TableCell>Operational Balance</TableCell>
              <TableCell>Role & Designation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={30} sx={{ color: '#D3AD32' }} />
                  <Typography variant="body2" sx={{ color: '#6b7a8f', mt: 1 }}>Loading condominium accounts...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <BankIcon sx={{ fontSize: 44, color: '#d1d5db', mb: 1 }} />
                  <Typography variant="h6" color="#6b7a8f">No Condominium Accounts Found</Typography>
                  <Typography variant="body2" color="#9ca3af" sx={{ mb: 2 }}>
                    {selectedCondoFilter !== 'ALL' ? 'This condominium has not yet registered an official account.' : 'No condominium accounts registered in the system.'}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleOpenAdd}
                    sx={{ background: '#D3AD32', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
                  >
                    Register Account Now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => {
                const isTelebirr = acc.paymentMethod === 'telebirr';
                const condo = acc.condo || condos.find(c => c.id === acc.condoId);

                return (
                  <TableRow key={acc.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ApartmentIcon sx={{ color: '#D3AD32', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="#1a1a2e">
                            {condo ? condo.condoName : 'Unknown Condo'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7a8f', fontFamily: 'monospace' }}>
                            {condo ? condo.condoCode : acc.condoId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isTelebirr ? 'rgba(59, 130, 246, 0.1)' : 'rgba(211, 173, 50, 0.12)',
                            color: isTelebirr ? '#2563eb' : '#b45309',
                          }}
                        >
                          {isTelebirr ? <PhoneIcon fontSize="small" /> : <BankIcon fontSize="small" />}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="#1a1a2e">
                            {acc.accountName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                            {acc.providerName || (isTelebirr ? 'Telebirr' : 'Commercial Bank of Ethiopia')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#b45309' }}>
                        {acc.maskedAccountNumber || `****${String(acc.accountNumber).slice(-4)}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={acc.accountType?.replace('_', ' ') || (isTelebirr ? 'Mobile Money' : 'Bank')}
                        size="small"
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          bgcolor: 'rgba(107, 114, 128, 0.08)',
                          color: '#4b5563',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#10b981">
                        ETB {Number(acc.balance || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {acc.isDefault ? (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: '14px !important', color: '#b45309 !important' }} />}
                          label="Primary Destination & Source"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(245, 158, 11, 0.15)',
                            color: '#b45309',
                            fontWeight: 700,
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        />
                      ) : (
                        <Button
                          size="small"
                          onClick={() => handleSetDefault(acc.id)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#6b7a8f', fontWeight: 600 }}
                        >
                          Make Primary
                        </Button>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={acc.status || 'active'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          bgcolor: acc.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: acc.status === 'active' ? '#10b981' : '#ef4444',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Edit Account">
                          <IconButton size="small" onClick={() => handleOpenEdit(acc)} sx={{ color: '#6b7a8f', '&:hover': { color: '#D3AD32' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate Account">
                          <IconButton size="small" onClick={() => handleDelete(acc.id)} sx={{ color: '#6b7a8f', '&:hover': { color: '#ef4444' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Register / Edit Account Dialog */}
      <Dialog
        disableRestoreFocus
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>
            {editingAccount ? 'Edit Condominium Account' : 'Register Official Condominium Account'}
          </DialogTitle>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, display: 'block' }}>
            Official account registered to its respective condominium for resident payment routing and payout disbursements
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Condominium Selector */}
            <FormControl fullWidth size="small">
              <InputLabel>Associated Condominium *</InputLabel>
              <Select
                value={formData.condoId}
                label="Associated Condominium *"
                disabled={Boolean(editingAccount)}
                onChange={(e) => setFormData({ ...formData, condoId: e.target.value })}
                required
              >
                {condos.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.condoName} ({c.condoCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Payment Channel / Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Channel / Method"
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethod: e.target.value,
                  providerName: e.target.value === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Ethio Telecom Telebirr',
                })}
              >
                <MenuItem value="cbe">CBE (Commercial Bank of Ethiopia)</MenuItem>
                <MenuItem value="telebirr">Telebirr Mobile Money</MenuItem>
                <MenuItem value="bank_transfer">Other Commercial Bank</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Account Holder / Fund Title *"
              placeholder="e.g. Selam Histsa Operational Fund"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Account Number / Phone Number *"
              placeholder={formData.paymentMethod === 'telebirr' ? '09...' : '1000...'}
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Provider / Bank Name"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              fullWidth
              size="small"
            />

            <TextField
              label="Initial Operational Balance (ETB)"
              type="number"
              placeholder="0"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              fullWidth
              size="small"
              inputProps={{ min: '0', step: '0.01' }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{ color: '#6b7a8f', textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                background: '#D3AD32',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 3,
                '&:hover': { background: '#b89428' },
              }}
            >
              {submitting ? 'Saving...' : (editingAccount ? 'Update Account' : 'Register Account')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SuperAdminAccounts;
