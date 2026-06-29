import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wrench, Package, Users, BarChart3 } from 'lucide-react'
import { api } from '../services/api'

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        onLogin(res.user)
      } else {
        const res = await api.login({
          email: formData.email,
          password: formData.password
        })
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        onLogin(res.user)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Package, text: 'Parts inventory management' },
    { icon: Users, text: 'Customer & invoice tracking' },
    { icon: BarChart3, text: 'Sales analytics dashboard' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <Wrench size={28} color="#fff" />
          </div>
          <h1>Auto Garage</h1>
          <p>
            Professional workshop management — inventory, customers, invoices, and analytics in one place.
          </p>
          <ul className="auth-features">
            {features.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="auth-feature-icon">
                  <Icon size={18} color="#93c5fd" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p>{isLogin ? 'Sign in to manage your garage' : 'Get started with Auto Garage'}</p>
          </div>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                placeholder="you@garage.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="auth-forgot">
                <Link to="/reset-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="auth-toggle" onClick={() => { setIsLogin(!isLogin); setError('') }}>
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
