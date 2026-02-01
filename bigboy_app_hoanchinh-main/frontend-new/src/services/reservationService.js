import api from './api';

export const reservationService = {
  async createReservation(restaurantId, data) {
    const response = await api.post(`/restaurants/${restaurantId}/reservations`, data);
    // Backend returns: { data: {...}, message: "..." }
    return response.data;
  },

  async getReservations() {
    const response = await api.get('/reservations');
    // Backend returns: { data: { items: [...], total: N }, message: "..." }
    return response.data;
  },

  async updateReservation(reservationId, data) {
    const response = await api.put(`/reservations/${reservationId}`, data);
    // Backend returns: { data: {...}, message: "..." }
    return response.data;
  },

  async deleteReservation(reservationId) {
    const response = await api.delete(`/reservations/${reservationId}`);
    // Backend returns: { message: "..." }
    return response.data;
  },
};

