import { globalShortcut, BrowserWindow, clipboard } from 'electron'
import { getSettings, getLastTranscription, setSettings } from './store'

let mainWindow: BrowserWindow | null = null
let currentPasteHotkey: string | null = null
let currentRecordHotkey: string | null = null
let currentRecordWithFormattingHotkey: string | null = null

export function registerHotkeys(window: BrowserWindow): void {
  mainWindow = window
  const settings = getSettings()

  // Register paste hotkey (Cmd+Shift+V by default)
  try {
    if (
      globalShortcut.register(settings.pasteHotkey, () => {
        pasteLastTranscription()
      })
    ) {
      currentPasteHotkey = settings.pasteHotkey
    }
  } catch (err) {
    console.error('Failed to register paste hotkey:', err)
  }

  // Register record toggle hotkey without formatting (Cmd+Shift+R by default)
  try {
    if (
      globalShortcut.register(settings.recordHotkey, () => {
        mainWindow?.webContents.send('toggle-recording', false)
      })
    ) {
      currentRecordHotkey = settings.recordHotkey
    }
  } catch (err) {
    console.error('Failed to register record hotkey:', err)
  }

  // Register record toggle hotkey with formatting (Cmd+Shift+F by default)
  try {
    if (
      globalShortcut.register(settings.recordWithFormattingHotkey, () => {
        mainWindow?.webContents.send('toggle-recording', true)
      })
    ) {
      currentRecordWithFormattingHotkey = settings.recordWithFormattingHotkey
    }
  } catch (err) {
    console.error('Failed to register record with formatting hotkey:', err)
  }
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll()
  currentPasteHotkey = null
  currentRecordHotkey = null
  currentRecordWithFormattingHotkey = null
}

// Update a specific hotkey
export function updateHotkey(
  type: 'paste' | 'record' | 'recordWithFormatting',
  newHotkey: string
): { success: boolean; error?: string } {
  // Validate the hotkey format
  if (!newHotkey || newHotkey.trim() === '') {
    return { success: false, error: 'Hotkey cannot be empty' }
  }

  // Unregister the old hotkey
  if (type === 'paste' && currentPasteHotkey) {
    globalShortcut.unregister(currentPasteHotkey)
  } else if (type === 'record' && currentRecordHotkey) {
    globalShortcut.unregister(currentRecordHotkey)
  } else if (type === 'recordWithFormatting' && currentRecordWithFormattingHotkey) {
    globalShortcut.unregister(currentRecordWithFormattingHotkey)
  }

  // Try to register the new hotkey
  try {
    let success = false
    if (type === 'paste') {
      success = globalShortcut.register(newHotkey, () => {
        pasteLastTranscription()
      })
      if (success) {
        currentPasteHotkey = newHotkey
        setSettings({ pasteHotkey: newHotkey })
      }
    } else if (type === 'record') {
      success = globalShortcut.register(newHotkey, () => {
        mainWindow?.webContents.send('toggle-recording', false)
      })
      if (success) {
        currentRecordHotkey = newHotkey
        setSettings({ recordHotkey: newHotkey })
      }
    } else if (type === 'recordWithFormatting') {
      success = globalShortcut.register(newHotkey, () => {
        mainWindow?.webContents.send('toggle-recording', true)
      })
      if (success) {
        currentRecordWithFormattingHotkey = newHotkey
        setSettings({ recordWithFormattingHotkey: newHotkey })
      }
    }

    if (!success) {
      // Re-register the old hotkey if the new one failed
      const settings = getSettings()
      if (type === 'paste' && settings.pasteHotkey) {
        globalShortcut.register(settings.pasteHotkey, () => pasteLastTranscription())
        currentPasteHotkey = settings.pasteHotkey
      } else if (type === 'record' && settings.recordHotkey) {
        globalShortcut.register(settings.recordHotkey, () =>
          mainWindow?.webContents.send('toggle-recording', false)
        )
        currentRecordHotkey = settings.recordHotkey
      } else if (type === 'recordWithFormatting' && settings.recordWithFormattingHotkey) {
        globalShortcut.register(settings.recordWithFormattingHotkey, () =>
          mainWindow?.webContents.send('toggle-recording', true)
        )
        currentRecordWithFormattingHotkey = settings.recordWithFormattingHotkey
      }
      return { success: false, error: 'Hotkey is already in use or invalid' }
    }

    return { success: true }
  } catch (err) {
    console.error('Failed to register hotkey:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to register hotkey',
    }
  }
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
