/**
 * Settings Store Module
 *
 * Manages application settings including API keys, hotkeys, microphone/terminal
 * selection, and feature flags. All settings are persisted to disk using electron-store
 * with encryption.
 *
 * @module store/settings
 */

import Store from 'electron-store'

/**
 * Application settings schema
 *
 * @interface AppSettings
 */
export interface AppSettings {
  /** ElevenLabs API key for Scribe v2 transcription */
  apiKey: string
  /** Selected microphone device ID (null = default device) */
  selectedMicrophoneId: string | null
  /** Selected terminal application bundle ID (null = auto-detect) */
  selectedTerminalId: string | null
  /** Global hotkey for paste operation (default: CommandOrControl+Shift+V) */
  pasteHotkey: string
  /** Global hotkey for record operation without formatting (default: CommandOrControl+Shift+R) */
  recordHotkey: string
  /** Global hotkey for record operation with formatting (default: CommandOrControl+Shift+F) */
  recordWithFormattingHotkey: string
  /** Whether to press Enter after pasting to terminal (submit command) */
  submitAfterPaste: boolean
  /** Enable/disable word replacements feature */
  replacementsEnabled: boolean
  /** Enable/disable voice command detection */
  voiceCommandsEnabled: boolean
  /** Enable/disable AI prompt formatting with Claude */
  promptFormattingEnabled: boolean
  /** Custom formatting instructions (empty string = use default) */
  promptFormattingInstructions: string
  /** Claude model variant for formatting */
  promptFormattingModel: 'sonnet' | 'opus' | 'haiku'
  /** Maximum history entries to keep (0 = unlimited) */
  historyLimit: number
  /** Paste mode: auto-paste to active field, clipboard only, or terminal */
  pasteMode: 'auto' | 'clipboard' | 'terminal'
  /** Whether the user has completed first launch (to show window once) */
  hasCompletedFirstLaunch: boolean
  /** Whether to show notifications after paste operations */
  showPasteNotifications: boolean
}

/**
 * Prompt formatting settings subset
 *
 * @interface PromptFormattingSettings
 */
export interface PromptFormattingSettings {
  /** Whether prompt formatting is enabled */
  enabled: boolean
  /** Custom instructions for formatting (empty = use default) */
  instructions: string
  /** Claude model to use for formatting */
  model: 'sonnet' | 'opus' | 'haiku'
}

/**
 * Default application settings
 *
 * These values are used when initializing a fresh installation or
 * when settings keys are missing.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  selectedMicrophoneId: null,
  selectedTerminalId: null,
  pasteHotkey: 'CommandOrControl+Shift+V',
  recordHotkey: 'CommandOrControl+Shift+R',
  recordWithFormattingHotkey: 'CommandOrControl+Shift+F',
  submitAfterPaste: true,
  replacementsEnabled: true,
  voiceCommandsEnabled: true,
  promptFormattingEnabled: true,
  promptFormattingInstructions: '',
  promptFormattingModel: 'sonnet',
  historyLimit: 500,
  pasteMode: 'clipboard',
  hasCompletedFirstLaunch: false,
  showPasteNotifications: false,
}

/**
 * Internal store instance
 *
 * @private
 */
interface SettingsStore {
  settings: AppSettings
}

const store = new Store<SettingsStore>({
  defaults: {
    settings: DEFAULT_SETTINGS,
  },
  encryptionKey: 'elevenlabs-transcription-secure-key',
})

// ============================================================================
// Settings CRUD Operations
// ============================================================================

/**
 * Retrieves all application settings
 *
 * @returns {AppSettings} Complete settings object
 *
 * @example
 * ```typescript
 * const settings = getSettings()
 * console.log(settings.recordHotkey) // "CommandOrControl+Shift+R"
 * ```
 */
export function getSettings(): AppSettings {
  return store.get('settings')
}

/**
 * Updates application settings (partial update)
 *
 * Only the provided settings keys will be updated. Other keys remain unchanged.
 *
 * @param {Partial<AppSettings>} settings - Settings to update
 *
 * @example
 * ```typescript
 * // Update only the record hotkey
 * setSettings({ recordHotkey: 'CommandOrControl+Shift+T' })
 *
 * // Update multiple settings
 * setSettings({
 *   voiceCommandsEnabled: false,
 *   replacementsEnabled: true
 * })
 * ```
 */
export function setSettings(settings: Partial<AppSettings>): void {
  const current = store.get('settings')
  store.set('settings', { ...current, ...settings })
}

/**
 * Resets all settings to defaults
 *
 * @warning This operation cannot be undone
 *
 * @example
 * ```typescript
 * resetSettings()
 * ```
 */
export function resetSettings(): void {
  store.set('settings', DEFAULT_SETTINGS)
}

// ============================================================================
// API Key Management
// ============================================================================

/**
 * Retrieves the stored ElevenLabs API key
 *
 * @returns {string} API key (empty string if not set)
 *
 * @example
 * ```typescript
 * const apiKey = getApiKey()
 * if (!apiKey) {
 *   console.log('No API key configured')
 * }
 * ```
 */
export function getApiKey(): string {
  return store.get('settings.apiKey') || ''
}

/**
 * Stores the ElevenLabs API key securely
 *
 * The API key is encrypted at rest using electron-store's built-in encryption.
 *
 * @param {string} apiKey - ElevenLabs API key
 *
 * @example
 * ```typescript
 * setApiKey('sk_...')
 * ```
 */
export function setApiKey(apiKey: string): void {
  store.set('settings.apiKey', apiKey)
}

/**
 * Checks if an API key is configured
 *
 * @returns {boolean} True if API key exists and is non-empty
 *
 * @example
 * ```typescript
 * if (!hasApiKey()) {
 *   showApiKeySetupDialog()
 * }
 * ```
 */
export function hasApiKey(): boolean {
  const apiKey = getApiKey()
  return apiKey.length > 0
}

// ============================================================================
// Prompt Formatting Settings
// ============================================================================

/**
 * Retrieves prompt formatting settings
 *
 * @returns {PromptFormattingSettings} Formatting settings object
 *
 * @example
 * ```typescript
 * const formatting = getPromptFormattingSettings()
 * if (formatting.enabled) {
 *   const result = await formatPrompt(text, formatting.instructions)
 * }
 * ```
 */
export function getPromptFormattingSettings(): PromptFormattingSettings {
  const settings = getSettings()
  return {
    enabled: settings.promptFormattingEnabled ?? true,
    instructions: settings.promptFormattingInstructions ?? '',
    model: settings.promptFormattingModel ?? 'sonnet',
  }
}

/**
 * Enables or disables prompt formatting
 *
 * @param {boolean} enabled - Whether to enable formatting
 *
 * @example
 * ```typescript
 * setPromptFormattingEnabled(true)
 * ```
 */
export function setPromptFormattingEnabled(enabled: boolean): void {
  setSettings({ promptFormattingEnabled: enabled })
}

/**
 * Sets custom formatting instructions
 *
 * An empty string will cause the system to use default instructions.
 *
 * @param {string} instructions - Custom formatting instructions
 *
 * @example
 * ```typescript
 * setPromptFormattingInstructions(
 *   'Convert voice commands to Python scripts with type hints'
 * )
 *
 * // Reset to default instructions
 * setPromptFormattingInstructions('')
 * ```
 */
export function setPromptFormattingInstructions(instructions: string): void {
  setSettings({ promptFormattingInstructions: instructions })
}

/**
 * Sets the Claude model to use for prompt formatting
 *
 * Model options:
 * - `sonnet`: Balanced performance and cost (recommended)
 * - `opus`: Highest quality, slower, most expensive
 * - `haiku`: Fastest, cheapest, good for simple prompts
 *
 * @param {('sonnet' | 'opus' | 'haiku')} model - Claude model variant
 *
 * @example
 * ```typescript
 * // Use fastest model for quick iterations
 * setPromptFormattingModel('haiku')
 *
 * // Use highest quality for complex prompts
 * setPromptFormattingModel('opus')
 * ```
 */
export function setPromptFormattingModel(model: 'sonnet' | 'opus' | 'haiku'): void {
  setSettings({ promptFormattingModel: model })
}

// ============================================================================
// Hotkey Management
// ============================================================================

/**
 * Gets the current record hotkey
 *
 * @returns {string} Record hotkey (e.g., "CommandOrControl+Shift+R")
 */
export function getRecordHotkey(): string {
  return getSettings().recordHotkey
}

/**
 * Gets the current paste hotkey
 *
 * @returns {string} Paste hotkey (e.g., "CommandOrControl+Shift+V")
 */
export function getPasteHotkey(): string {
  return getSettings().pasteHotkey
}

/**
 * Gets the current record with formatting hotkey
 *
 * @returns {string} Record with formatting hotkey (e.g., "CommandOrControl+Shift+F")
 */
export function getRecordWithFormattingHotkey(): string {
  return getSettings().recordWithFormattingHotkey
}

// ============================================================================
// Paste Settings
// ============================================================================

/**
 * Gets whether to submit (press Enter) after pasting to terminal
 *
 * @returns {boolean} True if Enter should be pressed after paste
 */
export function getSubmitAfterPaste(): boolean {
  return getSettings().submitAfterPaste ?? true
}

/**
 * Sets whether to submit (press Enter) after pasting to terminal
 *
 * @param {boolean} submit - Whether to press Enter after paste
 *
 * @example
 * ```typescript
 * // Only paste, don't submit
 * setSubmitAfterPaste(false)
 *
 * // Paste and submit (press Enter)
 * setSubmitAfterPaste(true)
 * ```
 */
export function setSubmitAfterPaste(submit: boolean): void {
  setSettings({ submitAfterPaste: submit })
}

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Checks if word replacements are enabled
 *
 * @returns {boolean} True if replacements are enabled
 */
export function areReplacementsEnabled(): boolean {
  return getSettings().replacementsEnabled
}

/**
 * Checks if voice commands are enabled
 *
 * @returns {boolean} True if voice commands are enabled
 */
export function areVoiceCommandsEnabled(): boolean {
  return getSettings().voiceCommandsEnabled
}

/**
 * Checks if prompt formatting is enabled
 *
 * @returns {boolean} True if prompt formatting is enabled
 */
export function isPromptFormattingEnabled(): boolean {
  return getSettings().promptFormattingEnabled
}

// ============================================================================
// History Settings
// ============================================================================

/**
 * Gets the history limit setting
 *
 * @returns {number} Maximum number of history entries (0 = unlimited)
 *
 * @example
 * ```typescript
 * const limit = getHistoryLimit()
 * if (limit === 0) {
 *   console.log('No history limit')
 * } else {
 *   console.log(`History limited to ${limit} entries`)
 * }
 * ```
 */
export function getHistoryLimit(): number {
  return store.get('settings.historyLimit') ?? 500
}

/**
 * Sets the history limit
 *
 * @param {number} limit - Maximum entries to keep (0 = unlimited)
 *
 * @example
 * ```typescript
 * // Keep only last 100 entries
 * setHistoryLimit(100)
 *
 * // Unlimited history
 * setHistoryLimit(0)
 * ```
 */
export function setHistoryLimit(limit: number): void {
  setSettings({ historyLimit: limit })
}

// ============================================================================
// Paste Mode Settings
// ============================================================================

/**
 * Gets the current paste mode
 *
 * @returns {'auto' | 'clipboard' | 'terminal'} Current paste mode
 *
 * @example
 * ```typescript
 * const mode = getPasteMode()
 * if (mode === 'auto') {
 *   console.log('Auto-paste to active field enabled')
 * }
 * ```
 */
export function getPasteMode(): 'auto' | 'clipboard' | 'terminal' {
  return store.get('settings.pasteMode') ?? 'clipboard'
}

/**
 * Sets the paste mode
 *
 * @param {'auto' | 'clipboard' | 'terminal'} mode - Paste mode to use
 *
 * @example
 * ```typescript
 * // Enable auto-paste
 * setPasteMode('auto')
 *
 * // Use clipboard only
 * setPasteMode('clipboard')
 *
 * // Paste to terminal
 * setPasteMode('terminal')
 * ```
 */
export function setPasteMode(mode: 'auto' | 'clipboard' | 'terminal'): void {
  setSettings({ pasteMode: mode })
}

/**
 * Gets whether the user has completed first launch
 *
 * @returns {boolean} True if first launch completed
 */
export function hasCompletedFirstLaunch(): boolean {
  return store.get('settings.hasCompletedFirstLaunch') ?? false
}

/**
 * Marks first launch as completed
 *
 * @example
 * ```typescript
 * setFirstLaunchCompleted()
 * ```
 */
export function setFirstLaunchCompleted(): void {
  setSettings({ hasCompletedFirstLaunch: true })
}

/**
 * Gets whether to show paste notifications
 *
 * @returns {boolean} True if paste notifications should be shown
 */
export function getShowPasteNotifications(): boolean {
  return store.get('settings.showPasteNotifications') ?? false
}

/**
 * Sets whether to show paste notifications
 *
 * @param {boolean} show - Whether to show notifications
 *
 * @example
 * ```typescript
 * // Enable notifications
 * setShowPasteNotifications(true)
 *
 * // Disable notifications
 * setShowPasteNotifications(false)
 * ```
 */
export function setShowPasteNotifications(show: boolean): void {
  setSettings({ showPasteNotifications: show })
}
