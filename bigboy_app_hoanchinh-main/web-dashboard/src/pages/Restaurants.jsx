import { useState, useEffect } from 'react'
import { getRestaurants, updateRestaurantStatus } from '../services/adminService'
import './Restaurants.css'

function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadRestaurants()
  }, [statusFilter])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await getRestaurants(params)
      setRestaurants(res?.data ?? [])
    } catch (error) {
      console.error('Error loading restaurants:', error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái nhà hàng sang "${newStatus}"?`)) return
    try {
      setProcessingId(id)
      await updateRestaurantStatus(id, newStatus)
      loadRestaurants()
    } catch (error) {
      alert(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setProcessingId(null)
    }
  }

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'Active', label: 'Active' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Inactive', label: 'Inactive' },
  ]

  if (loading) {
    return (
      <div className="admin-page loading">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="admin-page restaurants-page">
      <div className="admin-header">
        <h1>Quản lý nhà hàng</h1>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="restaurants-list">
        {restaurants.length === 0 ? (
          <div className="empty-state">Chưa có nhà hàng nào.</div>
        ) : (
          restaurants.map((r) => (
            <div key={r.id} className="restaurant-card">
              <div className="restaurant-info">
                <h3>{r.name}</h3>
                <p className="restaurant-slug">{r.slug}</p>
                <p className="restaurant-meta">{r.email} · {r.phone || '—'}</p>
                {r.address && <p className="restaurant-address">{r.address}</p>}
                <div className="restaurant-badges">
                  <span className={`badge status-${(r.status || '').toLowerCase()}`}>{r.status}</span>
                  <span className="badge subscription">{r.subscription}</span>
                </div>
              </div>
              <div className="restaurant-actions">
                <span className="status-label">Trạng thái:</span>
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  disabled={processingId === r.id}
                  className="status-select"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Restaurants