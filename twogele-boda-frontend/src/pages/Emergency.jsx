import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import MapView, { DEMAND_MARKERS, HAZARD_MARKERS } from '../components/MapView'
import '../styles/pages.css'

const ALERTS = [
  {
    title: 'Flooding',
    body: 'Nakivubo: Water is rising. Be careful on a boda.',
    time: '2m ago',
    tone: 'danger',
    icon: 'flood',
  },
  {
    title: 'Heavy jam',
    body: 'Clock Tower: Big jam. Try Lumumba Ave.',
    time: '12m ago',
    tone: 'warn',
    icon: 'traffic',
  },
  {
    title: 'Road closed',
    body: 'Entebbe Rd near Kibuye: Road work. One lane only.',
    time: '25m ago',
    tone: 'danger',
    icon: 'block',
  },
]

const CONTACTS = [
  { name: 'Police', detail: 'Call 999 or 112', icon: 'local_police', tel: '999' },
  { name: 'KCCA', detail: 'Bad roads & city problems', icon: 'apartment', tel: '0800990000' },
  { name: 'Ambulance / Red Cross', detail: 'If someone is hurt', icon: 'medical_services', tel: '911' },
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
            Danger spots
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
          Report a problem
        </button>
      </section>

      <aside className="dispatch-side">
        <div className="dispatch-side-top">
          <div className="section-head">
            <h2>
              Warnings now <span className="badge critical">NOW</span>
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
          <span className="panel-label">Who to call</span>
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
            <strong>RIDER TIP</strong>
            <p>
              Rain may come this afternoon. Cover your phone and check the map often.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
