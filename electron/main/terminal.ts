import { exec } from 'child_process'
import { promisify } from 'util'

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
    return stdout.trim() === 'true'
  } catch {
    return false
  }
}

/**
 * Get list of running terminal applications
 */
export async function getRunningTerminals(): Promise<TerminalApp[]> {
  const running: TerminalApp[] = []

  // Check each supported terminal individually
  for (const terminal of SUPPORTED_TERMINALS) {
    const isRunning = await isAppRunning(terminal.name)
    if (isRunning) {
      running.push(terminal)
    }
  }

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
    return trimmed.split(', ').filter(n => n.length > 0 && n !== 'missing value')
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
          displayName: `${terminal.displayName}: ${shortName}`
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
  try {
    // Escape special characters for AppleScript
    const escapedText = text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')

    // Escape window name for AppleScript
    const escapedWindowName = windowName
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')

    // Copy text to clipboard first
    const copyScript = `set the clipboard to "${escapedText}"`
    await execAsync(`osascript -e '${copyScript}'`)

    // Small delay to ensure clipboard is set
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get the app name from bundle ID
    const terminal = SUPPORTED_TERMINALS.find(t => t.bundleId === bundleId)
    const appName = terminal?.name || 'Terminal'

    // Try to activate the specific window by name and paste
    try {
      const activateScript = `
tell application "${appName}"
  activate
  try
    set targetWindow to first window whose name is "${escapedWindowName}"
    set index of targetWindow to 1
  on error
    -- If exact match fails, try partial match
    set targetWindow to first window whose name contains "${escapedWindowName}"
    set index of targetWindow to 1
  end try
end tell
delay 0.3
tell application "System Events"
  keystroke "v" using command down
end tell
`
      await execAsync(`osascript -e '${activateScript}'`)
      return { success: true, needsPermission: false, copied: true }
    } catch (pasteError: any) {
      if (pasteError.stderr?.includes('not allowed to send keystrokes') ||
          pasteError.stderr?.includes('1002')) {
        // At least activate the window
        try {
          const activateOnly = `
tell application "${appName}"
  activate
  try
    set targetWindow to first window whose name is "${escapedWindowName}"
    set index of targetWindow to 1
  end try
end tell
`
          await execAsync(`osascript -e '${activateOnly}'`)
        } catch {}
        return { success: false, needsPermission: true, copied: true }
      }
      throw pasteError
    }
  } catch (error) {
    console.error('Failed to paste to terminal window:', error)
    return { success: false, needsPermission: false, copied: false }
  }
}

/**
 * Paste text into a specific terminal application
 * Returns: { success: boolean, needsPermission: boolean, copied: boolean }
 */
export async function pasteToTerminal(text: string, bundleId: string): Promise<{ success: boolean; needsPermission: boolean; copied: boolean }> {
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
    await new Promise(resolve => setTimeout(resolve, 100))

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
      if (pasteError.stderr?.includes('not allowed to send keystrokes') ||
          pasteError.stderr?.includes('1002')) {
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
