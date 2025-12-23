/* eslint-disable max-lines */
import { ipcMain, clipboard, BrowserWindow } from 'electron'
import {
  updateAudioLevel,
  updateFrequencyData,
  updateRecordingTime,
  updateVoiceCommands,
  updateTranscriptPreview,
  updateOverlayStatus,
} from './overlay'
import { showFormattingOverlay, hideFormattingOverlay } from './formattingOverlay'
import { showComparisonOverlay } from './comparisonOverlay'
import {
  validateIPC,
  AppSettingsSchema,
  ApiKeySchema,
  TranscriptionRecordSchema,
  PasteToTerminalSchema,
  PasteToTerminalWindowSchema,
  GamificationSessionSchema,
  GamificationAchievementSchema,
  WordReplacementSchema,
  WordReplacementUpdateSchema,
  VoiceCommandTriggerSchema,
  VoiceCommandTriggerUpdateSchema,
  FormatPromptSchema,
  ReformatTextSchema,
  GenerateTitleSchema,
  ErrorLogSchema,
} from './validation'
import { ACHIEVEMENTS } from './gamification/achievementDefinitions'
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
  GamificationData,
} from './store'
import { checkAndUnlockAllAchievements } from './store/gamification'
import { FormattingService, TerminalService } from './services'
import { SUPPORTED_TERMINALS } from './terminal'
import { updateHotkey } from './hotkeys'

let onRecordingStateChange: ((isRecording: boolean) => void) | null = null

async function fetchScribeToken(apiKey: string): Promise<string> {
  const response = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })

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

  ipcMain.handle('set-settings', (_, settings: unknown) => {
    const validated = validateIPC(AppSettingsSchema, settings, 'Invalid settings')
    setSettings(validated)
    return getSettings()
  })

  ipcMain.handle('get-api-key', () => {
    return getApiKey()
  })

  ipcMain.handle('set-api-key', (_, apiKey: unknown) => {
    const validated = validateIPC(ApiKeySchema, apiKey, 'Invalid API key')
    setApiKey(validated)
    return true
  })

  ipcMain.handle('has-api-key', () => {
    return !!getApiKey()
  })

  // History
  ipcMain.handle('get-history', () => {
    return getHistory()
  })

  ipcMain.handle('save-transcription', (_, record: unknown) => {
    const validated = validateIPC(TranscriptionRecordSchema, record, 'Invalid transcription record')
    saveTranscription(validated as TranscriptionRecord)
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('history-changed')
    })
    return true
  })

  ipcMain.handle('delete-transcription', (_, id: string) => {
    deleteTranscription(id)
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('history-changed')
    })
    return true
  })

  ipcMain.handle('clear-history', () => {
    clearHistory()
    // Notify all renderer windows that history changed
    BrowserWindow.getAllWindows().forEach((win) => {
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
  ipcMain.on(
    'voice-commands-update',
    (_, commands: { send: string[]; clear: string[]; cancel: string[] }) => {
      updateVoiceCommands(commands)
    }
  )

  // Transcript preview from renderer (for overlay display)
  ipcMain.on('transcript-preview', (_, data: { text: string; wordCount: number }) => {
    updateTranscriptPreview(data.text, data.wordCount)
  })

  // Overlay status from renderer
  ipcMain.on('overlay-status', (_, status: { connected: boolean; formattingEnabled: boolean }) => {
    updateOverlayStatus(status)
  })

  // Terminal operations
  ipcMain.handle('get-running-terminals', async () => {
    return TerminalService.getInstance().getRunningTerminals()
  })

  ipcMain.handle('get-supported-terminals', () => {
    return SUPPORTED_TERMINALS
  })

  ipcMain.handle('paste-to-terminal', async (_, text: unknown, bundleId: unknown) => {
    const validated = validateIPC(
      PasteToTerminalSchema,
      { text, bundleId },
      'Invalid paste to terminal params'
    )
    return TerminalService.getInstance().pasteToTerminal(validated.text, validated.bundleId)
  })

  // Terminal window operations
  ipcMain.handle('get-terminal-windows', async () => {
    return TerminalService.getInstance().getTerminalWindows()
  })

  ipcMain.handle(
    'paste-to-terminal-window',
    async (_, text: unknown, bundleId: unknown, windowName: unknown) => {
      const validated = validateIPC(
        PasteToTerminalWindowSchema,
        { text, bundleId, windowName },
        'Invalid paste to terminal window params'
      )
      return TerminalService.getInstance().pasteToWindow(
        validated.text,
        validated.bundleId,
        validated.windowName
      )
    }
  )

  ipcMain.handle('paste-to-last-active-terminal', async (_, text: string) => {
    return TerminalService.getInstance().pasteToActiveTerminal(text)
  })

  // Word replacement operations
  ipcMain.handle('get-replacements', () => {
    return getReplacements()
  })

  ipcMain.handle('add-replacement', (_, replacement: unknown) => {
    const validated = validateIPC(WordReplacementSchema, replacement, 'Invalid word replacement')
    addReplacement(validated)
    return true
  })

  ipcMain.handle('update-replacement', (_, id: unknown, updates: unknown) => {
    if (typeof id !== 'string' || !id) {
      throw new Error('Invalid replacement ID')
    }
    const validated = validateIPC(
      WordReplacementUpdateSchema,
      updates,
      'Invalid word replacement updates'
    )
    updateReplacement(id, validated)
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

  ipcMain.handle('update-voice-command-trigger', (_, id: unknown, updates: unknown) => {
    if (typeof id !== 'string' || !id) {
      throw new Error('Invalid voice command trigger ID')
    }
    const validated = validateIPC(
      VoiceCommandTriggerUpdateSchema,
      updates,
      'Invalid voice command trigger updates'
    )
    updateVoiceCommandTrigger(id, validated)
    return true
  })

  ipcMain.handle('add-voice-command-trigger', (_, trigger: unknown) => {
    const validated = validateIPC(
      VoiceCommandTriggerSchema,
      trigger,
      'Invalid voice command trigger'
    )
    addVoiceCommandTrigger(validated)
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
  ipcMain.handle('format-prompt', async (_, text: unknown) => {
    const validated = validateIPC(FormatPromptSchema, { text }, 'Invalid format prompt params')
    showFormattingOverlay()
    try {
      const result = await FormattingService.getInstance().formatPrompt(validated.text)
      hideFormattingOverlay()
      const selectedText = await showComparisonOverlay(validated.text, result)
      return selectedText || result
    } catch (error) {
      hideFormattingOverlay()
      throw error
    }
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
    return FormattingService.getInstance().getDefaultInstructions()
  })

  ipcMain.handle('check-claude-cli', async () => {
    return FormattingService.getInstance().checkClaudeCliStatus()
  })

  ipcMain.handle('generate-title', async (_, text: unknown) => {
    const validated = validateIPC(GenerateTitleSchema, { text }, 'Invalid generate title params')
    return FormattingService.getInstance().generateTitle(validated.text)
  })

  // Reformat text with optional custom instructions (for reformat dialog)
  ipcMain.handle('reformat-text', async (_, text: unknown, customInstructions?: unknown) => {
    const validated = validateIPC(
      ReformatTextSchema,
      { text, customInstructions },
      'Invalid reformat text params'
    )
    return FormattingService.getInstance().reformatText(
      validated.text,
      validated.customInstructions
    )
  })

  // Gamification operations
  ipcMain.handle('get-gamification-data', () => {
    return getGamificationData()
  })

  ipcMain.handle('get-achievement-definitions', () => {
    // Return achievements from the backend (single source of truth)
    return ACHIEVEMENTS
  })

  ipcMain.handle('save-gamification-data', (_, data: Partial<GamificationData>) => {
    saveGamificationData(data)
    // Notify all windows that gamification data changed
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('gamification-data-changed')
    })
    return true
  })

  ipcMain.handle('record-gamification-session', (_, params: unknown) => {
    const validated = validateIPC(
      GamificationSessionSchema,
      params,
      'Invalid gamification session params'
    )

    const result = recordGamificationSession(validated.words, validated.durationMs)

    // Notify all windows that gamification data changed
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('gamification-data-changed')
    })

    return result
  })

  ipcMain.handle('unlock-gamification-achievement', (_, params: unknown) => {
    const validated = validateIPC(
      GamificationAchievementSchema,
      params,
      'Invalid gamification achievement params'
    )
    unlockGamificationAchievement(validated.achievementId, validated.xpReward)
    // Notify all windows that an achievement was unlocked
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('achievement-unlocked', validated.achievementId)
    })
    return true
  })

  ipcMain.handle('check-gamification-daily-login', () => {
    const result = checkDailyLoginBonus()
    if (result.bonusAwarded) {
      // Notify all windows that gamification data changed
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('gamification-data-changed')
      })
    }
    return result
  })

  ipcMain.handle('reset-gamification-progress', () => {
    resetGamificationProgress()
    // Notify all windows that gamification was reset
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('gamification-data-changed')
    })
    return true
  })

  ipcMain.handle('check-and-unlock-all-achievements', () => {
    const unlockedIds = checkAndUnlockAllAchievements()
    // Notify all windows that gamification data changed
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('gamification-data-changed')
      // Notify about each newly unlocked achievement
      unlockedIds.forEach((id) => {
        win.webContents.send('achievement-unlocked', id)
      })
    })
    return unlockedIds
  })

  // Test method for comparison overlay
  ipcMain.handle('test-show-comparison-overlay', async () => {
    const originalText =
      'This is a test of the comparison overlay. You can click on either version to select it.'
    const formattedText =
      '# Test Comparison\n\nThis is a **test** of the comparison overlay.\n\n- Click either version to select'
    return await showComparisonOverlay(originalText, formattedText)
  })

  // Error logging
  ipcMain.on('log-error', (_, error: unknown) => {
    const validated = validateIPC(ErrorLogSchema, error, 'Invalid error log data')
    console.error('[ErrorBoundary] Renderer error:', validated.message)
    if (validated.stack) {
      console.error('[ErrorBoundary] Stack:', validated.stack)
    }
    if (validated.componentStack) {
      console.error('[ErrorBoundary] Component stack:', validated.componentStack)
    }
  })
}
