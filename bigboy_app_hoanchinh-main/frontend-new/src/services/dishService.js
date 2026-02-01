import api from './api';

export const dishService = {
  async getDishes(params = {}) {
    const response = await api.get('/dishes', { params });
    return response.data;
  },

  async getDishById(dishId) {
    const response = await api.get(`/dishes/${dishId}`);
    return response.data;
  },
};

