// src/api/axiosConfig.js
import axios from 'axios';

const API_URL = 'https://backend-a3xi.onrender.com/api';

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
    console.log('📤 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
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
    console.log('📥 Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
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
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const api = {
  auth: {
    login: (data) => {
      console.log('🔐 Calling login API with:', data.email);
      return axiosInstance.post('/auth/login', data);
    },
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
  },
  users: {
    getAll: (condoId) => axiosInstance.get(`/admin/users${condoId ? `/${condoId}` : ''}`),
    getById: (id) => axiosInstance.get(`/admin/users/${id}`),
    getByCondo: (condoId) => axiosInstance.get(`/admin/users/${condoId}`),
    verify: (condoId, userId) => axiosInstance.patch(`/admin/users/${condoId}/${userId}/verify`),
    update: (condoId, userId, data) => axiosInstance.patch(`/users/${condoId}/${userId}`, data),
    delete: (condoId, userId) => axiosInstance.delete(`/users/${condoId}/${userId}`),
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