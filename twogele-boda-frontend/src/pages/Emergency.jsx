import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import MapView, { DEMAND_MARKERS, HAZARD_MARKERS } from '../components/MapView'
import '../styles/pages.css'

const ALERTS = [
  {
    title: 'Heavy Flooding',
    body: 'Nakivubo: Water levels rising. High risk for Bodas.',
    time: '2m ago',
    tone: 'danger',
    icon: 'flood',
  },
  {
    title: 'Gridlock',
    body: 'Clock Tower Junction: Heavy congestion. Use Lumumba Ave.',
    time: '12m ago',
    tone: 'warn',
    icon: 'traffic',
  },
  {
    title: 'Road Closure',
    body: 'Entebbe Rd: Maintenance near Kibuye. Lane restricted.',
    time: '25m ago',
    tone: 'danger',
    icon: 'block',
  },
]

const CONTACTS = [
  { name: 'Uganda Police', detail: '999 / 112', icon: 'local_police', tel: '999' },
  { name: 'KCCA Helpline', detail: 'Infrastructure Issues', icon: 'apartment', tel: '0800990000' },
  { name: 'Ambulance / Red Cross', detail: 'Medical Emergencies', icon: 'medical_services', tel: '911' },
]

export default function Emergency() {
  const [filter, setFilter] = useState('hazards')
  const markers = useMemo(
    () => (filter === 'traffic' ? [...HAZARD_MARKERS, ...DEMAND_MARKERS] : HAZARD_MARKERS),
    [filter],
  )

  return (
    <div className="dispatch-layout">
      <section className="dispatch-map">
        <div className="map-toolbar">
          <button
            type="button"
            className={filter === 'hazards' ? 'chip active' : 'chip'}
            onClick={() => setFilter('hazards')}
          >
            All Hazards
          </button>
          <button
            type="button"
            className={filter === 'traffic' ? 'chip active' : 'chip'}
            onClick={() => setFilter('traffic')}
          >
            Traffic
          </button>
        </div>

        <MapView markers={markers} zoom={13} className="dispatch-map-canvas" />

        <button className="report-fab" type="button">
          <Icon name="add_alert" filled />
          Report New Incident
        </button>
      </section>

      <aside className="dispatch-side">
        <div className="dispatch-side-top">
          <div className="section-head">
            <h2>
              Active Alerts <span className="badge critical">LIVE</span>
            </h2>
            <Icon name="tune" />
          </div>
          <div className="list">
            {ALERTS.map((alert) => (
              <article className={`alert-row ${alert.tone}`} key={alert.title}>
                <div className={`alert-icon ${alert.tone}`}>
                  <Icon name={alert.icon} />
                </div>
                <div>
                  <div className="alert-title-row">
                    <strong>{alert.title}</strong>
                    <time>{alert.time}</time>
                  </div>
                  <p>{alert.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="dispatch-side-bottom">
          <span className="panel-label">Emergency Contacts</span>
          <div className="list">
            {CONTACTS.map((c) => (
              <a className="contact" key={c.name} href={`tel:${c.tel}`}>
                <div className="contact-left">
                  <Icon name={c.icon} />
                  <div>
                    <strong>{c.name}</strong>
                    <p className="empty-note" style={{ margin: 0 }}>
                      {c.detail}
                    </p>
                  </div>
                </div>
                <Icon name="call" />
              </a>
            ))}
          </div>

          <div className="tip-card" style={{ marginTop: '1rem' }}>
            <strong>PRO TIP FOR RIDERS</strong>
            <p>
              Heavy rains are predicted for the afternoon. Keep your phone waterproof and check
              the hazard map every 30 minutes.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
