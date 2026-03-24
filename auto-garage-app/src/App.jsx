import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import PartsInventory from './pages/PartsInventory'
import CarHistory from './pages/CarHistory'
import Customers from './pages/Customers'
import Invoices from './pages/Invoices'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
    return user ? children : <Navigate to="/login" replace />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="parts" element={<PartsInventory />} />
          <Route path="cars" element={<CarHistory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
