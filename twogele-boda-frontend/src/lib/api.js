const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function parseError(res) {
  const data = await res.json().catch(() => ({}))
  const detail = data.detail || `Request failed (${res.status})`
  throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
}

export async function chatWithGemma(
  message,
  { source = 'text', riderId = 'anonymous', language = 'en', retries = 2 } = {},
) {
  let lastError
  const attempts = Math.max(1, retries + 1)

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, source, rider_id: riderId, language }),
      })

      if (!res.ok) {
        // Retry transient Gemini / Render failures
        if ((res.status === 502 || res.status === 503) && attempt + 1 < attempts) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
          continue
        }
        await parseError(res)
      }
      return res.json()
    } catch (err) {
      lastError = err
      if (attempt + 1 < attempts) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError || new Error('Request failed')
}

export async function fetchHistory({ limit = 30, category, riderId } = {}) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (category) params.set('category', category)
  if (riderId) params.set('rider_id', riderId)

  const res = await fetch(`${API_BASE}/history?${params}`)
  if (!res.ok) await parseError(res)
  return res.json()
}

export async function chatWithGemmaAudio({ message = '', audioBlob, filename = 'rider-voice.webm' }) {
  const form = new FormData()
  if (message.trim()) form.append('message', message.trim())
  form.append('audio', audioBlob, filename)

  const res = await fetch(`${API_BASE}/chat/multimodal`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) await parseError(res)
  return res.json()
}

export function classifyResponse(text = '', categoryHint) {
  if (categoryHint === 'safety' || categoryHint === 'expense') return categoryHint

  const lower = text.toLowerCase()
  const looksSafety =
    lower.includes('hazard type') ||
    lower.includes('hazard') ||
    lower.includes('urgency') ||
    lower.includes('responsible body') ||
    lower.includes('kcca') ||
    lower.includes('traffic police')
  const looksExpense =
    lower.includes('fuel expenses') ||
    lower.includes('income saved') ||
    lower.includes('daily expenses') ||
    /"fuel expenses"|"income saved"|"daily expenses"/i.test(text)

  if (looksSafety && !looksExpense) return 'safety'
  if (looksExpense && !looksSafety) return 'expense'
  if (looksSafety) return 'safety'
  if (looksExpense) return 'expense'
  return 'unknown'
}

export function extractJsonBlock(text = '') {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const match = candidate.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return match[0]
  }
}

export function extractField(text, label) {
  const re = new RegExp(
    `(?:^|\\n)\\s*[*•\\-]?\\s*\\*?\\*?${label}\\*?\\*?\\s*[:：]\\s*(.+)`,
    'i',
  )
  const match = text.match(re)
  return match ? match[1].trim().replace(/^\*+\s*/, '').replace(/\*+$/, '') : null
}

export function replyPreview(text = '') {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s*[*•\-]\s*\*?\*?Hazard Type\*?\*?.*$/gim, '')
    .replace(/^\s*[*•\-]\s*\*?\*?Location\*?\*?.*$/gim, '')
    .replace(/^\s*[*•\-]\s*\*?\*?Urgency\*?\*?.*$/gim, '')
    .replace(/^\s*[*•\-]\s*\*?\*?Responsible Body\*?\*?.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
