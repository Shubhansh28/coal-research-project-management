import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../constants';
import { clearCookie, getCookie, saveCookie } from '../auth/cookieStorage';

export const api = axios.create({
  baseURL: API_URL.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: Platform.OS === 'web'
});

api.interceptors.request.use(async (config) => {
  const cookie = await getCookie();
  if (Platform.OS !== 'web' && cookie) config.headers.Cookie = cookie;
  return config;
});

api.interceptors.response.use(async (response) => {
  const setCookie = response.headers?.['set-cookie'] || response.headers?.['Set-Cookie'];
  if (setCookie) await saveCookie(Array.isArray(setCookie) ? setCookie[0] : setCookie);
  return response;
}, async (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    await clearCookie();
  }
  return Promise.reject(error);
});

const query = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'ALL')
);

export const authApi = {
  login: (body) => api.post('/api/auth/login', body),
  signup: (body) => api.post('/api/auth/signup', body),
  me: () => api.get('/api/auth/me')
};
export const dashboardApi = {
  admin: () => api.get('/api/dashboard'),
  researcher: () => api.get('/api/dashboard/researcher')
};
export const projectsApi = {
  list: () => api.get('/api/projects'),
  get: (id) => api.get(`/api/projects/${id}`),
  create: (body) => api.post('/api/projects', body),
  update: (id, body) => api.patch(`/api/projects/${id}`, body),
  status: (id, status) => api.patch(`/api/projects/${id}/status`, { status }),
  availableResearchers: (id) => api.get(`/api/projects/${id}/available-researchers`),
  assign: (id, researcherIds) => api.post(`/api/projects/${id}/researchers`, { researcherIds }),
  removeResearcher: (id, userId) => api.delete(`/api/projects/${id}/researchers/${userId}`)
};
export const reportsApi = {
  list: (params) => api.get('/api/reports', { params: query(params) }),
  get: (id) => api.get(`/api/reports/${id}`),
  create: (body) => api.post('/api/reports', body),
  review: (id, body) => api.patch(`/api/reports/${id}/review`, body)
};
export const fundReportsApi = {
  list: (params) => api.get('/api/fund-reports', { params: query(params) }),
  get: (id) => api.get(`/api/fund-reports/${id}`),
  create: (body) => api.post('/api/fund-reports', body)
};
export const documentsApi = {
  list: (projectId) => api.get(`/api/projects/${projectId}/documents`),
  get: (id) => api.get(`/api/documents/${id}`),
  create: (projectId, body) => api.post(`/api/projects/${projectId}/documents`, body),
  remove: (id) => api.delete(`/api/documents/${id}`)
};
