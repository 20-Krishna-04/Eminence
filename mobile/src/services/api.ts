import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Helper to determine the best default backend URL based on platform
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator loops back to host machine via 10.0.2.2
    return 'http://10.0.2.2:3000';
  }
  // iOS simulator and web use localhost
  return 'http://localhost:3000';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  async (config) => {
    try {
      if (Platform.OS !== 'web') {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        const token = localStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve token for API request:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration/unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Could trigger logout or event
      console.warn('Unauthorized API call - 401 received');
    }
    return Promise.reject(error);
  }
);

export default api;
