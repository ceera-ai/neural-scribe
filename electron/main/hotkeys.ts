import { globalShortcut, BrowserWindow } from 'electron'
import { getSettings, setSettings, getPasteMode } from './store/settings'
import { getLastTranscription } from './store/history'
import { handlePaste } from './paste-handler'
import { hideMainWindowTemporarily, isMainWindowVisible } from './index'
import { captureActiveApplication, clearCapturedApplication } from './focus-manager'
import { showOverlay, hideOverlay } from './overlay'

let mainWindow: BrowserWindow | null = null
let currentPasteHotkey: string | null = null
let currentRecordHotkey: string | null = null
let currentRecordWithFormattingHotkey: string | null = null
let _escapeCallback: (() => void) | null = null // Stored for cleanup, not directly used
let isEscapeRegistered = false
let isCurrentlyRecording = false // Track recording state in main process

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
      globalShortcut.register(settings.recordHotkey, async () => {
        const t0 = performance.now()
        console.log(`[PERF] Hotkey pressed at ${t0.toFixed(2)}ms`)

        // Toggle state and show/hide overlay IMMEDIATELY
        isCurrentlyRecording = !isCurrentlyRecording

        if (isCurrentlyRecording) {
          // Starting recording - show overlay immediately (don't wait for capture)
          console.log('[Hotkeys] Starting recording, showing overlay immediately...')

          // Capture app in background (non-blocking)
          captureActiveApplication()
            .then(() => {
              const t1 = performance.now()
              console.log(
                `[PERF] captureActiveApplication completed in ${(t1 - t0).toFixed(2)}ms (async)`
              )
            })
            .catch((err) => {
              console.error('[Hotkeys] Failed to capture active app:', err)
            })

          showOverlay()
          const t1 = performance.now()
          console.log(`[PERF] showOverlay took ${(t1 - t0).toFixed(2)}ms`)
          console.log(`[PERF] TOTAL hotkey handler (start): ${(t1 - t0).toFixed(2)}ms`)
        } else {
          // Stopping recording - hide overlay immediately
          console.log('[Hotkeys] Stopping recording, hiding overlay...')
          hideOverlay()
          const t1 = performance.now()
          console.log(`[PERF] hideOverlay took ${(t1 - t0).toFixed(2)}ms`)
        }

        // Send IPC to renderer (async, doesn't block)
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
      globalShortcut.register(settings.recordWithFormattingHotkey, async () => {
        const t0 = performance.now()
        console.log(`[PERF] Hotkey with formatting pressed at ${t0.toFixed(2)}ms`)

        // Toggle state and show/hide overlay IMMEDIATELY
        isCurrentlyRecording = !isCurrentlyRecording

        if (isCurrentlyRecording) {
          // Starting recording - show overlay immediately (don't wait for capture)
          console.log(
            '[Hotkeys] Starting recording with formatting, showing overlay immediately...'
          )

          // Capture app in background (non-blocking)
          captureActiveApplication()
            .then(() => {
              const t1 = performance.now()
              console.log(
                `[PERF] captureActiveApplication completed in ${(t1 - t0).toFixed(2)}ms (async)`
              )
            })
            .catch((err) => {
              console.error('[Hotkeys] Failed to capture active app:', err)
            })

          showOverlay()
          const t1 = performance.now()
          console.log(`[PERF] showOverlay took ${(t1 - t0).toFixed(2)}ms`)
          console.log(
            `[PERF] TOTAL hotkey handler (start with formatting): ${(t1 - t0).toFixed(2)}ms`
          )
        } else {
          // Stopping recording - hide overlay immediately
          console.log('[Hotkeys] Stopping recording, hiding overlay...')
          hideOverlay()
          const t1 = performance.now()
          console.log(`[PERF] hideOverlay took ${(t1 - t0).toFixed(2)}ms`)
        }

        // Send IPC to renderer (async, doesn't block)
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
  console.log('[Hotkeys] pasteLastTranscription called')

  const lastRecord = getLastTranscription()
  if (!lastRecord) {
    console.log('[Hotkeys] No transcription to paste')
    return
  }

  console.log('[Hotkeys] Last transcription:', {
    id: lastRecord.id,
    textLength: lastRecord.text.length,
    textPreview: lastRecord.text.substring(0, 50) + '...',
  })

  const pasteMode = getPasteMode()
  console.log('[Hotkeys] Current paste mode:', pasteMode)

  // For auto-paste mode, capture the currently active application first
  // (since we're not in a recording session, we need to know where to paste)
  if (pasteMode === 'auto') {
    console.log('[Hotkeys] Auto-paste mode: capturing active application before paste')
    await captureActiveApplication()
  }

  // Use the new paste handler which respects paste mode settings
  console.log('[Hotkeys] Calling handlePaste...')
  const result = await handlePaste(
    { mode: pasteMode, text: lastRecord.text },
    hideMainWindowTemporarily,
    isMainWindowVisible
  )
  console.log('[Hotkeys] handlePaste result:', result)

  // Clear captured app after paste
  if (pasteMode === 'auto') {
    clearCapturedApplication()
  }

  // Notify renderer that paste was triggered
  mainWindow?.webContents.send('transcription-pasted', lastRecord.text)
  console.log('[Hotkeys] Notified renderer about paste')
}

/**
 * Register Escape key to trigger a callback (for overlay cancel)
 * This is registered dynamically when overlay shows
 */
export function registerEscapeKey(callback: () => void): void {
  if (isEscapeRegistered) {
    console.warn('[Hotkeys] Escape key already registered, unregistering first')
    unregisterEscapeKey()
  }

  try {
    if (globalShortcut.register('Escape', callback)) {
      _escapeCallback = callback
      isEscapeRegistered = true
      console.log('[Hotkeys] Escape key registered successfully')
    } else {
      console.error('[Hotkeys] Failed to register Escape key - already in use')
    }
  } catch (err) {
    console.error('[Hotkeys] Error registering Escape key:', err)
  }
}

/**
 * Unregister Escape key
 * This is called when overlay hides
 */
export function unregisterEscapeKey(): void {
  if (isEscapeRegistered) {
    try {
      globalShortcut.unregister('Escape')
      _escapeCallback = null
      isEscapeRegistered = false
      console.log('[Hotkeys] Escape key unregistered')
    } catch (err) {
      console.error('[Hotkeys] Error unregistering Escape key:', err)
    }
  }
}
