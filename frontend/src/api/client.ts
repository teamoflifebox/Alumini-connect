import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Central Axios instance.
 * Automatically attaches the JWT accessToken from Zustand store to every request.
 * On 401, clears auth state and redirects to login.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Sends the refreshToken cookie automatically
});

// Request interceptor: attach token from store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh tokens using the HttpOnly cookie
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data.data;

        // Update the store with the new token
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original failed request
        return api(originalRequest);
      } catch {
        // Refresh failed - force logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
