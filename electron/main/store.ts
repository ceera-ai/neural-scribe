import Store from 'electron-store'

export interface TranscriptionRecord {
  id: string
  text: string
  timestamp: number
  wordCount: number
}

export interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  pasteHotkey: string
  recordHotkey: string
}

interface StoreSchema {
  settings: AppSettings
  history: TranscriptionRecord[]
}

const defaults: StoreSchema = {
  settings: {
    apiKey: '',
    selectedMicrophoneId: null,
    pasteHotkey: 'CommandOrControl+Shift+V',
    recordHotkey: 'CommandOrControl+Shift+R'
  },
  history: []
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
