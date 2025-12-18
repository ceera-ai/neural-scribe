import Store from 'electron-store'

export interface TranscriptionRecord {
  id: string
  text: string
  timestamp: number
  wordCount: number
  duration: number // Recording duration in seconds
}

export interface WordReplacement {
  id: string
  from: string
  to: string
  caseSensitive: boolean
  wholeWord: boolean
  enabled: boolean
}

export interface VoiceCommandTrigger {
  id: string
  phrase: string
  command: 'send' | 'clear' | 'cancel'
  enabled: boolean
  isCustom: boolean // true if user-added, false if built-in
}

export interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  selectedTerminalId: string | null
  pasteHotkey: string
  recordHotkey: string
  replacementsEnabled: boolean
  voiceCommandsEnabled: boolean
}

interface StoreSchema {
  settings: AppSettings
  history: TranscriptionRecord[]
  replacements: WordReplacement[]
  voiceCommandTriggers: VoiceCommandTrigger[]
}

// Default voice command triggers
const defaultVoiceCommandTriggers: VoiceCommandTrigger[] = [
  // Send commands
  { id: 'send-1', phrase: 'send it', command: 'send', enabled: true, isCustom: false },
  { id: 'send-2', phrase: 'send this', command: 'send', enabled: true, isCustom: false },
  { id: 'send-3', phrase: 'paste it', command: 'send', enabled: true, isCustom: false },
  { id: 'send-4', phrase: 'paste this', command: 'send', enabled: true, isCustom: false },
  { id: 'send-5', phrase: 'submit', command: 'send', enabled: true, isCustom: false },
  { id: 'send-6', phrase: 'go ahead', command: 'send', enabled: false, isCustom: false },
  { id: 'send-7', phrase: 'execute', command: 'send', enabled: false, isCustom: false },
  // Clear commands
  { id: 'clear-1', phrase: 'clear it', command: 'clear', enabled: true, isCustom: false },
  { id: 'clear-2', phrase: 'clear this', command: 'clear', enabled: true, isCustom: false },
  { id: 'clear-3', phrase: 'start over', command: 'clear', enabled: true, isCustom: false },
  // Cancel commands
  { id: 'cancel-1', phrase: 'cancel', command: 'cancel', enabled: true, isCustom: false },
  { id: 'cancel-2', phrase: 'never mind', command: 'cancel', enabled: true, isCustom: false },
  { id: 'cancel-3', phrase: 'stop', command: 'cancel', enabled: false, isCustom: false },
]

const defaults: StoreSchema = {
  settings: {
    apiKey: '',
    selectedMicrophoneId: null,
    selectedTerminalId: null,
    pasteHotkey: 'CommandOrControl+Shift+V',
    recordHotkey: 'CommandOrControl+Shift+R',
    replacementsEnabled: true,
    voiceCommandsEnabled: true
  },
  history: [],
  replacements: [],
  voiceCommandTriggers: defaultVoiceCommandTriggers
}

export const store = new Store<StoreSchema>({
  defaults,
  encryptionKey: 'elevenlabs-transcription-secure-key'
})

// Settings helpers
export function getSettings(): AppSettings {
  return store.get('settings')
}

export function setSettings(settings: Partial<AppSettings>): void {
  const current = store.get('settings')
  store.set('settings', { ...current, ...settings })
}

export function getApiKey(): string {
  return store.get('settings.apiKey') || ''
}

export function setApiKey(apiKey: string): void {
  store.set('settings.apiKey', apiKey)
}

// History helpers
const MAX_HISTORY_ITEMS = 100

export function getHistory(): TranscriptionRecord[] {
  return store.get('history')
}

export function saveTranscription(record: TranscriptionRecord): void {
  const history = store.get('history')
  const updated = [record, ...history].slice(0, MAX_HISTORY_ITEMS)
  store.set('history', updated)
}

export function deleteTranscription(id: string): void {
  const history = store.get('history')
  store.set('history', history.filter(r => r.id !== id))
}

export function clearHistory(): void {
  store.set('history', [])
}

export function getLastTranscription(): TranscriptionRecord | null {
  const history = store.get('history')
  return history.length > 0 ? history[0] : null
}

// Replacement helpers
export function getReplacements(): WordReplacement[] {
  return store.get('replacements') || []
}

export function addReplacement(replacement: WordReplacement): void {
  const replacements = store.get('replacements') || []
  store.set('replacements', [...replacements, replacement])
}

export function updateReplacement(id: string, updates: Partial<WordReplacement>): void {
  const replacements = store.get('replacements') || []
  store.set('replacements', replacements.map(r =>
    r.id === id ? { ...r, ...updates } : r
  ))
}

export function deleteReplacement(id: string): void {
  const replacements = store.get('replacements') || []
  store.set('replacements', replacements.filter(r => r.id !== id))
}

export function applyReplacements(text: string): string {
  const replacements = store.get('replacements') || []
  let result = text

  for (const replacement of replacements) {
    if (!replacement.enabled) continue

    let pattern: RegExp
    const flags = replacement.caseSensitive ? 'g' : 'gi'

    if (replacement.wholeWord) {
      // Match whole words only using word boundaries
      pattern = new RegExp(`\\b${escapeRegex(replacement.from)}\\b`, flags)
    } else {
      pattern = new RegExp(escapeRegex(replacement.from), flags)
    }

    result = result.replace(pattern, replacement.to)
  }

  return result
}

// Helper to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Voice command trigger helpers
export function getVoiceCommandTriggers(): VoiceCommandTrigger[] {
  const triggers = store.get('voiceCommandTriggers')
  // If no triggers exist (first run or reset), return defaults
  if (!triggers || triggers.length === 0) {
    store.set('voiceCommandTriggers', defaultVoiceCommandTriggers)
    return defaultVoiceCommandTriggers
  }
  return triggers
}

export function updateVoiceCommandTrigger(id: string, updates: Partial<VoiceCommandTrigger>): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set('voiceCommandTriggers', triggers.map(t =>
    t.id === id ? { ...t, ...updates } : t
  ))
}

export function addVoiceCommandTrigger(trigger: VoiceCommandTrigger): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set('voiceCommandTriggers', [...triggers, trigger])
}

export function deleteVoiceCommandTrigger(id: string): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set('voiceCommandTriggers', triggers.filter(t => t.id !== id))
}

export function resetVoiceCommandTriggers(): void {
  store.set('voiceCommandTriggers', defaultVoiceCommandTriggers)
}

// Get enabled triggers grouped by command type
export function getEnabledVoiceCommands(): { send: string[], clear: string[], cancel: string[] } {
  const triggers = getVoiceCommandTriggers()
  return {
    send: triggers.filter(t => t.command === 'send' && t.enabled).map(t => t.phrase),
    clear: triggers.filter(t => t.command === 'clear' && t.enabled).map(t => t.phrase),
    cancel: triggers.filter(t => t.command === 'cancel' && t.enabled).map(t => t.phrase),
  }
}
