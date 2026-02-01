import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getReservations } from '../services/reservationService'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log('Loading stats...')
      const [allReservations, pendingReservations, confirmedReservations, cancelledReservations] = await Promise.all([
        getReservations(),
        getReservations({ status: 'Pending' }),
        getReservations({ status: 'Confirmed' }),
        getReservations({ status: 'Cancelled' })
      ])

      console.log('Reservations loaded:', { allReservations, pendingReservations, confirmedReservations, cancelledReservations })

      const today = new Date().toISOString().split('T')[0]
      const todayReservations = allReservations.data?.items?.filter(r => {
        const reservationDate = r.date?.split('T')[0]
        return reservationDate === today
      }) || []

      setStats({
        total: allReservations.data?.total || 0,
        pending: pendingReservations.data?.total || 0,
        confirmed: confirmedReservations.data?.total || 0,
        cancelled: cancelledReservations.data?.total || 0,
        today: todayReservations.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      console.error('Error details:', error.response?.data || error.message)
      setError(error.response?.data?.message || error.message || 'Lỗi khi tải dữ liệu')
      // Set default stats on error
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        today: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          <strong>Lỗi:</strong> {error}
          <br />
          <small>Vui lòng kiểm tra console để biết thêm chi tiết.</small>
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Tổng đặt bàn</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Chờ duyệt</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Đã xác nhận</h3>
            <p className="stat-number">{stats.confirmed}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📆</div>
          <div className="stat-content">
            <h3>Hôm nay</h3>
            <p className="stat-number">{stats.today}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/reservations" className="action-button">
          Xem tất cả đặt bàn →
        </Link>
      </div>
    </div>
  )
}

export default Dashboard