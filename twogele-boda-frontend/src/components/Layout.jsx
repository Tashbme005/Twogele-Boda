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
  { to: '/finance', label: 'Ledger', icon: 'payments' },
  { to: '/settings', label: 'Profile', icon: 'person' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const emergency = pathname.startsWith('/emergency')

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <Icon name="moped" filled />
          <span>Twogele Boda AI</span>
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

      <aside className="sidebar">
        <h2 className="sidebar-title">Rider Portal</h2>
        <p className="sidebar-sub">Kampala District</p>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="tip-card">
          <strong>RIDER SAFETY TIP</strong>
          <p>Wear high-visibility gear during evening rain in Kampala.</p>
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
