import { exec } from 'child_process'
import { promisify } from 'util'
import { clipboard } from 'electron'

const execAsync = promisify(exec)

export interface TerminalApp {
  name: string
  bundleId: string
  displayName: string
}

export interface TerminalWindow {
  appName: string
  bundleId: string
  windowName: string
  windowIndex: number
  displayName: string
}

// Supported terminal applications
export const SUPPORTED_TERMINALS: TerminalApp[] = [
  { name: 'Terminal', bundleId: 'com.apple.Terminal', displayName: 'Terminal' },
  { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
  { name: 'Code', bundleId: 'com.microsoft.VSCode', displayName: 'VS Code' },
  { name: 'Cursor', bundleId: 'com.todesktop.230313mzl4w4u92', displayName: 'Cursor' },
  { name: 'Warp', bundleId: 'dev.warp.Warp-Stable', displayName: 'Warp' },
  { name: 'Alacritty', bundleId: 'org.alacritty', displayName: 'Alacritty' },
  { name: 'Hyper', bundleId: 'co.zeit.hyper', displayName: 'Hyper' },
  { name: 'kitty', bundleId: 'net.kovidgoyal.kitty', displayName: 'Kitty' },
]

/**
 * Check if a specific app is running using AppleScript
 */
async function isAppRunning(appName: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `osascript -e 'tell application "System Events" to (name of processes) contains "${appName}"'`
    )
    const isRunning = stdout.trim() === 'true'
    console.log(`[Terminal] Checking if ${appName} is running: ${isRunning}`)
    return isRunning
  } catch (err) {
    console.error(`[Terminal] Error checking if ${appName} is running:`, err)
    return false
  }
}

/**
 * Get list of running terminal applications
 */
export async function getRunningTerminals(): Promise<TerminalApp[]> {
  const running: TerminalApp[] = []

  console.log('[Terminal] Checking for running terminals...')

  // Check each supported terminal individually
  for (const terminal of SUPPORTED_TERMINALS) {
    const isRunning = await isAppRunning(terminal.name)
    if (isRunning) {
      running.push(terminal)
    }
  }

  console.log(
    `[Terminal] Found ${running.length} running terminals:`,
    running.map((t) => t.name)
  )
  return running
}

/**
 * Get window names for an application using System Events (works for all apps)
 */
async function getWindowNamesViaSystemEvents(appName: string): Promise<string[]> {
  try {
    const script = `
tell application "System Events"
  tell process "${appName}"
    set windowNames to {}
    repeat with w in windows
      set end of windowNames to name of w
    end repeat
    return windowNames
  end tell
end tell
`
    const { stdout } = await execAsync(`osascript -e '${script}'`)
    // Parse AppleScript list output
    const trimmed = stdout.trim()
    if (!trimmed || trimmed === '') return []

    // AppleScript returns comma-separated list
    return trimmed.split(', ').filter((n) => n.length > 0 && n !== 'missing value')
  } catch {
    return []
  }
}

/**
 * Get windows for all running terminal applications
 */
export async function getTerminalWindows(): Promise<TerminalWindow[]> {
  const windows: TerminalWindow[] = []
  const runningTerminals = await getRunningTerminals()

  for (const terminal of runningTerminals) {
    try {
      // Use System Events to get window names (works for all apps including Electron)
      const windowNames = await getWindowNamesViaSystemEvents(terminal.name)

      if (windowNames.length === 0) {
        // App is running but no windows detected, skip it
        // (don't add dummy entries for apps with no windows)
        continue
      }

      windowNames.forEach((name, index) => {
        // Truncate long window names for display
        const shortName = name.length > 50 ? name.substring(0, 47) + '...' : name
        windows.push({
          appName: terminal.name,
          bundleId: terminal.bundleId,
          windowName: name,
          windowIndex: index + 1,
          displayName: `${terminal.displayName}: ${shortName}`,
        })
      })
    } catch (err) {
      console.error(`Failed to get windows for ${terminal.name}:`, err)
      // Skip apps where we can't enumerate windows
    }
  }

  return windows
}

/**
 * Paste text into a specific terminal window by name
 * Returns: { success: boolean, needsPermission: boolean, copied: boolean }
 */
export async function pasteToTerminalWindow(
  text: string,
  bundleId: string,
  windowName: string
): Promise<{ success: boolean; needsPermission: boolean; copied: boolean }> {
  // Try to acquire paste lock
  if (!acquirePasteLock(text)) {
    return { success: false, needsPermission: false, copied: false }
  }

  try {
    // Get the app name from bundle ID
    const terminal = SUPPORTED_TERMINALS.find((t) => t.bundleId === bundleId)
    const appName = terminal?.name || 'Terminal'

    console.log(`[Paste] Attempting to paste to ${appName} window: "${windowName}"`)

    // Escape window name for AppleScript - handle special chars
    // For shell single-quoted strings, we need to handle single quotes specially
    const escapedWindowName = windowName
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "'\"'\"'")

    // Step 1: Copy to clipboard using Electron's clipboard (handles all characters)
    clipboard.writeText(text)
    console.log('[Paste] Text copied to clipboard')

    // Step 2: Activate app and bring window to front
    const activateScript = `
tell application "${appName}"
  activate
end tell
delay 0.2
tell application "System Events"
  tell process "${appName}"
    set frontmost to true
    try
      set targetWindow to first window whose name is "${escapedWindowName}"
      perform action "AXRaise" of targetWindow
    on error
      try
        set targetWindow to first window whose name contains "${escapedWindowName}"
        perform action "AXRaise" of targetWindow
      end try
    end try
  end tell
end tell
delay 0.3
`
    try {
      await execAsync(`osascript -e '${activateScript}'`)
      console.log('[Paste] Window activated')
    } catch (activateErr) {
      console.log('[Paste] Window activation had issues, continuing anyway:', activateErr)
    }

    // Step 3: Send paste keystroke followed by Enter (with longer delay for large pastes)
    try {
      const pasteScript = `
tell application "System Events"
  keystroke "v" using command down
  delay 0.5
  keystroke return
end tell
`
      await execAsync(`osascript -e '${pasteScript}'`)
      console.log('[Paste] Paste keystroke sent successfully')
      return { success: true, needsPermission: false, copied: true }
    } catch (pasteError: any) {
      console.error('[Paste] Keystroke error:', pasteError.stderr || pasteError.message)
      if (
        pasteError.stderr?.includes('not allowed to send keystrokes') ||
        pasteError.stderr?.includes('1002') ||
        pasteError.stderr?.includes('not allowed assistive access')
      ) {
        return { success: false, needsPermission: true, copied: true }
      }
      // Even if keystroke failed, text is in clipboard
      return { success: false, needsPermission: true, copied: true }
    }
  } catch (error) {
    console.error('[Paste] Failed to paste to terminal window:', error)
    return { success: false, needsPermission: false, copied: false }
  } finally {
    releasePasteLock()
    console.log('[Paste] Lock released')
  }
}

/**
 * Paste text into a specific terminal application
 * Returns: { success: boolean, needsPermission: boolean, copied: boolean }
 */
export async function pasteToTerminal(
  text: string,
  bundleId: string
): Promise<{ success: boolean; needsPermission: boolean; copied: boolean }> {
  // Try to acquire paste lock
  if (!acquirePasteLock(text)) {
    return { success: false, needsPermission: false, copied: false }
  }

  try {
    // Escape special characters for AppleScript
    const escapedText = text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')

    // Copy text to clipboard first
    const copyScript = `set the clipboard to "${escapedText}"`
    await execAsync(`osascript -e '${copyScript}'`)

    // Small delay to ensure clipboard is set
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Try to activate the app and paste
    try {
      const activateScript = `
tell application id "${bundleId}"
  activate
end tell
delay 0.2
tell application "System Events"
  keystroke "v" using command down
end tell
`
      await execAsync(`osascript -e '${activateScript}'`)
      return { success: true, needsPermission: false, copied: true }
    } catch (pasteError: any) {
      // Check if it's a permission error
      if (
        pasteError.stderr?.includes('not allowed to send keystrokes') ||
        pasteError.stderr?.includes('1002')
      ) {
        // At least activate the window
        try {
          await execAsync(`osascript -e 'tell application id "${bundleId}" to activate'`)
        } catch {}
        return { success: false, needsPermission: true, copied: true }
      }
      throw pasteError
    }
  } catch (error) {
    console.error('Failed to paste to terminal:', error)
    return { success: false, needsPermission: false, copied: false }
  } finally {
    releasePasteLock()
    console.log('[Paste] Lock released')
  }
}

/**
 * Get the frontmost application
 */
export async function getFrontmostApp(): Promise<string | null> {
  try {
    const { stdout } = await execAsync(
      `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`
    )
    return stdout.trim()
  } catch (error) {
    console.error('Failed to get frontmost app:', error)
    return null
  }
}

// Global paste lock to prevent any concurrent paste operations
let isPasting = false
let lastPasteTime = 0
let lastPasteText = ''
const PASTE_DEBOUNCE_MS = 3000 // Minimum time between pastes

/**
 * Acquire paste lock - returns true if lock acquired, false if already locked
 */
function acquirePasteLock(text: string): boolean {
  const now = Date.now()

  // Check if already pasting
  if (isPasting) {
    console.log('[Paste] Lock already held, rejecting paste')
    return false
  }

  // Check time-based debounce
  if (now - lastPasteTime < PASTE_DEBOUNCE_MS) {
    console.log(`[Paste] Debounce active (${now - lastPasteTime}ms since last), rejecting paste`)
    return false
  }

  // Check if same text was just pasted (content-based dedup)
  if (text === lastPasteText && now - lastPasteTime < 10000) {
    console.log('[Paste] Same text pasted recently, rejecting duplicate')
    return false
  }

  isPasting = true
  lastPasteTime = now
  lastPasteText = text
  return true
}

/**
 * Release paste lock
 */
function releasePasteLock(): void {
  isPasting = false
}

/**
 * Paste text to the last active terminal (simpler workflow)
 * Returns: { success: boolean, needsPermission: boolean, copied: boolean, targetApp: string }
 */
export async function pasteToLastActiveTerminal(
  text: string
): Promise<{
  success: boolean
  needsPermission: boolean
  copied: boolean
  targetApp: string | null
}> {
  // Try to acquire paste lock
  if (!acquirePasteLock(text)) {
    return { success: false, needsPermission: false, copied: false, targetApp: null }
  }

  console.log(`[Paste] Lock acquired, starting paste operation`)

  try {
    // Step 1: Copy to clipboard using Electron's clipboard
    clipboard.writeText(text)
    console.log('[Paste] Text copied to clipboard')

    // Step 2: Find the last active terminal by checking running terminals
    const runningTerminals = await getRunningTerminals()

    if (runningTerminals.length === 0) {
      console.log('[Paste] No terminal apps running')
      return { success: false, needsPermission: false, copied: true, targetApp: null }
    }

    // Use the first running terminal (or we could track the last used one)
    const targetTerminal = runningTerminals[0]
    const appName = targetTerminal.name

    console.log(`[Paste] Pasting to ${appName}`)

    // Step 3: Activate the terminal and paste
    const activateScript = `
tell application "${appName}"
  activate
end tell
delay 0.3
`
    try {
      await execAsync(`osascript -e '${activateScript}'`)
      console.log('[Paste] Terminal activated')
    } catch (activateErr) {
      console.log('[Paste] Terminal activation had issues, continuing anyway:', activateErr)
    }

    // Step 4: Send paste keystroke followed by Enter (with longer delay for large pastes)
    try {
      const pasteScript = `
tell application "System Events"
  keystroke "v" using command down
  delay 0.5
  keystroke return
end tell
`
      await execAsync(`osascript -e '${pasteScript}'`)
      console.log('[Paste] Paste keystroke sent successfully')
      return { success: true, needsPermission: false, copied: true, targetApp: appName }
    } catch (pasteError: any) {
      console.error('[Paste] Keystroke error:', pasteError.stderr || pasteError.message)
      if (
        pasteError.stderr?.includes('not allowed to send keystrokes') ||
        pasteError.stderr?.includes('1002') ||
        pasteError.stderr?.includes('not allowed assistive access')
      ) {
        return { success: false, needsPermission: true, copied: true, targetApp: appName }
      }
      return { success: false, needsPermission: true, copied: true, targetApp: appName }
    }
  } catch (error) {
    console.error('[Paste] Failed to paste to terminal:', error)
    return { success: false, needsPermission: false, copied: false, targetApp: null }
  } finally {
    // Always release the lock
    releasePasteLock()
    console.log('[Paste] Lock released')
  }
}
