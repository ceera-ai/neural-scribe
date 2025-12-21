/**
 * Terminal Service
 *
 * Provides terminal automation functionality including terminal detection
 * and text pasting. Encapsulates all terminal-related logic.
 *
 * @module services/TerminalService
 */

import {
  getRunningTerminals as getRunningTerminalsImpl,
  getTerminalWindows as getTerminalWindowsImpl,
  pasteToTerminal as pasteToTerminalImpl,
  pasteToTerminalWindow as pasteToTerminalWindowImpl,
  pasteToLastActiveTerminal as pasteToLastActiveTerminalImpl,
  TerminalApp,
  TerminalWindow,
  PasteResult,
} from '../terminal'

export type { TerminalApp, TerminalWindow, PasteResult }

/**
 * Terminal Service
 *
 * Singleton service for terminal automation.
 *
 * @example
 * ```typescript
 * const service = TerminalService.getInstance()
 *
 * // Get running terminals
 * const terminals = await service.getRunningTerminals()
 * console.log(`Found ${terminals.length} terminals`)
 *
 * // Paste to terminal
 * const result = await service.pasteToActiveTerminal('echo "Hello World"')
 * if (result.success) {
 *   console.log(`Pasted to ${result.targetApp}`)
 * }
 * ```
 */
export class TerminalService {
  private static instance: TerminalService

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Gets the singleton instance
   *
   * @returns {TerminalService} Service instance
   */
  public static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService()
    }
    return TerminalService.instance
  }

  /**
   * Gets all running terminal applications
   *
   * @returns {Promise<TerminalApp[]>} Array of running terminal apps
   *
   * @example
   * ```typescript
   * const terminals = await service.getRunningTerminals()
   * terminals.forEach(term => {
   *   console.log(`${term.displayName} (${term.bundleId})`)
   * })
   * ```
   */
  public async getRunningTerminals(): Promise<TerminalApp[]> {
    return await getRunningTerminalsImpl()
  }

  /**
   * Gets all open terminal windows across all terminal apps
   *
   * @returns {Promise<TerminalWindow[]>} Array of terminal windows
   *
   * @example
   * ```typescript
   * const windows = await service.getTerminalWindows()
   * console.log(`Found ${windows.length} terminal windows`)
   * ```
   */
  public async getTerminalWindows(): Promise<TerminalWindow[]> {
    return await getTerminalWindowsImpl()
  }

  /**
   * Pastes text to a specific terminal application
   *
   * @param {string} text - Text to paste
   * @param {string} bundleId - Terminal app bundle ID
   * @returns {Promise<PasteResult>} Paste result
   *
   * @example
   * ```typescript
   * const result = await service.pasteToTerminal(
   *   'npm install',
   *   'com.googlecode.iterm2'
   * )
   *
   * if (result.needsPermission) {
   *   showPermissionDialog()
   * } else if (result.success) {
   *   console.log('Pasted successfully')
   * }
   * ```
   */
  public async pasteToTerminal(text: string, bundleId: string): Promise<PasteResult> {
    return await pasteToTerminalImpl(text, bundleId)
  }

  /**
   * Pastes text to a specific terminal window
   *
   * @param {string} text - Text to paste
   * @param {string} bundleId - Terminal app bundle ID
   * @param {string} windowName - Window name/title
   * @returns {Promise<PasteResult>} Paste result
   *
   * @example
   * ```typescript
   * const result = await service.pasteToWindow(
   *   'ls -la',
   *   'com.googlecode.iterm2',
   *   'Session 1'
   * )
   * ```
   */
  public async pasteToWindow(
    text: string,
    bundleId: string,
    windowName: string
  ): Promise<PasteResult> {
    return await pasteToTerminalWindowImpl(text, bundleId, windowName)
  }

  /**
   * Automatically detects and pastes to the most recently active terminal
   *
   * This is the recommended method for pasting as it requires no user selection.
   *
   * @param {string} text - Text to paste
   * @returns {Promise<PasteResult & { targetApp: string | null }>} Paste result with target app name
   *
   * @example
   * ```typescript
   * const result = await service.pasteToActiveTerminal('docker-compose up')
   *
   * if (result.success) {
   *   console.log(`Pasted to ${result.targetApp}`)
   * } else if (result.needsPermission) {
   *   notifyUser('Please grant accessibility permissions')
   * } else if (result.copied) {
   *   notifyUser('Copied to clipboard (paste manually)')
   * }
   * ```
   */
  public async pasteToActiveTerminal(
    text: string
  ): Promise<PasteResult & { targetApp: string | null }> {
    return await pasteToLastActiveTerminalImpl(text)
  }

  /**
   * Checks if any terminals are currently running
   *
   * @returns {Promise<boolean>} True if at least one terminal is running
   */
  public async hasRunningTerminals(): Promise<boolean> {
    const terminals = await this.getRunningTerminals()
    return terminals.length > 0
  }

  /**
   * Gets the count of running terminal applications
   *
   * @returns {Promise<number>} Number of running terminals
   */
  public async getRunningTerminalCount(): Promise<number> {
    const terminals = await this.getRunningTerminals()
    return terminals.length
  }

  /**
   * Finds a terminal by bundle ID
   *
   * @param {string} bundleId - Terminal app bundle ID
   * @returns {Promise<TerminalApp | null>} Terminal app or null if not found
   */
  public async findTerminalByBundleId(bundleId: string): Promise<TerminalApp | null> {
    const terminals = await this.getRunningTerminals()
    return terminals.find((t) => t.bundleId === bundleId) || null
  }
}

// Export singleton instance
export default TerminalService.getInstance()
