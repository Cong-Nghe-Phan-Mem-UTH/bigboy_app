import api from './api';

export const historyService = {
  async getHistory() {
    const response = await api.get('/history');
    // Backend returns: { data: { summary: {...}, history: [...] }, message: "..." }
    return response.data;
  },

  async getRestaurantHistory() {
    const response = await api.get('/history/restaurants');
    // Backend returns: { data: [...], message: "..." }
    return response.data;
  },
};

