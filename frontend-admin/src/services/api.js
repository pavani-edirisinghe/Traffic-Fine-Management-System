import axios from 'axios';
import { getAccessToken } from './auth';

// The base URL of Kavithma's Spring Boot server
const API_BASE_URL = 'http://localhost:8080/api/v1'; 

// Create an Axios instance
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

export const login = async ({ username, password }) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

export const createOfficer = async ({ username, password }) => {
  const response = await apiClient.post('/admin/officers', { username, password });
  return response.data;
};

export const updateOfficer = async ({ currentUsername, newUsername, newPassword }) => {
  const response = await apiClient.put(`/admin/officers/${encodeURIComponent(currentUsername)}`, {
    newUsername,
    newPassword,
  });
  return response.data;
};

export const deleteOfficer = async (username) => {
  await apiClient.delete(`/admin/officers/${encodeURIComponent(username)}`);
};

export const issueDriverToken = async (payload) => {
  const response = await apiClient.post('/officer/driver-token', payload);
  return response.data;
};

export const getOfficers = async () => {
  const response = await apiClient.get('/admin/officers');
  return response.data;
};

export const getDrivers = async () => {
  const response = await apiClient.get('/admin/drivers');
  return response.data;
};

export const me = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// The function to fetch all fines for the Admin Dashboard
export const getAllFines = async () => {
  try {
    const response = await apiClient.get('/fines');
    return response.data; // This returns the JSON array from the backend
  } catch (error) {
    console.error("API Error fetching fines:", error);
    throw error;
  }
};