import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers of new token
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// Debug flag - enable via localStorage.setItem('api_debug', 'true')
const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('api_debug') === 'true' || import.meta.env.DEV;
};

export const createApiClient = () => {
  const client = axios.create({
    baseURL: '/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token (skip for auth endpoints) + debug logging
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const isAuthEndpoint = config.url?.startsWith('/auth');
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    if (isDebugEnabled()) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  });

  // Response interceptor - handle token refresh on 401 + debug logging
  client.interceptors.response.use(
    (response) => {
      // Debug logging for successful responses
      if (isDebugEnabled()) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, {
          data: response.data,
        });
      }
      return response;
    },
    async (error) => {
      // Debug logging for errors
      if (isDebugEnabled()) {
        const errorData = error.response?.data;
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          dataStringified: errorData ? JSON.stringify(errorData, null, 2) : 'No data',
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            data: error.config?.data,
          },
        });
      }
      const originalRequest = error.config;
      
      // If error is not 401 or request already retried, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      const state = useAuthStore.getState();
      const currentRefreshToken = state.refreshToken;

      // No refresh token available - logout and redirect
      if (!currentRefreshToken) {
        await state.logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      // Start token refresh
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Dynamic import to break circular dependency
        const { refreshToken } = await import('./auth');
        const response = await refreshToken({ refresh_token: currentRefreshToken });
        const { access_token, refresh_token } = response.data;
        
        // Update tokens in store
        state.setTokens(access_token, refresh_token);
        
        // Notify subscribers and retry original request
        onTokenRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await state.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
};

const client = createApiClient();
export default client;
