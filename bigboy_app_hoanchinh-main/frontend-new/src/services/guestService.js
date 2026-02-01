import api from './api';

export const guestService = {
  async createOrder(data) {
    const response = await api.post('/guest/orders', data);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/guest/orders');
    return response.data;
  },
};

