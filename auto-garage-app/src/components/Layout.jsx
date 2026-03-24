import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Car, 
  Users, 
  FileText, 
  Menu,
  X,
  Wrench,
  LogOut,
  User
} from 'lucide-react'

const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/parts', icon: Package, label: 'Parts Inventory' },
    { path: '/cars', icon: Car, label: 'Car Buy/Sell' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/invoices', icon: FileText, label: 'Invoices' },
  ]

  return (
    <div className="app">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>
            <Wrench size={28} />
            Auto Garage
          </h1>
        </div>
        <nav>
          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  onClick={closeSidebar}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} color="#fff" />
            </div>
            <div style={{ color: '#fff', fontSize: '14px' }}>
              <div style={{ fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          onClick={closeSidebar}
          style={{ background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
        />
      )}
    </div>
  )
}

export default Layout
