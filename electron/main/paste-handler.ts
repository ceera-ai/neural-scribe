/**
 * Paste Handler Module
 *
 * Handles different paste modes for transcribed text:
 * - Auto-paste: Automatically paste into the currently focused text field
 * - Clipboard: Copy to clipboard only (manual paste)
 * - Terminal: Paste into the last active terminal window
 *
 * Uses @nut-tree-fork/nut-js for keyboard simulation on macOS.
 *
 * @module paste-handler
 */

import { clipboard, systemPreferences, Notification } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import { getShowPasteNotifications } from './store/settings'
import {
  restorePreviousApplicationFocus,
  clearCapturedApplication,
  getPreviousApplicationName,
} from './focus-manager'

/**
 * Paste mode options
 */
export type PasteMode = 'auto' | 'clipboard' | 'terminal'

/**
 * Paste operation parameters
 */
export interface PasteOptions {
  mode: PasteMode
  text: string
}

/**
 * Result of a paste operation
 */
export interface PasteResult {
  success: boolean
  mode: PasteMode
  error?: string
}

/**
 * Checks if the app has macOS accessibility permissions
 *
 * Required for keyboard simulation (auto-paste mode).
 *
 * @param {boolean} prompt - If true, prompts user to grant permissions
 * @returns {boolean} True if accessibility permissions are granted
 *
 * @example
 * ```typescript
 * if (!checkAccessibilityPermissions(false)) {
 *   console.log('Accessibility permissions not granted')
 * }
 * ```
 */
export function checkAccessibilityPermissions(prompt = false): boolean {
  if (process.platform !== 'darwin') {
    return true // Only needed on macOS
  }

  return systemPreferences.isTrustedAccessibilityClient(prompt)
}

/**
 * Requests macOS accessibility permissions
 *
 * Opens System Preferences to allow user to grant permissions.
 *
 * @returns {boolean} Current permission status
 *
 * @example
 * ```typescript
 * const granted = requestAccessibilityPermissions()
 * if (!granted) {
 *   console.log('User must manually grant permissions in System Preferences')
 * }
 * ```
 */
export function requestAccessibilityPermissions(): boolean {
  return checkAccessibilityPermissions(true)
}

/**
 * Copies text to clipboard only (no auto-paste)
 *
 * @param {string} text - Text to copy
 * @returns {PasteResult} Result of operation
 *
 * @example
 * ```typescript
 * const result = await clipboardOnlyMode('Hello world')
 * if (result.success) {
 *   console.log('Text copied to clipboard')
 * }
 * ```
 */
export async function clipboardOnlyMode(text: string): Promise<PasteResult> {
  try {
    console.log('[PasteHandler] clipboardOnlyMode - Copying text to clipboard')
    clipboard.writeText(text)

    // Show notification if enabled
    if (getShowPasteNotifications()) {
      console.log('[PasteHandler] Showing clipboard notification')
      new Notification({
        title: 'Text Copied',
        body: 'Text copied to clipboard. Press Cmd+V to paste.',
        silent: true,
      }).show()
    }

    console.log('[PasteHandler] Clipboard copy successful')
    return {
      success: true,
      mode: 'clipboard',
    }
  } catch (error) {
    console.error('[PasteHandler] Failed to copy to clipboard:', error)
    return {
      success: false,
      mode: 'clipboard',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Auto-pastes text to the currently focused text field
 *
 * Implementation:
 * 1. Copy text to clipboard
 * 2. Hide main window if visible (to shift focus back to previous app)
 * 3. Wait for focus shift (100ms)
 * 4. Simulate Cmd+V keypress
 * 5. Keep window hidden
 *
 * @param {string} text - Text to paste
 * @param {() => Promise<void>} hideWindow - Function to hide the main window
 * @param {() => boolean} isWindowVisible - Function to check if window is visible
 * @returns {PasteResult} Result of operation
 *
 * @example
 * ```typescript
 * const result = await autoPasteToActiveField(
 *   'Hello world',
 *   hideMainWindow,
 *   isMainWindowVisible
 * )
 * ```
 */
export async function autoPasteToActiveField(
  text: string,
  hideWindow: () => Promise<void>,
  isWindowVisible: () => boolean
): Promise<PasteResult> {
  try {
    console.log('[PasteHandler] autoPasteToActiveField - Starting auto-paste')
    console.log('[PasteHandler] Text to paste:', {
      length: text.length,
      preview: text.substring(0, 100),
    })

    // Check what app we captured
    const capturedAppName = getPreviousApplicationName()
    console.log('[PasteHandler] Previously captured application:', capturedAppName ?? 'NONE')

    // Check accessibility permissions first
    const hasPermissions = checkAccessibilityPermissions(false)
    console.log('[PasteHandler] Accessibility permissions:', hasPermissions)

    if (!hasPermissions) {
      console.warn('[PasteHandler] Auto-paste failed: Accessibility permissions not granted')
      // Fallback to clipboard mode
      clearCapturedApplication()
      return await clipboardOnlyMode(text)
    }

    // Step 1: Copy to clipboard
    console.log('[PasteHandler] Step 1: Copying to clipboard')
    clipboard.writeText(text)
    await delay(50) // Short delay to ensure clipboard is updated

    // Step 2: Hide main window if visible
    const windowVisible = isWindowVisible()
    console.log('[PasteHandler] Step 2: Main window visible?', windowVisible)

    if (windowVisible) {
      console.log('[PasteHandler] Hiding main window')
      await hideWindow()
      await delay(100) // Wait for window to hide
    }

    // Step 3: Restore focus to the previously active application
    console.log('[PasteHandler] Step 3: Restoring focus to previous application')
    console.log('[PasteHandler] Calling restorePreviousApplicationFocus with 300ms wait...')
    const focusRestored = await restorePreviousApplicationFocus(300)
    console.log('[PasteHandler] Focus restoration result:', focusRestored)

    if (!focusRestored) {
      console.warn('[PasteHandler] ⚠️  Failed to restore focus, waiting for system to settle')
      await delay(300) // Fallback delay if focus restoration failed
    } else {
      console.log('[PasteHandler] ✅ Focus successfully restored, ready to paste')
    }

    // Step 4: Simulate Cmd+V
    console.log('[PasteHandler] Step 4: About to simulate Cmd+V keypress...')
    console.log('[PasteHandler] Pressing LeftSuper (Cmd) key...')
    await keyboard.pressKey(Key.LeftSuper) // Cmd key
    console.log('[PasteHandler] Typing V key...')
    await keyboard.type(Key.V)
    console.log('[PasteHandler] Releasing LeftSuper (Cmd) key...')
    await keyboard.releaseKey(Key.LeftSuper)
    console.log('[PasteHandler] ✅ Cmd+V simulation complete')

    // Show notification if enabled
    if (getShowPasteNotifications()) {
      new Notification({
        title: 'Text Pasted',
        body: 'Text pasted to active field.',
        silent: true,
      }).show()
    }

    console.log('[PasteHandler] Auto-paste operation completed successfully')

    // Clear the captured application now that paste is complete
    console.log('[PasteHandler] Clearing captured application after successful paste')
    clearCapturedApplication()

    return {
      success: true,
      mode: 'auto',
    }
  } catch (error) {
    console.error('[PasteHandler] ❌ Auto-paste failed with error:', error)

    // Clear captured app on error too
    clearCapturedApplication()

    // Fallback to clipboard mode
    new Notification({
      title: 'Auto-paste Failed',
      body: 'Text copied to clipboard instead. Press Cmd+V to paste.',
      silent: true,
    }).show()

    return await clipboardOnlyMode(text)
  }
}

/**
 * Main paste handler that routes to the appropriate paste function
 *
 * @param {PasteOptions} options - Paste operation parameters
 * @param {() => Promise<void>} hideWindow - Function to hide the main window
 * @param {() => boolean} isWindowVisible - Function to check if window is visible
 * @returns {PasteResult} Result of operation
 *
 * @example
 * ```typescript
 * const result = await handlePaste(
 *   { mode: 'auto', text: 'Hello world' },
 *   hideMainWindow,
 *   isMainWindowVisible
 * )
 * ```
 */
export async function handlePaste(
  options: PasteOptions,
  hideWindow: () => Promise<void>,
  isWindowVisible: () => boolean
): Promise<PasteResult> {
  const { mode, text } = options

  console.log('[PasteHandler] handlePaste called with:', {
    mode,
    textLength: text.length,
    textPreview: text.substring(0, 50) + '...',
  })

  switch (mode) {
    case 'auto':
      console.log('[PasteHandler] Using AUTO-PASTE mode')
      return await autoPasteToActiveField(text, hideWindow, isWindowVisible)

    case 'clipboard':
      console.log('[PasteHandler] Using CLIPBOARD-ONLY mode')
      return await clipboardOnlyMode(text)

    case 'terminal':
      console.log('[PasteHandler] Using TERMINAL mode (falling back to clipboard)')
      // Terminal mode is handled separately via existing terminal paste logic
      // Just copy to clipboard here
      return await clipboardOnlyMode(text)

    default:
      console.error(`[PasteHandler] Unknown paste mode: ${mode}`)
      return await clipboardOnlyMode(text)
  }
}

/**
 * Utility function to delay execution
 *
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
