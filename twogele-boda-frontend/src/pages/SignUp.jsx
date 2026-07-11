import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { BrandLogo } from '../components/BrandLogo'
import { Icon } from '../components/Icon'
import { useAuth } from '../lib/AuthContext'
import '../styles/marketing.css'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, configured } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!agreed) {
      setError('Please agree to the terms to continue.')
      return
    }
    setBusy(true)
    try {
      await signUp({ name: name.trim(), email: email.trim(), password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mkt">
      <header className="mkt-nav">
        <BrandLogo className="mkt-brand" />
        <div className="mkt-nav-actions">
          <Link className="mkt-btn mkt-btn-ghost" to="/login">
            Log in
          </Link>
        </div>
      </header>

      <main className="auth-shell">
        <div className="auth-panel">
          <div className="auth-visual">
            <img src={kampalaHero} alt="" />
            <div className="auth-visual-copy">
              <h1>Join Kampala riders</h1>
              <p>Better safety help, clearer money tracking, and a community that backs you.</p>
            </div>
          </div>

          <div className="auth-form-wrap">
            <div>
              <h2>Create your account</h2>
              <p>Fill in your details to start.</p>
            </div>

            {!configured && (
              <p className="auth-note">
                Add your Neon Auth URL to <code>VITE_NEON_AUTH_URL</code> in the frontend{' '}
                <code>.env</code> file, then restart Vite.
              </p>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="signup-name">Full name</label>
                <div className="auth-input">
                  <Icon name="person" />
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Musa Kasule"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email</label>
                <div className="auth-input">
                  <Icon name="mail" />
                  <input
                    id="signup-email"
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
                <label htmlFor="signup-password">Password</label>
                <div className="auth-input">
                  <Icon name="lock" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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

              <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', color: 'var(--m-muted)', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>I agree to the terms of use and privacy policy.</span>
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button className="mkt-btn mkt-btn-primary mkt-btn-block mkt-btn-xl" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : 'Create account'}
                {!busy && <Icon name="arrow_forward" />}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--m-primary)', fontWeight: 700 }}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
