import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let formattingOverlayWindow: BrowserWindow | null = null
let isFormatting = false

/**
 * Create the formatting progress overlay window
 * Displayed when AI formatting is in progress
 */
export function createFormattingOverlay(): void {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.bounds

  // Center the overlay on screen
  const overlayWidth = 600
  const overlayHeight = 500
  const x = Math.round((width - overlayWidth) / 2)
  const y = Math.round((height - overlayHeight) / 2)

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
 * Position the overlay centered on the primary display
 */
function positionOverlay(): void {
  if (!formattingOverlayWindow || formattingOverlayWindow.isDestroyed()) return

  const display = screen.getPrimaryDisplay()
  const { width, height } = display.bounds

  const overlayWidth = 600
  const overlayHeight = 500
  const x = Math.round((width - overlayWidth) / 2)
  const y = Math.round((height - overlayHeight) / 2)

  formattingOverlayWindow.setBounds({ x, y, width: overlayWidth, height: overlayHeight })
  console.log(`[FormattingOverlay] Positioned: ${overlayWidth}x${overlayHeight} at (${x}, ${y})`)
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

      // Position overlay before showing
      positionOverlay()

      // Show window
      formattingOverlayWindow.show()

      // Trigger fade-in animation
      formattingOverlayWindow.webContents
        .executeJavaScript(
          `
        if (window.showFormattingOverlay) window.showFormattingOverlay();
      `
        )
        .catch(() => {})

      console.log('[FormattingOverlay] Shown')
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
