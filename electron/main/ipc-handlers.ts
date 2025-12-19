import { ipcMain, clipboard, BrowserWindow } from 'electron'
import { updateAudioLevel, updateFrequencyData, updateRecordingTime, updateVoiceCommands, updateTranscriptPreview, updateOverlayStatus } from './overlay'
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
  getGamificationData,
  saveGamificationData,
  recordGamificationSession,
  unlockGamificationAchievement,
  checkDailyLoginBonus,
  resetGamificationProgress,
  TranscriptionRecord,
  AppSettings,
  WordReplacement,
  VoiceCommandTrigger,
  GamificationData
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
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('history-changed')
    })
    return true
  })

  ipcMain.handle('delete-transcription', (_, id: string) => {
    deleteTranscription(id)
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('history-changed')
    })
    return true
  })

  ipcMain.handle('clear-history', () => {
    clearHistory()
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('history-changed')
    })
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

  // Audio level from renderer (for overlay visualization)
  ipcMain.on('audio-level', (_, level: number) => {
    updateAudioLevel(level)
  })

  // Frequency data from renderer (for spectrum visualization)
  ipcMain.on('frequency-data', (_, frequencyData: number[]) => {
    updateFrequencyData(frequencyData)
  })

  // Recording time from renderer (for overlay display)
  ipcMain.on('recording-time', (_, seconds: number) => {
    updateRecordingTime(seconds)
  })

  // Voice commands from renderer (for overlay display)
  ipcMain.on('voice-commands-update', (_, commands: { send: string[], clear: string[], cancel: string[] }) => {
    updateVoiceCommands(commands)
  })

  // Transcript preview from renderer (for overlay display)
  ipcMain.on('transcript-preview', (_, data: { text: string, wordCount: number }) => {
    updateTranscriptPreview(data.text, data.wordCount)
  })

  // Overlay status from renderer
  ipcMain.on('overlay-status', (_, status: { connected: boolean, formattingEnabled: boolean }) => {
    updateOverlayStatus(status)
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

  // Gamification operations
  ipcMain.handle('get-gamification-data', () => {
    return getGamificationData()
  })

  ipcMain.handle('save-gamification-data', (_, data: Partial<GamificationData>) => {
    saveGamificationData(data)
    // Notify all windows that gamification data changed
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('gamification-data-changed')
    })
    return true
  })

  ipcMain.handle('record-gamification-session', (_, params: { words: number; durationMs: number }) => {
    const result = recordGamificationSession(params.words, params.durationMs)
    // Notify all windows that gamification data changed
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('gamification-data-changed')
    })
    return result
  })

  ipcMain.handle('unlock-gamification-achievement', (_, params: { achievementId: string; xpReward: number }) => {
    unlockGamificationAchievement(params.achievementId, params.xpReward)
    // Notify all windows that an achievement was unlocked
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('achievement-unlocked', params.achievementId)
    })
    return true
  })

  ipcMain.handle('check-gamification-daily-login', () => {
    const result = checkDailyLoginBonus()
    if (result.bonusAwarded) {
      // Notify all windows that gamification data changed
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('gamification-data-changed')
      })
    }
    return result
  })

  ipcMain.handle('reset-gamification-progress', () => {
    resetGamificationProgress()
    // Notify all windows that gamification was reset
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('gamification-data-changed')
    })
    return true
  })
}
