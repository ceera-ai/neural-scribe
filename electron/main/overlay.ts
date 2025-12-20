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
  const parts = hotkey.split('+').map((part) => {
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
      y: windowBounds.y + windowBounds.height / 2,
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
      nodeIntegration: false,
    },
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
      overlayWindow.webContents
        .executeJavaScript(
          `
        const hotkeyEl = document.getElementById('hotkey-display');
        if (hotkeyEl) hotkeyEl.textContent = '${hotkeyText}';
      `
        )
        .catch(() => {})

      overlayWindow.show()

      // Trigger animation and sound
      overlayWindow.webContents
        .executeJavaScript(
          `
        if (window.showOverlay) window.showOverlay();
      `
        )
        .catch(() => {})

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
      // Trigger hide animation and sound
      overlayWindow.webContents
        .executeJavaScript(
          `
        if (window.hideOverlay) window.hideOverlay();
      `
        )
        .catch(() => {})

      // Hide window after animation completes (350ms)
      setTimeout(() => {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.hide()
          console.log('[Overlay] Hidden')
        }
      }, 350)
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
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayWindow.isVisible() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
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

    // Generate waveform bar heights with some variation based on audio level
    // Creates a subtle wave pattern that reacts to voice
    const waveformHeights: number[] = []
    for (let i = 0; i < 16; i++) {
      // Create a wave pattern - center bars are taller
      const centerDistance = Math.abs(i - 7.5) / 7.5
      const baseHeight = 4 + (1 - centerDistance) * 8 // 4-12px base
      const audioBoost = clampedLevel * 8 * (1 - centerDistance * 0.5) // Add up to 8px based on audio
      // Add slight randomness for organic feel
      const variation = Math.sin(Date.now() / 100 + i * 0.5) * 2 * clampedLevel
      waveformHeights.push(Math.round(baseHeight + audioBoost + variation))
    }
    const waveformUpdates = waveformHeights
      .map((h, i) => `if (wfBars[${i}]) wfBars[${i}].style.height = "${h}px";`)
      .join('\n      ')

    // Update all voice-controlled elements
    const script = `
      var m = document.querySelector(".magenta-wave");
      var c = document.querySelector(".cyan-boost");
      var cloud = document.querySelector(".cloud-overlay");
      var highlight = document.querySelector(".highlight-layer");
      var gradient = document.querySelector(".gradient-animation");
      var glow = document.querySelector(".glow-spots");
      var wfBars = document.querySelectorAll(".waveform-bar");
      if (m) m.style.opacity = "${magentaOpacity}";
      if (c) c.style.opacity = "${cyanBoost}";
      if (cloud) cloud.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (highlight) highlight.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (gradient) gradient.style.transform = "scaleY(${scaleY}) scaleX(${scaleX})";
      if (glow) glow.style.opacity = "${glowOpacity}";
      ${waveformUpdates}
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
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Update the recording time display in the overlay
 * @param seconds - Recording time in seconds
 */
export function updateRecordingTime(seconds: number): void {
  try {
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayWindow.isVisible() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
      return
    }

    const timeStr = formatTime(seconds)
    const script = `
      var timeEl = document.getElementById('recording-time');
      if (timeEl) timeEl.textContent = '${timeStr}';
    `
    overlayWindow.webContents.executeJavaScript(script).catch(() => {})
  } catch (err) {
    // Ignore errors silently
  }
}

/**
 * Update the voice commands display in the overlay
 * @param commands - Object with send, clear, cancel command arrays
 */
export function updateVoiceCommands(commands: {
  send: string[]
  clear: string[]
  cancel: string[]
}): void {
  try {
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
      return
    }

    // Build HTML for voice commands
    const allCommands: { phrase: string; action: string }[] = []
    commands.send.forEach((phrase) => allCommands.push({ phrase, action: 'Send' }))
    commands.clear.forEach((phrase) => allCommands.push({ phrase, action: 'Clear' }))
    commands.cancel.forEach((phrase) => allCommands.push({ phrase, action: 'Cancel' }))

    const commandsHtml = allCommands
      .slice(0, 4)
      .map((cmd) => {
        // Escape HTML entities
        const escapedPhrase = cmd.phrase
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
        const escapedAction = cmd.action
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
        return `<div class="voice-cmd-item"><span class="voice-cmd-phrase">"${escapedPhrase}"</span><span class="voice-cmd-action">${escapedAction}</span></div>`
      })
      .join('')

    // Escape the entire HTML for JS string
    const escapedCommandsHtml = escapeForJS(commandsHtml)

    const script = `
      var container = document.getElementById('voice-commands-list');
      if (container) container.innerHTML = '${escapedCommandsHtml}';
    `
    overlayWindow.webContents.executeJavaScript(script).catch((err) => {
      console.error('[Overlay] Failed to update voice commands:', err)
    })
  } catch (err) {
    console.error('[Overlay] Error in updateVoiceCommands:', err)
  }
}

/**
 * Split text into lines of approximately maxChars characters, breaking at word boundaries
 */
function splitIntoLines(text: string, maxChars: number = 90): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Safely escape a string for use in JavaScript string literals
 * Handles all special characters that could break JS execution
 */
function escapeForJS(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Backslash must be first
    .replace(/'/g, "\\'") // Single quote
    .replace(/"/g, '\\"') // Double quote
    .replace(/`/g, '\\`') // Backtick
    .replace(/\n/g, '\\n') // Newline
    .replace(/\r/g, '\\r') // Carriage return
    .replace(/\t/g, '\\t') // Tab
    .replace(/\f/g, '\\f') // Form feed
    .replace(/\v/g, '\\v') // Vertical tab
}

/**
 * Update the live transcript preview in the overlay
 * @param text - The transcript text to display
 * @param wordCount - Total word count
 */
export function updateTranscriptPreview(text: string, wordCount: number): void {
  try {
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayWindow.isVisible() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
      return
    }

    // Get last ~50 characters for the small preview card
    const previewText = text.length > 50 ? '...' + text.slice(-50) : text
    // Escape all special characters for JS
    const escapedPreview = escapeForJS(previewText).replace(/\n/g, ' ')

    // Split text into lines for focus mode (show last 4 lines max)
    const allLines = splitIntoLines(text, 90)
    const displayLines = allLines.slice(-4) // Show last 4 lines

    // Build HTML for focus mode lines
    let focusHtml = ''
    if (displayLines.length === 0) {
      focusHtml = '<div class="focus-placeholder">Listening...</div>'
    } else {
      focusHtml = displayLines
        .map((line, index) => {
          const isCurrentLine = index === displayLines.length - 1
          // Properly escape for HTML content
          const escapedLine = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
          if (isCurrentLine) {
            return `<div class="focus-line current">${escapedLine}<span class="focus-cursor"></span></div>`
          }
          return `<div class="focus-line">${escapedLine}</div>`
        })
        .join('')
    }

    // Escape the entire HTML string for JS
    const escapedFocusHtml = escapeForJS(focusHtml)

    const script = `
      // Update small preview card
      var previewEl = document.getElementById('transcript-preview');
      var wordCountEl = document.getElementById('word-count');
      if (previewEl) previewEl.textContent = "${escapedPreview}";
      if (wordCountEl) wordCountEl.textContent = '${wordCount}';

      // Update focus mode typewriter display
      var focusLinesEl = document.getElementById('focus-lines');
      var focusWordCountEl = document.getElementById('focus-word-count');
      if (focusLinesEl) focusLinesEl.innerHTML = '${escapedFocusHtml}';
      if (focusWordCountEl) focusWordCountEl.textContent = '${wordCount}';
    `
    overlayWindow.webContents.executeJavaScript(script).catch((err) => {
      // Log errors for debugging (will appear in main process console)
      console.error('[Overlay] Failed to update transcript preview:', err)
    })
  } catch (err) {
    console.error('[Overlay] Error in updateTranscriptPreview:', err)
  }
}

/**
 * Update the overlay status indicators
 * @param status - Object with connected and formattingEnabled flags
 */
export function updateOverlayStatus(status: {
  connected: boolean
  formattingEnabled: boolean
}): void {
  try {
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
      return
    }

    const connectedClass = status.connected ? 'connected' : 'disconnected'
    const formattingText = status.formattingEnabled ? 'ON' : 'OFF'
    const formattingClass = status.formattingEnabled ? 'enabled' : 'disabled'
    const connectedLabel = status.connected ? 'Connected' : 'Disconnected'

    const script = `
      var connDot = document.getElementById('connection-dot');
      var connLabel = document.getElementById('connection-label');
      var fmtBadge = document.getElementById('formatting-badge');
      var fmtValue = document.getElementById('formatting-value');
      if (connDot) {
        connDot.className = 'connection-dot ${connectedClass}';
      }
      if (connLabel) {
        connLabel.textContent = '${connectedLabel}';
      }
      if (fmtBadge) {
        fmtBadge.className = 'formatting-badge ${formattingClass}';
      }
      if (fmtValue) {
        fmtValue.textContent = '${formattingText}';
      }
    `
    overlayWindow.webContents.executeJavaScript(script).catch((err) => {
      console.error('[Overlay] Failed to update status:', err)
    })
  } catch (err) {
    console.error('[Overlay] Error in updateOverlayStatus:', err)
  }
}

/**
 * Update the overlay's spectrum visualization with frequency data
 * @param frequencyData - Array of 24 frequency values from 0 to 1
 */
export function updateFrequencyData(frequencyData: number[]): void {
  try {
    if (
      !overlayWindow ||
      overlayWindow.isDestroyed() ||
      !overlayWindow.isVisible() ||
      !overlayReady ||
      overlayWindow.webContents.isDestroyed()
    ) {
      return
    }

    // Build the JavaScript to update all spectrum bars
    const barUpdates = frequencyData
      .slice(0, 24)
      .map((value, index) => {
        // Clamp value between 0 and 1
        const clampedValue = Math.max(0, Math.min(1, value))
        // Map to bar height: min 4px, max 40px
        const height = Math.round(4 + clampedValue * 36)
        return `bars[${index}].style.height = "${height}px";`
      })
      .join('\n      ')

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
