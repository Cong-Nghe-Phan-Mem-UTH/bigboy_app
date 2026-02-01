import { useState, useEffect } from 'react'
import { getRevenue } from '../services/adminService'
import './Revenue.css'

function formatMoney(n) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(n || 0)
}

function Revenue() {
  const [data, setData] = useState({ by_restaurant: [], total_revenue: 0, date_from: '', date_to: '' })
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadRevenue = async () => {
    try {
      setLoading(true)
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res = await getRevenue(params)
      setData(res?.data ?? { by_restaurant: [], total_revenue: 0, date_from: dateFrom, date_to: dateTo })
    } catch (error) {
      console.error('Error loading revenue:', error)
      setData({ by_restaurant: [], total_revenue: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenue()
  }, [])

  const handleApplyFilter = (e) => {
    e.preventDefault()
    loadRevenue()
  }

  if (loading) {
    return (
      <div className="admin-page loading">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="admin-page revenue-page">
      <div className="admin-header">
        <h1>Quản lý doanh thu</h1>
        <form className="revenue-filters" onSubmit={handleApplyFilter}>
          <label>
            Từ ngày
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="filter-input"
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="filter-input"
            />
          </label>
          <button type="submit" className="btn-apply">Áp dụng</button>
        </form>
      </div>

      <div className="revenue-summary">
        <div className="summary-card total">
          <span className="summary-label">Tổng doanh thu</span>
          <span className="summary-value">{formatMoney(data.total_revenue)}</span>
        </div>
      </div>

      <div className="revenue-table-wrap">
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Nhà hàng</th>
              <th>Slug</th>
              <th>Số đơn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.by_restaurant?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-cell">Chưa có dữ liệu doanh thu trong khoảng thời gian đã chọn.</td>
              </tr>
            ) : (
              data.by_restaurant?.map((row) => (
                <tr key={row.tenant_id}>
                  <td>{row.name}</td>
                  <td>{row.slug}</td>
                  <td>{row.order_count}</td>
                  <td className="revenue-cell">{formatMoney(row.total_revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Revenue