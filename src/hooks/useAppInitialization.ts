import { useEffect, useState } from 'react'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface AppInitializationState {
  hasApiKey: boolean | null
  initError: string | null
  formattingEnabled: boolean
  recordHotkey: string
  pasteHotkey: string
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
    if (!isElectron) {
      setInitError('This app requires Electron. The preload script may not have loaded correctly.')
      return
    }

    // Check API key
    window.electronAPI
      .hasApiKey()
      .then(setHasApiKey)
      .catch((err) => {
        console.error('Failed to check API key:', err)
        setInitError('Failed to initialize: ' + err.message)
      })

    // Load formatting settings
    window.electronAPI
      .getPromptFormattingSettings()
      .then((settings) => {
        setFormattingEnabled(settings.enabled)
      })
      .catch((err) => {
        console.error('Failed to load formatting settings:', err)
      })

    // Load shortcut settings
    window.electronAPI
      .getSettings()
      .then((settings) => {
        if (settings.recordHotkey) setRecordHotkey(settings.recordHotkey)
        if (settings.pasteHotkey) setPasteHotkey(settings.pasteHotkey)
      })
      .catch((err) => {
        console.error('Failed to load shortcut settings:', err)
      })
  }, [])

  return {
    hasApiKey,
    initError,
    formattingEnabled,
    recordHotkey,
    pasteHotkey,
    setFormattingEnabled,
    setRecordHotkey,
    setPasteHotkey,
  }
}
