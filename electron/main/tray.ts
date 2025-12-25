import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron'
import { join } from 'path'
import { getPasteMode, setPasteMode } from './store/settings'
import { toggleMainWindow, isMainWindowVisible } from './index'

let tray: Tray | null = null
let isRecording = false
let mainWindowRef: BrowserWindow | null = null
let normalIcon: nativeImage | null = null
let recordingIcon: nativeImage | null = null

export function createTray(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow

  // Load normal icon (black sound wave, template for auto-invert)
  const normalIconPath =
    process.platform === 'darwin'
      ? join(__dirname, '../../resources/trayTemplate.png')
      : join(__dirname, '../../resources/tray.png')

  // Load recording icon (white sound wave on orange background)
  const recordingIconPath = join(__dirname, '../../resources/tray-recording.png')

  // Create icons
  try {
    normalIcon = nativeImage.createFromPath(normalIconPath)
    if (normalIcon.isEmpty()) {
      normalIcon = createDefaultIcon(false)
    } else if (process.platform === 'darwin') {
      normalIcon.setTemplateImage(true) // Enable template mode for auto-invert
    }
  } catch {
    normalIcon = createDefaultIcon(false)
  }

  try {
    recordingIcon = nativeImage.createFromPath(recordingIconPath)
    if (recordingIcon.isEmpty()) {
      recordingIcon = createDefaultIcon(true)
    }
    // Don't set as template - we want the orange color to show
  } catch {
    recordingIcon = createDefaultIcon(true)
  }

  // Create tray with normal icon
  tray = new Tray(normalIcon)
  tray.setToolTip('Neural Scribe')

  rebuildTrayMenu(mainWindow)

  // Toggle window visibility on tray click (menubar behavior)
  tray.on('click', () => {
    toggleMainWindow()
  })
}

function createDefaultIcon(recording: boolean): nativeImage {
  // Create a simple 16x16 icon
  const size = 16
  const buffer = Buffer.alloc(size * size * 4) // RGBA

  // Fill with a simple circle pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const cx = size / 2 - 0.5
      const cy = size / 2 - 0.5
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)

      if (dist < size / 2 - 1) {
        // Inside circle - purple when recording, gray when not
        if (recording) {
          buffer[idx] = 168 // R
          buffer[idx + 1] = 85 // G
          buffer[idx + 2] = 247 // B (purple #a855f7)
        } else {
          buffer[idx] = 100 // R
          buffer[idx + 1] = 100 // G
          buffer[idx + 2] = 100 // B
        }
        buffer[idx + 3] = 255 // A
      } else {
        // Outside - transparent
        buffer[idx] = 0
        buffer[idx + 1] = 0
        buffer[idx + 2] = 0
        buffer[idx + 3] = 0
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size })
}

function rebuildTrayMenu(mainWindow: BrowserWindow): void {
  const currentPasteMode = getPasteMode()
  const windowVisible = isMainWindowVisible()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: windowVisible ? 'Hide Window' : 'Show Window',
      click: () => {
        toggleMainWindow()
      },
    },
    { type: 'separator' },
    {
      label: isRecording ? 'Stop Recording (⌘⇧R)' : 'Toggle Recording (⌘⇧R)',
      click: () => {
        mainWindow.webContents.send('toggle-recording')
      },
    },
    { type: 'separator' },
    {
      label: 'Paste Mode',
      submenu: [
        {
          label: 'Auto-paste to Active Field',
          type: 'radio',
          checked: currentPasteMode === 'auto',
          click: () => {
            setPasteMode('auto')
            rebuildTrayMenu(mainWindow)
          },
        },
        {
          label: 'Clipboard Only',
          type: 'radio',
          checked: currentPasteMode === 'clipboard',
          click: () => {
            setPasteMode('clipboard')
            rebuildTrayMenu(mainWindow)
          },
        },
        {
          label: 'Last Active Terminal',
          type: 'radio',
          checked: currentPasteMode === 'terminal',
          click: () => {
            setPasteMode('terminal')
            rebuildTrayMenu(mainWindow)
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('open-settings')
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray?.setContextMenu(contextMenu)
}

/**
 * Updates the tray menu (can be called when settings change)
 * Exported so it can be called from other modules
 */
export function updateTrayMenu(): void {
  if (mainWindowRef) {
    rebuildTrayMenu(mainWindowRef)
  }
}

export function updateTrayRecordingState(mainWindow: BrowserWindow, recording: boolean): void {
  isRecording = recording
  if (tray) {
    // Swap between normal and recording icons
    if (recording && recordingIcon) {
      tray.setImage(recordingIcon)
    } else if (!recording && normalIcon) {
      tray.setImage(normalIcon)
    }
    rebuildTrayMenu(mainWindow)
  }
}
