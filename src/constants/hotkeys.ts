/**
 * Hotkey-related constants for the Neural Scribe application
 */

export const HOTKEYS = {
  RECORD_DEFAULT: 'CommandOrControl+Shift+R',
  PASTE_DEFAULT: 'CommandOrControl+Shift+V',

  // Platform-specific key symbols for display
  SYMBOLS: {
    CommandOrControl: process.platform === 'darwin' ? '⌘' : 'Ctrl',
    Shift: '⇧',
    Alt: '⌥',
    Option: '⌥',
  },
} as const
