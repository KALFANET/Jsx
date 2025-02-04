// services/api.ts
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

// API Endpoints
export const endpoints = {
  // System
  getSystemStatus: () => api.get('/system/status'),
  updateSystemSettings: (settings: any) => api.post('/system/settings', settings),
  
  // Devices
  getDevices: () => api.get('/devices'),
  getDeviceDetails: (id: string) => api.get(`/devices/${id}`),
  executeCommand: (deviceId: string, command: string) => 
    api.post(`/devices/${deviceId}/command`, { command }),
  
  // Software
  getSoftwareList: () => api.get('/software'),
  installSoftware: (deviceId: string, software: any) => 
    api.post(`/devices/${deviceId}/software/install`, software),
  uninstallSoftware: (deviceId: string, softwareId: string) => 
    api.delete(`/devices/${deviceId}/software/${softwareId}`),
  
  // Users
  getUsers: () => api.get('/users'),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (userId: string, userData: any) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  
  // Performance
  getPerformanceMetrics: (deviceId: string) => api.get(`/devices/${deviceId}/performance`),
  getHistoricalMetrics: (deviceId: string, period: string) => 
    api.get(`/devices/${deviceId}/performance/history`, { params: { period } })
};

export default api;