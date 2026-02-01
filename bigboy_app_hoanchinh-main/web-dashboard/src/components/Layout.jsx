import { Link, useLocation } from 'react-router-dom'
import { removeToken } from '../utils/auth'
import './Layout.css'

function Layout({ children, setIsAuthenticated }) {
  const location = useLocation()

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>🍽️ BigBoy</h1>
          <p>Restaurant Dashboard</p>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/reservations" 
              className={location.pathname === '/reservations' ? 'active' : ''}
            >
              📅 Đặt bàn
            </Link>
          </li>
          <li>
            <Link 
              to="/restaurants" 
              className={location.pathname === '/restaurants' ? 'active' : ''}
            >
              🏪 Quản lý nhà hàng
            </Link>
          </li>
          <li>
            <Link 
              to="/revenue" 
              className={location.pathname === '/revenue' ? 'active' : ''}
            >
              💰 Quản lý doanh thu
            </Link>
          </li>
          <li>
            <Link 
              to="/users" 
              className={location.pathname === '/users' ? 'active' : ''}
            >
              👥 Quản lý người dùng
            </Link>
          </li>
          <li>
            <Link 
              to="/ai-config" 
              className={location.pathname === '/ai-config' ? 'active' : ''}
            >
              🤖 Cấu hình AI gợi ý
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout