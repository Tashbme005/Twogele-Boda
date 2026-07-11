import { useState } from 'react'
import '../styles/pages.css'

const TOGGLES = [
  { id: 'voice', label: 'Voice input for dispatch', detail: 'Allow microphone on Smart Dispatch' },
  { id: 'alerts', label: 'Hazard push alerts', detail: 'Notify when nearby incidents go critical' },
  { id: 'ledger', label: 'Auto-save ledger JSON', detail: 'Keep expense responses in local history' },
  { id: 'luganda', label: 'Prefer Luganda replies', detail: 'Ask Gemma to answer in Luganda when possible' },
]

export default function Settings() {
  const [on, setOn] = useState({ voice: false, alerts: true, ledger: true, luganda: false })

  return (
    <>
      <section className="page-head">
        <h1>Settings</h1>
        <p>Tune the Rider Portal for how you work on the road.</p>
      </section>

      <section className="panel">
        <span className="panel-label">Preferences</span>
        {TOGGLES.map((item) => (
          <div className="settings-row" key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                {item.detail}
              </p>
            </div>
            <button
              type="button"
              className={`toggle${on[item.id] ? ' on' : ''}`}
              aria-pressed={on[item.id]}
              onClick={() => setOn((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <span />
            </button>
          </div>
        ))}
      </section>

      <section className="section panel">
        <span className="panel-label">Backend</span>
        <div className="settings-row">
          <div>
            <strong>API base URL</strong>
            <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
              {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <strong>Model</strong>
            <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
              gemma-4-26b-a4b-it via Google AI Studio
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
