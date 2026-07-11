import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../lib/AuthContext'
import '../styles/pages.css'

export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { t, language, setLanguage, languages } = useLanguage()
  const [profile, setProfile] = useState({
    name: user?.name || 'Musa Kasule',
    stage: 'Kiwatule Stage A',
    plate: 'UEE 492P',
  })
  const [safetyAlerts, setSafetyAlerts] = useState(true)
  const [financeAlerts, setFinanceAlerts] = useState(true)
  const [battery, setBattery] = useState('Normal')
  const [routing, setRouting] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [savedProfile, setSavedProfile] = useState(profile)
  const [note, setNote] = useState('')

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  function handleSave() {
    setSavedProfile(profile)
    setNote(t('savedOk'))
  }

  function handleCancel() {
    setProfile(savedProfile)
    setNote(t('cancelledOk'))
  }

  return (
    <>
      <section className="page-head">
        <h1>{t('myDetails')}</h1>
        <p>{t('changeDetails')}</p>
      </section>

      <div className="settings-grid">
        <section className="panel">
          <h3 className="card-title">
            <Icon name="person" /> {t('aboutYou')}
          </h3>
          <label className="field">
            <span>{t('fullName')}</span>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t('stageLocation')}</span>
            <input
              value={profile.stage}
              onChange={(e) => setProfile((p) => ({ ...p, stage: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t('plateNumber')}</span>
            <input
              value={profile.plate}
              onChange={(e) => setProfile((p) => ({ ...p, plate: e.target.value }))}
            />
          </label>
        </section>

        <section className="panel">
          <h3 className="card-title">
            <Icon name="language" /> {t('language')}
          </h3>
          <p className="empty-note" style={{ marginTop: 0 }}>
            {t('languageHint')}
          </p>
          {languages.map((opt) => (
            <label className="radio-row" key={opt.id}>
              <input
                type="radio"
                name="lang"
                checked={language === opt.id}
                onChange={() => setLanguage(opt.id)}
              />
              <span>{opt.native}</span>
            </label>
          ))}
        </section>

        <section className="panel">
          <h3 className="card-title">
            <Icon name="notifications" /> {t('notificationsTitle')}
          </h3>
          <div className="settings-row">
            <div>
              <strong>{t('dangerAlerts')}</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                {t('dangerAlertsHint')}
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
              <strong>{t('moneyUpdates')}</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                {t('moneyUpdatesHint')}
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
            <Icon name="bolt" /> {t('smartHelp')}{' '}
            <span className="badge critical" style={{ marginLeft: '0.5rem' }}>
              NEW
            </span>
          </h3>
          <div className="tip-card" style={{ marginBottom: '1rem' }}>
            <p style={{ margin: 0 }}>{t('smartHelpBody')}</p>
          </div>
          <label className="field">
            <span>{t('phoneBattery')}</span>
            <select value={battery} onChange={(e) => setBattery(e.target.value)}>
              <option>Normal</option>
              <option>Strong</option>
              <option>Save battery</option>
            </select>
          </label>
          <div className="settings-row">
            <div>
              <strong>{t('saferRoutes')}</strong>
              <p className="empty-note" style={{ margin: '0.2rem 0 0' }}>
                {t('saferRoutesHint')}
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
        <button className="btn-primary" type="button" onClick={handleSave}>
          <Icon name="save" /> {t('save')}
        </button>
        <button className="btn-outline" type="button" onClick={handleCancel}>
          {t('cancel')}
        </button>
        <button className="btn-outline" type="button" onClick={handleLogout} disabled={loggingOut}>
          <Icon name="logout" />
          {loggingOut ? t('loggingOut') : t('logOut')}
        </button>
      </div>
      {note && (
        <p className="empty-note" style={{ marginTop: '0.75rem' }}>
          {note}
        </p>
      )}
      {user?.email && (
        <p className="empty-note" style={{ marginTop: '1rem' }}>
          {t('signedInAs', { email: user.email })}
        </p>
      )}
    </>
  )
}
