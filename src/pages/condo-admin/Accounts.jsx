// src/pages/condo-admin/Accounts.jsx
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
  ReceiptLong as ReceiptIcon,
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

const CondoAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Transaction History Modal State
  const [openTxModal, setOpenTxModal] = useState(false);
  const [selectedTxAccount, setSelectedTxAccount] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    paymentMethod: 'cbe',
    providerName: 'Commercial Bank of Ethiopia',
    balance: '',
    isDefault: false,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.condoAccounts.getAll();
      const list = res.data?.data || res.data || [];
      setAccounts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load condominium source accounts:', err);
      toast.error(err.response?.data?.message || 'Failed to load source accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      accountName: '',
      accountNumber: '',
      paymentMethod: 'cbe',
      providerName: 'Commercial Bank of Ethiopia',
      balance: '',
      isDefault: accounts.length === 0,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setFormData({
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

    if (!formData.accountName.trim()) {
      toast.error('Account name is required');
      return;
    }
    if (!formData.accountNumber.trim() || formData.accountNumber.trim().length < 3) {
      toast.error('Valid account number is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        paymentMethod: formData.paymentMethod,
        providerName: formData.providerName || (formData.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr'),
        balance: formData.balance ? Number(formData.balance) : 0,
        isDefault: Boolean(formData.isDefault),
      };

      if (editingAccount) {
        await api.condoAccounts.update(editingAccount.id, payload);
        toast.success('Condominium source account updated successfully');
      } else {
        await api.condoAccounts.create(payload);
        toast.success('Condominium source account registered successfully');
      }

      setOpenModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Error saving condominium account:', err);
      toast.error(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTransactions = async (acc) => {
    setSelectedTxAccount(acc);
    setOpenTxModal(true);
    try {
      setLoadingTx(true);
      const res = await api.transactions.getAll({ condoAccountId: acc.id, limit: 50 });
      const txs = res.data?.data?.transactions || res.data?.data || [];
      setAccountTransactions(Array.isArray(txs) ? txs : []);
    } catch (err) {
      console.error('Failed to load account transactions:', err);
      toast.error('Failed to load transaction history');
    } finally {
      setLoadingTx(false);
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      await api.condoAccounts.setDefault(accountId);
      toast.success('Primary condominium source account updated');
      fetchAccounts();
    } catch (err) {
      console.error('Error setting default account:', err);
      toast.error(err.response?.data?.message || 'Failed to set default source account');
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to deactivate this condominium source account? Outgoing payouts will not be able to use it.')) return;
    try {
      await api.condoAccounts.delete(accountId);
      toast.success('Source account deactivated');
      fetchAccounts();
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
            Condominium Source Accounts
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Register and manage condominium bank and mobile money accounts used to fund Equb winner payouts and Iddir assistance disbursements
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAccounts}
            sx={{ textTransform: 'none', borderRadius: '12px', fontWeight: 600, color: '#6b7a8f', borderColor: '#d1d5db' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(211, 173, 50, 0.25)',
            }}
          >
            Add Source Account
          </Button>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <strong>Financial Origin Integrity:</strong> When processing an Equb round winner pot or an approved Iddir benefit disbursement, you select one of these registered source accounts as the official funding channel. Account numbers are masked for audit security.
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>REGISTERED SOURCE ACCOUNTS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mt: 0.5 }}>
                    {accounts.length}
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(211, 173, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BankIcon sx={{ color: '#D3AD32', fontSize: 26 }} />
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>TOTAL OPERATIONAL FUND</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                    ETB {totalBalance.toLocaleString()}
                  </Typography>
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
                  <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 600 }}>PRIMARY DISBURSEMENT SOURCE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {accounts.find(a => a.isDefault)?.providerName || (accounts.length > 0 ? accounts[0].providerName : 'None Configured')}
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

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account Name & Provider</TableCell>
              <TableCell>Account Number (Masked)</TableCell>
              <TableCell>Method / Type</TableCell>
              <TableCell>Available Balance</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={30} sx={{ color: '#D3AD32' }} />
                  <Typography variant="body2" sx={{ color: '#6b7a8f', mt: 1 }}>Loading condominium source accounts...</Typography>
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <BankIcon sx={{ fontSize: 44, color: '#d1d5db', mb: 1 }} />
                  <Typography variant="h6" color="#6b7a8f">No Source Accounts Configured</Typography>
                  <Typography variant="body2" color="#9ca3af" sx={{ mb: 2 }}>
                    Please register at least one CBE or Telebirr account for this condominium to fund Equb winner payouts and Iddir mutual aid benefits.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleOpenAdd}
                    sx={{ background: '#D3AD32', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
                  >
                    Add Source Account
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => {
                const isTelebirr = acc.paymentMethod === 'telebirr';

                return (
                  <TableRow key={acc.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
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
                          label="Primary Source & Destination"
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
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7a8f', display: 'block' }}>
                        {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Account Transaction History">
                          <IconButton size="small" onClick={() => handleOpenTransactions(acc)} sx={{ color: '#6b7a8f', '&:hover': { color: '#3b82f6' } }}>
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

      {/* Add / Edit Dialog */}
      <Dialog
        disableRestoreFocus
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
                {editingAccount ? 'Edit Condominium Source Account' : 'Register Condominium Source Account'}
              </DialogTitle>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                Used to disburse Equb pots and Iddir community benefits
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Provider / Method *</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Provider / Method *"
                  onChange={(e) => {
                    const method = e.target.value;
                    setFormData({
                      ...formData,
                      paymentMethod: method,
                      providerName: method === 'cbe' ? 'Commercial Bank of Ethiopia' : method === 'telebirr' ? 'Telebirr' : 'Commercial Bank',
                    });
                  }}
                  sx={{ borderRadius: '10px', bgcolor: '#fff' }}
                >
                  <MenuItem value="cbe">Commercial Bank of Ethiopia (CBE)</MenuItem>
                  <MenuItem value="telebirr">Telebirr (Ethio Telecom Mobile Money)</MenuItem>
                  <MenuItem value="bank_transfer">Other Commercial Bank</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Bank / Provider Name *"
                value={formData.providerName}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                fullWidth
                size="small"
                required
                placeholder="e.g. Commercial Bank of Ethiopia, Dashen Bank"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
              />

              <TextField
                label="Account Holder / Official Name *"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                fullWidth
                size="small"
                required
                placeholder="e.g. Sunshine Condo Administration Operational Fund"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
              />

              <TextField
                label={formData.paymentMethod === 'telebirr' ? 'Telebirr Phone Number *' : 'Bank Account Number *'}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                fullWidth
                size="small"
                required
                placeholder={formData.paymentMethod === 'telebirr' ? '09...' : '1000...'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
              />

              <TextField
                label="Operational Balance (ETB)"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                fullWidth
                size="small"
                placeholder="0"
                helperText="Funds currently available in this account for disbursements"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  id="condoDefaultAccCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="condoDefaultAccCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Set as primary funding source for Equb & Iddir disbursements
                </label>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#6b7a8f' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '10px',
                px: 3,
                textTransform: 'none',
              }}
            >
              {submitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Register Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog
        open={openTxModal}
        onClose={() => setOpenTxModal(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 3, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Transaction History
            </Typography>
            <Typography variant="caption" sx={{ color: '#D3AD32' }}>
              {selectedTxAccount?.accountName} ({selectedTxAccount?.accountNumber})
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenTxModal(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingTx ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#D3AD32' }} />
            </Box>
          ) : accountTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#6b7a8f' }}>
              <ReceiptIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>No transactions recorded</Typography>
              <Typography variant="caption">Transactions linked to this account will appear here.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount (ETB)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountTransactions.map((tx) => (
                    <TableRow key={tx.id || tx.reference} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.referenceNo || tx.reference || tx.id?.slice(0, 8)}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{tx.paymentType || tx.type || 'Transfer'}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>{Number(tx.amount || 0).toLocaleString()} ETB</TableCell>
                      <TableCell>{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status || 'completed'}
                          size="small"
                          sx={{
                            bgcolor: tx.status === 'completed' || tx.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: tx.status === 'completed' || tx.status === 'approved' ? '#16a34a' : '#ca8a04',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenTxModal(false)} variant="contained" sx={{ bgcolor: '#1a1a2e', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CondoAccounts;
