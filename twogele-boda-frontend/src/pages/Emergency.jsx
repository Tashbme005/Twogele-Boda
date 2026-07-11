import { Icon } from '../components/Icon'
import '../styles/pages.css'

const ALERTS = [
  {
    title: 'Heavy Flooding',
    body: 'Nakivubo: Water levels rising. High risk for Bodas.',
    time: '2m ago',
    tone: '',
  },
  {
    title: 'Gridlock',
    body: 'Clock Tower Junction: Heavy congestion. Use Lumumba Ave.',
    time: '12m ago',
    tone: 'orange',
  },
  {
    title: 'Road Closure',
    body: 'Entebbe Rd: Maintenance near Kibuye. Lane restricted.',
    time: '25m ago',
    tone: '',
  },
]

const CONTACTS = [
  { name: 'Uganda Police', detail: '999 / 112', icon: 'shield' },
  { name: 'KCCA Helpline', detail: 'Infrastructure Issues', icon: 'apartment' },
  { name: 'Ambulance / Red Cross', detail: 'Medical Emergencies', icon: 'medical_services' },
]

export default function Emergency() {
  return (
    <>
      <section className="page-head">
        <h1>Emergency Dispatch</h1>
        <p>Live hazard awareness for Kampala riders.</p>
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="section-head">
            <h4>
              <Icon name="map" />
              Hazard Map
            </h4>
            <div className="chips">
              <span className="chip" style={{ background: 'var(--primary-container)' }}>
                All Hazards
              </span>
              <span className="chip">Traffic</span>
            </div>
          </div>
          <div className="hotspots" style={{ height: '22rem' }}>
            <div className="hotspot-legend">
              <div>Active Incidents: 3</div>
              <div>Nakivubo · Clock Tower · Entebbe Rd</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn-primary" type="button" style={{ flex: '0 1 18rem', background: 'var(--error)', color: 'white' }}>
              <Icon name="e911_emergency" filled />
              Report New Incident
            </button>
          </div>
        </section>

        <aside style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <section className="panel">
            <div className="section-head">
              <h4>
                Active Alerts <span className="badge critical">LIVE</span>
              </h4>
            </div>
            <div className="list">
              {ALERTS.map((alert) => (
                <article className={`alert ${alert.tone}`} key={alert.title}>
                  <h4>{alert.title}</h4>
                  <p>{alert.body}</p>
                  <time>{alert.time}</time>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <span className="panel-label">Emergency Contacts</span>
            <div className="list">
              {CONTACTS.map((c) => (
                <div className="contact" key={c.name}>
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
                </div>
              ))}
            </div>
          </section>

          <section className="tip-card">
            <strong>PRO TIP FOR RIDERS</strong>
            <p>
              Heavy rains are predicted for the afternoon. Keep your phone waterproof and check
              the hazard map every 30 minutes.
            </p>
          </section>
        </aside>
      </div>
    </>
  )
}
