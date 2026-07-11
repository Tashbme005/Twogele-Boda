import { useCallback, useEffect, useRef, useState } from 'react'

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

/**
 * Chrome speech-to-text for Twogele voice dispatch.
 * Gemma 4 26B via AI Studio does not accept raw audio, so we transcribe
 * in the browser and send text to /chat.
 */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const finalRef = useRef('')
  const stopResolverRef = useRef(null)

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      try {
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const start = useCallback(async () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      throw new Error(
        'Voice input needs Chrome or Edge speech recognition. Type your message instead.',
      )
    }

    // Mic permission probe (clearer errors than SpeechRecognition alone)
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    }

    finalRef.current = ''
    setLiveTranscript('')
    setSeconds(0)

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-UG'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = finalRef.current
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText = `${finalText} ${piece}`.trim()
        } else {
          interim += piece
        }
      }
      finalRef.current = finalText
      setLiveTranscript(`${finalText} ${interim}`.trim())
    }

    recognition.onerror = (event) => {
      const message =
        event.error === 'not-allowed'
          ? 'Microphone permission denied. Allow mic access and try again.'
          : event.error === 'no-speech'
            ? 'No speech detected. Try again closer to the mic.'
            : `Voice error: ${event.error}`
      stopResolverRef.current?.({ transcript: finalRef.current, error: message })
      stopResolverRef.current = null
      setRecording(false)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    recognition.onend = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecording(false)
      stopResolverRef.current?.({ transcript: finalRef.current.trim() })
      stopResolverRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
    timerRef.current = window.setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      return Promise.resolve({ transcript: '' })
    }

    return new Promise((resolve) => {
      stopResolverRef.current = resolve
      try {
        recognition.stop()
      } catch {
        resolve({ transcript: finalRef.current.trim() })
        stopResolverRef.current = null
        setRecording(false)
      }
    })
  }, [])

  return { recording, supported, seconds, liveTranscript, start, stop }
}
