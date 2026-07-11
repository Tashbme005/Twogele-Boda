const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function chatWithGemma(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = data.detail || `Request failed (${res.status})`
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }

  return data
}

export function classifyResponse(text = '') {
  const lower = text.toLowerCase()
  const looksSafety =
    lower.includes('hazard') ||
    lower.includes('urgency') ||
    lower.includes('responsible body') ||
    lower.includes('kcca') ||
    lower.includes('traffic police')
  const looksExpense =
    lower.includes('fuel expenses') ||
    lower.includes('income saved') ||
    lower.includes('daily expenses') ||
    /\{[\s\S]*\}/.test(text)

  if (looksSafety && !looksExpense) return 'safety'
  if (looksExpense && !looksSafety) return 'expense'
  if (looksSafety) return 'safety'
  if (looksExpense) return 'expense'
  return 'unknown'
}

export function extractJsonBlock(text = '') {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return match[0]
  }
}

export function extractField(text, label) {
  const re = new RegExp(`${label}\\s*[:：]\\s*(.+)`, 'i')
  const match = text.match(re)
  return match ? match[1].trim().replace(/^\*+\s*/, '') : null
}
