import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpcHandlers } from './ipc-handlers'
import { createTray, updateTrayRecordingState } from './tray'
import { registerHotkeys, unregisterHotkeys } from './hotkeys'
import { createOverlayWindow, showOverlay, hideOverlay, destroyOverlay } from './overlay'
import { createFormattingOverlay, destroyFormattingOverlay } from './formattingOverlay'
import {
  createComparisonOverlay,
  destroyComparisonOverlay,
  setupComparisonIpcHandlers,
} from './comparisonOverlay'
import { hasCompletedFirstLaunch, setFirstLaunchCompleted } from './store/settings'

let mainWindow: BrowserWindow | null = null
let debugWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 900,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false, // ✅ Keep audio analysis running when window is hidden
    },
  })

  mainWindow.on('ready-to-show', () => {
    // Only show window on first launch (for onboarding)
    // Otherwise, app runs as menubar-only (hidden by default)
    if (!hasCompletedFirstLaunch()) {
      mainWindow?.show()
      setFirstLaunchCompleted()
    }

    // Open dev tools in development
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Actually quit when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createDebugWindow(): void {
  debugWindow = new BrowserWindow({
    width: 900,
    height: 700,
    x: 950, // Position to the right of main window
    y: 100,
    show: false,
    autoHideMenuBar: true,
    title: 'Debug Tools - Neural Scribe',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  debugWindow.on('ready-to-show', () => {
    debugWindow?.show()
  })

  // Load the debug HTML file
  debugWindow.loadFile(join(__dirname, '../renderer/electron/debug.html'))

  debugWindow.on('closed', () => {
    debugWindow = null
  })
}

app.whenReady().then(() => {
  // Set app name and user model id
  app.setName('Neural Scribe')
  electronApp.setAppUserModelId('com.neuralscribe.app')

  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = join(__dirname, '../../resources/icon.png')
    app.dock.setIcon(iconPath)
  }

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Setup IPC handlers with recording state callback
  setupIpcHandlers((isRecording: boolean) => {
    if (mainWindow) {
      updateTrayRecordingState(mainWindow, isRecording)
    }
    // Show/hide recording overlay
    if (isRecording) {
      showOverlay()
    } else {
      hideOverlay()
    }
  })

  // Create window
  createWindow()

  // Create recording overlay window (pass main window for fallback display detection)
  createOverlayWindow(mainWindow!)

  // Create formatting progress overlay window
  createFormattingOverlay()

  // Create comparison overlay window
  createComparisonOverlay()

  // Setup comparison overlay IPC handlers
  setupComparisonIpcHandlers()

  // Create system tray
  createTray(mainWindow!)

  // Register global hotkeys
  registerHotkeys(mainWindow!)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
    // In menubar mode, don't auto-show window on activate
    // User must use tray menu to show/hide window
  })
})

app.on('window-all-closed', () => {
  // Don't quit on window close in menubar mode
  // App continues running in background via system tray
  // Only quit on macOS if explicitly requested
  if (process.platform !== 'darwin') {
    // On non-macOS, still quit when all windows closed
    app.quit()
  }
})

app.on('will-quit', () => {
  unregisterHotkeys()
  destroyOverlay()
  destroyFormattingOverlay()
  destroyComparisonOverlay()
})

// ============================================================================
// Window Visibility Management (for menubar mode)
// ============================================================================

/**
 * Toggles the main window visibility (show/hide)
 * Used by system tray menu
 */
export function toggleMainWindow(): void {
  if (!mainWindow) return

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

/**
 * Checks if the main window is currently visible
 * Used by paste handler to determine if window needs hiding
 *
 * @returns {boolean} True if window is visible
 */
export function isMainWindowVisible(): boolean {
  return mainWindow?.isVisible() ?? false
}

/**
 * Hides the main window temporarily (for auto-paste operation)
 * This allows focus to return to the previously active application
 */
export async function hideMainWindowTemporarily(): Promise<void> {
  if (mainWindow?.isVisible()) {
    mainWindow.hide()
  }
}

export { updateTrayRecordingState }
