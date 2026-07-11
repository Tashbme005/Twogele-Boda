import { Icon } from '../components/Icon'
import '../styles/pages.css'

const SACCOs = [
  {
    name: 'Kampala Boda SACCO',
    detail: 'Low-interest bike loans · Weekly savings',
    rate: '12% p.a.',
  },
  {
    name: 'Wandegeya Riders Coop',
    detail: 'Emergency medical cover + fuel float',
    rate: '10% p.a.',
  },
  {
    name: 'UG Treasury Bills',
    detail: 'Government-backed · 91-day notes',
    rate: 'Safe',
  },
]

export default function Wealth() {
  return (
    <>
      <section className="page-head">
        <h1>Wealth Planner</h1>
        <p>Turn daily tips and savings into long-term options.</p>
      </section>

      <section className="panel">
        <span className="panel-label">This Month</span>
        <div className="metrics">
          <article className="metric">
            <span>Income saved</span>
            <strong>UGX 450,000</strong>
          </article>
          <article className="metric">
            <span>Fuel expenses</span>
            <strong>UGX 280,000</strong>
          </article>
          <article className="metric">
            <span>Daily expenses</span>
            <strong>UGX 160,000</strong>
          </article>
        </div>
      </section>

      <section className="section panel">
        <div className="section-head">
          <h4>
            <Icon name="savings" />
            Suggested SACCOs &amp; Investments
          </h4>
        </div>
        <div className="list">
          {SACCOs.map((item) => (
            <div className="list-item" key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                  {item.detail}
                </p>
              </div>
              <span className="badge verified">{item.rate}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section tip-card" style={{ padding: '1.25rem' }}>
        <strong>GEMMA TIP</strong>
        <p>
          Log fuel and tips daily on the Dashboard. Gemma will keep your ledger JSON clean and
          suggest the next best place for surplus savings.
        </p>
      </section>
    </>
  )
}
