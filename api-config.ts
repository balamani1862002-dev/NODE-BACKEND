// API Configuration for Frontend
// Copy this file to your frontend project

// Base URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ROUTES = {
  // Authentication Routes (No Auth Required)
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User Profile Routes (Auth Required)
  USER: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },

  // Todo Routes (Auth Required)
  TODOS: {
    GET_ALL: '/todos',
    CREATE: '/todos',
    UPDATE: (id: string) => `/todos/${id}`,
    DELETE: (id: string) => `/todos/${id}`,
    REORDER: '/todos/reorder',
  },

  // Transaction Routes (Auth Required)
  TRANSACTIONS: {
    GET_ALL: '/transactions',
    GET_SUMMARY: '/transactions/summary',
    GET_ANALYTICS: '/transactions/analytics',
    CREATE: '/transactions',
    UPDATE: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
  },

  // Dashboard Routes (Auth Required)
  DASHBOARD: {
    GET_STATS: '/dashboard/stats',
  },

  // Admin Routes (Admin Only)
  ADMIN: {
    GET_ALL_USERS: '/admin/users',
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    IMPERSONATE_USER: (userId: string) => `/admin/impersonate/${userId}`,
  },
};

// Full URL Builder
export const getFullUrl = (route: string): string => {
  return `${API_BASE_URL}${route}`;
};

// Example Usage:
// const signupUrl = getFullUrl(API_ROUTES.AUTH.SIGNUP);
// const updateTodoUrl = getFullUrl(API_ROUTES.TODOS.UPDATE('todo-id-123'));
