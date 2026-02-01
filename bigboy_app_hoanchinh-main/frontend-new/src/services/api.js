import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_VERSION, STORAGE_KEYS } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log base URL for debugging
if (__DEV__) {
  console.log('[API Config] Base URL:', `${API_BASE_URL}${API_VERSION}`);
}

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && token.trim()) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
        if (__DEV__) {
          console.log(`[API] Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
        }
      } else {
        if (__DEV__) {
          console.warn(`[API] No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
          // Debug: Check what's in storage
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('[API] AsyncStorage keys:', allKeys);
        }
      }
      // Log request for debugging
      if (__DEV__) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          baseURL: config.baseURL,
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          data: config.data,
        });
      }
    } catch (storageError) {
      if (__DEV__) {
        console.error('[API] Error reading token from storage:', storageError);
      }
    }
    return config;
  },
  (error) => {
    // In development we log as normal log to avoid red error overlay
    if (__DEV__) {
      console.log('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    if (__DEV__) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Log error for debugging
    if (__DEV__) {
      console.log('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
    }
    
    if (error.response?.status === 401) {
      const hadToken = error.config?.headers?.Authorization;
      const errorMessage = error.response?.data?.message || '';
      
      // Only clear token if it's clearly expired/invalid, not endpoint-specific errors
      // Some endpoints might return 401 for other reasons (e.g., "Invalid customer token" for membership)
      const shouldClearToken = hadToken && (
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid') && errorMessage.includes('token') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage === 'Invalid token'
      );
      
      if (shouldClearToken) {
        if (__DEV__) {
          console.log('[API] 401 with token - token expired/invalid, clearing auth data');
        }
        await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } else if (hadToken) {
        // Token was sent but endpoint rejected it for other reasons - don't clear
        if (__DEV__) {
          console.warn(`[API] 401 with token but not clearing - endpoint error: ${errorMessage}`);
        }
      } else {
        // No token was sent - don't clear, just log
        if (__DEV__) {
          console.warn('[API] 401 without token - endpoint requires authentication');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

