import axios from 'axios';
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clean token helper
const getCleanToken = () => {
  const token = getAccessToken();

  if (!token) return null;

  // If token is saved like "Bearer xxxx", remove Bearer part
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    return token.substring(7);
  }

  // Only accept normal JWT format: aaa.bbb.ccc
  if (typeof token === 'string' && token.split('.').length === 3) {
    return token;
  }

  return null;
};

// Single request interceptor only
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

// Response error handling
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

// ======================
// AUTH
// ======================

export const login = async ({ username, password }) => {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const me = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// ======================
// OFFICERS & ADMIN
// ======================

export const createOfficer = async (officerData) => {
  const response = await apiClient.post('/admin/officers', {
    username: officerData.username,
    password: officerData.password,
    fullName: officerData.fullName,
    badgeId: officerData.badgeId,
    phoneNumber: officerData.phoneNumber,
    district: officerData.district,
  });
  return response.data;
};

export const updateOfficer = async ({
  currentUsername,
  newUsername,
  newPassword,
}) => {
  const response = await apiClient.put(
    `/admin/officers/${encodeURIComponent(currentUsername)}`,
    {
      newUsername,
      newPassword,
    }
  );
  return response.data;
};

export const deleteOfficer = async (username) => {
  await apiClient.delete(`/admin/officers/${encodeURIComponent(username)}`);
};

export const getOfficers = async () => {
  const response = await apiClient.get('/admin/officers');
  return response.data;
};

export const getDrivers = async () => {
  const response = await apiClient.get('/admin/drivers');
  return response.data;
};

// ======================
// DRIVER TOKEN
// ======================

export const issueDriverToken = async (payload) => {
  const response = await apiClient.post('/officer/driver-token', payload);
  return response.data;
};

// ======================
// FINES
// ======================

export const getAllFines = async () => {
  const response = await apiClient.get('/fines');
  return response.data;
};

export const issueFine = async (driverId, officerId, amount, description) => {
  const response = await apiClient.post('/fines/issue', null, {
    params: { driverId, officerId, amount, description },
  });
  return response.data;
};

export const getDriverFines = async (driverId) => {
  const response = await apiClient.get(`/fines/driver/${driverId}`);
  return response.data;
};

export const getOfficerFines = async () => {
  const response = await apiClient.get('/fines/officer/me');
  return response.data;
};

export const getFineByReferenceNumber = async (referenceNumber) => {
  const response = await apiClient.get(
    `/fines/reference/${encodeURIComponent(referenceNumber)}`
  );
  return response.data;
};

// ======================
// PAYMENTS
// ======================

export const payFineById = async (fineId, amount, method = 'ONLINE') => {
  const response = await apiClient.post(`/payments/${fineId}`, null, {
    params: { amount, method },
  });
  return response.data;
};

export const payFine = payFineById;

// ======================
// NOTIFICATIONS
// ======================

export const getOfficerNotifications = async (officerId) => {
  const response = await apiClient.get(`/notifications/officer/${officerId}`);
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return response.data;
};