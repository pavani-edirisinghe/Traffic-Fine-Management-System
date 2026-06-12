import axios from 'axios';
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/v1';
const ROOT_API_URL = 'http://localhost:8080/api';

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

// ======================
// OFFICERS
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
  await apiClient.delete(
    `/admin/officers/${encodeURIComponent(username)}`
  );
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
// USER
// ======================

export const me = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// ======================
// DRIVER TOKEN
// ======================

export const issueDriverToken = async (payload) => {
  const response = await apiClient.post(
    '/officer/driver-token',
    payload
  );

  return response.data;
};

// ======================
// FINES
// ======================

export const getAllFines = async () => {
  const response = await apiClient.get('/fines');
  return response.data;
};

export const issueFine = async (
  driverId,
  officerId,
  amount,
  description
) => {
  const response = await apiClient.post(
    `${ROOT_API_URL}/fines/issue`,
    null,
    {
      params: {
        driverId,
        officerId,
        amount,
        description,
      },
    }
  );

  return response.data;
};

export const getDriverFines = async (driverId) => {
  const response = await apiClient.get(
    `${ROOT_API_URL}/fines/driver/${driverId}`
  );

  return response.data;
};

// ======================
// PAYMENTS
// ======================

export const payFine = async (fineId, amount, method) => {
  const response = await apiClient.post(
    `${ROOT_API_URL}/payments/${fineId}`,
    null,
    {
      params: {
        amount,
        method,
      },
    }
  );

  return response.data;
};

// ======================
// NOTIFICATIONS
// ======================

export const getOfficerNotifications = async (officerId) => {
  const response = await apiClient.get(
    `${ROOT_API_URL}/notifications/officer/${officerId}`
  );

  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.put(
    `${ROOT_API_URL}/notifications/${notificationId}/read`
  );

  return response.data;
};