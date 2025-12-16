import { globalShortcut, BrowserWindow, clipboard } from 'electron'
import { getSettings, getLastTranscription } from './store'

let mainWindow: BrowserWindow | null = null

export function registerHotkeys(window: BrowserWindow): void {
  mainWindow = window
  const settings = getSettings()

  // Register paste hotkey (Cmd+Shift+V by default)
  try {
    globalShortcut.register(settings.pasteHotkey, () => {
      pasteLastTranscription()
    })
  } catch (err) {
    console.error('Failed to register paste hotkey:', err)
  }

  // Register record toggle hotkey (Cmd+Shift+R by default)
  try {
    globalShortcut.register(settings.recordHotkey, () => {
      mainWindow?.webContents.send('toggle-recording')
    })
  } catch (err) {
    console.error('Failed to register record hotkey:', err)
  }
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll()
}

async function pasteLastTranscription(): Promise<void> {
  const lastRecord = getLastTranscription()
  if (!lastRecord) {
    console.log('No transcription to paste')
    return
  }

  // Copy to clipboard
  clipboard.writeText(lastRecord.text)

  // Notify renderer that paste was triggered
  mainWindow?.webContents.send('transcription-pasted', lastRecord.text)

  // Note: For actual keyboard simulation to paste into other apps,
  // we would need @nut-tree/nut-js or similar. For now, we just
  // copy to clipboard and the user can Cmd+V manually.
  // This is a safer approach that doesn't require accessibility permissions.
}
