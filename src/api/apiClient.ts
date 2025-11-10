import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Axios instance with base configuration
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005/v1.0',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request interceptor - Add auth token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Global error handling
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend response structure: { success, customCode, message, data }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

