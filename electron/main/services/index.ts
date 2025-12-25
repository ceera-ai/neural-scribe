/**
 * Services Index
 *
 * Re-exports all service classes for convenient importing.
 *
 * @module services
 */

export { FormattingService } from './FormattingService'
export { TerminalService } from './TerminalService'

// Export default instances
export { default as formattingService } from './FormattingService'
export { default as terminalService } from './TerminalService'

// Re-export types
export type { FormatResult, TitleResult, ClaudeCliStatus } from './FormattingService'
export type { TerminalApp, TerminalWindow, PasteResult } from './TerminalService'
