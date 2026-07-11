import { Icon } from '../components/Icon'
import '../styles/pages.css'

const INVESTMENTS = [
  {
    title: 'Boda-Boda SACCO',
    body: 'Community-driven savings with low-interest loan eligibility.',
    rate: '8.5% p.a.',
    icon: 'groups',
    cta: 'Learn More',
  },
  {
    title: 'MTN/Airtel 11% Funds',
    body: 'High-yield mobile money unit trusts with daily interest.',
    rate: '11.2% p.a.',
    icon: 'ad_units',
    cta: 'Invest Now',
  },
  {
    title: 'Treasury Bills',
    body: 'Government-backed security with fixed competitive rates.',
    rate: '12.5% p.a.',
    icon: 'account_balance',
    cta: 'Purchase',
  },
]

const LEDGER = [
  {
    when: 'Oct 24, 09:15 AM',
    title: 'Trip Earnings - Entebbe Rd',
    note: 'AI Parsed: +12,000 cash minus fuel',
    amount: '+8,500',
    impact: 'Growth',
    balance: '12,402,000',
    pos: true,
  },
  {
    when: 'Oct 24, 07:40 AM',
    title: 'Fuel - Total Oasis',
    note: 'AI Parsed: 18k fuel expense',
    amount: '-18,000',
    impact: 'Cost',
    balance: '12,393,500',
    pos: false,
  },
  {
    when: 'Oct 23, 08:10 PM',
    title: 'Tips - Nakawa Stage',
    note: 'AI Parsed: evening tip cluster',
    amount: '+15,000',
    impact: 'Growth',
    balance: '12,411,500',
    pos: true,
  },
]

export default function Wealth() {
  return (
    <>
      <section className="page-head">
        <h1>Wealth Planner</h1>
        <p>
          Manage your savings, track your growth, and secure your family&apos;s future with smart
          Ugandan investments.
        </p>
      </section>

      <div className="wealth-grid">
        <section className="panel goal-card">
          <div className="goal-top">
            <div>
              <span className="badge verified" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                Active Goal
              </span>
              <h3>New Bajaj Boxer 150 Goal</h3>
            </div>
            <div className="goal-amount">
              <strong>UGX 4,875,000</strong>
              <span>Saved of UGX 7,500,000</span>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '65%' }} />
          </div>
          <div className="goal-meta">
            <div>
              <span>Weekly Earnings</span>
              <strong className="pos">UGX 482,500</strong>
            </div>
            <div>
              <span>Monthly Savings</span>
              <strong>UGX 450,000</strong>
            </div>
            <div>
              <span>Completion</span>
              <strong>65%</strong>
            </div>
            <div>
              <span>Est. Time Left</span>
              <strong>4 Months</strong>
            </div>
            <button className="btn-primary" type="button" style={{ flex: '0 0 auto' }}>
              Boost Savings
            </button>
          </div>
        </section>

        <div className="wealth-stats">
          <article className="stat-card peach">
            <div>
              <span>Total Net Worth</span>
              <strong>UGX 12,402,000</strong>
              <em>+12% this month</em>
            </div>
            <Icon name="account_balance_wallet" />
          </article>
          <article className="stat-card sand">
            <div>
              <span>Emergency Fund</span>
              <strong>UGX 1,200,000</strong>
              <em>Ready for withdrawal</em>
            </div>
            <Icon name="security" />
          </article>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Investment Opportunities</h2>
          <button className="linkish" type="button">
            View All →
          </button>
        </div>
        <div className="invest-grid">
          {INVESTMENTS.map((item) => (
            <article className="panel invest-card" key={item.title}>
              <div className="invest-icon">
                <Icon name={item.icon} />
              </div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
              <div className="invest-rate">
                <span>Projected Return</span>
                <strong>{item.rate}</strong>
              </div>
              <button className="btn-outline" type="button">
                {item.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ledger-head">
          <h2>
            <Icon name="analytics" /> Smart Ledger History
          </h2>
          <button className="chip" type="button">
            <Icon name="filter_list" /> Filter
          </button>
        </div>
        <div className="table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Parsed Log / Source</th>
                <th>Amount</th>
                <th>Wealth Impact</th>
                <th>Ledger Balance</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((row) => (
                <tr key={row.when + row.title}>
                  <td>{row.when}</td>
                  <td>
                    <strong>{row.title}</strong>
                    <div className="empty-note">{row.note}</div>
                  </td>
                  <td className={row.pos ? 'pos' : 'neg'}>{row.amount}</td>
                  <td>
                    <span className={`badge ${row.pos ? 'verified' : 'critical'}`}>{row.impact}</span>
                  </td>
                  <td>{row.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
