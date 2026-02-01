import api from './api'

export const getReservations = async (params = {}) => {
  const response = await api.get('/restaurants/my/reservations', { params })
  return response.data
}

export const approveReservation = async (reservationId) => {
  const response = await api.put(`/restaurants/my/reservations/${reservationId}/approve`)
  return response.data
}

export const rejectReservation = async (reservationId, reason = '') => {
  const response = await api.put(`/restaurants/my/reservations/${reservationId}/reject`, {
    reason
  })
  return response.data
}

export const updateReservationStatus = async (reservationId, status, notes = '') => {
  const response = await api.put(`/restaurants/my/reservations/${reservationId}/status`, {
    status,
    notes
  })
  return response.data
}