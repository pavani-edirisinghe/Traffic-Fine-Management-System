import axios from 'axios';
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async ({ username, password }) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

export const me = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getOfficers = async () => {
  const response = await apiClient.get('/admin/officers');
  return response.data;
};

export const getDrivers = async () => {
  const response = await apiClient.get('/admin/drivers');
  return response.data;
};

export const createOfficer = async ({ username, password, fullName, badgeId, phoneNumber, district }) => {
  const response = await apiClient.post('/admin/officers', {
    username, password, fullName, badgeId, phoneNumber, district,
  });
  return response.data;
};

export const updateOfficer = async ({ currentUsername, newUsername, newPassword, displayName, phoneNumber }) => {
  const response = await apiClient.put(`/admin/officers/${encodeURIComponent(currentUsername)}`, {
    newUsername, newPassword, displayName, phoneNumber,
  });
  return response.data;
};

export const deleteOfficer = async (username) => {
  await apiClient.delete(`/admin/officers/${encodeURIComponent(username)}`);
};

export const getAllFines = async () => {
  const response = await apiClient.get('/admin/fines');
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics');
  return response.data;
};

// ── Officer ───────────────────────────────────────────────────────────────────
export const issueDriverToken = async (payload) => {
  const response = await apiClient.post('/officer/driver-token', payload);
  return response.data;
};

export const getOfficerFines = async () => {
  const response = await apiClient.get('/officer/fines');
  return response.data;
};

export const getOfficerNotifications = async () => {
  const response = await apiClient.get('/officer/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.put(`/officer/notifications/${notificationId}/read`);
  return response.data;
};

// ── Driver ────────────────────────────────────────────────────────────────────
export const getDriverFines = async () => {
  const response = await apiClient.get('/driver/fines');
  return response.data;
};

export const payFine = async (fineId, method = 'ONLINE') => {
  const response = await apiClient.post(`/driver/pay/${fineId}`, null, {
    params: { method },
  });
  return response.data;
};
