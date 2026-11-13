const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Custom error class for API responses
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Core HTTP client wrapping fetch with cookie credentials enabled by default
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // CRITICAL: Ensures HTTP-only auth cookies are sent and received
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    let data = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network request failed', 0, null);
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Authentication API endpoints
 */
export const authApi = {
  signup: (payload) => api.post('/api/auth/signup', payload),
  login: (payload) => api.post('/api/auth/login', payload),
  me: () => api.get('/api/auth/me'),
};

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
  getAdmin: () => api.get('/api/dashboard'),
  getResearcher: () => api.get('/api/dashboard/researcher'),
};

/**
 * Projects API endpoints
 */
export const projectsApi = {
  list: () => api.get('/api/projects'),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.patch(`/api/projects/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/projects/${id}/status`, { status }),
  getAvailableResearchers: (id) => api.get(`/api/projects/${id}/available-researchers`),
  assignResearchers: (id, researcherIds) => api.post(`/api/projects/${id}/researchers`, { researcherIds }),
  removeResearcher: (id, userId) => api.delete(`/api/projects/${id}/researchers/${userId}`),
};

export default api;
