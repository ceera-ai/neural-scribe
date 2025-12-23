import { BrowserWindow, screen, Display } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let formattingOverlayWindow: BrowserWindow | null = null
let isFormatting = false

/**
 * Check if a display appears to be in fullscreen mode (macOS)
 */
function isDisplayFullscreen(display: Display): boolean {
  if (process.platform !== 'darwin') {
    return false
  }
  const { workAreaSize, bounds } = display
  return workAreaSize.height === bounds.height
}

/**
 * Get the best display for the overlay (where cursor is, if not fullscreen)
 */
function getBestDisplay(): Display {
  // Get display where cursor is
  const cursorPoint = screen.getCursorScreenPoint()
  const cursorDisplay = screen.getDisplayNearestPoint(cursorPoint)

  // Check if cursor display is in fullscreen mode
  if (!isDisplayFullscreen(cursorDisplay)) {
    console.log('[FormattingOverlay] Using cursor display')
    return cursorDisplay
  }

  console.log('[FormattingOverlay] Cursor display is fullscreen, using primary display')
  return screen.getPrimaryDisplay()
}

/**
 * Create the formatting progress overlay window
 * Displayed when AI formatting is in progress
 */
export function createFormattingOverlay(): void {
  const display = screen.getPrimaryDisplay()
  const { height } = display.bounds

  // Position in bottom left corner with padding
  const overlayWidth = 200
  const overlayHeight = 200
  const padding = 20
  const x = padding
  const y = height - overlayHeight - padding

  formattingOverlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x,
    y,
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
      nodeIntegration: false,
      sandbox: true, // ✅ Enable sandboxing for security
    },
  })

  // CRITICAL: DO NOT call setIgnoreMouseEvents
  // This allows the overlay to block user interaction

  // Show on all desktops/spaces (macOS)
  if (process.platform === 'darwin') {
    formattingOverlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  // Load overlay HTML
  if (is.dev) {
    formattingOverlayWindow.loadFile(join(__dirname, '../../electron/formatting-overlay.html'))
  } else {
    formattingOverlayWindow.loadFile(join(__dirname, '../formatting-overlay.html'))
  }

  console.log('[FormattingOverlay] Window created')
}

/**
 * Position the overlay in bottom left corner of the given display
 */
function positionOverlay(display: Display): void {
  if (!formattingOverlayWindow || formattingOverlayWindow.isDestroyed()) return

  const { x: displayX, y: displayY, height } = display.bounds

  const overlayWidth = 200
  const overlayHeight = 200
  const padding = 20
  const x = displayX + padding
  const y = displayY + height - overlayHeight - padding

  formattingOverlayWindow.setBounds({ x, y, width: overlayWidth, height: overlayHeight })
  console.log(
    `[FormattingOverlay] Positioned on display ${display.id}: ${overlayWidth}x${overlayHeight} at (${x}, ${y})`
  )
}

/**
 * Show the formatting overlay
 * Called when formatting starts
 */
export function showFormattingOverlay(): void {
  if (isFormatting) {
    console.log('[FormattingOverlay] Already showing, ignoring duplicate call')
    return
  }

  try {
    if (formattingOverlayWindow && !formattingOverlayWindow.isDestroyed()) {
      isFormatting = true

      // Get the best display (where cursor is, if not fullscreen)
      const targetDisplay = getBestDisplay()

      // Position overlay on the target display before showing
      positionOverlay(targetDisplay)

      // Reload HTML content to ensure fresh state
      const htmlPath = is.dev
        ? join(__dirname, '../../electron/formatting-overlay.html')
        : join(__dirname, '../formatting-overlay.html')

      formattingOverlayWindow
        .loadFile(htmlPath)
        .then(() => {
          if (formattingOverlayWindow && !formattingOverlayWindow.isDestroyed()) {
            // Show window after content is loaded
            formattingOverlayWindow.show()

            // Trigger fade-in animation
            formattingOverlayWindow.webContents
              .executeJavaScript(
                `
            if (window.showFormattingOverlay) window.showFormattingOverlay();
          `
              )
              .catch(() => {})

            console.log('[FormattingOverlay] Shown on display:', targetDisplay.id)
          }
        })
        .catch((err) => {
          console.log('[FormattingOverlay] Error loading overlay:', err)
          isFormatting = false
        })
    }
  } catch (err) {
    console.log('[FormattingOverlay] Error showing overlay:', err)
    isFormatting = false
    formattingOverlayWindow = null
  }
}

/**
 * Hide the formatting overlay
 * Called when formatting completes
 */
export function hideFormattingOverlay(): void {
  try {
    if (formattingOverlayWindow && !formattingOverlayWindow.isDestroyed()) {
      // Trigger fade-out animation
      formattingOverlayWindow.webContents
        .executeJavaScript(
          `
        if (window.hideFormattingOverlay) window.hideFormattingOverlay();
      `
        )
        .catch(() => {})

      // Hide window after animation completes (200ms fade-out)
      setTimeout(() => {
        if (formattingOverlayWindow && !formattingOverlayWindow.isDestroyed()) {
          formattingOverlayWindow.hide()
          isFormatting = false
          console.log('[FormattingOverlay] Hidden')
        }
      }, 200)
    }
  } catch (err) {
    console.log('[FormattingOverlay] Error hiding overlay:', err)
    isFormatting = false
    formattingOverlayWindow = null
  }
}

/**
 * Destroy the formatting overlay window
 * Called on app quit
 */
export function destroyFormattingOverlay(): void {
  try {
    if (formattingOverlayWindow && !formattingOverlayWindow.isDestroyed()) {
      formattingOverlayWindow.destroy()
      console.log('[FormattingOverlay] Destroyed')
    }
  } catch (err) {
    console.log('[FormattingOverlay] Error destroying overlay:', err)
  }
  formattingOverlayWindow = null
  isFormatting = false
}
