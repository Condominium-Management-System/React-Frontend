// src/pages/super-admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  Report as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';
import 'react-toastify/dist/ReactToastify.css';

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const CondoCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#ffffff',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const STATUS_COLORS = {
  reported: '#f59e0b',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#22c55e',
  closed: '#6b7280',
};

const Reports = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportStats, setReportStats] = useState([]);
  const [expandedCondo, setExpandedCondo] = useState(null);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    reported: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      setLoading(true);
      const stats = await reportService.getSuperAdminStats();
      setReportStats(stats || []);
      
      const totals = (stats || []).reduce((acc, condo) => ({
        total: acc.total + (condo.total || 0),
        reported: acc.reported + (condo.reported || 0),
        assigned: acc.assigned + (condo.assigned || 0),
        inProgress: acc.inProgress + (condo.inProgress || 0),
        resolved: acc.resolved + (condo.resolved || 0),
        closed: acc.closed + (condo.closed || 0),
      }), { total: 0, reported: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 });
      
      setTotalStats(totals);
    } catch (error) {
      console.error('Error fetching report stats:', error);
      toast.error('Failed to fetch report stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (condoId) => {
    setExpandedCondo(expandedCondo === condoId ? null : condoId);
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          Reports Overview
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
          Report statistics across all condominiums
        </Typography>
      </Box>

      {/* Total Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Total Reports</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#1a1a2e' }}>{totalStats.total}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Reported</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#f59e0b' }}>{totalStats.reported}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>In Progress</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#8b5cf6' }}>{totalStats.inProgress}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Resolved</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#22c55e' }}>{totalStats.resolved}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#6b7a8f', fontWeight: 500 }}>Closed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#6b7280' }}>{totalStats.closed}</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Condo Report Cards */}
      <Grid container spacing={3}>
        {reportStats.map((condo) => (
          <Grid item xs={12} key={condo.condoId}>
            <CondoCard>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleExpand(condo.condoId)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      background: 'rgba(211, 173, 50, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ReportIcon sx={{ color: '#D3AD32' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {condo.condoName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
                        Code: {condo.condoCode} • Total Reports: {condo.total}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${condo.reported} Reported`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
                    />
                    <Chip 
                      label={`${condo.inProgress} In Progress`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
                    />
                    <Chip 
                      label={`${condo.resolved} Resolved`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                    />
                    <IconButton size="small">
                      {expandedCondo === condo.condoId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Expanded Details */}
                <Collapse in={expandedCondo === condo.condoId}>
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f1f3f5' }}>
                    <Grid container spacing={3}>
                      {/* Status Breakdown */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
                          Status Breakdown
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.entries({
                            Reported: condo.reported,
                            Assigned: condo.assigned,
                            'In Progress': condo.inProgress,
                            Resolved: condo.resolved,
                            Closed: condo.closed,
                          }).map(([label, value]) => (
                            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" sx={{ color: '#6b7a8f', width: 100 }}>
                                {label}
                              </Typography>
                              <Box sx={{ flex: 1, height: 8, bgcolor: '#f1f3f5', borderRadius: 4 }}>
                                <Box 
                                  sx={{ 
                                    width: `${condo.total > 0 ? (value / condo.total) * 100 : 0}%`,
                                    height: 8,
                                    bgcolor: STATUS_COLORS[label.toLowerCase().replace(' ', '_')] || '#6b7280',
                                    borderRadius: 4,
                                    transition: 'width 0.5s ease',
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', minWidth: 30 }}>
                                {value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Grid>

                      {/* Categories */}
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
                          Categories
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.entries(condo.categories).map(([category, count]) => (
                            <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ color: '#6b7a8f', textTransform: 'capitalize' }}>
                                {category}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                                {count}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Grid>

                      {/* Priorities */}
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
                          Priorities
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.entries(condo.priorities).map(([priority, count]) => (
                            <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Chip 
                                label={priority}
                                size="small"
                                sx={{
                                  backgroundColor: priority === 'emergency' ? 'rgba(220, 38, 38, 0.1)' :
                                                  priority === 'high' ? 'rgba(245, 158, 11, 0.1)' :
                                                  priority === 'medium' ? 'rgba(59, 130, 246, 0.1)' :
                                                  'rgba(107, 114, 128, 0.1)',
                                  color: priority === 'emergency' ? '#dc2626' :
                                         priority === 'high' ? '#f59e0b' :
                                         priority === 'medium' ? '#3b82f6' : '#6b7280',
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                                {count}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>
            </CondoCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reports;