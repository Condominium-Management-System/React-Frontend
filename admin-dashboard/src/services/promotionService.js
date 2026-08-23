import { api } from '../api/axiosConfig';

export const promotionService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.promotions.getAll(params);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.promotions.getById(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      // If data is FormData, log what's being sent
      if (data instanceof FormData) {
        console.log('📤 Creating promotion with FormData:');
        for (let [key, value] of data.entries()) {
          console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
        }
      }
      const response = await api.promotions.create(data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error creating promotion:', error.response?.data);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.promotions.update(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.promotions.delete(id);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  review: async (id, data) => {
    try {
      const response = await api.promotions.review(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error reviewing promotion:', error);
      throw error;
    }
  },

  getStats: async (promotions) => {
    const stats = {
      total: promotions.length,
      pending: promotions.filter(p => p.status === 'pending').length,
      approved: promotions.filter(p => p.status === 'approved').length,
      active: promotions.filter(p => p.status === 'active').length,
      expired: promotions.filter(p => p.status === 'expired').length,
      rejected: promotions.filter(p => p.status === 'rejected').length,
      cancelled: promotions.filter(p => p.status === 'cancelled').length,
      totalRevenue: promotions.reduce((sum, p) => sum + (p.price || 0), 0),
    };
    return stats;
  }
};