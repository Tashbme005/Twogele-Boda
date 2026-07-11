import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { BrandLogo } from '../components/BrandLogo'
import { Icon } from '../components/Icon'
import { useAuth } from '../lib/AuthContext'
import '../styles/marketing.css'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn({ email: email.trim(), password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mkt">
      <header className="mkt-nav">
        <BrandLogo className="mkt-brand" />
        <div className="mkt-nav-actions">
          <Link className="mkt-btn mkt-btn-ghost" to="/signup">
            Sign up
          </Link>
        </div>
      </header>

      <main className="auth-shell">
        <div className="auth-panel">
          <div className="auth-visual">
            <img src={kampalaHero} alt="" />
            <div className="auth-visual-copy">
              <h1>Welcome back, rider</h1>
              <p>Log in to see your road help and money records.</p>
            </div>
          </div>

          <div className="auth-form-wrap">
            <div>
              <h2>Log in</h2>
              <p>Use the email and password you signed up with.</p>
            </div>

            {!configured && (
              <p className="auth-note">
                Add your Neon Auth URL to <code>VITE_NEON_AUTH_URL</code> in the frontend{' '}
                <code>.env</code> file, then restart Vite.
              </p>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="login-email">Email</label>
                <div className="auth-input">
                  <Icon name="mail" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input">
                  <Icon name="lock" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    className="toggle-vis"
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="mkt-btn mkt-btn-primary mkt-btn-block mkt-btn-xl" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : 'Open my app'}
              </button>
            </form>

            <div className="auth-switch">
              New here?{' '}
              <Link to="/signup" style={{ color: 'var(--m-primary)', fontWeight: 700 }}>
                Create a rider account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
