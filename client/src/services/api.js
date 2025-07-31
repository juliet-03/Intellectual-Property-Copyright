import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced API services
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  updateRiskScore: (id) => api.post(`/clients/${id}/risk-score`),
  getRecommendedActions: (id) => api.get(`/clients/${id}/recommended-actions`),
  bulkUpdate: (data) => api.post('/clients/bulk-update', data),
  export: (filters) => api.post('/clients/export', filters, { responseType: 'blob' }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const analyticsAPI = {
  getStats: () => api.get('/analytics/stats'),
  getPaymentTrends: (period = '6m') => api.get(`/analytics/payment-trends?period=${period}`),
  getRiskDistribution: () => api.get('/analytics/risk-distribution'),
  getRecentActivities: (limit = 10) => api.get(`/analytics/recent-activities?limit=${limit}`),
  getPerformanceMetrics: () => api.get('/analytics/performance'),
  getCollectionEfficiency: () => api.get('/analytics/collection-efficiency'),
  generateReport: (type, filters) => api.post(`/analytics/reports/${type}`, filters, {
    responseType: 'blob'
  })
};

export const verificationAPI = {
  getVerificationStatus: (clientId) => api.get(`/verification/${clientId}/status`),
  initiateStep: (clientId, stepId) => api.post(`/verification/${clientId}/steps/${stepId}/initiate`),
  uploadDocument: (clientId, stepId, formData) => 
    api.post(`/verification/${clientId}/steps/${stepId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  approveStep: (clientId, stepId) => api.post(`/verification/${clientId}/steps/${stepId}/approve`),
  rejectStep: (clientId, stepId, reason) => 
    api.post(`/verification/${clientId}/steps/${stepId}/reject`, { reason }),
  getDocuments: (clientId) => api.get(`/verification/${clientId}/documents`),
  downloadDocument: (documentId) => api.get(`/verification/documents/${documentId}/download`, {
    responseType: 'blob'
  })
};

export const integrationAPI = {
  syncWithLoanCompany: (clientId) => api.post(`/integrations/loan-company/sync/${clientId}`),
  validateWithCreditBureau: (clientId) => api.post(`/integrations/credit-bureau/validate/${clientId}`),
  processPayment: (clientId, paymentData) => 
    api.post(`/integrations/payment-gateway/process/${clientId}`, paymentData),
  sendSMS: (clientId, message) => api.post(`/integrations/sms/send/${clientId}`, { message }),
  getIntegrationHealth: () => api.get('/integrations/health'),
  getIntegrationLogs: (integration, limit = 50) => 
    api.get(`/integrations/${integration}/logs?limit=${limit}`),
  retryFailedIntegration: (integrationId) => api.post(`/integrations/retry/${integrationId}`)
};

export const activityAPI = {
  getClientTimeline: (clientId, limit = 50) => 
    api.get(`/activities/client/${clientId}?limit=${limit}`),
  getActivityAnalytics: (clientId, days = 30) => 
    api.get(`/activities/analytics/${clientId}?days=${days}`),
  logActivity: (activityData) => api.post('/activities/log', activityData),
  getSystemActivities: (limit = 100) => api.get(`/activities/system?limit=${limit}`),
  exportActivities: (filters) => api.post('/activities/export', filters, {
    responseType: 'blob'
  })
};

export const riskAPI = {
  calculateRiskScore: (clientId) => api.post(`/risk/calculate/${clientId}`),
  getRiskFactors: (clientId) => api.get(`/risk/factors/${clientId}`),
  updateRiskFactors: (clientId, factors) => api.put(`/risk/factors/${clientId}`, factors),
  getRiskTrends: (clientId, period = '3m') => 
    api.get(`/risk/trends/${clientId}?period=${period}`),
  getBenchmarkData: () => api.get('/risk/benchmarks'),
  getMLPredictions: (clientId) => api.get(`/risk/ml-predictions/${clientId}`),
  trainRiskModel: () => api.post('/risk/train-model')
};

export const messagesAPI = {
  getClientMessages: (clientId) => api.get(`/messages/client/${clientId}`),
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getTemplates: () => api.get('/messages/templates'),
  createTemplate: (template) => api.post('/messages/templates', template),
  scheduleMessage: (messageData) => api.post('/messages/schedule', messageData),
  getBulkMessageStatus: (batchId) => api.get(`/messages/bulk/${batchId}/status`)
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  verifyEmail: (token) => api.post('/auth/verify-email', { token })
};

export const profileAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getNotificationSettings: () => api.get('/auth/profile/notifications'),
  updateNotificationSettings: (settings) => api.put('/auth/profile/notifications', settings)
};

export const reportsAPI = {
  generateCollectionReport: (filters) => api.post('/reports/collection', filters, {
    responseType: 'blob'
  }),
  generateRiskReport: (filters) => api.post('/reports/risk', filters, {
    responseType: 'blob'
  }),
  generateActivityReport: (filters) => api.post('/reports/activity', filters, {
    responseType: 'blob'
  }),
  getReportHistory: () => api.get('/reports/history'),
  scheduleReport: (reportConfig) => api.post('/reports/schedule', reportConfig)
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = () => {
  const token = localStorage.getItem('token');
  const wsUrl = `ws://localhost:5000/ws?token=${token}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast.error('Real-time connection failed');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      createWebSocketConnection();
    }, 5000);
  };
  
  return ws;
};

export default api; 
