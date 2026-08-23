import { api } from '../api/axiosConfig';

export const lostFoundService = {
  // Get all lost & found items
  getAll: async (params = {}) => {
    try {
      const response = await api.lostFound.getAll(params);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lost & found items:', error);
      throw error;
    }
  },

  // Get single item
  getById: async (id) => {
    try {
      const response = await api.lostFound.getById(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lost & found item:', error);
      throw error;
    }
  },

  // Create new item
  create: async (data) => {
    try {
      const response = await api.lostFound.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating lost & found item:', error);
      throw error;
    }
  },

  // Update item
  update: async (id, data) => {
    try {
      const response = await api.lostFound.update(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating lost & found item:', error);
      throw error;
    }
  },

  // Delete item
  delete: async (id) => {
    try {
      const response = await api.lostFound.delete(id);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting lost & found item:', error);
      throw error;
    }
  },

  // Claim item
  claim: async (id, data) => {
    try {
      const response = await api.lostFound.claim(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error claiming lost & found item:', error);
      throw error;
    }
  },

  // Verify claim
  verifyClaim: async (id) => {
    try {
      const response = await api.lostFound.verifyClaim(id);
      return response.data.data;
    } catch (error) {
      console.error('Error verifying claim:', error);
      throw error;
    }
  },

  // Get item statistics
  getStats: async (items) => {
    const stats = {
      total: items.length,
      lost: items.filter(i => i.type === 'lost').length,
      found: items.filter(i => i.type === 'found').length,
      open: items.filter(i => i.status === 'open').length,
      matched: items.filter(i => i.status === 'matched').length,
      claimed: items.filter(i => i.status === 'claimed').length,
      archived: items.filter(i => i.status === 'archived').length,
    };
    return stats;
  }
};