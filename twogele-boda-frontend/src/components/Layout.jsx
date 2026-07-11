import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import '../styles/layout.css'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/emergency', label: 'Emergency Dispatch', icon: 'emergency' },
  { to: '/finance', label: 'Financial Insights', icon: 'trending_up' },
  { to: '/wealth', label: 'Wealth Planner', icon: 'savings' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

const MOBILE = [
  { to: '/', label: 'Home', icon: 'moped', end: true },
  { to: '/emergency', label: 'Safety', icon: 'security' },
  { to: '/finance', label: 'Finance', icon: 'trending_up' },
  { to: '/wealth', label: 'Wealth', icon: 'savings' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
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
    // Let Leaflet maps reflow after content width changes.
    const t = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 240)
    return () => window.clearTimeout(t)
  }, [sidebarOpen])

  return (
    <div className={`shell${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="icon-btn sidebar-toggle"
            type="button"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebarOpen}
            aria-controls="rider-sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Icon name={sidebarOpen ? 'menu_open' : 'menu'} />
          </button>
          <div className="brand">
            <Icon name="moped" filled />
            <span>Twogele Boda AI</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className={`status-pill ${emergency ? 'warn' : ''}`}>
            <span className="dot" />
            {emergency ? 'Emergency Dispatch Active' : 'Gemma 4 Engine Connected'}
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
        <h2 className="sidebar-title">Rider Portal</h2>
        <p className="sidebar-sub">Kampala District</p>
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
