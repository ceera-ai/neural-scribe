import { BrowserWindow, screen, Display, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let comparisonOverlayWindow: BrowserWindow | null = null
let resolveSelection: ((text: string) => void) | null = null

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
  const cursorPoint = screen.getCursorScreenPoint()
  const cursorDisplay = screen.getDisplayNearestPoint(cursorPoint)

  if (!isDisplayFullscreen(cursorDisplay)) {
    console.log('[ComparisonOverlay] Using cursor display')
    return cursorDisplay
  }

  console.log('[ComparisonOverlay] Cursor display is fullscreen, using primary display')
  return screen.getPrimaryDisplay()
}

/**
 * Create the comparison overlay window
 * Full-screen transparent overlay
 */
export function createComparisonOverlay(): void {
  const display = screen.getPrimaryDisplay()
  const { x, y, width, height } = display.bounds

  comparisonOverlayWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  // Don't set click-through - we need the cards to be clickable
  // The background will be click-through via CSS pointer-events: none

  // Show on all desktops/spaces (macOS)
  if (process.platform === 'darwin') {
    comparisonOverlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  // Wait for window to be ready before allowing it to be shown
  comparisonOverlayWindow.once('ready-to-show', () => {
    console.log('[ComparisonOverlay] Window ready to show')
  })

  // Log when page finishes loading
  comparisonOverlayWindow.webContents.on('did-finish-load', () => {
    console.log('[ComparisonOverlay] Page finished loading')
  })

  // Load overlay HTML
  if (is.dev) {
    comparisonOverlayWindow.loadFile(join(__dirname, '../../electron/comparison-overlay.html'))
  } else {
    comparisonOverlayWindow.loadFile(join(__dirname, '../comparison-overlay.html'))
  }

  // Handle close event
  comparisonOverlayWindow.on('closed', () => {
    comparisonOverlayWindow = null
    if (resolveSelection) {
      resolveSelection('') // Return empty if closed without selection
      resolveSelection = null
    }
  })

  console.log('[ComparisonOverlay] Window created')
}

/**
 * Position the overlay to fill the entire display (full-screen transparent)
 */
function positionOverlay(display: Display): void {
  if (!comparisonOverlayWindow || comparisonOverlayWindow.isDestroyed()) return

  const { x, y, width, height } = display.bounds

  comparisonOverlayWindow.setBounds({ x, y, width, height })
  console.log(
    `[ComparisonOverlay] Full-screen on display ${display.id}: ${width}x${height} at (${x}, ${y})`
  )
}

/**
 * Show the comparison overlay with original and formatted text
 * Returns a promise that resolves with the selected text
 */
export function showComparisonOverlay(
  originalText: string,
  formattedText: string
): Promise<string> {
  console.log('[ComparisonOverlay] showComparisonOverlay called')
  console.log('[ComparisonOverlay] Original length:', originalText.length)
  console.log('[ComparisonOverlay] Formatted length:', formattedText.length)

  return new Promise((resolve) => {
    try {
      if (comparisonOverlayWindow && !comparisonOverlayWindow.isDestroyed()) {
        console.log('[ComparisonOverlay] Window exists and is not destroyed')
        console.log('[ComparisonOverlay] Setting resolveSelection callback')
        resolveSelection = resolve

        // Get the best display (where cursor is)
        const targetDisplay = getBestDisplay()

        // Position overlay to fill the entire display BEFORE showing
        positionOverlay(targetDisplay)

        // Wait for the bounds to be set, then show and send data
        setTimeout(() => {
          if (!comparisonOverlayWindow || comparisonOverlayWindow.isDestroyed()) {
            console.warn('[ComparisonOverlay] Window destroyed during positioning')
            resolve('')
            return
          }

          // Show window
          comparisonOverlayWindow.show()

          // Wait for the module to load and setComparisonTexts to be available
          const waitForFunction = async (retries = 20, delay = 100) => {
            for (let i = 0; i < retries; i++) {
              try {
                const result = await comparisonOverlayWindow!.webContents.executeJavaScript(
                  'typeof window.setComparisonTexts === "function"'
                )
                if (result) {
                  console.log('[ComparisonOverlay] setComparisonTexts is ready')
                  return true
                }
                console.log(
                  `[ComparisonOverlay] Waiting for setComparisonTexts... attempt ${i + 1}/${retries}`
                )
                await new Promise((r) => setTimeout(r, delay))
              } catch (err) {
                console.error('[ComparisonOverlay] Error checking for function:', err)
              }
            }
            return false
          }

          // Wait for function to be ready, then call it
          waitForFunction()
            .then((ready) => {
              if (!ready) {
                console.error('[ComparisonOverlay] setComparisonTexts never became available')
                return
              }

              // Send the texts to the overlay
              console.log('[ComparisonOverlay] Executing JavaScript to set texts...')
              return comparisonOverlayWindow!.webContents.executeJavaScript(
                `
              console.log('[ComparisonOverlay executeJS] Calling setComparisonTexts...');
              window.setComparisonTexts(
                ${JSON.stringify(originalText)},
                ${JSON.stringify(formattedText)}
              );
              console.log('[ComparisonOverlay executeJS] setComparisonTexts called');
            `
              )
            })
            .then(() => {
              console.log('[ComparisonOverlay] JavaScript executed successfully')
              console.log('[ComparisonOverlay] Waiting for user selection...')
            })
            .catch((err) => {
              console.error('[ComparisonOverlay] Error setting texts:', err)
            })
        }, 50)
      } else {
        console.warn('[ComparisonOverlay] Window not available or destroyed')
        resolve('') // Return empty if window not available
      }
    } catch (err) {
      console.error('[ComparisonOverlay] Error showing overlay:', err)
      resolve('')
    }
  })
}

/**
 * Hide the comparison overlay with fade-out animation
 */
export function hideComparisonOverlay(): void {
  try {
    if (comparisonOverlayWindow && !comparisonOverlayWindow.isDestroyed()) {
      console.log('[ComparisonOverlay] Triggering fade-out animation...')

      // Trigger fade-out animation
      comparisonOverlayWindow.webContents
        .executeJavaScript('if (window.triggerFadeOut) { window.triggerFadeOut(); }')
        .catch((err) => {
          console.error('[ComparisonOverlay] Error triggering fade-out:', err)
        })

      // Wait for animation to complete (400ms) then hide
      setTimeout(() => {
        if (comparisonOverlayWindow && !comparisonOverlayWindow.isDestroyed()) {
          comparisonOverlayWindow.hide()
          console.log('[ComparisonOverlay] Hidden')
        }
      }, 400)
    }
  } catch (err) {
    console.log('[ComparisonOverlay] Error hiding overlay:', err)
  }
}

/**
 * Destroy the comparison overlay window
 */
export function destroyComparisonOverlay(): void {
  try {
    if (comparisonOverlayWindow && !comparisonOverlayWindow.isDestroyed()) {
      comparisonOverlayWindow.destroy()
      console.log('[ComparisonOverlay] Destroyed')
    }
  } catch (err) {
    console.log('[ComparisonOverlay] Error destroying overlay:', err)
  }
  comparisonOverlayWindow = null
  resolveSelection = null
}

/**
 * Handle text selection from the overlay
 */
export function setupComparisonIpcHandlers(): void {
  ipcMain.on('comparison-text-selected', (_, selectedText: string) => {
    console.log('[ComparisonOverlay] IPC received: comparison-text-selected')
    console.log('[ComparisonOverlay] Text selected, length:', selectedText.length)
    console.log('[ComparisonOverlay] Text preview:', selectedText.slice(0, 100) + '...')
    console.log('[ComparisonOverlay] Has resolveSelection callback?', !!resolveSelection)

    hideComparisonOverlay()

    if (resolveSelection) {
      console.log('[ComparisonOverlay] Resolving promise with selected text')
      resolveSelection(selectedText)
      resolveSelection = null
    } else {
      console.warn('[ComparisonOverlay] No resolveSelection callback found!')
    }
  })
}
