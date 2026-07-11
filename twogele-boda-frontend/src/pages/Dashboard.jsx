import { useEffect, useRef, useState } from 'react'
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
  fetchHistory,
  replyPreview,
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

function parseResult(data, userMessage) {
  const response = (data.response || data.raw || data.model_response || '').trim()
  const kind = classifyResponse(response, data.category)
  return {
    kind,
    userMessage: userMessage || data.user_message || '',
    response,
    thinking: data.thinking,
    json: data.ledger || extractJsonBlock(response),
    hazard: extractField(response, 'Hazard Type'),
    location: extractField(response, 'Location'),
    urgency: extractField(response, 'Urgency'),
    authority: extractField(response, 'Responsible Body'),
  }
}

function historyToMessages(rows) {
  const chronological = [...rows].reverse()
  const messages = []
  for (const row of chronological) {
    if (row.user_message) {
      messages.push({
        id: `u-${row.id}`,
        role: 'user',
        text: row.user_message,
        category: row.category,
      })
    }
    if (row.model_response) {
      messages.push({
        id: `a-${row.id}`,
        role: 'assistant',
        text: replyPreview(row.model_response) || row.model_response,
        category: row.category,
      })
    }
  }
  return messages
}

export default function Dashboard() {
  const { riderId } = useAuth()
  const { t, language, speechLang } = useLanguage()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [messages, setMessages] = useState([])
  const [safetyResult, setSafetyResult] = useState(null)
  const [moneyResult, setMoneyResult] = useState(null)
  const chatEndRef = useRef(null)
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

  useEffect(() => {
    let cancelled = false
    async function loadHistory() {
      if (!riderId || riderId === 'anonymous') {
        setMessages([])
        return
      }
      try {
        const rows = await fetchHistory({ limit: 30, riderId })
        if (cancelled) return
        setMessages(historyToMessages(rows))
        const latestSafety = rows.find((row) => row.category === 'safety')
        const latestMoney = rows.find((row) => row.category === 'expense')
        if (latestSafety) setSafetyResult(parseResult(latestSafety, latestSafety.user_message))
        if (latestMoney) setMoneyResult(parseResult(latestMoney, latestMoney.user_message))
      } catch {
        // History is optional — chat still works without it.
      }
    }
    loadHistory()
    return () => {
      cancelled = true
    }
  }, [riderId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  function applyParsed(parsed, userText) {
    const stamp = Date.now()
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: 'user', text: userText, category: parsed.kind },
      {
        id: `a-${stamp}`,
        role: 'assistant',
        text: replyPreview(parsed.response) || parsed.response,
        category: parsed.kind,
      },
    ])
    if (parsed.kind === 'safety' || parsed.kind === 'unknown') setSafetyResult(parsed)
    if (parsed.kind === 'expense' || parsed.kind === 'unknown') setMoneyResult(parsed)
  }

  async function runPrompt(text) {
    const trimmed = text.trim()
    if (!trimmed || loading || recording) return

    setMessage(trimmed)
    setLoading(true)
    setError('')
    setStatus(t('pleaseWaitReading'))

    try {
      const data = await chatWithGemma(trimmed, { riderId, language })
      applyParsed(parseResult(data, trimmed), trimmed)
      setStatus(t('done'))
      setMessage('')
    } catch (err) {
      setError(err.message || t('sorryWrong'))
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
      applyParsed(parseResult(data, combined), combined)
      setStatus(t('done'))
      setMessage('')
    } catch (err) {
      setError(err.message || t('voiceFailed'))
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const displayText = recording && liveTranscript ? liveTranscript : message
  const micLabel = recording ? t('stopSend', { seconds }) : t('speakWithMic')
  const moneyList = moneyRows(moneyResult?.json, t)

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

      <section className="panel chat-panel" aria-live="polite">
        <div className="section-head" style={{ marginBottom: '0.75rem' }}>
          <h4>
            <Icon name="forum" />
            {t('chatHistory')}
          </h4>
        </div>
        <div className="chat-thread">
          {messages.length === 0 && !loading ? (
            <p className="empty-note">{t('noChatsYet')}</p>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={`chat-bubble ${item.role}${item.category ? ` cat-${item.category}` : ''}`}
              >
                <span className="chat-role">{item.role === 'user' ? t('you') : t('twogele')}</span>
                <p>{item.text}</p>
              </div>
            ))
          )}
          {loading && <p className="voice-status">{t('pleaseWaitReading')}</p>}
          <div ref={chatEndRef} />
        </div>
      </section>

      <div className="tracks">
        <article className="track safety">
          <div className="track-inner">
            <div className="track-head">
              <h3>
                <Icon name="warning" />
                {t('roadDanger')}
              </h3>
              <span className="badge critical">
                {safetyResult ? simpleUrgency(safetyResult.urgency, t) : t('ready')}
              </span>
            </div>

            {safetyResult ? (
              <>
                <div className="meta-grid">
                  <div className="meta-box">
                    <span>{t('whatWrong')}</span>
                    <strong>{safetyResult.hazard || t('roadProblem')}</strong>
                  </div>
                  <div className="meta-box">
                    <span>{t('where')}</span>
                    <strong>{safetyResult.location || t('kampala')}</strong>
                  </div>
                </div>
                <div className="authority">
                  <Icon name="policy" />
                  <div>
                    <strong>{t('whoHelp')}</strong>
                    <p>{safetyResult.authority || replyPreview(safetyResult.response)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="empty-note">{t('safetyEmpty')}</p>
            )}
          </div>
        </article>

        <article className="track wealth">
          <div className="track-inner">
            <div className="track-head">
              <h3>
                <Icon name="account_balance_wallet" />
                {t('yourMoney')}
              </h3>
              <span className="badge verified">{moneyResult ? t('saved') : t('ready')}</span>
            </div>

            {moneyResult ? (
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
                      {replyPreview(moneyResult.response) || moneyResult.response}
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
                      {typeof moneyResult.json === 'object' && moneyResult.json['Income saved']
                        ? `UGX ${(Number(moneyResult.json['Income saved']) * 30).toLocaleString()}`
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
