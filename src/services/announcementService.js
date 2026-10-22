import { api } from '../api/axiosConfig';

export const announcementService = {
  getAll: async (params = {}) => {
    try {
      // Remove any undefined values
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });
      
      console.log('📡 Fetching announcements with params:', cleanParams);
      const response = await api.announcements.getAll(cleanParams);
      console.log('📥 Announcements response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching announcements:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.announcements.getById(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('📤 Creating announcement with data:', data);
      const response = await api.announcements.create(data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error creating announcement:', error.response?.data);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.announcements.update(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.announcements.delete(id);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  getStats: async (announcements) => {
    const stats = {
      total: announcements.length,
      pinned: announcements.filter(a => a.isPinned).length,
      active: announcements.filter(a => !a.expiryDate || new Date(a.expiryDate) > new Date()).length,
      expired: announcements.filter(a => a.expiryDate && new Date(a.expiryDate) < new Date()).length,
      byType: {
        general: announcements.filter(a => a.announcementType === 'general').length,
        emergency: announcements.filter(a => a.announcementType === 'emergency').length,
        event: announcements.filter(a => a.announcementType === 'event').length,
        celebration: announcements.filter(a => a.announcementType === 'celebration').length,
        mourning: announcements.filter(a => a.announcementType === 'mourning').length,
      }
    };
    return stats;
  }
};