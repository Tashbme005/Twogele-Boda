import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Icon } from '../components/Icon'
import '../styles/pages.css'

const INVESTMENTS = [
  {
    title: 'Boda SACCO',
    body: 'Save with other riders. You can also borrow later.',
    rate: 'About 8.5% a year',
    icon: 'groups',
    cta: 'Learn more',
  },
  {
    title: 'MTN / Airtel save',
    body: 'Put money on your phone and earn a little every day.',
    rate: 'About 11% a year',
    icon: 'ad_units',
    cta: 'Start saving',
  },
  {
    title: 'Government save',
    body: 'Safe place to keep money with the government.',
    rate: 'About 12.5% a year',
    icon: 'account_balance',
    cta: 'See how',
  },
]

const LEDGER = [
  {
    when: 'Oct 24, 09:15 AM',
    title: 'Trip money - Entebbe Rd',
    note: 'Cash after fuel',
    amount: '+8,500',
    impact: 'Up',
    balance: '12,402,000',
    pos: true,
  },
  {
    when: 'Oct 24, 07:40 AM',
    title: 'Fuel - Total Oasis',
    note: '18k fuel',
    amount: '-18,000',
    impact: 'Spent',
    balance: '12,393,500',
    pos: false,
  },
  {
    when: 'Oct 23, 08:10 PM',
    title: 'Tips - Nakawa Stage',
    note: 'Evening tips',
    amount: '+15,000',
    impact: 'Up',
    balance: '12,411,500',
    pos: true,
  },
]

export default function Wealth() {
  const navigate = useNavigate()
  const { showToast } = useOutletContext() || {}
  const [filter, setFilter] = useState('all')
  const [savedExtra, setSavedExtra] = useState(0)

  const rows = useMemo(() => {
    if (filter === 'up') return LEDGER.filter((r) => r.pos)
    if (filter === 'spent') return LEDGER.filter((r) => !r.pos)
    return LEDGER
  }, [filter])

  function cycleFilter() {
    setFilter((current) => {
      const next = current === 'all' ? 'up' : current === 'up' ? 'spent' : 'all'
      showToast?.(
        next === 'all'
          ? 'Showing all money history'
          : next === 'up'
            ? 'Showing money in only'
            : 'Showing money out only',
      )
      return next
    })
  }

  return (
    <>
      <section className="page-head">
        <h1>Save &amp; grow</h1>
        <p>Keep money for your family and your next bike.</p>
      </section>

      <div className="wealth-grid">
        <section className="panel goal-card">
          <div className="goal-top">
            <div>
              <span className="badge verified" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                My goal
              </span>
              <h3>New Bajaj Boxer 150</h3>
            </div>
            <div className="goal-amount">
              <strong>UGX {(4875000 + savedExtra).toLocaleString()}</strong>
              <span>Saved of UGX 7,500,000</span>
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, ((4875000 + savedExtra) / 7500000) * 100)}%` }}
            />
          </div>
          <div className="goal-meta">
            <div>
              <span>This week&apos;s money</span>
              <strong className="pos">UGX 482,500</strong>
            </div>
            <div>
              <span>Saved this month</span>
              <strong>UGX {(450000 + savedExtra).toLocaleString()}</strong>
            </div>
            <div>
              <span>How far</span>
              <strong>{Math.round(((4875000 + savedExtra) / 7500000) * 100)}%</strong>
            </div>
            <div>
              <span>Time left</span>
              <strong>About 4 months</strong>
            </div>
            <button
              className="btn-primary"
              type="button"
              style={{ flex: '0 0 auto' }}
              onClick={() => {
                setSavedExtra((n) => n + 10000)
                showToast?.('Added UGX 10,000 to your bike save.')
              }}
            >
              Add more save
            </button>
          </div>
        </section>

        <div className="wealth-stats">
          <article className="stat-card peach">
            <div>
              <span>All your money</span>
              <strong>UGX {(12402000 + savedExtra).toLocaleString()}</strong>
              <em>+12% this month</em>
            </div>
            <Icon name="account_balance_wallet" />
          </article>
          <article className="stat-card sand">
            <div>
              <span>Emergency money</span>
              <strong>UGX 1,200,000</strong>
              <em>Ready if you need it</em>
            </div>
            <Icon name="security" />
          </article>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Ways to grow money</h2>
          <button
            className="linkish"
            type="button"
            onClick={() => {
              document.getElementById('invest-list')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            See all →
          </button>
        </div>
        <div className="invest-grid" id="invest-list">
          {INVESTMENTS.map((item) => (
            <article className="panel invest-card" key={item.title}>
              <div className="invest-icon">
                <Icon name={item.icon} />
              </div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
              <div className="invest-rate">
                <span>You may earn</span>
                <strong>{item.rate}</strong>
              </div>
              <button
                className="btn-outline"
                type="button"
                onClick={() => showToast?.(`${item.title}: we will help you start this soon.`)}
              >
                {item.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ledger-head">
          <h2>
            <Icon name="analytics" /> Money history
          </h2>
          <button className="chip" type="button" onClick={cycleFilter}>
            <Icon name="filter_list" />{' '}
            {filter === 'all' ? 'All' : filter === 'up' ? 'Money in' : 'Money out'}
          </button>
        </div>
        <div className="table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>When</th>
                <th>What</th>
                <th>Amount</th>
                <th>Up or spent</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
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
        <div style={{ padding: '1rem' }}>
          <button className="btn-outline" type="button" onClick={() => navigate('/app/finance')}>
            Open My money
          </button>
        </div>
      </section>
    </>
  )
}
