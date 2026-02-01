import api from './api';

export const qrService = {
  async scanQR(token) {
    const response = await api.post('/qr/scan', { token });
    // Backend returns: { data: { restaurant: {...}, table: {...}, token: "..." }, message: "..." }
    const payload = response.data?.data || response.data;
    return {
      restaurant_id: payload?.restaurant?.id,
      restaurant_name: payload?.restaurant?.name,
      table_token: payload?.token || token,
      table_number: payload?.table?.number,
      ...payload,
    };
  },
};
