/**
 * Gamification Stats Module
 *
 * Tracks user statistics including words transcribed, sessions, and daily streaks.
 *
 * @module store/gamification/stats
 */

/**
 * Feature usage statistics for tracking app feature interactions
 *
 * @interface FeatureUsageStats
 */
export interface FeatureUsageStats {
  // AI Formatting
  /** Total AI formatting operations (initial formatting) */
  formattingOperations: number
  /** Total reformatting operations (re-formatting existing text) */
  reformattingOperations: number
  /** Total AI title generations */
  titleGenerationsCount: number
  /** AI model usage counts by model type */
  modelUsageCounts: { sonnet: number; opus: number; haiku: number }
  /** Number of times custom formatting instructions were changed */
  customInstructionsChanges: number

  // Voice Commands
  /** Total voice commands used (send/clear/cancel) */
  voiceCommandsUsed: number
  /** Voice command usage by type */
  voiceCommandsByType: { send: number; clear: number; cancel: number }
  /** Number of custom voice commands added */
  customVoiceCommandsAdded: number
  /** Number of times voice command triggers were modified */
  voiceCommandTriggersModified: number

  // Word Replacements
  /** Number of word replacement rules added */
  wordReplacementsAdded: number
  /** Number of times word replacements were applied */
  wordReplacementsApplied: number

  // Terminal Integration
  /** Total paste-to-terminal operations */
  terminalPasteOperations: number
  /** Unique terminal bundle IDs used */
  uniqueTerminalsUsed: string[]
  /** Terminal usage counts by bundle ID */
  terminalUsageCounts: Record<string, number>

  // Keyboard Shortcuts
  /** Total hotkey usage count */
  hotkeyUsageCount: number
  /** Paste hotkey usage count */
  pasteHotkeyCount: number
  /** Record hotkey usage count */
  recordHotkeyCount: number
  /** Number of hotkey configuration changes */
  hotkeyChanges: number

  // History & Settings
  /** Number of history search operations */
  historySearchCount: number
  /** Number of settings changes */
  settingsChanges: number
  /** Number of feature toggles (enable/disable) */
  featureToggles: number
  /** Number of microphone device changes */
  microphoneChanges: number

  // Transcription Engines
  /** Number of times transcription engine was changed */
  engineChanges: number
  /** List of unique engines used (elevenlabs, deepgram) */
  enginesUsed: string[]
  /** Session count by engine */
  engineSessionCounts: Record<string, number>

  // First-use dates (YYYY-MM-DD format)
  /** First time AI formatting was used */
  firstFormattingDate: string
  /** First time voice command was used */
  firstVoiceCommandDate: string
  /** First time word replacement was used */
  firstReplacementDate: string
  /** First time terminal paste was used */
  firstTerminalPasteDate: string
}

/**
 * User statistics
 *
 * @interface UserStats
 */
export interface UserStats {
  /** Total words transcribed across all sessions */
  totalWordsTranscribed: number
  /** Total recording time in milliseconds */
  totalRecordingTimeMs: number
  /** Total number of transcription sessions */
  totalSessions: number
  /** Current daily login streak */
  currentStreak: number
  /** Longest streak ever achieved */
  longestStreak: number
  /** Last active date (YYYY-MM-DD format) */
  lastActiveDate: string
  /** First session date (YYYY-MM-DD format) */
  firstSessionDate: string
  /** Feature usage statistics */
  featureUsage: FeatureUsageStats
}

/**
 * Default feature usage stats for new users
 */
export const DEFAULT_FEATURE_USAGE: FeatureUsageStats = {
  // AI Formatting
  formattingOperations: 0,
  reformattingOperations: 0,
  titleGenerationsCount: 0,
  modelUsageCounts: { sonnet: 0, opus: 0, haiku: 0 },
  customInstructionsChanges: 0,

  // Voice Commands
  voiceCommandsUsed: 0,
  voiceCommandsByType: { send: 0, clear: 0, cancel: 0 },
  customVoiceCommandsAdded: 0,
  voiceCommandTriggersModified: 0,

  // Word Replacements
  wordReplacementsAdded: 0,
  wordReplacementsApplied: 0,

  // Terminal Integration
  terminalPasteOperations: 0,
  uniqueTerminalsUsed: [],
  terminalUsageCounts: {},

  // Keyboard Shortcuts
  hotkeyUsageCount: 0,
  pasteHotkeyCount: 0,
  recordHotkeyCount: 0,
  hotkeyChanges: 0,

  // History & Settings
  historySearchCount: 0,
  settingsChanges: 0,
  featureToggles: 0,
  microphoneChanges: 0,

  // Transcription Engines
  engineChanges: 0,
  enginesUsed: [],
  engineSessionCounts: {},

  // First-use dates
  firstFormattingDate: '',
  firstVoiceCommandDate: '',
  firstReplacementDate: '',
  firstTerminalPasteDate: '',
}

/**
 * Default stats for new users
 */
export const DEFAULT_STATS: UserStats = {
  totalWordsTranscribed: 0,
  totalRecordingTimeMs: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  firstSessionDate: new Date().toISOString().split('T')[0],
  featureUsage: DEFAULT_FEATURE_USAGE,
}

/**
 * Updates session statistics
 *
 * @param {UserStats} stats - Current stats
 * @param {number} words - Words transcribed in this session
 * @param {number} durationMs - Session duration in milliseconds
 * @returns {UserStats} Updated stats
 *
 * @example
 * ```typescript
 * const updated = updateSessionStats(currentStats, 150, 45000)
 * // Adds 150 words, 45 seconds, and increments session count
 * ```
 */
export function updateSessionStats(stats: UserStats, words: number, durationMs: number): UserStats {
  return {
    ...stats,
    totalWordsTranscribed: stats.totalWordsTranscribed + words,
    totalRecordingTimeMs: stats.totalRecordingTimeMs + durationMs,
    totalSessions: stats.totalSessions + 1,
  }
}

/**
 * Updates daily streak based on last active date
 *
 * Streak logic:
 * - Consecutive days: increment streak
 * - Gap >1 day: reset to 1
 * - Same day: no change
 *
 * @param {UserStats} stats - Current stats
 * @param {string} today - Today's date (YYYY-MM-DD)
 * @returns {UserStats} Updated stats with new streak
 *
 * @example
 * ```typescript
 * const updated = updateStreak(stats, '2025-12-21')
 * console.log(updated.currentStreak)  // Incremented if consecutive
 * console.log(updated.longestStreak)  // Updated if new record
 * ```
 */
export function updateStreak(stats: UserStats, today: string): UserStats {
  // If already active today, no change
  if (stats.lastActiveDate === today) {
    return stats
  }

  const updated = { ...stats, lastActiveDate: today }

  if (!stats.lastActiveDate) {
    // First session ever
    updated.currentStreak = 1
    updated.longestStreak = Math.max(1, stats.longestStreak)
    return updated
  }

  // Calculate days since last active
  const lastDate = new Date(stats.lastActiveDate)
  const todayDate = new Date(today)
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    // Consecutive day - increment streak
    updated.currentStreak = stats.currentStreak + 1
    updated.longestStreak = Math.max(updated.currentStreak, stats.longestStreak)
  } else if (diffDays > 1) {
    // Streak broken - reset to 1
    updated.currentStreak = 1
  }
  // diffDays === 0 handled above (same day)

  return updated
}

/**
 * Calculates derived statistics
 *
 * @param {UserStats} stats - Current stats
 * @returns Calculated statistics
 *
 * @example
 * ```typescript
 * const derived = getDerivedStats(stats)
 * console.log(derived.averageWordsPerSession)  // 147.5
 * console.log(derived.averageSessionDuration)  // 42.3 seconds
 * console.log(derived.totalHours)              // 2.5 hours
 * ```
 */
export function getDerivedStats(stats: UserStats) {
  const totalSessions = stats.totalSessions || 1 // Avoid division by zero

  return {
    /** Average words per session */
    averageWordsPerSession: stats.totalWordsTranscribed / totalSessions,
    /** Average session duration in seconds */
    averageSessionDuration: stats.totalRecordingTimeMs / totalSessions / 1000,
    /** Total recording time in hours */
    totalHours: stats.totalRecordingTimeMs / (1000 * 60 * 60),
    /** Total recording time in minutes */
    totalMinutes: stats.totalRecordingTimeMs / (1000 * 60),
    /** Words per minute average */
    wordsPerMinute:
      stats.totalRecordingTimeMs > 0
        ? stats.totalWordsTranscribed / (stats.totalRecordingTimeMs / 60000)
        : 0,
  }
}

/**
 * Gets today's date in YYYY-MM-DD format
 *
 * @returns {string} Today's date
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Checks if user is active today
 *
 * @param {UserStats} stats - Current stats
 * @returns {boolean} True if last active date is today
 */
export function isActiveToday(stats: UserStats): boolean {
  return stats.lastActiveDate === getTodayString()
}
