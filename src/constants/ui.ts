/**
 * UI-related constants for the Neural Scribe application
 */

export const UI = {
  // Pagination
  HISTORY_PAGE_SIZE: 10,
  HISTORY_MAX_ENTRIES: 500,

  // Audio Analysis
  AUDIO_FFT_SIZE: 128,
  AUDIO_SMOOTHING: 0.3,
  AUDIO_MIN_DECIBELS: -90,
  AUDIO_MAX_DECIBELS: -10,

  // Overlay
  OVERLAY_MAX_LINE_CHARS: 90,
  OVERLAY_HEIGHT_PERCENT: 0.6,
  OVERLAY_DEFAULT_WIDTH: 600,

  // Animations
  ANIMATION_DURATION_MS: 350,
  TOAST_DURATION_MS: 3000,
  ACHIEVEMENT_POPUP_DURATION_MS: 5000,

  // Formatting
  MIN_WORDS_FOR_FORMATTING: 15,

  // Recording
  MAX_RECORDING_DURATION_MS: 3600000, // 1 hour

  // Transcription
  MAX_TRANSCRIPT_LENGTH: 100000, // characters
} as const
