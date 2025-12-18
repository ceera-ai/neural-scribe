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

export interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  selectedTerminalId: string | null
  pasteHotkey: string
  recordHotkey: string
}

interface StoreSchema {
  settings: AppSettings
  history: TranscriptionRecord[]
  replacements: WordReplacement[]
}

const defaults: StoreSchema = {
  settings: {
    apiKey: '',
    selectedMicrophoneId: null,
    selectedTerminalId: null,
    pasteHotkey: 'CommandOrControl+Shift+V',
    recordHotkey: 'CommandOrControl+Shift+R'
  },
  history: [],
  replacements: []
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
