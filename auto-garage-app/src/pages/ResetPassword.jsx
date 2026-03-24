import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { ArrowLeft, KeyRound } from 'lucide-react'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await api.resetPassword({
        email: formData.email,
        newPassword: formData.newPassword
      })
      setSuccess('Password reset successful! You can now login with your new password.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
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
          <div style={{
            width: '60px',
            height: '60px',
            background: '#e3f2fd',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <KeyRound size={28} color="#1976d2" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#333', marginBottom: '10px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#666' }}>
            Enter your email and new password
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

        {success && (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
