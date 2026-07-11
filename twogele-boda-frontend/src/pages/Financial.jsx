import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { fetchHistory } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import '../styles/pages.css'

function formatAmount(ledger) {
  if (!ledger || typeof ledger !== 'object') return null
  const fuel = Number(ledger['Fuel expenses'] ?? ledger.fuel ?? NaN)
  const income = Number(ledger['Income saved'] ?? ledger.income ?? NaN)
  if (!Number.isNaN(fuel) && fuel > 0) return { text: `- UGX ${fuel.toLocaleString()}`, pos: false }
  if (!Number.isNaN(income) && income > 0) return { text: `+ UGX ${income.toLocaleString()}`, pos: true }
  return null
}

function activityLabel(item) {
  const msg = (item.user_message || '').trim()
  if (msg.length <= 48) return msg || 'Ledger entry'
  return `${msg.slice(0, 45)}…`
}

export default function Financial() {
  const navigate = useNavigate()
  const { showToast } = useOutletContext() || {}
  const { riderId } = useAuth()
  const { t } = useLanguage()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchHistory({ limit: 20, category: 'expense', riderId })
        if (!cancelled) setHistory(rows)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load history')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [riderId])

  const activity = useMemo(
    () =>
      history.map((item) => {
        const amount = formatAmount(item.ledger)
        return {
          id: item.id,
          label: activityLabel(item),
          amount: amount?.text || 'Logged',
          pos: amount?.pos ?? true,
        }
      }),
    [history],
  )

  const totals = useMemo(() => {
    let fuel = 0
    let saved = 0
    for (const item of history) {
      const ledger = item.ledger
      if (!ledger || typeof ledger !== 'object') continue
      const f = Number(ledger['Fuel expenses'] ?? 0)
      const s = Number(ledger['Income saved'] ?? 0)
      if (!Number.isNaN(f)) fuel += f
      if (!Number.isNaN(s)) saved += s
    }
    return { fuel, saved }
  }, [history])

  return (
    <>
      <section className="page-head">
        <h1>{t('myMoney')}</h1>
        <p>{t('seeEarnedSpent')}</p>
      </section>

      <div className="metrics">
        <article className="metric">
          <span>{t('moneyKept')}</span>
          <strong>UGX {totals.saved.toLocaleString()}</strong>
          <em>{t('fromWhatTold')}</em>
        </article>
        <article className="metric">
          <span>{t('fuelSpent')}</span>
          <strong>UGX {totals.fuel.toLocaleString()}</strong>
          <em>{t('allFuelLogged')}</em>
        </article>
        <article className="metric">
          <span>{t('busyTime')}</span>
          <strong>07:00 – 09:30</strong>
          <em>{t('morningRush')}</em>
        </article>
      </div>

      <section className="section panel">
        <div className="section-head">
          <h4>{t('moneyInOut')}</h4>
          <span className="empty-note">{t('last7')}</span>
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
        <strong>{t('tipsEarn')}</strong>
        <div className="two-col" style={{ marginTop: '0.85rem' }}>
          <div className="panel" style={{ boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <Icon name="campaign" /> {t('manyCustomersTitle')}
            </h4>
            <p className="empty-note" style={{ margin: 0 }}>
              {t('kololoBusy')}
            </p>
          </div>
          <div className="panel" style={{ boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <Icon name="tire_repair" /> {t('saveFuel')}
            </h4>
            <p className="empty-note" style={{ margin: 0 }}>
              {t('fuelTip')}
            </p>
          </div>
        </div>
      </section>

      <div className="two-col section">
        <section className="panel">
          <div className="section-head">
            <h4>{t('whatRecorded')}</h4>
            <span className="empty-note">{loading ? t('loading') : `${activity.length} saved`}</span>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="list">
            {!loading && activity.length === 0 && !error && (
              <p className="empty-note">{t('nothingYet')}</p>
            )}
            {activity.map((item) => (
              <div className="list-item" key={item.id}>
                <span>{item.label}</span>
                <span className={item.pos ? 'pos' : 'neg'}>{item.amount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ textAlign: 'center' }}>
          <h4 style={{ marginTop: 0, fontFamily: 'var(--font-headline)' }}>{t('newBikeDream')}</h4>
          <p className="empty-note">{t('goal')}</p>
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
          <button
            className="btn-primary"
            type="button"
            style={{ width: '100%' }}
            onClick={() => {
              showToast?.('Open Save & grow to add money to your bike goal.')
              navigate('/app/wealth')
            }}
          >
            {t('putMoneyIn')}
          </button>
        </section>
      </div>
    </>
  )
}
