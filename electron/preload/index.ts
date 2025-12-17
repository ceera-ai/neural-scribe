import { contextBridge, ipcRenderer } from 'electron'

export interface TranscriptionRecord {
  id: string
  text: string
  timestamp: number
  wordCount: number
}

export interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  selectedTerminalId: string | null
  pasteHotkey: string
  recordHotkey: string
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

export type RecordingToggleCallback = () => void
export type TranscriptionPastedCallback = (text: string) => void

const electronAPI = {
  // Token management
  getScribeToken: (): Promise<string> => ipcRenderer.invoke('get-scribe-token'),

  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('set-settings', settings),
  getApiKey: (): Promise<string> => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey: string): Promise<boolean> => ipcRenderer.invoke('set-api-key', apiKey),
  hasApiKey: (): Promise<boolean> => ipcRenderer.invoke('has-api-key'),

  // History
  getHistory: (): Promise<TranscriptionRecord[]> => ipcRenderer.invoke('get-history'),
  saveTranscription: (record: TranscriptionRecord): Promise<boolean> =>
    ipcRenderer.invoke('save-transcription', record),
  deleteTranscription: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('delete-transcription', id),
  clearHistory: (): Promise<boolean> => ipcRenderer.invoke('clear-history'),
  getLastTranscription: (): Promise<TranscriptionRecord | null> =>
    ipcRenderer.invoke('get-last-transcription'),

  // Clipboard
  copyToClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('copy-to-clipboard', text),
  readClipboard: (): Promise<string> => ipcRenderer.invoke('read-clipboard'),

  // Terminal operations
  getRunningTerminals: (): Promise<TerminalApp[]> =>
    ipcRenderer.invoke('get-running-terminals'),
  getSupportedTerminals: (): Promise<TerminalApp[]> =>
    ipcRenderer.invoke('get-supported-terminals'),
  pasteToTerminal: (text: string, bundleId: string): Promise<{ success: boolean; needsPermission: boolean; copied: boolean }> =>
    ipcRenderer.invoke('paste-to-terminal', text, bundleId),
  getTerminalWindows: (): Promise<TerminalWindow[]> =>
    ipcRenderer.invoke('get-terminal-windows'),
  pasteToTerminalWindow: (text: string, bundleId: string, windowName: string): Promise<{ success: boolean; needsPermission: boolean; copied: boolean }> =>
    ipcRenderer.invoke('paste-to-terminal-window', text, bundleId, windowName),

  // Events from main process
  onToggleRecording: (callback: RecordingToggleCallback): void => {
    ipcRenderer.on('toggle-recording', () => callback())
  },
  onTranscriptionPasted: (callback: TranscriptionPastedCallback): void => {
    ipcRenderer.on('transcription-pasted', (_, text: string) => callback(text))
  },
  onPasteLastTranscription: (callback: () => void): void => {
    ipcRenderer.on('paste-last-transcription', () => callback())
  },

  // Remove listeners
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel)
  },

  // Notify main process of recording state
  notifyRecordingState: (isRecording: boolean): void => {
    ipcRenderer.send('recording-state-changed', isRecording)
  }
}

// Expose API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for TypeScript
export type ElectronAPI = typeof electronAPI
