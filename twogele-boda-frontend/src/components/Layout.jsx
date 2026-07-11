import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../lib/AuthContext'
import { BrandLogo } from './BrandLogo'
import { Icon } from './Icon'
import '../styles/layout.css'

const SIDEBAR_KEY = 'twogele-sidebar-open'
const STATUS_KEY = 'twogele-rider-status'

function initialsFrom(user) {
  const name = (user?.name || user?.email || 'Rider').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function displayName(user) {
  if (user?.name) return user.name
  if (user?.email) return user.email.split('@')[0]
  return 'Rider'
}

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, signOut, riderId } = useAuth()
  const { t, language, setLanguage, languages } = useLanguage()
  const emergency = pathname.startsWith('/app/emergency')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    return saved === null ? true : saved === 'true'
  })
  const [online, setOnline] = useState(() => localStorage.getItem(STATUS_KEY) !== 'away')
  const [menu, setMenu] = useState(null)
  const [toast, setToast] = useState('')
  const actionsRef = useRef(null)

  const NAV = [
    { to: '/app', label: t('navHome'), icon: 'dashboard', end: true },
    { to: '/app/emergency', label: t('navDanger'), icon: 'emergency' },
    { to: '/app/finance', label: t('navMoney'), icon: 'trending_up' },
    { to: '/app/wealth', label: t('navSave'), icon: 'savings' },
    { to: '/app/settings', label: t('navSettings'), icon: 'settings' },
  ]

  const MOBILE = [
    { to: '/app', label: t('navHome'), icon: 'moped', end: true },
    { to: '/app/emergency', label: t('navDangerShort'), icon: 'security' },
    { to: '/app/finance', label: t('navMoneyShort'), icon: 'trending_up' },
    { to: '/app/wealth', label: t('navSaveShort'), icon: 'savings' },
    { to: '/app/settings', label: t('navMe'), icon: 'settings' },
  ]

  const NOTICES = [
    {
      id: 'flood',
      title: language === 'lg' ? 'Amazzi ku Nakivubo' : language === 'sw' ? 'Mafuriko Nakivubo' : 'Flooding near Nakivubo',
      body:
        language === 'lg'
          ? 'Amazzi galinnyuka. Gezaako ekkubo eddala.'
          : language === 'sw'
            ? 'Maji yanapanda. Chukua barabara nyingine.'
            : 'Water is rising. Take another road if you can.',
      to: '/app/emergency',
    },
    {
      id: 'jam',
      title: language === 'lg' ? 'Eggga ku Clock Tower' : language === 'sw' ? 'Msongamano Clock Tower' : 'Heavy jam at Clock Tower',
      body:
        language === 'lg'
          ? 'Gezaako Lumumba Ave.'
          : language === 'sw'
            ? 'Jaribu Lumumba Ave.'
            : 'Try Lumumba Ave for faster trips.',
      to: '/app/emergency',
    },
    {
      id: 'money',
      title: language === 'lg' ? 'Amagezi ga petrol' : language === 'sw' ? 'Kidokezo cha mafuta' : 'Fuel tip',
      body:
        language === 'lg'
          ? 'Tereka petrol ya leero ku Awaka.'
          : language === 'sw'
            ? 'Rekodi mafuta ya leo kwenye Nyumbani.'
            : "Record today's fuel on Home so My money stays up to date.",
      to: '/app',
    },
  ]

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen))
    const timer = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 240)
    return () => window.clearTimeout(timer)
  }, [sidebarOpen])

  useEffect(() => {
    localStorage.setItem(STATUS_KEY, online ? 'ready' : 'away')
  }, [online])

  useEffect(() => {
    setMenu(null)
  }, [pathname])

  useEffect(() => {
    function onPointerDown(event) {
      if (!actionsRef.current?.contains(event.target)) setMenu(null)
    }
    function onKey(event) {
      if (event.key === 'Escape') setMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function toggleMenu(next) {
    setMenu((current) => (current === next ? null : next))
  }

  function showToast(message) {
    setToast(message)
  }

  async function handleLogout() {
    setMenu(null)
    await signOut()
    navigate('/login', { replace: true })
  }

  const statusLabel = emergency
    ? t('dangerMapOpen')
    : online
      ? t('readyHelp')
      : t('onBreak')
  const statusClass = emergency || !online ? 'warn' : ''
  const avatar = initialsFrom(user)
  const shortId = riderId && riderId !== 'anonymous' ? `#${String(riderId).slice(0, 6)}` : '#guest'

  return (
    <div className={`shell${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <header className="topbar">
        <BrandLogo className="brand" to="/app" label={t('brand')} />
        <div className="topbar-actions" ref={actionsRef}>
          <div className="menu-wrap">
            <button
              className={`icon-btn lang-btn${menu === 'lang' ? ' open' : ''}`}
              type="button"
              aria-label={t('languageMenu')}
              aria-expanded={menu === 'lang'}
              onClick={() => toggleMenu('lang')}
            >
              <Icon name="translate" />
              <span className="lang-code">{language.toUpperCase()}</span>
            </button>
            {menu === 'lang' && (
              <div className="top-menu" role="menu">
                <p className="top-menu-title">{t('chooseLanguage')}</p>
                {languages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className={language === item.id ? 'active' : ''}
                    onClick={() => {
                      setLanguage(item.id)
                      setMenu(null)
                      showToast(item.native)
                    }}
                  >
                    <Icon name="language" />
                    {item.native}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="menu-wrap">
            <button
              className={`status-pill ${statusClass}`}
              type="button"
              aria-expanded={menu === 'status'}
              aria-haspopup="true"
              onClick={() => toggleMenu('status')}
            >
              <span className="dot" />
              {statusLabel}
            </button>
            {menu === 'status' && (
              <div className="top-menu" role="menu">
                <p className="top-menu-title">{t('yourStatus')}</p>
                <button
                  type="button"
                  role="menuitem"
                  className={online && !emergency ? 'active' : ''}
                  onClick={() => {
                    setOnline(true)
                    setMenu(null)
                    showToast(t('readyHelp'))
                  }}
                >
                  <Icon name="check_circle" filled />
                  {t('readyHelp')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={!online ? 'active' : ''}
                  onClick={() => {
                    setOnline(false)
                    setMenu(null)
                    showToast(t('onBreak'))
                  }}
                >
                  <Icon name="pause_circle" />
                  {t('onBreak')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null)
                    navigate('/app/emergency')
                  }}
                >
                  <Icon name="emergency" />
                  {t('openDangerMap')}
                </button>
              </div>
            )}
          </div>

          <div className="menu-wrap">
            <button
              className={`icon-btn${menu === 'notes' ? ' open' : ''}`}
              type="button"
              aria-label={t('notifications')}
              aria-expanded={menu === 'notes'}
              onClick={() => toggleMenu('notes')}
            >
              <Icon name="notifications" />
              <span className="notify-dot" aria-hidden="true" />
            </button>
            {menu === 'notes' && (
              <div className="top-menu top-menu-wide" role="menu">
                <p className="top-menu-title">{t('updates')}</p>
                {NOTICES.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    role="menuitem"
                    className="note-item"
                    onClick={() => {
                      setMenu(null)
                      navigate(note.to)
                    }}
                  >
                    <strong>{note.title}</strong>
                    <span>{note.body}</span>
                  </button>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null)
                    navigate('/app/emergency')
                  }}
                >
                  <Icon name="map" />
                  {t('seeAllOnMap')}
                </button>
              </div>
            )}
          </div>

          <div className="menu-wrap">
            <button
              className={`avatar avatar-btn${menu === 'profile' ? ' open' : ''}`}
              type="button"
              aria-label={t('accountMenu')}
              aria-expanded={menu === 'profile'}
              onClick={() => toggleMenu('profile')}
            >
              {avatar}
            </button>
            {menu === 'profile' && (
              <div className="top-menu" role="menu">
                <div className="top-menu-user">
                  <strong>{displayName(user)}</strong>
                  <span>{user?.email || 'Rider account'}</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null)
                    navigate('/app/settings')
                  }}
                >
                  <Icon name="settings" />
                  {t('myDetails')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null)
                    navigate('/app/finance')
                  }}
                >
                  <Icon name="account_balance_wallet" />
                  {t('myMoney')}
                </button>
                <button type="button" role="menuitem" className="danger" onClick={handleLogout}>
                  <Icon name="logout" />
                  {t('logOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div className="app-toast" role="status">
          {toast}
        </div>
      )}

      <aside
        id="rider-sidebar"
        className={`sidebar${sidebarOpen ? ' is-open' : ' is-closed'}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar-head">
          <div>
            <h2 className="sidebar-title">{t('forRiders')}</h2>
            <p className="sidebar-sub">{t('kampala')}</p>
          </div>
          <button
            className="icon-btn sidebar-toggle"
            type="button"
            aria-label="Hide sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="rider-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="chevron_left" />
          </button>
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              tabIndex={sidebarOpen ? 0 : -1}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="rider-card rider-card-btn"
          type="button"
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={() => navigate('/app/settings')}
        >
          <div className="rider-avatar" aria-hidden="true">
            {avatar}
          </div>
          <div>
            <strong>{displayName(user)}</strong>
            <p>Rider ID: {shortId}</p>
          </div>
        </button>
      </aside>

      {!sidebarOpen && (
        <button
          className="sidebar-reopen"
          type="button"
          aria-label="Show sidebar"
          aria-expanded={false}
          aria-controls="rider-sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <Icon name="chevron_right" />
        </button>
      )}

      <main className="content">
        <Outlet context={{ showToast }} />
      </main>

      <nav className="mobile-nav" aria-label="Mobile">
        {MOBILE.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon name={item.icon} filled={item.end || item.to === '/app'} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
