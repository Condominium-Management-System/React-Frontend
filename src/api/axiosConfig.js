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
    updateMyProfile: (data) => {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      return axiosInstance.patch('/auth/me', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
    },
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
    getMyFullProfile: () => axiosInstance.get('/users/me/full-profile'),
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
    getAll: (params) => axiosInstance.get('/reports', { params }),
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
    create: (data) => axiosInstance.post('/payments', data),
    getMy: (params) => axiosInstance.get('/payments/my', { params }),
    getAll: (params) => axiosInstance.get('/payments', { params }),
    getById: (id) => axiosInstance.get(`/payments/${id}`),
    getStatistics: (params) => axiosInstance.get('/payments/statistics', { params }),
    approve: (id, data) => axiosInstance.patch(`/payments/${id}/approve`, data),
    reject: (id, data) => axiosInstance.patch(`/payments/${id}/reject`, data),
    cancel: (id) => axiosInstance.patch(`/payments/${id}/cancel`),
  },
  transactions: {
    getMy: (params) => axiosInstance.get('/transactions/my', { params }),
    getAll: (params) => axiosInstance.get('/transactions', { params }),
    getById: (id) => axiosInstance.get(`/transactions/${id}`),
    getByReference: (ref) => axiosInstance.get(`/transactions/reference/${ref}`),
    getStatistics: (params) => axiosInstance.get('/transactions/statistics', { params }),
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
    getUnreadCount: () => axiosInstance.get('/announcements/unread-count'),
    markRead: (id) => axiosInstance.post(`/announcements/${id}/read`),
    markAllRead: () => axiosInstance.post('/announcements/mark-all-read'),
    create: (data) => axiosInstance.post('/announcements', data),
    update: (id, data) => axiosInstance.put(`/announcements/${id}`, data),
    delete: (id) => axiosInstance.delete(`/announcements/${id}`),
  },
  condoAccounts: {
    getAll: (params) => axiosInstance.get('/condo-accounts', { params }),
    getById: (id) => axiosInstance.get(`/condo-accounts/${id}`),
    create: (data) => axiosInstance.post('/condo-accounts', data),
    update: (id, data) => axiosInstance.patch(`/condo-accounts/${id}`, data),
    delete: (id) => axiosInstance.delete(`/condo-accounts/${id}`),
    setDefault: (id) => axiosInstance.patch(`/condo-accounts/${id}/default`),
  },
  accounts: {
    getRecipientAccounts: (userId) => axiosInstance.get(`/accounts/recipient/${userId}`),
    getAll: () => axiosInstance.get('/accounts'),
    getById: (id) => axiosInstance.get(`/accounts/${id}`),
    create: (data) => axiosInstance.post('/accounts', data),
    update: (id, data) => axiosInstance.patch(`/accounts/${id}`, data),
    delete: (id) => axiosInstance.delete(`/accounts/${id}`),
    setDefault: (id) => axiosInstance.patch(`/accounts/${id}/default`),
  },
  equbs: {
    getMy: () => axiosInstance.get('/equbs/my'),
    getMyById: (id) => axiosInstance.get(`/equbs/my/${id}`),
    requestMembership: (id) => axiosInstance.post(`/equbs/${id}/join`),
    getAll: (params) => axiosInstance.get('/admin/equbs', { params: { limit: 100, ...params } }),
    getById: (id) => axiosInstance.get(`/admin/equbs/${id}`),
    create: (data) => axiosInstance.post('/admin/equbs', data),
    update: (id, data) => axiosInstance.patch(`/admin/equbs/${id}`, data),
    delete: (id) => axiosInstance.delete(`/admin/equbs/${id}`),
    addMember: (equbId, userId) => axiosInstance.post('/admin/equbs/members', { equbId, userId }),
    removeMember: (equbId, userId) => axiosInstance.delete(`/admin/equbs/${equbId}/members/${userId}`),
    drawWinner: (equbId, data = {}) => axiosInstance.post(`/admin/equbs/${equbId}/draw`, data),
    recordPayment: (equbId, userId, data = {}) => axiosInstance.post(`/admin/equbs/${equbId}/members/${userId}/pay`, data),
  },
  iddirs: {
    getMy: () => axiosInstance.get('/iddirs/my'),
    getMyById: (id) => axiosInstance.get(`/iddirs/my/${id}`),
    requestMembership: (id) => axiosInstance.post(`/iddirs/${id}/join`),
    createClaim: (id, data) => axiosInstance.post(`/iddirs/${id}/claims`, data),
    getMyClaims: () => axiosInstance.get('/iddirs/my-claims'),
    getClaimById: (id) => axiosInstance.get(`/iddirs/claims/${id}`),
    getAll: (params) => axiosInstance.get('/admin/iddirs', { params: { limit: 100, ...params } }),
    getById: (id) => axiosInstance.get(`/admin/iddirs/${id}`),
    create: (data) => axiosInstance.post('/admin/iddirs', data),
    update: (id, data) => axiosInstance.patch(`/admin/iddirs/${id}`, data),
    delete: (id) => axiosInstance.delete(`/admin/iddirs/${id}`),
    addMember: (iddirId, userId) => axiosInstance.post('/admin/iddirs/members', { iddirId, userId }),
    removeMember: (iddirId, userId) => axiosInstance.delete(`/admin/iddirs/${iddirId}/members/${userId}`),
    recordPayment: (iddirId, userId, data = {}) => axiosInstance.post(`/admin/iddirs/${iddirId}/members/${userId}/pay`, data),
    disburse: (iddirId, data = {}) => axiosInstance.post(`/admin/iddirs/${iddirId}/disburse`, data),
  },
  chat: {
    getConversations: () => axiosInstance.get('/chat/conversations'),
    getMessages: (partnerId, params) => axiosInstance.get(`/chat/messages/${partnerId}`, { params }),
    getItemDiscussion: (lostFoundId) => axiosInstance.get(`/chat/item/${lostFoundId}`),
    sendMessage: (data) => axiosInstance.post('/chat/messages', data),
    markAsRead: (messageId) => axiosInstance.patch(`/chat/messages/${messageId}/read`),
  },
};
