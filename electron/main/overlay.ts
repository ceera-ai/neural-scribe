import { BrowserWindow, screen, Display } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let overlayWindow: BrowserWindow | null = null
let mainWindowRef: BrowserWindow | null = null

/**
 * Check if a display appears to be in fullscreen mode (macOS)
 * When fullscreen, the workArea height equals the full bounds height (no menu bar)
 */
function isDisplayFullscreen(display: Display): boolean {
  if (process.platform !== 'darwin') {
    return false
  }
  // On macOS, when a display has a fullscreen app, the workArea equals bounds
  // (no space reserved for menu bar/dock)
  const { workAreaSize, bounds } = display
  return workAreaSize.height === bounds.height
}

/**
 * Get the best display for the overlay:
 * 1. Display where cursor is (if not fullscreen)
 * 2. Display where Neural Scribe window is (fallback)
 * 3. Primary display (last resort)
 */
function getBestDisplay(): Display {
  // Get display where cursor is
  const cursorPoint = screen.getCursorScreenPoint()
  const cursorDisplay = screen.getDisplayNearestPoint(cursorPoint)

  // Check if cursor display is in fullscreen mode
  if (!isDisplayFullscreen(cursorDisplay)) {
    console.log('[Overlay] Using cursor display')
    return cursorDisplay
  }

  console.log('[Overlay] Cursor display is fullscreen, checking main window display')

  // Fallback to main window's display
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    const windowBounds = mainWindowRef.getBounds()
    const windowCenter = {
      x: windowBounds.x + windowBounds.width / 2,
      y: windowBounds.y + windowBounds.height / 2
    }
    const mainWindowDisplay = screen.getDisplayNearestPoint(windowCenter)

    // Only use main window display if it's different from cursor display
    if (mainWindowDisplay.id !== cursorDisplay.id) {
      console.log('[Overlay] Using main window display')
      return mainWindowDisplay
    }
  }

  // Last resort: primary display
  console.log('[Overlay] Falling back to primary display')
  return screen.getPrimaryDisplay()
}

/**
 * Position the overlay on the given display
 */
function positionOverlay(display: Display): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return

  const { width, height } = display.workAreaSize
  const { x: displayX, y: displayY } = display.bounds

  // Center horizontally on the display, near the bottom
  const overlayWidth = 350
  const overlayHeight = 50
  const x = displayX + Math.round(width / 2 - overlayWidth / 2)
  const y = displayY + height - 80

  overlayWindow.setBounds({ x, y, width: overlayWidth, height: overlayHeight })
}

export function createOverlayWindow(mainWindow?: BrowserWindow): void {
  mainWindowRef = mainWindow || null

  const display = screen.getPrimaryDisplay()
  const { width, height } = display.workAreaSize

  overlayWindow = new BrowserWindow({
    width: 350,
    height: 50,
    x: Math.round(width / 2 - 175),
    y: height - 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Make click-through
  overlayWindow.setIgnoreMouseEvents(true)

  // Show on all desktops/spaces (macOS)
  if (process.platform === 'darwin') {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  // Load overlay HTML
  if (is.dev) {
    overlayWindow.loadFile(join(__dirname, '../../electron/overlay.html'))
  } else {
    overlayWindow.loadFile(join(__dirname, '../overlay.html'))
  }

  console.log('[Overlay] Window created')
}

export function showOverlay(): void {
  try {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      // Position overlay on the best display before showing
      const targetDisplay = getBestDisplay()
      positionOverlay(targetDisplay)

      overlayWindow.show()
      console.log('[Overlay] Shown on display:', targetDisplay.id)
    }
  } catch (err) {
    console.log('[Overlay] Error showing overlay:', err)
    overlayWindow = null
  }
}

export function hideOverlay(): void {
  try {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.hide()
      console.log('[Overlay] Hidden')
    }
  } catch (err) {
    console.log('[Overlay] Error hiding overlay:', err)
    overlayWindow = null
  }
}

export function destroyOverlay(): void {
  try {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.destroy()
    }
  } catch (err) {
    console.log('[Overlay] Error destroying overlay:', err)
  }
  overlayWindow = null
  mainWindowRef = null
}

export function setMainWindowRef(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow
}
