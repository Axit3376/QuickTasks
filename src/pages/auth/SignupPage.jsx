import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import './auth.css'

function SignupPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/app')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (cred.user && name) {
        await updateProfile(cred.user, { displayName: name })
      }
      navigate('/app', { replace: true })
    } catch (err) {
      let errorMessage = 'Failed to sign up'
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection'
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">QuickTasks</h1>
        <h2 className="auth-subtitle">Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Name
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage



