/**
 * API Service
 * Centralized Axios instance with session auth support and CSRF handling.
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Required for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store CSRF token
let csrfToken = null

/**
 * Fetch and cache CSRF token from Django.
 * Called before any mutating requests.
 */
export const fetchCsrfToken = async () => {
  if (csrfToken) return csrfToken
  const response = await api.get('/api/auth/csrf/')
  csrfToken = response.data.csrfToken
  return csrfToken
}

// Request interceptor: attach CSRF token to mutating requests
api.interceptors.request.use(async (config) => {
  const mutatingMethods = ['post', 'put', 'patch', 'delete']
  if (mutatingMethods.includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})

// Response interceptor: handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      // Reset CSRF token on CSRF failure; will re-fetch on next request
      csrfToken = null
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (username, password) =>
    api.post('/api/auth/login/', { username, password }),

  logout: () =>
    api.post('/api/auth/logout/'),

  checkSession: () =>
    api.get('/api/auth/session/'),
}

// ─── Employees ────────────────────────────────────────────────────────────────

export const employeeAPI = {
  list: (params = {}) =>
    api.get('/api/employees/', { params }),

  get: (id) =>
    api.get(`/api/employees/${id}/`),

  create: (data) =>
    api.post('/api/employees/', data),

  update: (id, data) =>
    api.put(`/api/employees/${id}/`, data),

  delete: (id) =>
    api.delete(`/api/employees/${id}/`),

  departments: () =>
    api.get('/api/employees/departments/'),
}

// ─── Burnout ──────────────────────────────────────────────────────────────────

export const burnoutAPI = {
  list: (employeeId) =>
    api.get('/api/employees/burnout/', { params: employeeId ? { employee: employeeId } : {} }),

  submit: (data) =>
    api.post('/api/employees/burnout/', data),
}

// ─── Performance Reviews ──────────────────────────────────────────────────────

export const reviewAPI = {
  list: (employeeId) =>
    api.get('/api/employees/reviews/', { params: employeeId ? { employee: employeeId } : {} }),

  update: (id, data) =>
    api.put(`/api/employees/reviews/${id}/`, data),

  generate: (employeeId, period, reviewerNotes = '') =>
    api.post('/api/ai/generate-review/', {
      employee_id: employeeId,
      period,
      reviewer_notes: reviewerNotes,
    }),
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsAPI = {
  dashboard: () =>
    api.get('/api/analytics/dashboard/'),

  attritionList: () =>
    api.get('/api/analytics/attrition/'),

  predictEmployee: (id) =>
    api.post(`/api/analytics/predict/${id}/`),

  predictAll: () =>
    api.post('/api/analytics/predict-all/'),
}

export default api
