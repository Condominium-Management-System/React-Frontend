// src/pages/super-admin/EqubIddirManagement.jsx
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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';

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

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  '& .MuiCardContent-root': {
    padding: 24,
  },
}));

// Mock Data
const MOCK_CONDO_EQUBS = [
  {
    condoId: '1',
    condoName: 'Ye Kondominium 01',
    condoCode: 'YEKONDO-001',
    equbs: [
      { id: 'e1', name: 'Monthly Family Equb', contributionAmount: 5000, status: 'active', noMembers: 12, startDate: '2026-01-15', dueDate: '2026-12-15' },
      { id: 'e2', name: 'Wegeda Equb', contributionAmount: 3000, status: 'active', noMembers: 8, startDate: '2026-03-01', dueDate: '2027-02-28' },
    ],
    iddirs: [
      { id: 'i1', name: 'Wegeda Iddir', contributionAmount: 500, status: 'active', noMembers: 25, startedDate: '2026-01-01' },
      { id: 'i2', name: 'Kebele Iddir', contributionAmount: 1000, status: 'active', noMembers: 15, startedDate: '2025-06-01' },
    ],
  },
  {
    condoId: '2',
    condoName: 'Sunrise Condominium',
    condoCode: 'SUNRISE-001',
    equbs: [
      { id: 'e3', name: 'Sunrise Savings', contributionAmount: 2000, status: 'active', noMembers: 6, startDate: '2026-05-01', dueDate: '2027-04-30' },
    ],
    iddirs: [
      { id: 'i3', name: 'Sunrise Iddir', contributionAmount: 300, status: 'active', noMembers: 10, startedDate: '2026-02-15' },
    ],
  },
];

const EqubIddirManagement = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [condoData, setCondoData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    totalEqubs: 0,
    totalIddirs: 0,
    totalMembers: 0,
    totalAmount: 0,
  });
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCondoData(MOCK_CONDO_EQUBS);
      setTotalItems(MOCK_CONDO_EQUBS.length);
      
      const totalEqubs = MOCK_CONDO_EQUBS.reduce((sum, c) => sum + c.equbs.length, 0);
      const totalIddirs = MOCK_CONDO_EQUBS.reduce((sum, c) => sum + c.iddirs.length, 0);
      const totalMembers = MOCK_CONDO_EQUBS.reduce((sum, c) => {
        const equbMembers = c.equbs.reduce((s, e) => s + e.noMembers, 0);
        const iddirMembers = c.iddirs.reduce((s, i) => s + i.noMembers, 0);
        return sum + equbMembers + iddirMembers;
      }, 0);
      
      setStats({ totalEqubs, totalIddirs, totalMembers, totalAmount: totalEqubs * 5000 + totalIddirs * 500 });
      
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = condoData.filter(c => 
    c.condoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.condoCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleViewDetails = (condo) => {
    setSelectedItem(condo);
    setDetailTab(0);
    setOpenDetailModal(true);
  };

  const getStatusChip = (status) => {
    const colors = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
      completed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      cancelled: { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' },
      inactive: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
    };
    const c = colors[status] || { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    return <Chip label={status} size="small" sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600 }} />;
  };

  const formatCurrency = (amount) => `ETB ${amount?.toLocaleString() || 0}`;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Equb & Iddir Management</Typography>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Manage Equbs and Iddirs across all condominiums</Typography>
        </Box>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchData}
          sx={{ background: 'linear-gradient(135deg, #D3AD32 0%, #c49a2b 100%)', color: '#fff', textTransform: 'none', borderRadius: '12px' }}>
          Refresh
        </Button>
      </Box>

      
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Equbs
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
              {stats.totalEqubs}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(107, 114, 128, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AccountBalanceIcon sx={{ color: '#6b7280', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Iddirs
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
              {stats.totalIddirs}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(59, 130, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Members
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
              {stats.totalMembers}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(245, 158, 11, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PeopleIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32', fontSize: '1.1rem' }}>
              {formatCurrency(stats.totalAmount)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(211, 173, 50, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MoneyIcon sx={{ color: '#D3AD32', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2.4}>
    <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
      border: '1px solid rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7a8f', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6', fontSize: '1.1rem' }}>
              {stats.totalEqubs + stats.totalIddirs}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: 'rgba(139, 92, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircleIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <TextField fullWidth placeholder="Search by condominium name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7a8f' }} /></InputAdornment>, sx: { borderRadius: '10px' } }} size="small" />
      </Paper>

      {/* Condo Cards */}
      <Grid container spacing={3}>
        {paginatedData.map((condo) => (
          <Grid item xs={12} key={condo.condoId}>
            <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(211, 173, 50, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccountBalanceIcon sx={{ color: '#D3AD32' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>{condo.condoName}</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7a8f' }}>Code: {condo.condoCode}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`${condo.equbs.length} Equbs`} size="small" sx={{ backgroundColor: 'rgba(211, 173, 50, 0.08)', color: '#D3AD32' }} />
                  <Chip label={`${condo.iddirs.length} Iddirs`} size="small" sx={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }} />
                  <IconButton size="small" onClick={() => handleViewDetails(condo)} sx={{ color: '#6b7a8f' }}>
                    <FaEye size={18} />
                  </IconButton>
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ p: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7a8f', mb: 1 }}>Equbs</Typography>
                  {condo.equbs.map((equb) => (
                    <Box key={equb.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8f9fa', borderRadius: '8px', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{equb.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{equb.noMembers} members • {formatCurrency(equb.contributionAmount)}</Typography>
                      </Box>
                      {getStatusChip(equb.status)}
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7a8f', mb: 1 }}>Iddirs</Typography>
                  {condo.iddirs.map((iddir) => (
                    <Box key={iddir.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8f9fa', borderRadius: '8px', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{iddir.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{iddir.noMembers} members • {formatCurrency(iddir.contributionAmount)}</Typography>
                      </Box>
                      {getStatusChip(iddir.status)}
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Detail Modal */}
      <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="md" fullWidth TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', p: 3, color: '#fff' }}>
          <DialogTitle sx={{ p: 0, fontWeight: 700 }}>Condominium Details</DialogTitle>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{selectedItem?.condoName} - {selectedItem?.condoCode}</Typography>
        </Box>
        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          {selectedItem && (
            <Box>
              <Grid container spacing={2} sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f3f5' }}>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Equbs</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: '#D3AD32' }}>{selectedItem.equbs.length}</Typography></Grid>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Iddirs</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>{selectedItem.iddirs.length}</Typography></Grid>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#6b7a8f' }}>Total Members</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                  {selectedItem.equbs.reduce((s, e) => s + e.noMembers, 0) + selectedItem.iddirs.reduce((s, i) => s + i.noMembers, 0)}
                </Typography></Grid>
              </Grid>
              <Box sx={{ borderBottom: '1px solid #f1f3f5', bgcolor: '#ffffff' }}>
                <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 }, '& .Mui-selected': { color: '#D3AD32' }, '& .MuiTabs-indicator': { backgroundColor: '#D3AD32' } }}>
                  <Tab label="Equbs" icon={<AccountBalanceIcon />} iconPosition="start" />
                  <Tab label="Iddirs" icon={<ShieldIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              <Box sx={{ p: 3 }}>
                {detailTab === 0 && (
                  selectedItem.equbs.map((equb) => (
                    <Paper key={equb.id} sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #f1f3f5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box><Typography variant="body2" fontWeight={500}>{equb.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{equb.noMembers} members • {formatCurrency(equb.contributionAmount)} • {new Date(equb.startDate).toLocaleDateString()} - {new Date(equb.dueDate).toLocaleDateString()}</Typography></Box>
                        {getStatusChip(equb.status)}
                      </Box>
                    </Paper>
                  ))
                )}
                {detailTab === 1 && (
                  selectedItem.iddirs.map((iddir) => (
                    <Paper key={iddir.id} sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #f1f3f5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box><Typography variant="body2" fontWeight={500}>{iddir.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{iddir.noMembers} members • {formatCurrency(iddir.contributionAmount)} • Started: {new Date(iddir.startedDate).toLocaleDateString()}</Typography></Box>
                        {getStatusChip(iddir.status)}
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}><Button onClick={() => setOpenDetailModal(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default EqubIddirManagement;