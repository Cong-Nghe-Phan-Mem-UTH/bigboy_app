import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,

  // Initialize auth state
  initAuth: async () => {
    try {
      const token = await authService.getStoredToken();
      const user = await authService.getStoredUser();
      
      if (token && user) {
        // Verify token by fetching user data
        try {
          const userData = await authService.getMe();
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Token invalid, clear storage
          await authService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, isAuthenticated: true, isGuest: false });
      return { success: true };
    } catch (error) {
      // Better error handling
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || error.response.data?.msg
          || `Lỗi ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Đăng nhập thất bại';
      }
      
      // Log as normal log in dev to avoid red error overlay
      if (__DEV__) {
        console.log('Login error:', error);
      }
      return { success: false, error: errorMessage };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const data = await authService.register(userData);
      set({ user: data.user, isAuthenticated: true, isGuest: false });
      return { success: true };
    } catch (error) {
      // Better error handling
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || error.response.data?.msg
          || `Lỗi ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Đăng ký thất bại';
      }
      
      // Log as normal log in dev to avoid red error overlay
      if (__DEV__) {
        console.log('Registration error:', error);
      }
      return { success: false, error: errorMessage };
    }
  },

  // Guest login
  guestLogin: async (name, tableToken) => {
    try {
      const data = await authService.guestLogin(name, tableToken);
      set({ user: data.user || { name }, isAuthenticated: true, isGuest: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Guest login failed' };
    }
  },

  // Logout
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, isGuest: false });
  },

  // Update user
  updateUser: (userData) => {
    set({ user: userData });
  },
}));

