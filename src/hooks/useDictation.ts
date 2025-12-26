import { useEffect, useState, useCallback } from 'react'
import { useTranscriptionEngine } from './transcription/useTranscriptionEngine'
import type { TranscriptionEngine } from './transcription/types'

/**
 * Centralized dictation hook that uses the selected transcription engine
 *
 * This hook provides a simple interface for voice dictation in dialogs and forms.
 * It automatically uses the transcription engine selected in settings (ElevenLabs or Deepgram).
 *
 * @example
 * ```tsx
 * const { isRecording, startDictation, stopDictation, partialText, error } = useDictation({
 *   onFinalTranscript: (text) => setFormValue(text)
 * })
 * ```
 */
export interface UseDictationOptions {
  /** Called when a final transcript is received */
  onFinalTranscript?: (text: string) => void
  /** Called when partial transcript updates (real-time) */
  onPartialTranscript?: (text: string) => void
  /** Called when recording state changes */
  onRecordingChange?: (isRecording: boolean) => void
}

export interface UseDictationReturn {
  /** Whether currently recording */
  isRecording: boolean
  /** Start dictation recording */
  startDictation: () => Promise<void>
  /** Stop dictation recording */
  stopDictation: () => void
  /** Current partial transcript text (updates in real-time) */
  partialText: string
  /** Error message if any */
  error: string | null
  /** Currently active transcription engine */
  engine: TranscriptionEngine
}

export function useDictation(options: UseDictationOptions = {}): UseDictationReturn {
  const { onFinalTranscript, onPartialTranscript, onRecordingChange } = options

  const [engine, setEngine] = useState<TranscriptionEngine>('elevenlabs')
  const [partialText, setPartialText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

  // Load selected engine from settings
  useEffect(() => {
    if (isElectron) {
      window.electronAPI
        .getTranscriptionEngine()
        .then((selectedEngine) => {
          setEngine(selectedEngine)
          console.log(`[Dictation] Using engine: ${selectedEngine}`)
        })
        .catch((err) => {
          console.error('[Dictation] Failed to load engine:', err)
        })
    }
  }, [isElectron])

  // Use the transcription engine with specialized dictation callbacks
  const transcriptionProvider = useTranscriptionEngine({
    voiceCommandsEnabled: false, // Disable voice commands for dictation
    onRecordingStopped: async (transcript) => {
      console.log('[Dictation] Recording stopped, final transcript:', transcript)
      if (onFinalTranscript && transcript.trim()) {
        onFinalTranscript(transcript.trim())
      }
      setPartialText('')
    },
  })

  const {
    isRecording,
    transcriptSegments,
    startRecording,
    stopRecording,
    error: providerError,
  } = transcriptionProvider

  // Update partial text from transcript segments
  useEffect(() => {
    const fullText = transcriptSegments
      .map((seg) => seg.text)
      .join(' ')
      .trim()
    setPartialText(fullText)
    if (onPartialTranscript) {
      onPartialTranscript(fullText)
    }
  }, [transcriptSegments, onPartialTranscript])

  // Update error from provider
  useEffect(() => {
    setError(providerError)
  }, [providerError])

  // Notify recording state changes
  useEffect(() => {
    if (onRecordingChange) {
      onRecordingChange(isRecording)
    }
  }, [isRecording, onRecordingChange])

  // Wrapper for startRecording to handle errors
  const startDictation = useCallback(async () => {
    try {
      setError(null)
      setPartialText('')
      await startRecording()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start dictation'
      console.error('[Dictation] Error starting:', err)
      setError(errorMessage)
    }
  }, [startRecording])

  return {
    isRecording,
    startDictation,
    stopDictation: stopRecording,
    partialText,
    error,
    engine,
  }
}
