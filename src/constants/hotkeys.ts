/**
 * Hotkey-related constants for the Neural Scribe application
 */

// Use browser-safe platform detection
const isMac =
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

export const HOTKEYS = {
  RECORD_DEFAULT: 'CommandOrControl+Shift+R',
  PASTE_DEFAULT: 'CommandOrControl+Shift+V',

  // Platform-specific key symbols for display
  SYMBOLS: {
    CommandOrControl: isMac ? '⌘' : 'Ctrl',
    Shift: '⇧',
    Alt: '⌥',
    Option: '⌥',
  },
} as const
