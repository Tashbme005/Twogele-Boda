import { Icon } from '../components/Icon'
import '../styles/pages.css'

const ACTIVITY = [
  { label: 'Ride Completion · Kololo', amount: '+ UGX 12,500', pos: true },
  { label: 'Fuel Refill · Total Oasis', amount: '- UGX 20,000', pos: false },
  { label: 'Customer Tip · Nakawa', amount: '+ UGX 5,000', pos: true },
]

export default function Financial() {
  return (
    <>
      <section className="page-head">
        <h1>Financial Insights</h1>
        <p>Real-time performance tracking for your growth.</p>
      </section>

      <div className="metrics">
        <article className="metric">
          <span>Weekly Earnings</span>
          <strong>UGX 482,500</strong>
          <em>+12% vs last week</em>
        </article>
        <article className="metric">
          <span>Fuel Tracking</span>
          <strong>UGX 140,000</strong>
          <em>Monthly fuel: UGX 560,000</em>
        </article>
        <article className="metric">
          <span>Peak Time</span>
          <strong>07:00 – 09:30</strong>
          <em>Next peak starts in 45 mins</em>
        </article>
      </div>

      <section className="section panel">
        <div className="section-head">
          <h4>Income vs Expenses</h4>
          <span className="empty-note">Last 7 days</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.65rem',
            alignItems: 'end',
            height: '12rem',
            paddingTop: '1rem',
          }}
        >
          {[70, 55, 80, 48, 90, 62, 75].map((income, i) => (
            <div key={i} style={{ display: 'grid', gap: '0.35rem', alignItems: 'end' }}>
              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'end', height: '9rem' }}>
                <div
                  style={{
                    flex: 1,
                    height: `${income}%`,
                    background: '#0d9488',
                    borderRadius: '0.35rem 0.35rem 0 0',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: `${Math.max(25, 100 - income)}%`,
                    background: '#f59e0b',
                    borderRadius: '0.35rem 0.35rem 0 0',
                  }}
                />
              </div>
              <span style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section tip-card" style={{ padding: '1.25rem' }}>
        <strong>TIPS TO EARN MORE — POWERED BY GEMMA AI</strong>
        <div className="two-col" style={{ marginTop: '0.85rem' }}>
          <div className="panel" style={{ boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <Icon name="campaign" /> High Demand
            </h4>
            <p className="empty-note" style={{ margin: 0 }}>
              Kololo has elevated demand from a food festival this evening.
            </p>
          </div>
          <div className="panel" style={{ boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <Icon name="tire_repair" /> Efficiency Alert
            </h4>
            <p className="empty-note" style={{ margin: 0 }}>
              Fuel use is up 5%. Check tire pressure before the morning peak.
            </p>
          </div>
        </div>
      </section>

      <div className="two-col section">
        <section className="panel">
          <div className="section-head">
            <h4>Recent Activity</h4>
            <button className="linkish" type="button">
              View All
            </button>
          </div>
          <div className="list">
            {ACTIVITY.map((item) => (
              <div className="list-item" key={item.label}>
                <span>{item.label}</span>
                <span className={item.pos ? 'pos' : 'neg'}>{item.amount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ textAlign: 'center' }}>
          <h4 style={{ marginTop: 0, fontFamily: 'var(--font-headline)' }}>New Bike Goal</h4>
          <p className="empty-note">Target UGX 5,000,000</p>
          <div
            style={{
              width: '8rem',
              height: '8rem',
              margin: '1rem auto',
              borderRadius: '999px',
              border: '0.65rem solid #0d9488',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            75%
          </div>
          <button className="btn-primary" type="button" style={{ width: '100%' }}>
            Deposit Now
          </button>
        </section>
      </div>
    </>
  )
}
