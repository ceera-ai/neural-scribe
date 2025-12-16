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

export interface ElectronAPI {
  // Token management
  getScribeToken: () => Promise<string>

  // Settings
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getApiKey: () => Promise<string>
  setApiKey: (apiKey: string) => Promise<boolean>
  hasApiKey: () => Promise<boolean>

  // History
  getHistory: () => Promise<TranscriptionRecord[]>
  saveTranscription: (record: TranscriptionRecord) => Promise<boolean>
  deleteTranscription: (id: string) => Promise<boolean>
  clearHistory: () => Promise<boolean>
  getLastTranscription: () => Promise<TranscriptionRecord | null>

  // Clipboard
  copyToClipboard: (text: string) => Promise<boolean>
  readClipboard: () => Promise<string>

  // Events from main process
  onToggleRecording: (callback: () => void) => void
  onTranscriptionPasted: (callback: (text: string) => void) => void
  onPasteLastTranscription: (callback: () => void) => void

  // Remove listeners
  removeAllListeners: (channel: string) => void

  // Notify main process of recording state
  notifyRecordingState: (isRecording: boolean) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
