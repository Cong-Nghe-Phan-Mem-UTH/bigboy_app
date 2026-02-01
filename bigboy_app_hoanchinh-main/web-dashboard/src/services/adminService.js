import api from './api'

const ADMIN_PREFIX = '/admin'

export async function getRestaurants(params = {}) {
  const { data } = await api.get(`${ADMIN_PREFIX}/restaurants`, { params })
  return data
}

export async function updateRestaurantStatus(restaurantId, status) {
  const { data } = await api.put(`${ADMIN_PREFIX}/restaurants/${restaurantId}/status`, { status })
  return data
}

export async function getUsers(params = {}) {
  const { data } = await api.get(`${ADMIN_PREFIX}/users`, { params })
  return data
}

export async function getRevenue(params = {}) {
  const { data } = await api.get(`${ADMIN_PREFIX}/revenue`, { params })
  return data
}

export async function getAIConfig() {
  const { data } = await api.get(`${ADMIN_PREFIX}/ai-config`)
  return data
}

export async function updateAIConfig(payload) {
  const { data } = await api.put(`${ADMIN_PREFIX}/ai-config`, payload)
  return data
}