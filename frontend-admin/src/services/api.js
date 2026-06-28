import axios from 'axios';
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCleanToken = () => {
  const token = getAccessToken();
  if (!token) return null;
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    return token.substring(7);
  }
  if (typeof token === 'string' && token.split('.').length === 3) {
    return token;
  }
  return null;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getCleanToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized: Please login again.');
    }
    if (error.response?.status === 403) {
      console.error('403 Forbidden: Logged-in user role/token is not allowed.');
    }
    return Promise.reject(error);
  }
);

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

// ── Fines (public) ────────────────────────────────────────────────────────────
export const getFineByReferenceNumber = async (referenceNumber) => {
  const response = await apiClient.get(`/fines/reference/${encodeURIComponent(referenceNumber)}`);
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

export const payFineById = payFine;

// ── Legacy ────────────────────────────────────────────────────────────────────
export const issueFine = async (driverId, officerId, amount, description) => {
  const response = await apiClient.post(
    'http://localhost:8080/api/fines/issue',
    null,
    { params: { driverId, officerId, amount, description } }
  );
  return response.data;
};
