import { useState } from 'react'
import { Icon } from '../components/Icon'
import '../styles/pages.css'

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Musa Kasule',
    stage: 'Kiwatule Stage A',
    plate: 'UEE 492P',
  })
  const [language, setLanguage] = useState('en')
  const [safetyAlerts, setSafetyAlerts] = useState(true)
  const [financeAlerts, setFinanceAlerts] = useState(true)
  const [battery, setBattery] = useState('Normal')
  const [routing, setRouting] = useState(true)

  return (
    <>
      <section className="page-head">
        <h1>My details</h1>
        <p>Change your name, bike, and alerts.</p>
      </section>

      <div className="settings-grid">
        <section className="panel">
          <h3 className="card-title">
            <Icon name="person" /> About you
          </h3>
          <label className="field">
            <span>Full Name</span>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Stage / Location</span>
            <input
              value={profile.stage}
              onChange={(e) => setProfile((p) => ({ ...p, stage: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Plate Number</span>
            <input
              value={profile.plate}
              onChange={(e) => setProfile((p) => ({ ...p, plate: e.target.value }))}
            />
          </label>
        </section>

        <section className="panel">
          <h3 className="card-title">
            <Icon name="language" /> Language
          </h3>
          {[
            { id: 'en', label: 'English' },
            { id: 'lg', label: 'Luganda' },
            { id: 'sw', label: 'Swahili' },
          ].map((opt) => (
            <label className="radio-row" key={opt.id}>
              <input
                type="radio"
                name="lang"
                checked={language === opt.id}
                onChange={() => setLanguage(opt.id)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </section>

        <section className="panel">
          <h3 className="card-title">
            <Icon name="notifications" /> Notifications
          </h3>
          <div className="settings-row">
            <div>
              <strong>Danger alerts</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                Tell me about bad roads and jams
              </p>
            </div>
            <button
              type="button"
              className={`toggle${safetyAlerts ? ' on' : ''}`}
              onClick={() => setSafetyAlerts((v) => !v)}
            >
              <span />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Money updates</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                Daily and weekly money summary
              </p>
            </div>
            <button
              type="button"
              className={`toggle${financeAlerts ? ' on' : ''}`}
              onClick={() => setFinanceAlerts((v) => !v)}
            >
              <span />
            </button>
          </div>
        </section>

        <section className="panel gemma-card">
          <h3 className="card-title">
            <Icon name="bolt" /> Smart help{' '}
            <span className="badge critical" style={{ marginLeft: '0.5rem' }}>
              NEW
            </span>
          </h3>
          <div className="tip-card" style={{ marginBottom: '1rem' }}>
            <p style={{ margin: 0 }}>
              Helps you find busy places and safer roads in Kampala.
            </p>
          </div>
          <label className="field">
            <span>Phone battery</span>
            <select value={battery} onChange={(e) => setBattery(e.target.value)}>
              <option>Normal</option>
              <option>Strong</option>
              <option>Save battery</option>
            </select>
          </label>
          <div className="settings-row">
            <div>
              <strong>Safer routes</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                Suggest better roads in Kampala
              </p>
            </div>
            <button
              type="button"
              className={`toggle${routing ? ' on' : ''}`}
              onClick={() => setRouting((v) => !v)}
            >
              <span />
            </button>
          </div>
        </section>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" type="button">
          <Icon name="save" /> Save
        </button>
        <button className="btn-outline" type="button">
          Cancel
        </button>
      </div>
    </>
  )
}
