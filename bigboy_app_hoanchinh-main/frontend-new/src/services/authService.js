import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const authService = {
  // Customer Authentication
  async register(data) {
    // First call register API
    const response = await api.post('/customer/register', data);
    const registerPayload = response.data?.data || response.data;

    // Try to auto-login right after successful registration
    try {
      const loginResponse = await api.post('/customer/login', {
        email: data.email,
        password: data.password,
      });
      const payload = loginResponse.data?.data || loginResponse.data;
      const accessToken = payload.access_token;
      const user = payload.customer || payload.user;

      if (accessToken && user) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      // Normalize return shape for authStore
      return {
        ...payload,
        user,
      };
    } catch (e) {
      // If auto-login fails, just return registration payload
      return {
        user: registerPayload,
      };
    }
  },

  async login(email, password) {
    const response = await api.post('/customer/login', { email, password });
    const payload = response.data?.data || response.data;
    const accessToken = payload.access_token;
    const user = payload.customer || payload.user;

    if (__DEV__) {
      console.log('[AuthService] Login response:', {
        hasData: !!response.data?.data,
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
      });
    }

    if (accessToken && user) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      if (__DEV__) {
        console.log('[AuthService] Token saved to AsyncStorage');
        // Verify it was saved
        const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        console.log('[AuthService] Token verification:', savedToken ? 'Saved successfully' : 'FAILED to save');
      }
    } else {
      if (__DEV__) {
        console.warn('[AuthService] Missing token or user, not saving to storage');
      }
    }

    // Normalize return shape for authStore
    return {
      ...payload,
      user,
    };
  },

  async getMe() {
    const response = await api.get('/customer/me');
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async getStoredToken() {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getStoredUser() {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Guest Authentication
  async guestLogin(name, tableToken) {
    const response = await api.post('/guest/auth/login', { name, table_token: tableToken });
    if (response.data.access_token) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_TOKEN, response.data.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.TABLE_TOKEN, tableToken);
    }
    return response.data;
  },
};

