// API Configuration for Frontend (JavaScript Version)
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
    UPDATE: (id) => `/todos/${id}`,
    DELETE: (id) => `/todos/${id}`,
    REORDER: '/todos/reorder',
  },

  // Transaction Routes (Auth Required)
  TRANSACTIONS: {
    GET_ALL: '/transactions',
    GET_SUMMARY: '/transactions/summary',
    GET_ANALYTICS: '/transactions/analytics',
    CREATE: '/transactions',
    UPDATE: (id) => `/transactions/${id}`,
    DELETE: (id) => `/transactions/${id}`,
  },

  // Dashboard Routes (Auth Required)
  DASHBOARD: {
    GET_STATS: '/dashboard/stats',
  },

  // Admin Routes (Admin Only)
  ADMIN: {
    GET_ALL_USERS: '/admin/users',
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    IMPERSONATE_USER: (userId) => `/admin/impersonate/${userId}`,
  },
};

// Full URL Builder
export const getFullUrl = (route) => {
  return `${API_BASE_URL}${route}`;
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return query ? `?${query}` : '';
};

// Example Usage:
// import { API_ROUTES, getFullUrl, buildQueryString } from './api-config';
//
// // Simple route
// const signupUrl = getFullUrl(API_ROUTES.AUTH.SIGNUP);
// // Result: http://localhost:5000/api/auth/signup
//
// // Route with ID
// const updateTodoUrl = getFullUrl(API_ROUTES.TODOS.UPDATE('todo-id-123'));
// // Result: http://localhost:5000/api/todos/todo-id-123
//
// // Route with query params
// const todosUrl = getFullUrl(API_ROUTES.TODOS.GET_ALL) + buildQueryString({ filter: 'all', page: 1 });
// // Result: http://localhost:5000/api/todos?filter=all&page=1
