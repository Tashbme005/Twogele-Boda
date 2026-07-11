import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import '../styles/layout.css'

const NAV = [
  { to: '/', label: 'Home', icon: 'dashboard', end: true },
  { to: '/emergency', label: 'Road danger', icon: 'emergency' },
  { to: '/finance', label: 'My money', icon: 'trending_up' },
  { to: '/wealth', label: 'Save & grow', icon: 'savings' },
  { to: '/settings', label: 'My details', icon: 'settings' },
]

const MOBILE = [
  { to: '/', label: 'Home', icon: 'moped', end: true },
  { to: '/emergency', label: 'Danger', icon: 'security' },
  { to: '/finance', label: 'Money', icon: 'trending_up' },
  { to: '/wealth', label: 'Save', icon: 'savings' },
  { to: '/settings', label: 'Me', icon: 'settings' },
]

const SIDEBAR_KEY = 'twogele-sidebar-open'

export default function Layout() {
  const { pathname } = useLocation()
  const emergency = pathname.startsWith('/emergency')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    return saved === null ? true : saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen))
    const t = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 240)
    return () => window.clearTimeout(t)
  }, [sidebarOpen])

  return (
    <div className={`shell${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <header className="topbar">
        <div className="brand">
          <Icon name="moped" filled />
          <span>Twogele Boda</span>
        </div>
        <div className="topbar-actions">
          <div className={`status-pill ${emergency ? 'warn' : ''}`}>
            <span className="dot" />
            {emergency ? 'Danger map open' : 'Ready to help'}
          </div>
          <button className="icon-btn" type="button" aria-label="Notifications">
            <Icon name="notifications" />
          </button>
          <div className="avatar" aria-label="Profile">
            JD
          </div>
        </div>
      </header>

      <aside
        id="rider-sidebar"
        className={`sidebar${sidebarOpen ? ' is-open' : ' is-closed'}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar-head">
          <div>
            <h2 className="sidebar-title">For riders</h2>
            <p className="sidebar-sub">Kampala</p>
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
        <div className="rider-card">
          <div className="rider-avatar" aria-hidden="true">
            MK
          </div>
          <div>
            <strong>Musa K.</strong>
            <p>Rider ID: #29481</p>
          </div>
        </div>
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
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile">
        {MOBILE.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon name={item.icon} filled={item.to === '/'} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
