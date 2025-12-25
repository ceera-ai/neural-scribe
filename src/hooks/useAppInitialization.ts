import { useEffect, useState } from 'react'

interface AppInitializationState {
  hasApiKey: boolean | null
  initError: string | null
  formattingEnabled: boolean
  recordHotkey: string
  pasteHotkey: string
  setHasApiKey: (hasKey: boolean) => void
  setFormattingEnabled: (enabled: boolean) => void
  setRecordHotkey: (hotkey: string) => void
  setPasteHotkey: (hotkey: string) => void
}

/**
 * Custom hook to handle application initialization
 *
 * @remarks
 * This hook manages the initial setup of the application:
 * - Checks for API key configuration
 * - Loads user settings (formatting, hotkeys)
 * - Handles initialization errors
 *
 * The hook returns the initialization state and setter functions for updating settings.
 *
 * @returns Initialization state including API key status, error state, and settings
 */
export function useAppInitialization(): AppInitializationState {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [formattingEnabled, setFormattingEnabled] = useState(true)
  const [recordHotkey, setRecordHotkey] = useState('CommandOrControl+Shift+R')
  const [pasteHotkey, setPasteHotkey] = useState('CommandOrControl+Shift+V')

  // Check if API key is configured and load settings on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check at runtime inside useEffect to avoid race conditions
      const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

      if (!isElectron) {
        // If electronAPI isn't ready yet, wait a bit and retry
        const retryTimer = setTimeout(() => {
          const stillNotElectron = typeof window !== 'undefined' && window.electronAPI !== undefined
          if (!stillNotElectron) {
            setInitError(
              'This app requires Electron. The preload script may not have loaded correctly.'
            )
            setHasApiKey(false) // Set to false instead of leaving as null
          } else {
            // Retry initialization
            initializeApp()
          }
        }, 100)
        return () => clearTimeout(retryTimer)
      }

      try {
        // Load settings
        const settings = await window.electronAPI.getSettings()
        const engine = settings.transcriptionEngine || 'elevenlabs'

        // Only require API key if using ElevenLabs
        if (engine === 'elevenlabs') {
          const hasKey = await window.electronAPI.hasApiKey()
          setHasApiKey(hasKey)
        } else {
          // Using Web Speech API - no API key required
          setHasApiKey(true)
        }

        // Load formatting settings
        const formattingSettings = await window.electronAPI.getPromptFormattingSettings()
        setFormattingEnabled(formattingSettings.enabled)

        // Load shortcut settings
        if (settings.recordHotkey) setRecordHotkey(settings.recordHotkey)
        if (settings.pasteHotkey) setPasteHotkey(settings.pasteHotkey)

      } catch (err: any) {
        console.error('Failed to initialize app:', err)
        setInitError('Failed to initialize: ' + err.message)
        setHasApiKey(false)
      }
    }

    initializeApp()
  }, [])

  return {
    hasApiKey,
    initError,
    formattingEnabled,
    recordHotkey,
    pasteHotkey,
    setHasApiKey,
    setFormattingEnabled,
    setRecordHotkey,
    setPasteHotkey,
  }
}
