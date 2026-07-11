import { useState } from 'react'
import { Link } from 'react-router-dom'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { Icon } from '../components/Icon'
import MapView, { DEMAND_MARKERS, HAZARD_MARKERS } from '../components/MapView'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import {
  chatWithGemma,
  classifyResponse,
  extractField,
  extractJsonBlock,
} from '../lib/api'
import '../styles/pages.css'

const SAVE_IDEAS = [
  'Boda SACCO (save with other riders)',
  'MTN or Airtel money save',
  'Government save plans',
]

const MONEY_LABELS = {
  'Fuel expenses': 'Fuel',
  'Income saved': 'Money saved',
  'Daily expenses': "Today's spending",
}

function simpleUrgency(raw) {
  const text = (raw || '').toLowerCase()
  if (text.includes('critical') || text.includes('high')) return 'URGENT'
  if (text.includes('medium') || text.includes('moderate')) return 'CAREFUL'
  if (text.includes('low')) return 'SMALL'
  return 'URGENT'
}

function moneyRows(json) {
  if (!json || typeof json !== 'object') return []
  return Object.entries(json).map(([key, value]) => ({
    label: MONEY_LABELS[key] || key,
    value: typeof value === 'number' ? `UGX ${Number(value).toLocaleString()}` : String(value),
  }))
}

function applyModelResult(data, setResult) {
  const response = data.response || data.raw || ''
  const kind = classifyResponse(response)
  setResult({
    kind,
    response,
    thinking: data.thinking,
    json: extractJsonBlock(response),
    hazard: extractField(response, 'Hazard Type'),
    location: extractField(response, 'Location'),
    urgency: extractField(response, 'Urgency'),
    authority: extractField(response, 'Responsible Body'),
  })
}

export default function Dashboard() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const { recording, supported, seconds, liveTranscript, start, stop } =
    useVoiceRecorder()

  async function handleProcess(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading || recording) return

    setLoading(true)
    setError('')
    setStatus('Please wait… reading your message')

    try {
      const data = await chatWithGemma(text)
      applyModelResult(data, setResult)
      setStatus('Done')
    } catch (err) {
      setError(err.message || 'Sorry, something went wrong. Try again.')
      setResult(null)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  async function handleMicClick() {
    if (loading) return

    if (!supported) {
      setError('Voice works best in Chrome or Edge. You can also type.')
      return
    }

    setError('')

    if (!recording) {
      try {
        await start()
        setStatus('Listening… speak, then tap the mic again')
      } catch (err) {
        setError(
          err.name === 'NotAllowedError'
            ? 'Please allow the phone mic, then try again.'
            : err.message || 'Could not open the mic',
        )
        setStatus('')
      }
      return
    }

    setLoading(true)
    setStatus('Please wait… sending what you said')

    try {
      const captured = await stop()
      if (captured?.error) {
        throw new Error(captured.error)
      }

      const spoken = (captured?.transcript || liveTranscript || '').trim()
      const combined = [message.trim(), spoken].filter(Boolean).join(' ').trim()

      if (!combined) {
        throw new Error('We did not hear you. Tap mic, speak clearly, then tap again.')
      }

      setMessage(combined)
      const data = await chatWithGemma(combined, { source: 'voice' })
      applyModelResult(data, setResult)
      setStatus('Done')
    } catch (err) {
      setError(err.message || 'Sorry, voice failed. Try typing instead.')
      setResult(null)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const showSafety = !result || result.kind === 'safety' || result.kind === 'unknown'
  const showWealth = !result || result.kind === 'expense' || result.kind === 'unknown'
  const displayText = recording && liveTranscript ? liveTranscript : message
  const micLabel = recording
    ? `Stop & send (${seconds}s)`
    : 'Speak with mic'
  const moneyList = moneyRows(result?.json)

  return (
    <>
      <section className="page-head">
        <h1>TWOGELE BODA</h1>
        <p>Help for road danger and your daily money</p>
      </section>

      <section className="panel composer">
        <label className="panel-label" htmlFor="dispatch-input">
          Tell us what happened — type or speak
        </label>
        <form onSubmit={handleProcess}>
          <textarea
            id="dispatch-input"
            value={displayText}
            onChange={(e) => setMessage(e.target.value)}
            disabled={recording}
            placeholder="Example: 'Mwana I used 22k for fuel today' or 'Bad pothole on Jinja Road near the lights'"
          />
          <div className="composer-actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={loading || recording || !message.trim()}
            >
              <Icon name="bolt" filled />
              {loading && !recording ? 'Please wait…' : 'Send'}
            </button>
            <button
              className={`btn-mic${recording ? ' recording' : ''}`}
              type="button"
              aria-label={micLabel}
              title={micLabel}
              disabled={loading && !recording}
              onClick={handleMicClick}
            >
              <Icon name={recording ? 'stop' : 'mic'} filled />
            </button>
          </div>
        </form>
        {recording && (
          <p className="voice-status recording-status">
            Listening… {seconds}s — tap the mic again when you finish talking
          </p>
        )}
        {!recording && status && <p className="voice-status">{status}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>

      <div className="tracks">
        {showSafety && (
          <article className="track safety">
            <div className="track-inner">
              <div className="track-head">
                <h3>
                  <Icon name="warning" />
                  1. Road danger
                </h3>
                <span className="badge critical">
                  {result?.kind === 'safety' ? simpleUrgency(result.urgency) : 'READY'}
                </span>
              </div>

              {result?.kind === 'safety' ? (
                <>
                  <div className="meta-grid">
                    <div className="meta-box">
                      <span>What is wrong</span>
                      <strong>{result.hazard || 'Road problem'}</strong>
                    </div>
                    <div className="meta-box">
                      <span>Where</span>
                      <strong>{result.location || 'Kampala'}</strong>
                    </div>
                  </div>
                  <div className="authority">
                    <Icon name="policy" />
                    <div>
                      <strong>Who can help</strong>
                      <p>{result.authority || result.response}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-note">
                  Tell us about a bad road, accident, or road block. Help and who to call will show
                  here.
                </p>
              )}
            </div>
          </article>
        )}

        {showWealth && (
          <article className="track wealth">
            <div className="track-inner">
              <div className="track-head">
                <h3>
                  <Icon name="account_balance_wallet" />
                  2. Your money
                </h3>
                <span className="badge verified">
                  {result?.kind === 'expense' ? 'SAVED' : 'READY'}
                </span>
              </div>

              {result?.kind === 'expense' ? (
                <>
                  <p className="panel-label" style={{ marginBottom: '0.5rem' }}>
                    Today&apos;s money record
                  </p>
                  <div className="ledger">
                    {moneyList.length > 0 ? (
                      <div className="list">
                        {moneyList.map((row) => (
                          <div className="list-item" key={row.label}>
                            <span>{row.label}</span>
                            <span>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-note" style={{ margin: 0 }}>
                        {result.response}
                      </p>
                    )}
                  </div>
                  <div className="projection">
                    <div className="projection-icon">
                      <Icon name="show_chart" />
                    </div>
                    <div>
                      <span>If you save like this for 30 days</span>
                      <strong>
                        {typeof result.json === 'object' && result.json['Income saved']
                          ? `UGX ${(Number(result.json['Income saved']) * 30).toLocaleString()}`
                          : 'UGX 450,000'}
                      </strong>
                    </div>
                  </div>
                  <p className="panel-label">Ways to grow your money</p>
                  <div className="chips">
                    {SAVE_IDEAS.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-note">
                  Tell us about fuel, tips, or money you kept. Your simple money numbers will show
                  here.
                </p>
              )}
            </div>
          </article>
        )}
      </div>

      <section className="section panel">
        <div className="section-head">
          <h4>
            <Icon name="explore" />
            Busy places &amp; danger spots
          </h4>
          <Link className="linkish" to="/emergency">
            Open big map
          </Link>
        </div>
        <MapView
          markers={[...HAZARD_MARKERS, ...DEMAND_MARKERS]}
          zoom={12}
          className="dashboard-map"
        />
        <div className="hotspot-legend-row">
          <div>🟢 Many customers: Katwe</div>
          <div>🔴 Danger: Clock Tower</div>
        </div>
      </section>

      <section className="hero-banner">
        <img src={kampalaHero} alt="Kampala boda rider on the road" />
        <div className="overlay" />
        <div className="copy">
          <h3>Made for Kampala boda riders</h3>
          <p>Simple help for the road and your pocket.</p>
        </div>
      </section>

      <p className="disclaimer">
        This app helps you, but it is not the police, hospital, or a bank. For Build with Gemma
        Uganda.
      </p>
      <div className="partners">
        <span>KCCA</span>
        <span>GEMMA</span>
        <span>BUILD-UG</span>
      </div>
    </>
  )
}
