import { useEffect, useState } from 'react'
import { useElevenLabsProvider } from './useElevenLabsProvider'
import { useDeepgramProvider } from './useDeepgramProvider'
import type {
  TranscriptionProvider,
  TranscriptionProviderOptions,
  TranscriptionEngine
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

  // Log which provider is active
  useEffect(() => {
    const providerName = engine === 'deepgram'
      ? 'Deepgram (Premium)'
      : 'ElevenLabs Scribe (Premium)'
    console.log(`[TranscriptionEngine] 🎯 Active provider: ${providerName}`)
  }, [engine])

  // Return the active provider based on selected engine
  if (engine === 'deepgram') {
    console.log('[TranscriptionEngine] Returning Deepgram provider')
    return deepgramProvider
  }

  // Default to ElevenLabs
  console.log('[TranscriptionEngine] Returning ElevenLabs provider')
  return elevenLabsProvider
}
