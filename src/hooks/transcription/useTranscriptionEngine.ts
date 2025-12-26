import { useEffect, useState } from 'react'
import { useElevenLabsProvider } from './useElevenLabsProvider'
import { useDeepgramProvider } from './useDeepgramProvider'
import type {
  TranscriptionProvider,
  TranscriptionProviderOptions,
  TranscriptionEngine,
} from './types'

export function useTranscriptionEngine(
  options: TranscriptionProviderOptions = {}
): TranscriptionProvider {
  const [engine, setEngine] = useState<TranscriptionEngine>('elevenlabs')
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

  // Load selected engine from settings
  useEffect(() => {
    if (isElectron) {
      window.electronAPI
        .getTranscriptionEngine()
        .then((selectedEngine) => {
          console.log(`[TranscriptionEngine] Loaded engine from settings: "${selectedEngine}"`)
          setEngine(selectedEngine)
        })
        .catch((err) => {
          console.error('[TranscriptionEngine] Failed to load engine setting:', err)
        })
    }
  }, [isElectron])

  // Call all provider hooks unconditionally (React requirement)
  // Only the selected provider will be returned and used
  const elevenLabsProvider = useElevenLabsProvider(options)
  const deepgramProvider = useDeepgramProvider(options)

  // Get the active provider
  const activeProvider = engine === 'deepgram' ? deepgramProvider : elevenLabsProvider

  // Set up toggle-recording listener ONCE for the active provider
  // This prevents conflicts from both providers trying to register listeners
  useEffect(() => {
    if (!isElectron) return

    const handleToggleRecording = async (withFormatting: boolean) => {
      const { isRecording, startRecording, stopRecording, transcriptSegments, editedTranscript } =
        activeProvider
      const { onSaveTranscript, onFormattingOverride } = options

      console.log(
        `[TranscriptionEngine] Toggle recording: ${withFormatting ? 'with' : 'without'} formatting`
      )

      if (isRecording) {
        // Stop current recording
        stopRecording()
      } else {
        // Override formatting setting for this recording session
        if (onFormattingOverride) {
          onFormattingOverride(withFormatting)
        }

        // Save existing transcript before starting new recording
        if (transcriptSegments.length > 0 || editedTranscript) {
          const currentText =
            editedTranscript ||
            transcriptSegments
              .map((s) => s.text)
              .join(' ')
              .trim()
          if (currentText && onSaveTranscript) {
            await onSaveTranscript(currentText)
          }
        }
        startRecording()
      }
    }

    window.electronAPI.onToggleRecording(handleToggleRecording)

    return () => {
      window.electronAPI.removeAllListeners('toggle-recording')
    }
  }, [
    isElectron,
    activeProvider,
    activeProvider.isRecording,
    activeProvider.transcriptSegments,
    activeProvider.editedTranscript,
    options,
  ])

  // Log which provider is active
  useEffect(() => {
    const providerName =
      engine === 'deepgram' ? 'Deepgram (Premium)' : 'ElevenLabs Scribe (Premium)'
    console.log(`[TranscriptionEngine] 🎯 Active provider: ${providerName}`)
  }, [engine])

  // Return the active provider
  return activeProvider
}
