import api from './api';

export const reviewService = {
  async getRestaurantReviews(restaurantId) {
    const response = await api.get(`/restaurants/${restaurantId}/reviews`);
    return response.data;
  },

  async createReview(restaurantId, data) {
    const response = await api.post(`/restaurants/${restaurantId}/reviews`, data);
    return response.data;
  },

  async updateReview(reviewId, data) {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

