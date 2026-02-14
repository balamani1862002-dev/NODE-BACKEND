// Complete API Service Example for React/TypeScript Frontend
// Copy this to your frontend project (e.g., src/services/api.ts)

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // ==================== Authentication ====================
  auth: {
    signup: (data: { name: string; email: string; password: string; phone?: string }) =>
      apiClient.post('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),

    forgotPassword: (data: { email: string }) =>
      apiClient.post('/auth/forgot-password', data),

    resetPassword: (data: { token: string; password: string }) =>
      apiClient.post('/auth/reset-password', data),
  },

  // ==================== User Profile ====================
  user: {
    getProfile: () =>
      apiClient.get('/users/profile'),

    updateProfile: (data: { name?: string; email?: string; phone?: string; address?: string; profileImage?: string }) =>
      apiClient.put('/users/profile', data),
  },

  // ==================== Todos ====================
  todos: {
    getAll: (params?: { filter?: string; page?: number; limit?: number }) =>
      apiClient.get('/todos', { params }),

    create: (data: { title: string; description: string; isImportant?: boolean; hasReminder?: boolean; reminderDate?: string }) =>
      apiClient.post('/todos', data),

    update: (id: string, data: { title?: string; description?: string; status?: string; isImportant?: boolean; hasReminder?: boolean; reminderDate?: string; order?: number }) =>
      apiClient.put(`/todos/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/todos/${id}`),

    reorder: (data: { todos: Array<{ id: string; order: number }> }) =>
      apiClient.put('/todos/reorder', data),
  },

  // ==================== Transactions ====================
  transactions: {
    getAll: (params?: { type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
      apiClient.get('/transactions', { params }),

    getSummary: (params?: { startDate?: string; endDate?: string }) =>
      apiClient.get('/transactions/summary', { params }),

    getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
      apiClient.get('/transactions/analytics', { params }),

    create: (data: { type: string; amount: number; category: string; description: string; date: string }) =>
      apiClient.post('/transactions', data),

    update: (id: string, data: { type?: string; amount?: number; category?: string; description?: string; date?: string }) =>
      apiClient.put(`/transactions/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/transactions/${id}`),
  },

  // ==================== Dashboard ====================
  dashboard: {
    getStats: () =>
      apiClient.get('/dashboard/stats'),
  },

  // ==================== Admin ====================
  admin: {
    getAllUsers: (params?: { page?: number; limit?: number; role?: string }) =>
      apiClient.get('/admin/users', { params }),

    deleteUser: (userId: string) =>
      apiClient.delete(`/admin/users/${userId}`),

    impersonateUser: (userId: string) =>
      apiClient.post(`/admin/impersonate/${userId}`),
  },
};

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Export axios instance for custom requests
export default apiClient;

// ==================== Usage Examples ====================
/*

// 1. Signup
try {
  const response = await apiService.auth.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
  setAuthToken(response.data.token);
  console.log('User:', response.data.user);
} catch (error) {
  console.error('Signup failed:', error);
}

// 2. Login
try {
  const response = await apiService.auth.login({
    email: 'john@example.com',
    password: 'password123'
  });
  setAuthToken(response.data.token);
} catch (error) {
  console.error('Login failed:', error);
}

// 3. Get Profile
try {
  const response = await apiService.user.getProfile();
  console.log('Profile:', response.data);
} catch (error) {
  console.error('Failed to get profile:', error);
}

// 4. Get Todos
try {
  const response = await apiService.todos.getAll({ filter: 'all', page: 1, limit: 50 });
  console.log('Todos:', response.data.todos);
} catch (error) {
  console.error('Failed to get todos:', error);
}

// 5. Create Transaction
try {
  const response = await apiService.transactions.create({
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly salary',
    date: new Date().toISOString()
  });
  console.log('Transaction created:', response.data);
} catch (error) {
  console.error('Failed to create transaction:', error);
}

// 6. Get Dashboard Stats
try {
  const response = await apiService.dashboard.getStats();
  console.log('Stats:', response.data);
} catch (error) {
  console.error('Failed to get stats:', error);
}

*/
