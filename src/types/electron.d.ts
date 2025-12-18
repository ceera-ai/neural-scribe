export interface TranscriptionRecord {
  id: string
  text: string
  timestamp: number
  wordCount: number
  duration: number // Recording duration in seconds
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

export interface VoiceCommandTrigger {
  id: string
  phrase: string
  command: 'send' | 'clear' | 'cancel'
  enabled: boolean
  isCustom: boolean
}

export interface TerminalApp {
  name: string
  bundleId: string
  displayName: string
}

export interface TerminalWindow {
  appName: string
  bundleId: string
  windowName: string
  windowIndex: number
  displayName: string
}

export interface WordReplacement {
  id: string
  from: string
  to: string
  caseSensitive: boolean
  wholeWord: boolean
  enabled: boolean
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

  // Terminal operations
  getRunningTerminals: () => Promise<TerminalApp[]>
  getSupportedTerminals: () => Promise<TerminalApp[]>
  pasteToTerminal: (text: string, bundleId: string) => Promise<{ success: boolean; needsPermission: boolean; copied: boolean }>
  getTerminalWindows: () => Promise<TerminalWindow[]>
  pasteToTerminalWindow: (text: string, bundleId: string, windowName: string) => Promise<{ success: boolean; needsPermission: boolean; copied: boolean }>
  pasteToLastActiveTerminal: (text: string) => Promise<{ success: boolean; needsPermission: boolean; copied: boolean; targetApp: string | null }>

  // Word replacement operations
  getReplacements: () => Promise<WordReplacement[]>
  addReplacement: (replacement: WordReplacement) => Promise<boolean>
  updateReplacement: (id: string, updates: Partial<WordReplacement>) => Promise<boolean>
  deleteReplacement: (id: string) => Promise<boolean>
  applyReplacements: (text: string) => Promise<string>

  // Voice command trigger operations
  getVoiceCommandTriggers: () => Promise<VoiceCommandTrigger[]>
  updateVoiceCommandTrigger: (id: string, updates: Partial<VoiceCommandTrigger>) => Promise<boolean>
  addVoiceCommandTrigger: (trigger: VoiceCommandTrigger) => Promise<boolean>
  deleteVoiceCommandTrigger: (id: string) => Promise<boolean>
  resetVoiceCommandTriggers: () => Promise<boolean>
  getEnabledVoiceCommands: () => Promise<{ send: string[], clear: string[], cancel: string[] }>

  // Hotkey operations
  updateHotkey: (type: 'paste' | 'record', newHotkey: string) => Promise<{ success: boolean; error?: string }>

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
