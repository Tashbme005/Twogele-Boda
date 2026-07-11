import { useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading) return

    setLoading(true)
    setStatus('Talking to Twogele backend…')
    setResponse('')

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || `Request failed (${res.status})`)
      }

      setResponse(data.response || data.raw || JSON.stringify(data, null, 2))
      setStatus('ok')
    } catch (err) {
      setStatus(err.message || 'Something went wrong')
      setResponse('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <h1 className="brand">Twogele Boda</h1>
      <p className="tagline">
        Plain React + Vite shell for Kampala riders — report road hazards or log
        fuel, tips, and savings through one chat.
      </p>

      <form className="composer" onSubmit={handleSend}>
        <label htmlFor="rider-message" className="hint">
          Message (English, Luganda, or slang)
        </label>
        <textarea
          id="rider-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Huge pothole near Clock Tower on Entebbe Road"
        />
        <div className="actions">
          <button type="submit" disabled={loading || !message.trim()}>
            {loading ? 'Sending…' : 'Send'}
          </button>
          <span className="hint">API: {API_BASE}</span>
        </div>
      </form>

      {(status || response) && (
        <section className="panel" aria-live="polite">
          <h2>Response</h2>
          {status && status !== 'ok' && (
            <p className={`status ${status === 'Talking to Twogele backend…' ? '' : 'error'}`}>
              {status}
            </p>
          )}
          {status === 'ok' && <p className="status ok">Connected</p>}
          {response && <pre>{response}</pre>}
        </section>
      )}
    </main>
  )
}

export default App
