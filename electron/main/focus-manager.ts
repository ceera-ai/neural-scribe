/**
 * Focus Manager Module
 *
 * Tracks and restores the active application focus on macOS.
 * This is critical for auto-paste to work correctly - we need to paste
 * into the application that was active BEFORE recording started.
 *
 * @module focus-manager
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Information about the previously active application
 */
interface ActiveAppInfo {
  name: string
  bundleId: string
  processId: number
}

let previousActiveApp: ActiveAppInfo | null = null

/**
 * Get the currently active (frontmost) application using AppleScript
 *
 * @returns {Promise<ActiveAppInfo | null>} Information about the active app
 */
async function getActiveApplication(): Promise<ActiveAppInfo | null> {
  if (process.platform !== 'darwin') {
    console.log('[FocusManager] Not on macOS, skipping active app detection')
    return null
  }

  try {
    const script = `
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
        set appBundleId to bundle identifier of frontApp
        set appPID to unix id of frontApp
        return appName & "|" & appBundleId & "|" & appPID
      end tell
    `

    const { stdout } = await execAsync(`osascript -e '${script}'`)
    const [name, bundleId, processId] = stdout.trim().split('|')

    console.log('[FocusManager] Active application:', { name, bundleId, processId })

    return {
      name: name.trim(),
      bundleId: bundleId.trim(),
      processId: parseInt(processId.trim(), 10),
    }
  } catch (error) {
    console.error('[FocusManager] Failed to get active application:', error)
    return null
  }
}

/**
 * Activate (bring to front) an application by bundle ID
 *
 * @param {string} bundleId - The bundle identifier of the app to activate
 * @returns {Promise<boolean>} True if activation succeeded
 */
async function activateApplication(bundleId: string): Promise<boolean> {
  if (process.platform !== 'darwin') {
    console.log('[FocusManager] Not on macOS, skipping app activation')
    return false
  }

  try {
    console.log('[FocusManager] Activating application:', bundleId)

    const script = `
      tell application id "${bundleId}"
        activate
      end tell
    `

    await execAsync(`osascript -e '${script}'`)
    console.log('[FocusManager] Application activated successfully')
    return true
  } catch (error) {
    console.error('[FocusManager] Failed to activate application:', error)
    return false
  }
}

/**
 * Capture the currently active application before showing recording overlay.
 * Call this BEFORE showing the recording overlay.
 *
 * @returns {Promise<void>}
 */
export async function captureActiveApplication(): Promise<void> {
  console.log('[FocusManager] Capturing active application...')
  previousActiveApp = await getActiveApplication()

  if (previousActiveApp) {
    console.log('[FocusManager] Captured:', previousActiveApp.name)
  } else {
    console.log('[FocusManager] Failed to capture active application')
  }
}

/**
 * Restore focus to the previously active application.
 * Call this BEFORE simulating keyboard input for paste.
 *
 * @param {number} waitTimeMs - How long to wait after activating (default: 200ms)
 * @returns {Promise<boolean>} True if focus was restored successfully
 */
export async function restorePreviousApplicationFocus(waitTimeMs = 200): Promise<boolean> {
  console.log('[FocusManager] Restoring focus to previous application...')

  if (!previousActiveApp) {
    console.warn('[FocusManager] No previous application captured, cannot restore focus')
    return false
  }

  // Don't try to activate Neural Scribe itself
  if (
    previousActiveApp.bundleId === 'com.neuralscribe.app' ||
    previousActiveApp.name === 'Neural Scribe'
  ) {
    console.log('[FocusManager] Previous app was Neural Scribe itself, skipping activation')
    return false
  }

  console.log('[FocusManager] Restoring focus to:', previousActiveApp.name)

  const success = await activateApplication(previousActiveApp.bundleId)

  if (success) {
    console.log(`[FocusManager] Waiting ${waitTimeMs}ms for application to become active...`)
    await new Promise((resolve) => setTimeout(resolve, waitTimeMs))
    console.log('[FocusManager] Focus restored successfully')
    return true
  }

  console.warn('[FocusManager] Failed to restore focus')
  return false
}

/**
 * Clear the captured application info.
 * Call this after paste is complete or when recording is cancelled.
 */
export function clearCapturedApplication(): void {
  console.log('[FocusManager] Clearing captured application')
  previousActiveApp = null
}

/**
 * Get the name of the previously captured application (for debugging/logging)
 *
 * @returns {string | null} The name of the captured app, or null if none
 */
export function getPreviousApplicationName(): string | null {
  return previousActiveApp?.name ?? null
}
