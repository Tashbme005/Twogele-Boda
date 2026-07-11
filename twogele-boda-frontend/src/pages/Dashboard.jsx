import { useState } from 'react'
import { Link } from 'react-router-dom'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { Icon } from '../components/Icon'
import MapView, { DEMAND_MARKERS, HAZARD_MARKERS } from '../components/MapView'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { useLanguage } from '../i18n/LanguageContext'
import {
  chatWithGemma,
  classifyResponse,
  extractField,
  extractJsonBlock,
} from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import '../styles/pages.css'

const TEST_PROMPTS = {
  en: [
    {
      id: 'pothole',
      label: 'Pothole · Clock Tower',
      text: 'There is a huge pothole near Clock Tower on Entebbe Road. Bodas are swerving into oncoming traffic.',
    },
    {
      id: 'accident',
      label: 'Accident · Nakawa',
      text: 'Mwana accident ebadde ku Jinja Road near Nakawa stage, boda yagwa badly, guy needs help now!',
    },
    {
      id: 'flood',
      label: 'Flood · Makerere',
      text: 'Waliwo amazzi mangi ku Makerere Hill Road, road egaze completely, tekiyisa.',
    },
    {
      id: 'fuel',
      label: 'Fuel + save',
      text: 'I spent 25k on fuel today and saved 40k from my trips.',
    },
    {
      id: 'tips',
      label: 'Tips day',
      text: 'Mwana today tip zange zaali 80k, fuel 15k, daily expenses 10k, nateeka 55k.',
    },
    {
      id: 'invest',
      label: 'Save & invest',
      text: 'This month I saved 500000 UGX after fuel and daily costs. What can I invest in?',
    },
  ],
  lg: [
    {
      id: 'pothole',
      label: 'Kifo · Clock Tower',
      text: 'Waliwo ekifo kinene okumpi ne Clock Tower ku Entebbe Road. Bodas zevuddemu mu traffic.',
    },
    {
      id: 'accident',
      label: 'Accident · Nakawa',
      text: 'Mwana accident ebadde ku Jinja Road near Nakawa stage, boda yagwa badly, guy needs help now!',
    },
    {
      id: 'flood',
      label: 'Amazzi · Makerere',
      text: 'Waliwo amazzi mangi ku Makerere Hill Road, road egaze completely, tekiyisa.',
    },
    {
      id: 'fuel',
      label: 'Petrol + tereka',
      text: 'Nkozesezza 25k ku petrol leero era nateeka 40k okuva ku trips.',
    },
    {
      id: 'tips',
      label: 'Tips leero',
      text: 'Mwana today tip zange zaali 80k, fuel 15k, daily expenses 10k, nateeka 55k.',
    },
    {
      id: 'invest',
      label: 'Tereka & invest',
      text: 'Omwezi guno nateeka 500000 UGX oluvannyuma lwa petrol n’ebisasanyizo. Nnakola ki ku ssente?',
    },
  ],
  sw: [
    {
      id: 'pothole',
      label: 'Shimo · Clock Tower',
      text: 'Kuna shimo kubwa karibu na Clock Tower kwenye Entebbe Road. Boda zinapinda katika traffic.',
    },
    {
      id: 'accident',
      label: 'Ajali · Nakawa',
      text: 'Mwana accident ebadde ku Jinja Road near Nakawa stage, boda yagwa badly, guy needs help now!',
    },
    {
      id: 'flood',
      label: 'Mafuriko · Makerere',
      text: 'Kuna maji mengi Makerere Hill Road, barabara imefungwa kabisa.',
    },
    {
      id: 'fuel',
      label: 'Mafuta + weka',
      text: 'Nimetumia 25k mafuta leo na nimeweka 40k kutoka trips.',
    },
    {
      id: 'tips',
      label: 'Tips leo',
      text: 'Mwana today tip zange zaali 80k, fuel 15k, daily expenses 10k, nateeka 55k.',
    },
    {
      id: 'invest',
      label: 'Weka & invest',
      text: 'Mwezi huu nimeweka 500000 UGX baada ya mafuta na gharama. Ninaweza kuwekeza wapi?',
    },
  ],
}

function simpleUrgency(raw, t) {
  const text = (raw || '').toLowerCase()
  if (text.includes('critical') || text.includes('high')) return t('urgent')
  if (text.includes('medium') || text.includes('moderate')) return t('careful')
  if (text.includes('low')) return t('small')
  return t('urgent')
}

function moneyRows(json, t) {
  if (!json || typeof json !== 'object') return []
  const labels = {
    'Fuel expenses': t('fuel'),
    'Income saved': t('moneySaved'),
    'Daily expenses': t('todaySpend'),
  }
  return Object.entries(json).map(([key, value]) => ({
    label: labels[key] || key,
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
  const { riderId } = useAuth()
  const { t, language, speechLang } = useLanguage()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const { recording, supported, seconds, liveTranscript, start, stop } =
    useVoiceRecorder(speechLang)

  const prompts = TEST_PROMPTS[language] || TEST_PROMPTS.en

  const saveIdeas =
    language === 'lg'
      ? ['SACCO ya boda', 'Tereka ku MTN/Airtel', 'Enteekateeka za gavumenti']
      : language === 'sw'
        ? ['SACCO ya boda', 'Weka kwa MTN/Airtel', 'Mipango ya serikali']
        : [
            'Boda SACCO (save with other riders)',
            'MTN or Airtel money save',
            'Government save plans',
          ]

  async function runPrompt(text) {
    const trimmed = text.trim()
    if (!trimmed || loading || recording) return

    setMessage(trimmed)
    setLoading(true)
    setError('')
    setStatus(t('pleaseWaitReading'))

    try {
      const data = await chatWithGemma(trimmed, { riderId, language })
      applyModelResult(data, setResult)
      setStatus(t('done'))
    } catch (err) {
      setError(err.message || t('sorryWrong'))
      setResult(null)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  async function handleProcess(event) {
    event.preventDefault()
    await runPrompt(message)
  }

  async function handleMicClick() {
    if (loading) return

    if (!supported) {
      setError(t('voiceNeedsChrome'))
      return
    }

    setError('')

    if (!recording) {
      try {
        await start()
        setStatus(t('listening', { seconds: 0 }))
      } catch (err) {
        setError(
          err.name === 'NotAllowedError' ? t('allowMic') : err.message || t('couldNotMic'),
        )
        setStatus('')
      }
      return
    }

    setLoading(true)
    setStatus(t('pleaseWaitVoice'))

    try {
      const captured = await stop()
      if (captured?.error) {
        throw new Error(captured.error)
      }

      const spoken = (captured?.transcript || liveTranscript || '').trim()
      const combined = [message.trim(), spoken].filter(Boolean).join(' ').trim()

      if (!combined) {
        throw new Error(t('noSpeech'))
      }

      setMessage(combined)
      const data = await chatWithGemma(combined, { source: 'voice', riderId, language })
      applyModelResult(data, setResult)
      setStatus(t('done'))
    } catch (err) {
      setError(err.message || t('voiceFailed'))
      setResult(null)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const showSafety = !result || result.kind === 'safety' || result.kind === 'unknown'
  const showWealth = !result || result.kind === 'expense' || result.kind === 'unknown'
  const displayText = recording && liveTranscript ? liveTranscript : message
  const micLabel = recording ? t('stopSend', { seconds }) : t('speakWithMic')
  const moneyList = moneyRows(result?.json, t)

  return (
    <>
      <section className="page-head">
        <h1>{t('brand').toUpperCase()}</h1>
        <p>{t('helpRoadMoney')}</p>
      </section>

      <section className="panel composer">
        <label className="panel-label" htmlFor="dispatch-input">
          {t('tellWhatHappened')}
        </label>
        <form onSubmit={handleProcess}>
          <textarea
            id="dispatch-input"
            value={displayText}
            onChange={(e) => setMessage(e.target.value)}
            disabled={recording}
            placeholder={t('placeholderDispatch')}
          />
          <div className="composer-actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={loading || recording || !message.trim()}
            >
              <Icon name="bolt" filled />
              {loading && !recording ? t('pleaseWait') : t('send')}
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

        <div className="prompt-chips">
          <p className="panel-label">{t('tryThese')}</p>
          <div className="chips">
            {prompts.map((item) => (
              <button
                key={item.id}
                className="chip prompt-chip"
                type="button"
                title={item.text}
                disabled={loading || recording}
                onClick={() => runPrompt(item.text)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {recording && (
          <p className="voice-status recording-status">{t('listening', { seconds })}</p>
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
                  {t('roadDanger')}
                </h3>
                <span className="badge critical">
                  {result?.kind === 'safety' ? simpleUrgency(result.urgency, t) : t('ready')}
                </span>
              </div>

              {result?.kind === 'safety' ? (
                <>
                  <div className="meta-grid">
                    <div className="meta-box">
                      <span>{t('whatWrong')}</span>
                      <strong>{result.hazard || t('roadProblem')}</strong>
                    </div>
                    <div className="meta-box">
                      <span>{t('where')}</span>
                      <strong>{result.location || t('kampala')}</strong>
                    </div>
                  </div>
                  <div className="authority">
                    <Icon name="policy" />
                    <div>
                      <strong>{t('whoHelp')}</strong>
                      <p>{result.authority || result.response}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-note">{t('safetyEmpty')}</p>
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
                  {t('yourMoney')}
                </h3>
                <span className="badge verified">
                  {result?.kind === 'expense' ? t('saved') : t('ready')}
                </span>
              </div>

              {result?.kind === 'expense' ? (
                <>
                  <p className="panel-label" style={{ marginBottom: '0.5rem' }}>
                    {t('todayMoney')}
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
                      <span>{t('ifSave30')}</span>
                      <strong>
                        {typeof result.json === 'object' && result.json['Income saved']
                          ? `UGX ${(Number(result.json['Income saved']) * 30).toLocaleString()}`
                          : 'UGX 450,000'}
                      </strong>
                    </div>
                  </div>
                  <p className="panel-label">{t('waysGrow')}</p>
                  <div className="chips">
                    {saveIdeas.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-note">{t('moneyEmpty')}</p>
              )}
            </div>
          </article>
        )}
      </div>

      <section className="section panel">
        <div className="section-head">
          <h4>
            <Icon name="explore" />
            {t('busyPlaces')}
          </h4>
          <Link className="linkish" to="/app/emergency">
            {t('openBigMap')}
          </Link>
        </div>
        <MapView
          markers={[...HAZARD_MARKERS, ...DEMAND_MARKERS]}
          zoom={12}
          className="dashboard-map"
        />
        <div className="hotspot-legend-row">
          <div>🟢 {t('manyCustomers')}</div>
          <div>🔴 {t('dangerClock')}</div>
        </div>
      </section>

      <section className="hero-banner">
        <img src={kampalaHero} alt="Kampala boda rider on the road" />
        <div className="overlay" />
        <div className="copy">
          <h3>{t('madeForRiders')}</h3>
          <p>{t('simpleHelp')}</p>
        </div>
      </section>

      <p className="disclaimer">{t('disclaimer')}</p>
      <div className="partners">
        <span>KCCA</span>
        <span>GEMMA</span>
        <span>BUILD-UG</span>
      </div>
    </>
  )
}
