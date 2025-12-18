import { ipcMain, clipboard, BrowserWindow } from 'electron'
import {
  getSettings,
  setSettings,
  getApiKey,
  setApiKey,
  getHistory,
  saveTranscription,
  deleteTranscription,
  clearHistory,
  getLastTranscription,
  getReplacements,
  addReplacement,
  updateReplacement,
  deleteReplacement,
  applyReplacements,
  getVoiceCommandTriggers,
  updateVoiceCommandTrigger,
  addVoiceCommandTrigger,
  deleteVoiceCommandTrigger,
  resetVoiceCommandTriggers,
  getEnabledVoiceCommands,
  getPromptFormattingSettings,
  setPromptFormattingEnabled,
  setPromptFormattingInstructions,
  setPromptFormattingModel,
  TranscriptionRecord,
  AppSettings,
  WordReplacement,
  VoiceCommandTrigger
} from './store'
import {
  formatPrompt,
  generateTitle,
  isClaudeCliAvailable,
  getClaudeCliVersion,
  DEFAULT_FORMATTING_INSTRUCTIONS
} from './prompt-formatter'
import { getRunningTerminals, getTerminalWindows, pasteToTerminal, pasteToTerminalWindow, pasteToLastActiveTerminal, SUPPORTED_TERMINALS } from './terminal'
import { updateHotkey } from './hotkeys'

let onRecordingStateChange: ((isRecording: boolean) => void) | null = null

async function fetchScribeToken(apiKey: string): Promise<string> {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get token: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.token
}

export function setupIpcHandlers(recordingStateCallback?: (isRecording: boolean) => void): void {
  onRecordingStateChange = recordingStateCallback || null

  // Token generation
  ipcMain.handle('get-scribe-token', async () => {
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error('API key not configured')
    }
    return fetchScribeToken(apiKey)
  })

  // Settings
  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  ipcMain.handle('set-settings', (_, settings: Partial<AppSettings>) => {
    setSettings(settings)
    return getSettings()
  })

  ipcMain.handle('get-api-key', () => {
    return getApiKey()
  })

  ipcMain.handle('set-api-key', (_, apiKey: string) => {
    setApiKey(apiKey)
    return true
  })

  ipcMain.handle('has-api-key', () => {
    return !!getApiKey()
  })

  // History
  ipcMain.handle('get-history', () => {
    return getHistory()
  })

  ipcMain.handle('save-transcription', (_, record: TranscriptionRecord) => {
    saveTranscription(record)
    return true
  })

  ipcMain.handle('delete-transcription', (_, id: string) => {
    deleteTranscription(id)
    return true
  })

  ipcMain.handle('clear-history', () => {
    clearHistory()
    return true
  })

  ipcMain.handle('get-last-transcription', () => {
    return getLastTranscription()
  })

  // Clipboard
  ipcMain.handle('copy-to-clipboard', (_, text: string) => {
    clipboard.writeText(text)
    return true
  })

  ipcMain.handle('read-clipboard', () => {
    return clipboard.readText()
  })

  // Recording state from renderer
  ipcMain.on('recording-state-changed', (_, isRecording: boolean) => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording)
    }
  })

  // Terminal operations
  ipcMain.handle('get-running-terminals', async () => {
    return getRunningTerminals()
  })

  ipcMain.handle('get-supported-terminals', () => {
    return SUPPORTED_TERMINALS
  })

  ipcMain.handle('paste-to-terminal', async (_, text: string, bundleId: string) => {
    return pasteToTerminal(text, bundleId)
  })

  // Terminal window operations
  ipcMain.handle('get-terminal-windows', async () => {
    return getTerminalWindows()
  })

  ipcMain.handle('paste-to-terminal-window', async (_, text: string, bundleId: string, windowName: string) => {
    return pasteToTerminalWindow(text, bundleId, windowName)
  })

  ipcMain.handle('paste-to-last-active-terminal', async (_, text: string) => {
    return pasteToLastActiveTerminal(text)
  })

  // Word replacement operations
  ipcMain.handle('get-replacements', () => {
    return getReplacements()
  })

  ipcMain.handle('add-replacement', (_, replacement: WordReplacement) => {
    addReplacement(replacement)
    return true
  })

  ipcMain.handle('update-replacement', (_, id: string, updates: Partial<WordReplacement>) => {
    updateReplacement(id, updates)
    return true
  })

  ipcMain.handle('delete-replacement', (_, id: string) => {
    deleteReplacement(id)
    return true
  })

  ipcMain.handle('apply-replacements', (_, text: string) => {
    return applyReplacements(text)
  })

  // Voice command trigger operations
  ipcMain.handle('get-voice-command-triggers', () => {
    return getVoiceCommandTriggers()
  })

  ipcMain.handle('update-voice-command-trigger', (_, id: string, updates: Partial<VoiceCommandTrigger>) => {
    updateVoiceCommandTrigger(id, updates)
    return true
  })

  ipcMain.handle('add-voice-command-trigger', (_, trigger: VoiceCommandTrigger) => {
    addVoiceCommandTrigger(trigger)
    return true
  })

  ipcMain.handle('delete-voice-command-trigger', (_, id: string) => {
    deleteVoiceCommandTrigger(id)
    return true
  })

  ipcMain.handle('reset-voice-command-triggers', () => {
    resetVoiceCommandTriggers()
    return true
  })

  ipcMain.handle('get-enabled-voice-commands', () => {
    return getEnabledVoiceCommands()
  })

  // Hotkey operations
  ipcMain.handle('update-hotkey', (_, type: 'paste' | 'record', newHotkey: string) => {
    return updateHotkey(type, newHotkey)
  })

  // Prompt formatting operations
  ipcMain.handle('format-prompt', async (_, text: string) => {
    const settings = getPromptFormattingSettings()
    if (!settings.enabled) {
      return { success: true, formatted: text, skipped: true }
    }
    const result = await formatPrompt(
      text,
      settings.instructions || undefined,
      settings.model
    )
    return result
  })

  ipcMain.handle('get-prompt-formatting-settings', () => {
    return getPromptFormattingSettings()
  })

  ipcMain.handle('set-prompt-formatting-enabled', (_, enabled: boolean) => {
    setPromptFormattingEnabled(enabled)
    return true
  })

  ipcMain.handle('set-prompt-formatting-instructions', (_, instructions: string) => {
    setPromptFormattingInstructions(instructions)
    return true
  })

  ipcMain.handle('set-prompt-formatting-model', (_, model: 'sonnet' | 'opus' | 'haiku') => {
    setPromptFormattingModel(model)
    return true
  })

  ipcMain.handle('get-default-formatting-instructions', () => {
    return DEFAULT_FORMATTING_INSTRUCTIONS
  })

  ipcMain.handle('check-claude-cli', async () => {
    const available = await isClaudeCliAvailable()
    const version = available ? await getClaudeCliVersion() : null
    return { available, version }
  })

  ipcMain.handle('generate-title', async (_, text: string) => {
    return generateTitle(text)
  })

  // Reformat text with optional custom instructions (for reformat dialog)
  ipcMain.handle('reformat-text', async (_, text: string, customInstructions?: string) => {
    const settings = getPromptFormattingSettings()
    // Use custom instructions if provided, otherwise use default settings
    const instructions = customInstructions || settings.instructions || undefined
    const result = await formatPrompt(text, instructions, settings.model)
    return result
  })
}
