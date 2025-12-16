import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null
let isRecording = false

export function createTray(mainWindow: BrowserWindow): void {
  // Create a simple tray icon (we'll use a template image for macOS)
  const iconPath = process.platform === 'darwin'
    ? join(__dirname, '../../resources/trayTemplate.png')
    : join(__dirname, '../../resources/tray.png')

  // Create a simple icon if the file doesn't exist
  let icon: nativeImage
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      icon = createDefaultIcon()
    }
  } catch {
    icon = createDefaultIcon()
  }

  tray = new Tray(icon)
  tray.setToolTip('ElevenLabs Transcription')

  updateTrayMenu(mainWindow)

  tray.on('click', () => {
    mainWindow.show()
  })
}

function createDefaultIcon(): nativeImage {
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
        // Inside circle - white/black depending on recording state
        buffer[idx] = isRecording ? 255 : 100     // R
        buffer[idx + 1] = isRecording ? 100 : 100 // G
        buffer[idx + 2] = isRecording ? 100 : 100 // B
        buffer[idx + 3] = 255                      // A
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

function updateTrayMenu(mainWindow: BrowserWindow): void {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isRecording ? 'Stop Recording' : 'Start Recording',
      click: () => {
        mainWindow.webContents.send('toggle-recording')
      }
    },
    { type: 'separator' },
    {
      label: 'Paste Last Transcription',
      accelerator: 'CommandOrControl+Shift+V',
      click: () => {
        mainWindow.webContents.send('paste-last-transcription')
      }
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        mainWindow.show()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray?.setContextMenu(contextMenu)
}

export function updateTrayRecordingState(mainWindow: BrowserWindow, recording: boolean): void {
  isRecording = recording
  if (tray) {
    tray.setImage(createDefaultIcon())
    updateTrayMenu(mainWindow)
  }
}
