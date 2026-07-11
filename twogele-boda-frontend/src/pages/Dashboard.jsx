import { useState } from 'react'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { Icon } from '../components/Icon'
import {
  chatWithGemma,
  classifyResponse,
  extractField,
  extractJsonBlock,
} from '../lib/api'
import '../styles/pages.css'

const INVESTMENTS = [
  'Boda-Boda Cooperative SACCOs',
  'MTN/Airtel 11% Fund',
  'UG Treasury Bills',
]

export default function Dashboard() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleProcess(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading) return

    setLoading(true)
    setError('')

    try {
      const data = await chatWithGemma(text)
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
    } catch (err) {
      setError(err.message || 'Could not reach Gemma backend')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const showSafety = !result || result.kind === 'safety' || result.kind === 'unknown'
  const showWealth = !result || result.kind === 'expense' || result.kind === 'unknown'

  return (
    <>
      <section className="page-head">
        <h1>TWOGELE BODA</h1>
        <p>Kampala Boda hub for Safety &amp; Livelihoods</p>
      </section>

      <section className="panel composer">
        <label className="panel-label" htmlFor="dispatch-input">
          Smart Dispatch &amp; Ledger Input
        </label>
        <form onSubmit={handleProcess}>
          <textarea
            id="dispatch-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter or speak text (e.g., 'Mwana I used 22k for fuel today' OR 'Terrible pothole on Jinja Road near traffic lights')"
          />
          <div className="composer-actions">
            <button className="btn-primary" type="submit" disabled={loading || !message.trim()}>
              <Icon name="bolt" filled />
              {loading ? 'Processing…' : 'Process with Gemma 4'}
            </button>
            <button className="btn-mic" type="button" aria-label="Voice input" title="Voice coming soon">
              <Icon name="mic" filled />
            </button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      <div className="tracks">
        {showSafety && (
          <article className="track safety">
            <div className="track-inner">
              <div className="track-head">
                <h3>
                  <Icon name="warning" />
                  TRACK 1: Safety &amp; Incident Dispatch
                </h3>
                <span className="badge critical">
                  {(result?.urgency || 'CRITICAL').toUpperCase().split(/[\s(,]/)[0]}
                </span>
              </div>

              {result?.kind === 'safety' ? (
                <>
                  <div className="meta-grid">
                    <div className="meta-box">
                      <span>Hazard Type</span>
                      <strong>{result.hazard || 'Reported hazard'}</strong>
                    </div>
                    <div className="meta-box">
                      <span>Location</span>
                      <strong>{result.location || 'Kampala'}</strong>
                    </div>
                  </div>
                  <div className="authority">
                    <Icon name="policy" />
                    <div>
                      <strong>Assigned Authority</strong>
                      <p>{result.authority || result.response}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-note">
                  Safety reports appear here after Gemma classifies a hazard, accident, or road
                  block.
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
                  TRACK 2: Wealth Planner
                </h3>
                <span className="badge verified">VERIFIED</span>
              </div>

              {result?.kind === 'expense' ? (
                <>
                  <p className="panel-label" style={{ marginBottom: '0.5rem' }}>
                    Real-time Ledger Entry
                  </p>
                  <div className="ledger">
                    <pre>
                      {typeof result.json === 'object'
                        ? JSON.stringify(result.json, null, 2)
                        : result.json || result.response}
                    </pre>
                  </div>
                  <div className="projection">
                    <div className="projection-icon">
                      <Icon name="show_chart" />
                    </div>
                    <div>
                      <span>Monthly Savings Projection</span>
                      <strong>
                        {typeof result.json === 'object' && result.json['Income saved']
                          ? `${Number(result.json['Income saved']) * 30} UGX`
                          : '450,000 UGX'}
                      </strong>
                    </div>
                  </div>
                  <p className="panel-label">Suggested Investment Options</p>
                  <div className="chips">
                    {INVESTMENTS.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-note">
                  Fuel, tips, and savings logs appear here as structured ledger JSON from Gemma.
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
            Active Hotspots
          </h4>
          <button className="linkish" type="button">
            View Full Map
          </button>
        </div>
        <div className="hotspots">
          <div className="hotspot-legend">
            <div>🟢 High Demand: Katwe</div>
            <div>🔴 Hazard: Clock Tower</div>
          </div>
        </div>
      </section>

      <section className="hero-banner">
        <img src={kampalaHero} alt="Kampala boda rider on the road" />
        <div className="overlay" />
        <div className="copy">
          <h3>Empowering Kampala&apos;s Boda community</h3>
          <p>Built with Gemma for the modern Ugandan boda guy.</p>
        </div>
      </section>

      <p className="disclaimer">
        Assistive prototype only. Not an official emergency dispatch, legal, or authoritative
        financial advisory system. Developed for Build with Gemma Uganda.
      </p>
      <div className="partners">
        <span>KCCA</span>
        <span>GEMMA</span>
        <span>BUILD-UG</span>
      </div>
    </>
  )
}
