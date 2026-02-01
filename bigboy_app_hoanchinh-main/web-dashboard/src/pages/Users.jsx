import { useState, useEffect } from 'react'
import { getUsers } from '../services/adminService'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = roleFilter ? { role: roleFilter } : {}
      const res = await getUsers(params)
      setUsers(res?.data ?? [])
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Owner', label: 'Owner' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Employee', label: 'Employee' },
    { value: 'Cashier', label: 'Cashier' },
    { value: 'Kitchen', label: 'Kitchen' },
  ]

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('vi-VN')
    } catch {
      return d
    }
  }

  if (loading) {
    return (
      <div className="admin-page loading">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="admin-page users-page">
      <div className="admin-header">
        <h1>Quản lý người dùng</h1>
        <div className="filter-group">
          <label>Vai trò:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Tenant ID</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">Chưa có người dùng.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${(u.role || '').toLowerCase()}`}>{u.role}</span></td>
                  <td>{u.tenant_id ?? '—'}</td>
                  <td>{formatDate(u.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users