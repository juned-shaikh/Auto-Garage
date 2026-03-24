import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
        // Register
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
        // Login
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
            Auto Garage App
          </h1>
          <p style={{ color: '#666' }}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <Link to="/reset-password" style={{ color: '#667eea', fontSize: '14px', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
