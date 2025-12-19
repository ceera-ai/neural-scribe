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

  // Set ready when page finishes loading
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayReady = true
    console.log('[Overlay] Page loaded, ready for updates')
  })

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

// Track last log time to avoid spam
let lastLogTime = 0
let overlayReady = false

/**
 * Update the overlay's audio level visualization
 * @param level - Audio level from 0 to 1
 */
export function updateAudioLevel(level: number): void {
  try {
    if (!overlayWindow || overlayWindow.isDestroyed() || !overlayWindow.isVisible() || !overlayReady || overlayWindow.webContents.isDestroyed()) {
      return
    }

    // Clamp level between 0 and 1
    const clampedLevel = Math.max(0, Math.min(1, level))
    // Round to 2 decimal places to avoid floating point issues in JS
    const magentaOpacity = Math.round(clampedLevel * 100) / 100
    // Cyan boost is more subtle - just a gentle glow increase
    const cyanBoost = Math.round(clampedLevel * 0.5 * 100) / 100

    // Breathing scale: 1.0 at silence, up to 1.08 at max volume
    const scaleY = (1 + clampedLevel * 0.08).toFixed(3)
    const scaleX = (1 + clampedLevel * 0.02).toFixed(3)
    // Glow spots opacity: 0.6 at silence, 1.0 at max
    const glowOpacity = (0.6 + clampedLevel * 0.4).toFixed(2)

    // Log occasionally for debugging
    const now = Date.now()
    if (now - lastLogTime > 1000) {
      console.log(`[Overlay] Audio level: ${magentaOpacity}`)
      lastLogTime = now
    }

    // Update all voice-controlled elements
    const script = `
      var m = document.querySelector(".magenta-wave");
      var c = document.querySelector(".cyan-boost");
      var cloud = document.querySelector(".cloud-overlay");
      var highlight = document.querySelector(".highlight-layer");
      var gradient = document.querySelector(".gradient-animation");
      var glow = document.querySelector(".glow-spots");
      if (m) m.style.opacity = "${magentaOpacity}";
      if (c) c.style.opacity = "${cyanBoost}";
      if (cloud) cloud.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (highlight) highlight.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (gradient) gradient.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (glow) glow.style.opacity = "${glowOpacity}";
    `
    overlayWindow.webContents.executeJavaScript(script).catch(() => {})
  } catch (err) {
    // Ignore errors silently
  }
}

export function setOverlayReady(ready: boolean): void {
  overlayReady = ready
  console.log('[Overlay] Ready:', ready)
}

/**
 * Update the overlay's spectrum visualization with frequency data
 * @param frequencyData - Array of 24 frequency values from 0 to 1
 */
export function updateFrequencyData(frequencyData: number[]): void {
  try {
    if (!overlayWindow || overlayWindow.isDestroyed() || !overlayWindow.isVisible() || !overlayReady || overlayWindow.webContents.isDestroyed()) {
      return
    }

    // Build the JavaScript to update all spectrum bars
    const barUpdates = frequencyData.slice(0, 24).map((value, index) => {
      // Clamp value between 0 and 1
      const clampedValue = Math.max(0, Math.min(1, value))
      // Map to bar height: min 4px, max 40px
      const height = Math.round(4 + clampedValue * 36)
      return `bars[${index}].style.height = "${height}px";`
    }).join('\n      ')

    // Calculate overall level from frequency data for orb effects
    const avgLevel = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length
    const clampedLevel = Math.max(0, Math.min(1, avgLevel))

    // Audio level drives the color interpolation (0 = cyan, 1 = magenta)
    const audioLevelCss = clampedLevel.toFixed(3)

    // Scale and glow calculations
    const orbScale = (1 + clampedLevel * 0.15).toFixed(3)
    const orbGlowOpacity = (0.3 + clampedLevel * 0.5).toFixed(2)
    const ringOpacity = (0.35 + clampedLevel * 0.25).toFixed(2)

    const script = `
      var orb = document.querySelector(".overlay-orb");
      var bars = document.querySelectorAll(".spectrum-bar");
      var orbGlow = document.querySelector(".orb-glow");
      var orbCore = document.querySelector(".orb-core");
      var rings = document.querySelectorAll(".orb-ring");

      // Set audio level CSS variable for color interpolation (cyan -> magenta)
      if (orb) {
        orb.style.setProperty("--audio-level", "${audioLevelCss}");
      }

      // Update spectrum bars
      if (bars.length >= 24) {
        ${barUpdates}
      }

      // Update orb glow
      if (orbGlow) {
        orbGlow.style.opacity = "${orbGlowOpacity}";
        orbGlow.style.transform = "scale(${orbScale})";
      }

      // Update orb core scale
      if (orbCore) {
        orbCore.style.transform = "scale(${orbScale})";
      }

      // Update ring opacity based on audio
      rings.forEach(function(ring) {
        ring.style.opacity = "${ringOpacity}";
      });
    `
    overlayWindow.webContents.executeJavaScript(script).catch(() => {})
  } catch (err) {
    // Ignore errors silently
  }
}
