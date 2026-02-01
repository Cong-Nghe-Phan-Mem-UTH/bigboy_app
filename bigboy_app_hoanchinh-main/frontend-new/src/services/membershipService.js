import api from './api';

export const membershipService = {
  async getTiers() {
    const response = await api.get('/membership/tiers');
    return response.data;
  },

  async getMyTier() {
    const response = await api.get('/membership/my-tier');
    return response.data;
  },

  async updateTier() {
    const response = await api.post('/membership/update-tier');
    return response.data;
  },
};

