// src/api/axiosConfig.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

console.log('🔗 API URL:', API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('📥 Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const api = {
  auth: {
    login: (data) => axiosInstance.post('/auth/login', data),
    register: (data) => axiosInstance.post('/auth/register', data),
    logout: () => axiosInstance.post('/auth/logout'),
    me: () => axiosInstance.get('/auth/me'),
  },
  condos: {
    getAll: () => axiosInstance.get('/condos'),
    getById: (id) => axiosInstance.get(`/condos/${id}`),
    create: (data) => axiosInstance.post('/condos', data),
    update: (id, data) => axiosInstance.patch(`/condos/${id}`, data),
    toggleStatus: (id) => axiosInstance.patch(`/condos/${id}/status`),
    delete: (id) => axiosInstance.delete(`/condos/${id}`),
    search: (term) => axiosInstance.get('/condos/search', { params: { search: term } }),
  },
  blocks: {
    getAll: (condoId) => condoId ? axiosInstance.get(`/blocks/${condoId}/blocks/admin`) : axiosInstance.get('/blocks/admin'),
    getById: (condoId, blockId) => (blockId ? axiosInstance.get(`/blocks/${condoId}/blocks/${blockId}/admin`) : axiosInstance.get(`/blocks/${condoId}`)),
    create: (condoId, data) => (condoId ? axiosInstance.post(`/blocks/${condoId}/blocks`, { ...data, condoId }) : axiosInstance.post('/blocks', data)),
    update: (condoId, blockId, data) => (blockId ? axiosInstance.patch(`/blocks/${condoId}/blocks/${blockId}`, data) : axiosInstance.patch(`/blocks/${condoId}`, data)),
    delete: (condoId, blockId) => (blockId ? axiosInstance.delete(`/blocks/${condoId}/blocks/${blockId}`) : axiosInstance.delete(`/blocks/${condoId}`)),
    getStatistics: (condoId, blockId) => axiosInstance.get(`/blocks/${condoId}/blocks/${blockId}/statistics`),
  },
  rooms: {
    getAll: (condoId, params) => condoId ? axiosInstance.get(`/rooms/${condoId}`, { params }) : axiosInstance.get('/rooms/admin', { params }),
    getById: (condoId, roomId) => (roomId ? axiosInstance.get(`/rooms/${condoId}/${roomId}`) : axiosInstance.get(`/rooms/admin/${condoId}`)),
    create: (condoId, data) => (condoId ? axiosInstance.post(`/rooms/${condoId}`, data) : axiosInstance.post('/rooms', data)),
    update: (condoId, roomId, data) => (roomId ? axiosInstance.patch(`/rooms/${condoId}/${roomId}`, data) : axiosInstance.patch(`/rooms/${condoId}`, data)),
    updateStatus: (condoId, roomId, data) => (roomId ? axiosInstance.patch(`/rooms/${condoId}/${roomId}/status`, data) : axiosInstance.patch(`/rooms/${condoId}/status`, data)),
    delete: (condoId, roomId) => (roomId ? axiosInstance.delete(`/rooms/${condoId}/${roomId}`) : axiosInstance.delete(`/rooms/${condoId}`)),
    getAvailable: (condoId, params) => condoId ? axiosInstance.get(`/rooms/${condoId}/available`, { params }) : axiosInstance.get('/rooms/admin/available', { params }),
    getOccupied: (condoId, params) => condoId ? axiosInstance.get(`/rooms/${condoId}/occupied`, { params }) : axiosInstance.get('/rooms/admin/occupied', { params }),
    getReserved: (condoId, params) => condoId ? axiosInstance.get(`/rooms/${condoId}/reserved`, { params }) : axiosInstance.get('/rooms/admin/reserved', { params }),
  },
  users: {
    getAll: (condoId, params) => condoId ? axiosInstance.get(`/users/${condoId}`, { params }) : axiosInstance.get('/admin/users', { params }),
    getById: (id, condoId) => condoId ? axiosInstance.get(`/users/${condoId}/${id}`) : axiosInstance.get(`/admin/users/${id}`),
    create: (data) => axiosInstance.post('/admin/users', data),
    update: (id, data, condoId) => condoId ? axiosInstance.patch(`/users/${condoId}/${id}`, data) : axiosInstance.patch(`/admin/users/${id}`, data),
    verify: (id, isVerified, condoId) => condoId ? axiosInstance.patch(`/users/${condoId}/${id}/verify`, { isVerified }) : axiosInstance.patch(`/admin/users/${id}/verify`, { isVerified }),
    updateRole: (id, role, condoId) => condoId ? axiosInstance.patch(`/users/${condoId}/${id}/role`, { role }) : axiosInstance.patch(`/admin/users/${id}/role`, { role }),
    delete: (id, condoId) => condoId ? axiosInstance.delete(`/users/${condoId}/${id}`) : axiosInstance.delete(`/admin/users/${id}`),
    search: (search, condoId) => condoId ? axiosInstance.get(`/users/${condoId}/search`, { params: { search } }) : axiosInstance.get('/users/search', { params: { search } }),
  },
  reports: {
    getMy: () => axiosInstance.get('/reports/my'),
    getAdminAll: (params) => axiosInstance.get('/reports/admin/all', { params }),
    getById: (id) => axiosInstance.get(`/reports/${id}`),
    create: (data) => axiosInstance.post('/reports', data),
    update: (id, data) => axiosInstance.put(`/reports/${id}`, data),
    delete: (id) => axiosInstance.delete(`/reports/${id}`),
    assign: (id, data) => axiosInstance.put(`/reports/${id}/assign`, data),
    updateStatus: (id, data) => axiosInstance.put(`/reports/${id}/status`, data),
    addResponse: (id, data) => axiosInstance.post(`/reports/${id}/response`, data),
  },
  payments: {
    getMy: (params) => axiosInstance.get('/payments/my', { params }),
    getAll: (params) => axiosInstance.get('/payments', { params }),
    getById: (id) => axiosInstance.get(`/payments/${id}`),
    getStatistics: () => axiosInstance.get('/payments/statistics'),
    approve: (id, data) => axiosInstance.patch(`/payments/${id}/approve`, data),
    reject: (id, data) => axiosInstance.patch(`/payments/${id}/reject`, data),
    cancel: (id) => axiosInstance.patch(`/payments/${id}/cancel`),
  },
  lostFound: {
    getAll: (params) => axiosInstance.get('/lost-found', { params }),
    getById: (id) => axiosInstance.get(`/lost-found/${id}`),
    create: (data) => axiosInstance.post('/lost-found', data),
    update: (id, data) => axiosInstance.put(`/lost-found/${id}`, data),
    delete: (id) => axiosInstance.delete(`/lost-found/${id}`),
    claim: (id, data) => axiosInstance.post(`/lost-found/${id}/claim`, data),
    verifyClaim: (id) => axiosInstance.put(`/lost-found/${id}/verify-claim`),
  },
  promotions: {
    getAll: (params) => axiosInstance.get('/promotions', { params }),
    getById: (id) => axiosInstance.get(`/promotions/${id}`),
    create: (data) => axiosInstance.post('/promotions', data),
    update: (id, data) => axiosInstance.put(`/promotions/${id}`, data),
    delete: (id) => axiosInstance.delete(`/promotions/${id}`),
    review: (id, data) => axiosInstance.put(`/promotions/${id}/review`, data),
    trackClick: (id) => axiosInstance.post(`/promotions/${id}/click`),
  },
  announcements: {
    getAll: (params) => axiosInstance.get('/announcements', { params }),
    getById: (id) => axiosInstance.get(`/announcements/${id}`),
    create: (data) => axiosInstance.post('/announcements', data),
    update: (id, data) => axiosInstance.put(`/announcements/${id}`, data),
    delete: (id) => axiosInstance.delete(`/announcements/${id}`),
  },
  equbs: {
    getAll: (condoId) => axiosInstance.get(`/equbs/${condoId}/equbs`),
    getById: (id) => axiosInstance.get(`/equbs/${id}`),
    create: (condoId, data) => axiosInstance.post(`/equbs/${condoId}/equbs`, data),
    update: (condoId, id, data) => axiosInstance.patch(`/equbs/${condoId}/equbs/${id}`, data),
    delete: (condoId, id) => axiosInstance.delete(`/equbs/${condoId}/equbs/${id}`),
  },
  iddirs: {
    getAll: (condoId) => axiosInstance.get(`/iddirs/${condoId}/iddirs`),
    getById: (id) => axiosInstance.get(`/iddirs/${id}`),
    create: (condoId, data) => axiosInstance.post(`/iddirs/${condoId}/iddirs`, data),
    update: (condoId, id, data) => axiosInstance.patch(`/iddirs/${condoId}/iddirs/${id}`, data),
    delete: (condoId, id) => axiosInstance.delete(`/iddirs/${condoId}/iddirs/${id}`),
  },
};
