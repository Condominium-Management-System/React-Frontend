import { api } from '../api/axiosConfig';

// Generic CRUD service creator
export const createCrudService = (basePath) => {
  return {
    getAll: (params) => api.get(`/${basePath}`, { params }),
    getById: (id) => api.get(`/${basePath}/${id}`),
    create: (data) => api.post(`/${basePath}`, data),
    update: (id, data) => api.put(`/${basePath}/${id}`, data),
    delete: (id) => api.delete(`/${basePath}/${id}`),
  };
};

// Specific services
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getByCondo: (condoId) => api.get(`/users/${condoId}`),
  create: (data) => api.post('/users/register', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  verify: (id) => api.patch(`/users/${id}/verify`),
};

export const reportService = {
  getAll: (params) => api.get('/reports/admin/all', { params }),
  getMy: (params) => api.get('/reports/my', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  assign: (id, data) => api.put(`/reports/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/reports/${id}/status`, data),
  addResponse: (id, data) => api.post(`/reports/${id}/response`, data),
};