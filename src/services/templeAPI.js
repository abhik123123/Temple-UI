/**
 * templeAPI.js - API service for all temple management endpoints
 * Handles CRUD operations for all entities: Events, Services, Staff, Timings, Images, Donors
 */

import axios from 'axios';

// Get base URL from environment or use default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
console.log('API Base URL:', BASE_URL);
console.log('REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

/**
 * ============ EVENTS API ============
 */
export const eventsAPI = {
  // Get all events
  getAll: (params = {}) => 
    api.get('/events', { params }),

  // Get single event
  getById: (id) => 
    api.get(`/events/${id}`),

  // Create event (Admin only)
  create: (eventData) => {
    // Check if eventData is FormData (for file uploads)
    if (eventData instanceof FormData) {
      return api.post('/events', eventData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/events', eventData);
  },

  // Update event (Admin only)
  update: (id, eventData) => {
    // Check if eventData is FormData (for file uploads)
    if (eventData instanceof FormData) {
      return api.put(`/events/${id}`, eventData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/events/${id}`, eventData);
  },

  // Delete event (Admin only)
  delete: (id) => 
    api.delete(`/events/${id}`)
};

/**
 * ============ SERVICES API ============
 */
export const servicesAPI = {
  // Get all services
  getAll: (params = {}) => 
    api.get('/services', { params }),

  // Get single service
  getById: (id) => 
    api.get(`/services/${id}`),

  // Create service (Admin only)
  create: (serviceData) => 
    api.post('/services', serviceData),

  // Update service (Admin only)
  update: (id, serviceData) => 
    api.put(`/services/${id}`, serviceData),

  // Delete service (Admin only)
  delete: (id) => 
    api.delete(`/services/${id}`)
};

/**
 * ============ STAFF API ============
 */
export const staffAPI = {
  // Get all staff members
  getAll: (params = {}) => 
    api.get('/staff', { params }),

  // Get single staff member
  getById: (id) => 
    api.get(`/staff/${id}`),

  // Create staff member (Admin only)
  create: (staffData) => 
    api.post('/staff', staffData),

  // Update staff member (Admin only)
  update: (id, staffData) => 
    api.put(`/staff/${id}`, staffData),

  // Delete staff member (Admin only)
  delete: (id) => 
    api.delete(`/staff/${id}`)
};

/**
 * ============ TIMINGS API ============
 */
export const timingsAPI = {
  // Get all timings
  getAll: () => 
    api.get('/timings'),

  // Update timing for a specific day (Admin only)
  update: (day, timingData) => 
    api.put(`/timings/${day}`, timingData),

  // Add holiday (Admin only)
  addHoliday: (holidayData) => 
    api.post('/timings/holidays', holidayData),

  // Remove holiday (Admin only)
  removeHoliday: (id) => 
    api.delete(`/timings/holidays/${id}`)
};

/**
 * ============ IMAGES API ============
 */
export const imagesAPI = {
  // Get all home images
  getAll: (params = {}) => 
    api.get('/images/home', { params }),

  // Get single image
  getById: (id) => 
    api.get(`/images/home/${id}`),

  // Upload image (Admin only)
  upload: (formData) => 
    api.post('/images/home', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Update image metadata (Admin only)
  update: (id, imageData) => 
    api.put(`/images/home/${id}`, imageData),

  // Delete image (Admin only)
  delete: (id) => 
    api.delete(`/images/home/${id}`),

  // Download image (Admin only)
  download: (id) => 
    api.get(`/images/home/${id}/download`, { responseType: 'blob' })
};

/**
 * ============ DONORS API ============
 */
export const donorsAPI = {
  // Get all donors
  getAll: (params = {}) => 
    api.get('/donors', { params }),

  // Get single donor
  getById: (id) => 
    api.get(`/donors/${id}`),

  // Create donor (Admin only)
  create: (donorData) => 
    api.post('/donors', donorData),

  // Update donor (Admin only)
  update: (id, donorData) => 
    api.put(`/donors/${id}`, donorData),

  // Delete donor (Admin only)
  delete: (id) => 
    api.delete(`/donors/${id}`),

  // Get donation statistics
  getStatistics: () => 
    api.get('/donors/statistics'),

  // Export donors list (Admin only)
  export: () => 
    api.get('/donors/export', { responseType: 'blob' })
};

/**
 * ============ AUTHENTICATION API ============
 */
export const authAPI = {
  // Login
  login: (credentials) => 
    api.post('/auth/login', credentials),

  // Logout
  logout: () => 
    api.post('/auth/logout'),

  // Refresh token
  refreshToken: () => 
    api.post('/auth/refresh'),

  // Get current user
  getCurrentUser: () => 
    api.get('/auth/me')
};

export default api;
