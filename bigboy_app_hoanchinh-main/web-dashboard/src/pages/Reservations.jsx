import { useState, useEffect } from 'react'
import { getReservations, approveReservation, rejectReservation } from '../services/reservationService'
import { format } from 'date-fns'
import './Reservations.css'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)

  useEffect(() => {
    loadReservations()
  }, [filter])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await getReservations(params)
      setReservations(response?.data?.items ?? response?.items ?? [])
    } catch (error) {
      console.error('Error loading reservations:', error)
      alert('Lỗi khi tải danh sách đặt bàn')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!confirm('Bạn có chắc muốn duyệt đặt bàn này?')) return

    try {
      setProcessingId(id)
      await approveReservation(id)
      alert('Đã duyệt đặt bàn thành công!')
      loadReservations()
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi duyệt đặt bàn')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      setProcessingId(id)
      await rejectReservation(id, rejectReason)
      alert('Đã từ chối đặt bàn thành công!')
      setShowRejectModal(null)
      setRejectReason('')
      loadReservations()
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi từ chối đặt bàn')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { text: 'Chờ duyệt', class: 'status-pending' },
      'Confirmed': { text: 'Đã xác nhận', class: 'status-confirmed' },
      'Cancelled': { text: 'Đã hủy', class: 'status-cancelled' },
      'Completed': { text: 'Hoàn thành', class: 'status-completed' }
    }
    const statusInfo = statusMap[status] || { text: status, class: '' }
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="reservations">
      <div className="reservations-header">
        <h1>Quản lý đặt bàn</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={filter === 'Pending' ? 'active' : ''}
            onClick={() => setFilter('Pending')}
          >
            Chờ duyệt
          </button>
          <button 
            className={filter === 'Confirmed' ? 'active' : ''}
            onClick={() => setFilter('Confirmed')}
          >
            Đã xác nhận
          </button>
          <button 
            className={filter === 'Cancelled' ? 'active' : ''}
            onClick={() => setFilter('Cancelled')}
          >
            Đã hủy
          </button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <p>Không có đặt bàn nào</p>
        </div>
      ) : (
        <div className="reservations-list">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-header">
                <div>
                  <h3>{reservation.customer_name || 'Khách vãng lai'}</h3>
                  <p className="reservation-date">
                    📅 {formatDate(reservation.date)} lúc {reservation.time}
                  </p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className="reservation-details">
                <div className="detail-item">
                  <span className="detail-label">👥 Số người:</span>
                  <span className="detail-value">{reservation.guests}</span>
                </div>
                {reservation.table_number && (
                  <div className="detail-item">
                    <span className="detail-label">🪑 Bàn số:</span>
                    <span className="detail-value">{reservation.table_number}</span>
                  </div>
                )}
                {reservation.notes && (
                  <div className="detail-item">
                    <span className="detail-label">📝 Ghi chú:</span>
                    <span className="detail-value">{reservation.notes}</span>
                  </div>
                )}
              </div>

              {reservation.status === 'Pending' && (
                <div className="reservation-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(reservation.id)}
                    disabled={processingId === reservation.id}
                  >
                    {processingId === reservation.id ? 'Đang xử lý...' : '✅ Duyệt'}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => setShowRejectModal(reservation.id)}
                    disabled={processingId === reservation.id}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối đặt bàn</h3>
            <p>Vui lòng nhập lý do từ chối:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows="4"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => {
                setShowRejectModal(null)
                setRejectReason('')
              }}>
                Hủy
              </button>
              <button className="btn-confirm-reject" onClick={() => handleReject(showRejectModal)}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations