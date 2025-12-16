import { ipcMain, clipboard, BrowserWindow } from 'electron'
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
  TranscriptionRecord,
  AppSettings
} from './store'

let onRecordingStateChange: ((isRecording: boolean) => void) | null = null

async function fetchScribeToken(apiKey: string): Promise<string> {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/scribe/get-single-use-token',
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
    return true
  })

  ipcMain.handle('delete-transcription', (_, id: string) => {
    deleteTranscription(id)
    return true
  })

  ipcMain.handle('clear-history', () => {
    clearHistory()
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
}
