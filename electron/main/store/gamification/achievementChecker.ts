/**
 * Achievement Checker
 *
 * Determines which achievements should be unlocked based on current game state.
 * Checks various conditions (milestones, word counts, streaks, etc.) and returns
 * newly unlocked achievement IDs.
 *
 * @module store/gamification/achievementChecker
 */

import { ACHIEVEMENTS } from '../../gamification/achievementDefinitions'
import type { UserStats } from './stats'
import type { LevelSystem } from './levels'
import type { AchievementsState } from './achievements'
import { getDerivedStats } from './stats'
import { isAchievementUnlocked } from './achievements'

/**
 * Check all achievements and return newly unlocked IDs
 *
 * @param stats - Current user statistics
 * @param level - Current level system data
 * @param achievements - Current achievements state
 * @returns Array of newly unlocked achievement IDs
 */
export function checkAchievements(
  stats: UserStats,
  level: LevelSystem,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Check existing achievement categories
  newlyUnlocked.push(...checkMilestoneAchievements(stats, achievements))
  newlyUnlocked.push(...checkWordCountAchievements(stats, achievements))
  newlyUnlocked.push(...checkStreakAchievements(stats, achievements))
  newlyUnlocked.push(...checkSpeedAchievements(stats, achievements))
  newlyUnlocked.push(...checkTimeAchievements(stats, achievements))
  newlyUnlocked.push(...checkLevelAchievements(level, achievements))

  // Check new feature-based achievement categories
  newlyUnlocked.push(...checkAIMasteryAchievements(stats, achievements))
  newlyUnlocked.push(...checkCustomizationAchievements(stats, achievements))
  newlyUnlocked.push(...checkEfficiencyAchievements(stats, achievements))
  newlyUnlocked.push(...checkIntegrationAchievements(stats, achievements))
  newlyUnlocked.push(...checkExplorationAchievements(stats, achievements))

  return newlyUnlocked
}

/**
 * Check milestone achievements (session counts)
 */
export function checkMilestoneAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []
  const sessions = stats.totalSessions

  const milestones = [
    { id: 'first-steps', threshold: 1 },
    { id: 'getting-started', threshold: 10 },
    { id: 'veteran', threshold: 100 },
    { id: 'legend', threshold: 500 },
  ]

  for (const milestone of milestones) {
    if (sessions >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check word count achievements
 */
export function checkWordCountAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []
  const words = stats.totalWordsTranscribed

  const wordMilestones = [
    { id: 'chatterbox', threshold: 1000 },
    { id: 'wordsmith', threshold: 10000 },
    { id: 'eloquent', threshold: 50000 },
    { id: 'voice-master', threshold: 100000 },
    { id: 'word-wizard', threshold: 500000 },
  ]

  for (const milestone of wordMilestones) {
    if (words >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check streak achievements
 */
export function checkStreakAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []
  const streak = stats.longestStreak // Use longest streak for fairness

  const streakMilestones = [
    { id: 'committed', threshold: 3 },
    { id: 'dedicated', threshold: 7 },
    { id: 'unstoppable', threshold: 30 },
    { id: 'legendary-streak', threshold: 100 },
  ]

  for (const milestone of streakMilestones) {
    if (streak >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check speed achievements (words per minute)
 */
export function checkSpeedAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []
  const derived = getDerivedStats(stats)
  const wpm = derived.wordsPerMinute

  const speedMilestones = [
    { id: 'fast-talker', threshold: 150 },
    { id: 'speed-demon', threshold: 200 },
    { id: 'lightning', threshold: 250 },
  ]

  for (const milestone of speedMilestones) {
    if (wpm >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check time-based achievements (total recording time)
 */
export function checkTimeAchievements(stats: UserStats, achievements: AchievementsState): string[] {
  const newlyUnlocked: string[] = []
  const derived = getDerivedStats(stats)
  const hours = derived.totalHours

  const timeMilestones = [
    { id: 'marathon', threshold: 1 },
    { id: 'endurance', threshold: 10 },
    { id: 'time-lord', threshold: 50 },
    { id: 'timeless', threshold: 100 },
  ]

  for (const milestone of timeMilestones) {
    if (hours >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check level achievements
 */
export function checkLevelAchievements(
  level: LevelSystem,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []
  const currentLevel = level.level

  const levelMilestones = [
    { id: 'rising-star', threshold: 10 },
    { id: 'power-user', threshold: 25 },
    { id: 'elite', threshold: 50 },
    { id: 'transcendent', threshold: 100 },
  ]

  for (const milestone of levelMilestones) {
    if (currentLevel >= milestone.threshold && !isAchievementUnlocked(achievements, milestone.id)) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check AI mastery achievements (AI formatting, models, titles)
 */
export function checkAIMasteryAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Guard against missing featureUsage (pre-migration or during migration)
  if (!stats.featureUsage) {
    return newlyUnlocked
  }

  const {
    formattingOperations,
    reformattingOperations,
    titleGenerationsCount,
    modelUsageCounts,
    customInstructionsChanges,
  } = stats.featureUsage

  // AI Formatting progression
  const formattingTotal = formattingOperations + reformattingOperations
  const formattingMilestones = [
    { id: 'ai-assistant', threshold: 10 },
    { id: 'formatting-pro', threshold: 100 },
    { id: 'claudes-partner', threshold: 1000 },
  ]

  for (const milestone of formattingMilestones) {
    if (
      formattingTotal >= milestone.threshold &&
      !isAchievementUnlocked(achievements, milestone.id)
    ) {
      newlyUnlocked.push(milestone.id)
    }
  }

  // Model exploration
  const modelsUsed = Object.values(modelUsageCounts).filter((count) => count > 0).length
  if (modelsUsed >= 3 && !isAchievementUnlocked(achievements, 'model-curious')) {
    newlyUnlocked.push('model-curious')
  }

  // Model-specific achievements
  if (modelUsageCounts.sonnet >= 50 && !isAchievementUnlocked(achievements, 'sonnet-fan')) {
    newlyUnlocked.push('sonnet-fan')
  }
  if (modelUsageCounts.opus >= 25 && !isAchievementUnlocked(achievements, 'opus-enthusiast')) {
    newlyUnlocked.push('opus-enthusiast')
  }
  if (modelUsageCounts.haiku >= 100 && !isAchievementUnlocked(achievements, 'haiku-speedster')) {
    newlyUnlocked.push('haiku-speedster')
  }

  // Reformatting achievements
  if (reformattingOperations >= 5 && !isAchievementUnlocked(achievements, 'perfectionist')) {
    newlyUnlocked.push('perfectionist')
  }
  if (
    formattingTotal >= 10 &&
    reformattingOperations >= 10 &&
    !isAchievementUnlocked(achievements, 'version-control')
  ) {
    newlyUnlocked.push('version-control')
  }

  // Title generation
  const titleMilestones = [
    { id: 'title-generator', threshold: 20 },
    { id: 'librarian', threshold: 100 },
  ]

  for (const milestone of titleMilestones) {
    if (
      titleGenerationsCount >= milestone.threshold &&
      !isAchievementUnlocked(achievements, milestone.id)
    ) {
      newlyUnlocked.push(milestone.id)
    }
  }

  // Custom instructions
  if (customInstructionsChanges >= 1 && !isAchievementUnlocked(achievements, 'instruction-giver')) {
    newlyUnlocked.push('instruction-giver')
  }

  return newlyUnlocked
}

/**
 * Check customization achievements (voice commands, word replacements, settings)
 */
export function checkCustomizationAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Guard against missing featureUsage (pre-migration or during migration)
  if (!stats.featureUsage) {
    return newlyUnlocked
  }

  const {
    voiceCommandsUsed,
    customVoiceCommandsAdded,
    wordReplacementsAdded,
    wordReplacementsApplied,
    settingsChanges,
    featureToggles,
    customInstructionsChanges,
  } = stats.featureUsage

  // Voice commands
  if (voiceCommandsUsed >= 1 && !isAchievementUnlocked(achievements, 'voice-commander')) {
    newlyUnlocked.push('voice-commander')
  }
  if (voiceCommandsUsed >= 50 && !isAchievementUnlocked(achievements, 'command-master')) {
    newlyUnlocked.push('command-master')
  }
  if (
    customVoiceCommandsAdded >= 1 &&
    !isAchievementUnlocked(achievements, 'custom-command-creator')
  ) {
    newlyUnlocked.push('custom-command-creator')
  }
  if (customVoiceCommandsAdded >= 5 && !isAchievementUnlocked(achievements, 'command-library')) {
    newlyUnlocked.push('command-library')
  }

  // Word replacements
  if (wordReplacementsAdded >= 1 && !isAchievementUnlocked(achievements, 'word-smith-custom')) {
    newlyUnlocked.push('word-smith-custom')
  }
  if (
    wordReplacementsAdded >= 10 &&
    !isAchievementUnlocked(achievements, 'replacement-architect')
  ) {
    newlyUnlocked.push('replacement-architect')
  }
  if (
    wordReplacementsApplied >= 100 &&
    !isAchievementUnlocked(achievements, 'replacement-veteran')
  ) {
    newlyUnlocked.push('replacement-veteran')
  }

  // Note: case-sensitive-expert and whole-word-master require tracking replacement rule types
  // which we don't have yet - these will need special handling in IPC handlers

  // Settings customization
  if (settingsChanges >= 5 && !isAchievementUnlocked(achievements, 'settings-explorer')) {
    newlyUnlocked.push('settings-explorer')
  }
  if (featureToggles >= 10 && !isAchievementUnlocked(achievements, 'feature-toggler')) {
    newlyUnlocked.push('feature-toggler')
  }

  // Note: personalization-master requires tracking unique settings changed
  // This will need special handling

  // Custom formatting instructions
  if (
    customInstructionsChanges >= 3 &&
    !isAchievementUnlocked(achievements, 'instruction-experimenter')
  ) {
    newlyUnlocked.push('instruction-experimenter')
  }

  return newlyUnlocked
}

/**
 * Check efficiency achievements (keyboard shortcuts, quick workflows, history)
 */
export function checkEfficiencyAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Guard against missing featureUsage (pre-migration or during migration)
  if (!stats.featureUsage) {
    return newlyUnlocked
  }

  const {
    hotkeyUsageCount,
    pasteHotkeyCount,
    recordHotkeyCount,
    hotkeyChanges,
    historySearchCount,
  } = stats.featureUsage

  // Keyboard shortcuts
  if (hotkeyChanges >= 1 && !isAchievementUnlocked(achievements, 'hotkey-hero')) {
    newlyUnlocked.push('hotkey-hero')
  }
  if (hotkeyUsageCount >= 100 && !isAchievementUnlocked(achievements, 'shortcut-master')) {
    newlyUnlocked.push('shortcut-master')
  }
  if (pasteHotkeyCount >= 50 && !isAchievementUnlocked(achievements, 'paste-master')) {
    newlyUnlocked.push('paste-master')
  }
  if (recordHotkeyCount >= 50 && !isAchievementUnlocked(achievements, 'record-ninja')) {
    newlyUnlocked.push('record-ninja')
  }

  // Note: one-session-wonder, productivity-streak, and power-hour require session-level tracking
  // These will need special handling in the session recorder

  // History management
  if (historySearchCount >= 10 && !isAchievementUnlocked(achievements, 'history-hunter')) {
    newlyUnlocked.push('history-hunter')
  }

  // Note: archivist and minimalist require tracking history count and settings
  // These will need special handling

  return newlyUnlocked
}

/**
 * Check integration achievements (terminal paste)
 */
export function checkIntegrationAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Guard against missing featureUsage (pre-migration or during migration)
  if (!stats.featureUsage) {
    return newlyUnlocked
  }

  const { terminalPasteOperations, uniqueTerminalsUsed, terminalUsageCounts } = stats.featureUsage

  // Terminal usage
  if (terminalPasteOperations >= 1 && !isAchievementUnlocked(achievements, 'terminal-novice')) {
    newlyUnlocked.push('terminal-novice')
  }
  if (terminalPasteOperations >= 50 && !isAchievementUnlocked(achievements, 'terminal-veteran')) {
    newlyUnlocked.push('terminal-veteran')
  }

  // Multiple terminals
  const terminalsUsed = uniqueTerminalsUsed.length
  if (terminalsUsed >= 3 && !isAchievementUnlocked(achievements, 'multi-terminal-user')) {
    newlyUnlocked.push('multi-terminal-user')
  }
  if (terminalsUsed >= 8 && !isAchievementUnlocked(achievements, 'terminal-collector')) {
    newlyUnlocked.push('terminal-collector')
  }

  // Note: window-targeter requires tracking window-specific paste operations
  // This will need special handling

  // Terminal-specific achievements
  const vscodeCount =
    (terminalUsageCounts['com.microsoft.VSCode'] || 0) +
    (terminalUsageCounts['com.visualstudio.code.oss'] || 0)
  const cursorCount = terminalUsageCounts['com.todesktop.230313mzl4w4u92'] || 0
  const itermCount = terminalUsageCounts['com.googlecode.iterm2'] || 0

  if (vscodeCount >= 10 && !isAchievementUnlocked(achievements, 'vscode-coder')) {
    newlyUnlocked.push('vscode-coder')
  }
  if (cursorCount >= 10 && !isAchievementUnlocked(achievements, 'cursor-developer')) {
    newlyUnlocked.push('cursor-developer')
  }
  if (itermCount >= 10 && !isAchievementUnlocked(achievements, 'iterm-enthusiast')) {
    newlyUnlocked.push('iterm-enthusiast')
  }

  return newlyUnlocked
}

/**
 * Check exploration achievements (feature discovery, combos)
 */
export function checkExplorationAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  // Guard against missing featureUsage (pre-migration or during migration)
  if (!stats.featureUsage) {
    return newlyUnlocked
  }

  const { featureUsage } = stats

  // Count unique features used (non-zero values)
  const featuresUsed = [
    featureUsage.formattingOperations + featureUsage.reformattingOperations > 0,
    featureUsage.voiceCommandsUsed > 0,
    featureUsage.wordReplacementsApplied > 0,
    featureUsage.terminalPasteOperations > 0,
    featureUsage.hotkeyUsageCount > 0,
    featureUsage.historySearchCount > 0,
  ].filter(Boolean).length

  if (featuresUsed >= 5 && !isAchievementUnlocked(achievements, 'feature-discoverer')) {
    newlyUnlocked.push('feature-discoverer')
  }

  // Microphone selection
  if (
    featureUsage.microphoneChanges >= 1 &&
    !isAchievementUnlocked(achievements, 'microphone-selector')
  ) {
    newlyUnlocked.push('microphone-selector')
  }

  // Transcription Engine Exploration
  const enginesUsed = featureUsage.enginesUsed || []

  // ElevenLabs engine
  if (enginesUsed.includes('elevenlabs') && !isAchievementUnlocked(achievements, 'elevenlabs-explorer')) {
    newlyUnlocked.push('elevenlabs-explorer')
  }

  // Deepgram engine
  if (enginesUsed.includes('deepgram') && !isAchievementUnlocked(achievements, 'deepgram-discoverer')) {
    newlyUnlocked.push('deepgram-discoverer')
  }

  // Engine switcher (changed engine at least once)
  if ((featureUsage.engineChanges || 0) >= 1 && !isAchievementUnlocked(achievements, 'engine-switcher')) {
    newlyUnlocked.push('engine-switcher')
  }

  // Multi-engine master (used both engines)
  if (
    enginesUsed.includes('elevenlabs') &&
    enginesUsed.includes('deepgram') &&
    !isAchievementUnlocked(achievements, 'multi-engine-master')
  ) {
    newlyUnlocked.push('multi-engine-master')
  }

  // Note: jack-of-all-trades, combo-master, experimental-mode, and renaissance-user
  // require more complex tracking and will need special handling

  // Note: api-key-setup requires one-time event tracking
  // This will need special handling in settings

  return newlyUnlocked
}

/**
 * Get progress percentage for a specific achievement
 *
 * @param achievementId - Achievement ID
 * @param stats - Current user statistics
 * @param level - Current level system data
 * @returns Progress percentage (0-100), or null if achievement not found
 */
export function getAchievementProgress(
  achievementId: string,
  stats: UserStats,
  level: LevelSystem
): number | null {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!achievement) return null

  const derived = getDerivedStats(stats)

  // Map achievement IDs to their current progress and thresholds
  const progressMap: Record<string, { current: number; threshold: number }> = {
    // Milestones
    'first-steps': { current: stats.totalSessions, threshold: 1 },
    'getting-started': { current: stats.totalSessions, threshold: 10 },
    veteran: { current: stats.totalSessions, threshold: 100 },
    legend: { current: stats.totalSessions, threshold: 500 },

    // Words
    chatterbox: { current: stats.totalWordsTranscribed, threshold: 1000 },
    wordsmith: { current: stats.totalWordsTranscribed, threshold: 10000 },
    eloquent: { current: stats.totalWordsTranscribed, threshold: 50000 },
    'voice-master': { current: stats.totalWordsTranscribed, threshold: 100000 },
    'word-wizard': { current: stats.totalWordsTranscribed, threshold: 500000 },

    // Streaks
    committed: { current: stats.longestStreak, threshold: 3 },
    dedicated: { current: stats.longestStreak, threshold: 7 },
    unstoppable: { current: stats.longestStreak, threshold: 30 },
    'legendary-streak': { current: stats.longestStreak, threshold: 100 },

    // Speed
    'fast-talker': { current: derived.wordsPerMinute, threshold: 150 },
    'speed-demon': { current: derived.wordsPerMinute, threshold: 200 },
    lightning: { current: derived.wordsPerMinute, threshold: 250 },

    // Time
    marathon: { current: derived.totalHours, threshold: 1 },
    endurance: { current: derived.totalHours, threshold: 10 },
    'time-lord': { current: derived.totalHours, threshold: 50 },
    timeless: { current: derived.totalHours, threshold: 100 },

    // Level
    'rising-star': { current: level.level, threshold: 10 },
    'power-user': { current: level.level, threshold: 25 },
    elite: { current: level.level, threshold: 50 },
    transcendent: { current: level.level, threshold: 100 },
  }

  const progress = progressMap[achievementId]
  if (!progress) return null

  const percentage = Math.min(100, (progress.current / progress.threshold) * 100)
  return Math.floor(percentage)
}
