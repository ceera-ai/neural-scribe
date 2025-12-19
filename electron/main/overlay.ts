import { BrowserWindow, screen, Display } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { getSettings } from './store'

/**
 * Format a hotkey string for display (e.g., "CommandOrControl+Shift+R" → "⌘⇧R" on Mac)
 */
function formatHotkeyForDisplay(hotkey: string): string {
  const isMac = process.platform === 'darwin'

  // Split by + and format each part
  const parts = hotkey.split('+').map(part => {
    const p = part.trim().toLowerCase()

    if (p === 'commandorcontrol' || p === 'cmdorctrl') {
      return isMac ? '⌘' : 'Ctrl'
    }
    if (p === 'command' || p === 'cmd') {
      return isMac ? '⌘' : 'Ctrl'
    }
    if (p === 'control' || p === 'ctrl') {
      return isMac ? '⌃' : 'Ctrl'
    }
    if (p === 'shift') {
      return isMac ? '⇧' : 'Shift'
    }
    if (p === 'alt' || p === 'option') {
      return isMac ? '⌥' : 'Alt'
    }
    if (p === 'meta' || p === 'super') {
      return isMac ? '⌘' : 'Win'
    }
    // Capitalize single letter keys
    if (p.length === 1) {
      return p.toUpperCase()
    }
    // Special keys
    if (p === 'escape' || p === 'esc') return 'Esc'
    if (p === 'space') return 'Space'
    if (p === 'tab') return 'Tab'
    if (p === 'enter' || p === 'return') return '↵'
    if (p === 'backspace') return '⌫'
    if (p === 'delete') return '⌦'
    if (p === 'up') return '↑'
    if (p === 'down') return '↓'
    if (p === 'left') return '←'
    if (p === 'right') return '→'

    // Return as-is with first letter capitalized
    return part.charAt(0).toUpperCase() + part.slice(1)
  })

  // On Mac, join without separator for modifier symbols
  if (isMac) {
    return parts.join('')
  }
  // On other platforms, join with +
  return parts.join('+')
}

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
 * Full width, 30% height, anchored to absolute bottom
 */
function positionOverlay(display: Display): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return

  // Use bounds (full screen) not workAreaSize (excludes dock/menu)
  const { x: displayX, y: displayY, width, height } = display.bounds

  // Full width, 60% of screen height, at the absolute bottom
  const overlayWidth = width
  const overlayHeight = Math.round(height * 0.6)
  const x = displayX
  const y = displayY + height - overlayHeight

  overlayWindow.setBounds({ x, y, width: overlayWidth, height: overlayHeight })
  console.log(`[Overlay] Positioned: ${overlayWidth}x${overlayHeight} at (${x}, ${y})`)
}

export function createOverlayWindow(mainWindow?: BrowserWindow): void {
  mainWindowRef = mainWindow || null

  const display = screen.getPrimaryDisplay()
  const { width, height } = display.bounds

  // Initial size: full width, 60% height at absolute bottom
  const overlayHeight = Math.round(height * 0.6)

  overlayWindow = new BrowserWindow({
    width: width,
    height: overlayHeight,
    x: 0,
    y: height - overlayHeight,
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

      // Update the hotkey display from current settings
      const settings = getSettings()
      const hotkeyText = formatHotkeyForDisplay(settings.recordHotkey)
      overlayWindow.webContents.executeJavaScript(`
        const hotkeyEl = document.getElementById('hotkey-display');
        if (hotkeyEl) hotkeyEl.textContent = '${hotkeyText}';
      `).catch(() => {})

      overlayWindow.show()
      console.log('[Overlay] Shown on display:', targetDisplay.id, 'with hotkey:', hotkeyText)
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
