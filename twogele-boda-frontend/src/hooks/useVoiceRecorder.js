import { useCallback, useEffect, useRef, useState } from 'react'

function pickMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  return types.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || ''
}

/**
 * Browser mic recorder for Twogele voice dispatch.
 * Click start → record → stop returns an audio Blob.
 */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const stopResolverRef = useRef(null)

  useEffect(() => {
    setSupported(Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error('Voice recording is not supported in this browser.')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    chunksRef.current = []

    const mimeType = pickMimeType()
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecording(false)
      stopResolverRef.current?.({ blob, mimeType: type })
      stopResolverRef.current = null
    }

    recorder.start()
    setSeconds(0)
    setRecording(true)
    timerRef.current = window.setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      stopResolverRef.current = resolve
      recorder.stop()
    })
  }, [])

  return { recording, supported, seconds, start, stop }
}
