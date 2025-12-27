import { ipcMain, clipboard, BrowserWindow } from 'electron'
import {
  updateAudioLevel,
  updateFrequencyData,
  updateRecordingTime,
  updateVoiceCommands,
  updateTranscriptPreview,
  updateOverlayStatus,
  hideOverlay,
} from './overlay'
import { showFormattingOverlay, hideFormattingOverlay } from './formattingOverlay'
import { showComparisonOverlay } from './comparisonOverlay'
import { getAnalyticsData } from './services/analytics'
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
  PasteTextSchema,
  PasteModeSchema,
} from './validation'
import { ACHIEVEMENTS } from './gamification/achievementDefinitions'
import {
  getSettings,
  setSettings,
  getApiKey,
  setApiKey,
  getPromptFormattingSettings,
  setPromptFormattingEnabled,
  setPromptFormattingInstructions,
  setPromptFormattingModel,
  getPasteMode,
  setPasteMode,
  getDeepgramApiKey,
  setDeepgramApiKey,
  hasDeepgramApiKey,
} from './store/settings'
import {
  getHistory,
  saveTranscription,
  deleteTranscription,
  clearHistory,
  getLastTranscription,
  getHistoryStats,
  type TranscriptionRecord,
} from './store/history'
import {
  getReplacements,
  addReplacement,
  updateReplacement,
  deleteReplacement,
  applyReplacements,
} from './store/replacements'
import {
  getVoiceCommandTriggers,
  updateVoiceCommandTrigger,
  addVoiceCommandTrigger,
  deleteVoiceCommandTrigger,
  resetVoiceCommandTriggers,
  getEnabledVoiceCommands,
} from './store/voice-commands'
import {
  getGamificationData,
  saveGamificationData,
  recordGamificationSession,
  unlockGamificationAchievement,
  checkDailyLoginBonus,
  resetGamificationProgress,
  type GamificationData,
} from './store/gamification'
import {
  handlePaste,
  checkAccessibilityPermissions,
  requestAccessibilityPermissions,
} from './paste-handler'
import { checkAndUnlockAllAchievements, setGamificationData } from './store/gamification'
import { trackFeatureUsage, type FeatureType } from './store/gamification/featureTracking'
import { updateLevelFromXP } from './store/gamification/levels'
import { FormattingService, TerminalService } from './services'
import { SUPPORTED_TERMINALS } from './terminal'
import { updateHotkey } from './hotkeys'
import { captureActiveApplication } from './focus-manager'

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

  // Deepgram API key
  ipcMain.handle('get-deepgram-api-key', () => {
    return getDeepgramApiKey()
  })

  ipcMain.handle('set-deepgram-api-key', (_, apiKey: unknown) => {
    const validated = validateIPC(ApiKeySchema, apiKey, 'Invalid Deepgram API key')
    setDeepgramApiKey(validated)
    return true
  })

  ipcMain.handle('has-deepgram-api-key', () => {
    return hasDeepgramApiKey()
  })

  // Test Deepgram API connection
  ipcMain.handle('test-deepgram-connection', async () => {
    const apiKey = getDeepgramApiKey()
    if (!apiKey) {
      return { success: false, error: 'No Deepgram API key configured' }
    }

    try {
      // Make a simple request to Deepgram API to verify the key
      // We'll use the projects endpoint which is a lightweight check
      const response = await fetch('https://api.deepgram.com/v1/projects', {
        method: 'GET',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return { success: true }
      } else {
        return {
          success: false,
          error: `Invalid API key or authentication failed: ${response.status}`,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Deepgram API',
      }
    }
  })

  // Transcription engine selection
  ipcMain.handle('get-transcription-engine', () => {
    const settings = getSettings()
    return settings.transcriptionEngine || 'elevenlabs'
  })

  ipcMain.handle('set-transcription-engine', (_, engine: unknown) => {
    if (engine !== 'elevenlabs' && engine !== 'deepgram') {
      throw new Error('Invalid transcription engine. Must be "elevenlabs" or "deepgram"')
    }
    setSettings({ transcriptionEngine: engine })
    return true
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

  ipcMain.handle('get-history-stats', () => {
    return getHistoryStats()
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
  ipcMain.on('recording-state-changed', async (_, isRecording: boolean) => {
    const t0 = performance.now()
    console.log(`[IPC] recording-state-changed received: isRecording=${isRecording}`)
    console.log(
      `[PERF] recording-state-changed received at ${t0.toFixed(2)}ms, isRecording: ${isRecording}`
    )

    if (isRecording) {
      // Recording started - capture the currently active application
      // This must be done BEFORE showing the overlay
      console.log('[IPC] Recording started, capturing active application...')
      await captureActiveApplication()
      const t1 = performance.now()
      console.log(`[PERF] captureActiveApplication took ${(t1 - t0).toFixed(2)}ms`)
    } else {
      // Recording stopped - DON'T clear yet! The paste operation needs this info.
      // The captured app will be cleared AFTER paste completes in the paste handler.
      console.log('[IPC] Recording stopped (keeping captured app for paste operation)')
    }

    if (onRecordingStateChange) {
      const t2 = performance.now()
      onRecordingStateChange(isRecording)
      const t3 = performance.now()
      console.log(`[PERF] onRecordingStateChange callback took ${(t3 - t2).toFixed(2)}ms`)
      console.log(`[PERF] TOTAL recording-state-changed handler: ${(t3 - t0).toFixed(2)}ms`)
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

  // Cancel overlay (from Escape key press)
  ipcMain.on('cancel-overlay', () => {
    hideOverlay()
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
    const result = await TerminalService.getInstance().pasteToTerminal(
      validated.text,
      validated.bundleId
    )
    // Track terminal paste if successful
    if (result.success) {
      trackFeatureUsage('terminal-paste', { bundleId: validated.bundleId })
    }
    return result
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
      const result = await TerminalService.getInstance().pasteToWindow(
        validated.text,
        validated.bundleId,
        validated.windowName
      )
      // Track terminal paste if successful
      if (result.success) {
        trackFeatureUsage('terminal-paste', { bundleId: validated.bundleId })
      }
      return result
    }
  )

  ipcMain.handle('paste-to-last-active-terminal', async (_, text: string) => {
    const result = await TerminalService.getInstance().pasteToActiveTerminal(text)
    // Track terminal paste if successful (bundleId will be captured in the result)
    if (result.success && result.bundleId) {
      trackFeatureUsage('terminal-paste', { bundleId: result.bundleId })
    }
    return result
  })

  // Paste operations (auto-paste, clipboard, terminal)
  ipcMain.handle('paste-text', async (_, text: unknown, mode?: unknown) => {
    console.log('[IPC] paste-text called with mode:', mode)

    const currentMode = getPasteMode()
    console.log('[IPC] Current paste mode from settings:', currentMode)

    const validated = validateIPC(
      PasteTextSchema,
      { text, mode: mode ?? currentMode },
      'Invalid paste text params'
    )

    console.log('[IPC] Validated paste mode:', validated.mode)

    // Import window functions dynamically to avoid circular dependencies
    const { hideMainWindowTemporarily, isMainWindowVisible } = await import('./index')

    const result = await handlePaste(
      { mode: validated.mode ?? currentMode, text: validated.text },
      hideMainWindowTemporarily,
      isMainWindowVisible
    )

    console.log('[IPC] paste-text result:', result)
    return result
  })

  ipcMain.handle('check-accessibility-permissions', () => {
    return checkAccessibilityPermissions(false)
  })

  ipcMain.handle('request-accessibility-permissions', () => {
    return requestAccessibilityPermissions()
  })

  ipcMain.handle('get-paste-mode', () => {
    const mode = getPasteMode()
    console.log('[IPC] get-paste-mode returning:', mode)
    return mode
  })

  ipcMain.handle('set-paste-mode', (_, mode: unknown) => {
    console.log('[IPC] set-paste-mode called with:', mode)
    const validated = validateIPC(PasteModeSchema, mode, 'Invalid paste mode')
    setPasteMode(validated)
    console.log('[IPC] Paste mode updated to:', validated)
    return true
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
  ipcMain.handle(
    'update-hotkey',
    async (_, type: 'paste' | 'record' | 'recordWithFormatting', newHotkey: string) => {
      const result = updateHotkey(type, newHotkey)

      // Track hotkey change
      const newlyUnlocked = await trackFeatureUsage('hotkey-change')

      // Notify all windows that gamification data changed
      if (newlyUnlocked.length > 0) {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('gamification-data-changed')
          // Notify about each newly unlocked achievement
          newlyUnlocked.forEach((id) => {
            win.webContents.send('achievement-unlocked', id)
          })
        })
      }

      return result
    }
  )

  // Prompt formatting operations
  ipcMain.handle('format-prompt', async (_, text: unknown) => {
    const validated = validateIPC(FormatPromptSchema, { text }, 'Invalid format prompt params')
    console.log('[IPC] format-prompt called with text length:', validated.text.length)
    showFormattingOverlay()
    try {
      // Call the underlying formatPromptImpl directly to bypass the enabled check
      // The frontend decides whether to call this based on its override logic
      const { formatPrompt: formatPromptImpl } = await import('./prompt-formatter')
      const result = await formatPromptImpl(validated.text)
      console.log('[IPC] Formatting result:', { success: result.success, skipped: result.skipped })
      hideFormattingOverlay()
      const selectedText = await showComparisonOverlay(validated.text, result.formatted)
      console.log('[IPC] User selected text length:', selectedText?.length || 0)

      // Return a FormatResult object with the selected text
      return {
        success: true,
        formatted: selectedText || result.formatted,
        skipped: false,
      }
    } catch (error) {
      console.error('[IPC] format-prompt error:', error)
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

    // Get current transcription engine for tracking
    const settings = getSettings()
    const engine = settings.transcriptionEngine || 'elevenlabs'

    const result = recordGamificationSession(validated.words, validated.durationMs, engine)

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

  // Development: Reset specific achievement (for testing)
  ipcMain.handle('reset-achievement', (_, achievementId: unknown) => {
    if (typeof achievementId !== 'string') {
      throw new Error('Invalid achievement ID')
    }

    const data = getGamificationData()

    // Check if achievement is unlocked
    const wasUnlocked = !!data.achievements.unlocked[achievementId]

    if (wasUnlocked) {
      // Get XP that was awarded
      const xpAwarded = data.achievements.unlocked[achievementId].xpAwarded

      // Remove achievement
      delete data.achievements.unlocked[achievementId]

      // Subtract XP
      const newXP = Math.max(0, data.level.currentXP - xpAwarded)
      const updatedLevel = updateLevelFromXP(newXP)
      data.level = updatedLevel

      console.log(`[Dev] Reset achievement: ${achievementId} (-${xpAwarded} XP)`)
    }

    // Reset related counter based on achievement ID
    if (achievementId === 'microphone-selector' && data.stats.featureUsage) {
      data.stats.featureUsage.microphoneChanges = 0
      console.log('[Dev] Reset microphoneChanges counter')
    }

    // Save changes
    setGamificationData(data)

    // Notify UI
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('gamification-data-changed')
    })

    return { success: true, wasUnlocked }
  })

  // Analytics
  ipcMain.handle('get-analytics-data', (_, range: unknown, dateRange?: unknown) => {
    if (typeof range !== 'string') {
      throw new Error('Invalid time range')
    }

    const validRanges = ['today', 'week', 'month', 'quarter', 'year', 'all', 'custom']
    if (!validRanges.includes(range)) {
      throw new Error(`Invalid time range: ${range}`)
    }

    // Parse custom date range if provided
    let customDateRange: { start: Date; end: Date } | undefined
    if (dateRange && typeof dateRange === 'object' && 'start' in dateRange && 'end' in dateRange) {
      const dr = dateRange as { start: string | Date; end: string | Date }
      customDateRange = {
        start: typeof dr.start === 'string' ? new Date(dr.start) : dr.start,
        end: typeof dr.end === 'string' ? new Date(dr.end) : dr.end,
      }
    }

    const history = getHistory()
    const records = history.map((record) => ({
      id: record.id,
      timestamp: record.timestamp,
      wordCount: record.wordCount,
      duration: record.duration || 0,
    }))

    const aggregatedData = getAnalyticsData(
      records,
      range as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom',
      customDateRange
    )

    return {
      words: aggregatedData.map((d) => ({ date: d.date, value: d.words })),
      sessions: aggregatedData.map((d) => ({ date: d.date, value: d.sessions })),
      timeSpent: aggregatedData.map((d) => ({ date: d.date, value: d.timeSpent })),
    }
  })

  // Feature tracking
  ipcMain.handle('track-feature-usage', async (_, featureType: unknown, metadata?: unknown) => {
    if (typeof featureType !== 'string') {
      throw new Error('Invalid feature type')
    }

    const newlyUnlocked = await trackFeatureUsage(
      featureType as FeatureType,
      metadata as { bundleId?: string } | undefined
    )

    // Notify all windows that gamification data changed
    if (newlyUnlocked.length > 0) {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('gamification-data-changed')
        // Notify about each newly unlocked achievement
        newlyUnlocked.forEach((id) => {
          win.webContents.send('achievement-unlocked', id)
        })
      })
    }

    return newlyUnlocked
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
