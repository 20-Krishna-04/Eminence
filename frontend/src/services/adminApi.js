import api from './api';
import axios from 'axios';

export const adminApi = {
  getOverviewStats: () => api.get('/api/admin/stats/overview'),
  getRevenueStats: () => api.get('/api/admin/stats/revenue'),
  getRouteStats: () => api.get('/api/admin/stats/routes'),
  getCustomers: () => api.get('/api/admin/customers'),
  getDrivers: () => api.get('/api/admin/drivers'),
  getVehicles: () => api.get('/api/admin/vehicles'),
  getContracts: () => api.get('/api/admin/contracts'),
  
  createCustomer: (data) => axios.post('/api/admin/customers', data),
  updateCustomer: (id, data) => axios.put(`/api/admin/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/api/admin/customers/${id}`),
  
  createDriver: (data) => axios.post('/api/admin/drivers', data),
  updateDriver: (id, data) => axios.put(`/api/admin/drivers/${id}`, data),
  deleteDriver: (id) => api.delete(`/api/admin/drivers/${id}`),
  
  createVehicle: (data) => axios.post('/api/admin/vehicles', data),
  updateVehicle: (id, data) => axios.put(`/api/admin/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/api/admin/vehicles/${id}`),
  
  createContract: (data) => axios.post('/api/admin/contracts', data),
  updateContract: (id, data) => axios.put(`/api/admin/contracts/${id}`, data),
  
  createAdmin: (data) => axios.post('/api/admin/admins', data),
  updateAdmin: (id, data) => axios.put(`/api/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/api/admin/admins/${id}`)
};
