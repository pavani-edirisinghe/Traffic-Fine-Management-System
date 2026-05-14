import axios from 'axios';

// The base URL of Kavithma's Spring Boot server
const API_BASE_URL = 'http://localhost:8080/api/v1'; 

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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