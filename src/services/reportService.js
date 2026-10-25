import { api } from '../api/axiosConfig';

export const reportService = {
  // Super Admin - Get report statistics per condominium
  getSuperAdminStats: async () => {
    try {
      // First get all condos
      const condosRes = await api.condos.getAll();
      const condos = condosRes.data?.data || condosRes.data || [];
      
      // Then get reports for each condo
      const reportStats = await Promise.all(
        condos.map(async (condo) => {
          try {
            // Get reports for this condo
            const reportsRes = await api.reports.getAdminAll({ 
              condoId: condo.id,
              limit: 100 // Get all reports
            });
            const reports = reportsRes.data?.data?.items || (Array.isArray(reportsRes.data?.data) ? reportsRes.data.data : []);
            
            // Calculate statistics
            const total = reports.length;
            const reported = reports.filter(r => r.status === 'reported').length;
            const assigned = reports.filter(r => r.status === 'assigned').length;
            const inProgress = reports.filter(r => r.status === 'in_progress').length;
            const resolved = reports.filter(r => r.status === 'resolved').length;
            const closed = reports.filter(r => r.status === 'closed').length;
            
            // Get categories breakdown
            const categories = {};
            reports.forEach(r => {
              categories[r.category] = (categories[r.category] || 0) + 1;
            });
            
            // Get priorities breakdown
            const priorities = {};
            reports.forEach(r => {
              priorities[r.priority] = (priorities[r.priority] || 0) + 1;
            });
            
            return {
              condoId: condo.id,
              condoName: condo.condoName,
              condoCode: condo.condoCode,
              total,
              reported,
              assigned,
              inProgress,
              resolved,
              closed,
              categories,
              priorities,
            };
          } catch (err) {
            return {
              condoId: condo.id,
              condoName: condo.condoName,
              condoCode: condo.condoCode,
              total: 0,
              reported: 0,
              assigned: 0,
              inProgress: 0,
              resolved: 0,
              closed: 0,
              categories: {},
              priorities: {},
            };
          }
        })
      );
      
      return reportStats;
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      throw error;
    }
  },
  
  // Condo Admin - Get detailed reports for their condo
  getCondoAdminReports: async (filters = {}) => {
    try {
      const response = await api.reports.getAdminAll(filters);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching condo admin reports:', error);
      throw error;
    }
  },
  
  // Update report status (Condo Admin)
  updateReportStatus: async (reportId, data) => {
    try {
      const response = await api.reports.updateStatus(reportId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },
  
  // Assign report (Condo Admin)
  assignReport: async (reportId, data) => {
    try {
      const response = await api.reports.assign(reportId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error assigning report:', error);
      throw error;
    }
  },
  
  // Add response (Condo Admin)
  addResponse: async (reportId, data) => {
    try {
      const response = await api.reports.addResponse(reportId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },
  // Resident - Create a new report
  createReport: async (data) => {
    try {
      const response = await api.reports.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Resident - Get own submitted reports
  getMyReports: async () => {
    try {
      const response = await api.reports.getMy();
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my reports:', error);
      throw error;
    }
  },

  // Resident / Admin - Delete or withdraw report
  deleteReport: async (reportId) => {
    try {
      const response = await api.reports.delete(reportId);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Resident / Admin - Update report details
  updateReport: async (reportId, data) => {
    try {
      const response = await api.reports.update(reportId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },
};
