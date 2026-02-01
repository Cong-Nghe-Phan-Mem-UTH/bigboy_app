import api from './api';

export const restaurantService = {
  async getRestaurants(params = {}) {
    const response = await api.get('/mobile/restaurants', { params });
    return response.data;
  },

  async getRecommendedRestaurants() {
    const response = await api.get('/mobile/restaurants/recommended');
    return response.data;
  },

  /** Get all restaurants (for AI recommendation: fetch then score by preferences) */
  async getAllRestaurants() {
    const response = await api.get('/mobile/restaurants', {
      params: { limit: 50, page: 1 },
    });
    const res = response?.data;
    const inner = res?.data;
    const items = inner?.items ?? (Array.isArray(inner) ? inner : Array.isArray(res) ? res : []);
    return Array.isArray(items) ? items : [];
  },

  async getRestaurantById(id) {
    const response = await api.get(`/mobile/restaurants/${id}`);
    return response.data;
  },

  async getRestaurantDirections(id) {
    const response = await api.get(`/mobile/restaurants/${id}/directions`);
    return response.data;
  },
};

