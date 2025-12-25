/**
 * Formatting Service
 *
 * Provides AI-powered text formatting using Claude. Encapsulates all formatting
 * logic including prompt formatting, title generation, and text reformatting.
 *
 * @module services/FormattingService
 */

import {
  formatPrompt as formatPromptImpl,
  generateTitle as generateTitleImpl,
  isClaudeCliAvailable,
  getClaudeCliVersion,
  DEFAULT_FORMATTING_INSTRUCTIONS,
} from '../prompt-formatter'
import { getPromptFormattingSettings } from '../store/settings'

/**
 * Format result
 */
export interface FormatResult {
  /** Whether formatting succeeded */
  success: boolean
  /** Formatted text (or original if failed/skipped) */
  formatted: string
  /** Error message if failed */
  error?: string
  /** Whether formatting was skipped (text too short) */
  skipped?: boolean
}

/**
 * Title generation result
 */
export interface TitleResult {
  /** Whether title generation succeeded */
  success: boolean
  /** Generated title */
  title: string
  /** Error message if failed */
  error?: string
}

/**
 * Claude CLI status
 */
export interface ClaudeCliStatus {
  /** Whether Claude CLI is available */
  available: boolean
  /** Claude CLI version (null if not available) */
  version: string | null
}

/**
 * Formatting Service
 *
 * Singleton service for AI-powered text formatting.
 *
 * @example
 * ```typescript
 * const service = FormattingService.getInstance()
 *
 * // Format transcribed text
 * const result = await service.formatPrompt('install express and cors')
 * console.log(result.formatted)  // "npm install express cors"
 *
 * // Generate title
 * const titleResult = await service.generateTitle('npm install express')
 * console.log(titleResult.title)  // "Install Express"
 * ```
 */
export class FormattingService {
  private static instance: FormattingService

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Gets the singleton instance
   *
   * @returns {FormattingService} Service instance
   */
  public static getInstance(): FormattingService {
    if (!FormattingService.instance) {
      FormattingService.instance = new FormattingService()
    }
    return FormattingService.instance
  }

  /**
   * Formats transcribed text using Claude AI
   *
   * Converts natural language voice commands into proper shell syntax or code.
   * Uses settings from store for instructions and model selection.
   *
   * @param {string} text - Raw transcribed text
   * @returns {Promise<FormatResult>} Formatting result
   *
   * @example
   * ```typescript
   * const result = await service.formatPrompt('list all files recursively')
   * if (result.success && !result.skipped) {
   *   console.log(result.formatted)  // "ls -la"
   * }
   * ```
   */
  public async formatPrompt(text: string): Promise<FormatResult> {
    try {
      const settings = getPromptFormattingSettings()

      // Check if formatting is enabled
      if (!settings.enabled) {
        return {
          success: true,
          formatted: text,
          skipped: true,
        }
      }

      return await formatPromptImpl(text)
    } catch (error) {
      return {
        success: false,
        formatted: text,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Reformats text with custom instructions
   *
   * Allows one-time formatting with different instructions than settings.
   *
   * @param {string} text - Text to reformat
   * @param {string} [customInstructions] - Optional custom instructions
   * @returns {Promise<FormatResult>} Formatting result
   *
   * @example
   * ```typescript
   * const result = await service.reformatText(
   *   'npm install express',
   *   'Convert to pnpm'
   * )
   * console.log(result.formatted)  // "pnpm add express"
   * ```
   */
  public async reformatText(text: string, customInstructions?: string): Promise<FormatResult> {
    try {
      const settings = getPromptFormattingSettings()

      // Use custom instructions if provided, otherwise use default formatting instructions
      const instructions = customInstructions || settings.instructions
      const model = settings.model

      // Call formatPromptImpl with custom instructions
      return await formatPromptImpl(text, instructions, model)
    } catch (error) {
      return {
        success: false,
        formatted: text,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Generates a short title/summary for transcribed text
   *
   * Creates a concise 2-5 word title suitable for display in history lists.
   *
   * @param {string} text - Transcribed or formatted text
   * @returns {Promise<TitleResult>} Title generation result
   *
   * @example
   * ```typescript
   * const result = await service.generateTitle('npm install express cors dotenv')
   * console.log(result.title)  // "Install Express Dependencies"
   * ```
   */
  public async generateTitle(text: string): Promise<TitleResult> {
    try {
      return await generateTitleImpl(text)
    } catch (error) {
      return {
        success: false,
        title: text.substring(0, 50), // Fallback: first 50 chars
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Checks Claude CLI status
   *
   * @returns {Promise<ClaudeCliStatus>} CLI availability and version
   *
   * @example
   * ```typescript
   * const status = await service.checkClaudeCliStatus()
   * if (status.available) {
   *   console.log(`Claude CLI ${status.version} available`)
   * }
   * ```
   */
  public async checkClaudeCliStatus(): Promise<ClaudeCliStatus> {
    const available = await isClaudeCliAvailable()
    const version = available ? await getClaudeCliVersion() : null

    return { available, version }
  }

  /**
   * Gets the default formatting instructions
   *
   * @returns {string} Default instructions
   */
  public getDefaultInstructions(): string {
    return DEFAULT_FORMATTING_INSTRUCTIONS
  }

  /**
   * Gets current formatting settings
   *
   * @returns Formatting settings from store
   */
  public getSettings() {
    return getPromptFormattingSettings()
  }
}

// Export singleton instance
export default FormattingService.getInstance()
