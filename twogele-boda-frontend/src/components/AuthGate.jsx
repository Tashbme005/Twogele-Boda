import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function GuestOnly({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return children
}
