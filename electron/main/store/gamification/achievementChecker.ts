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

  // Check each achievement category
  newlyUnlocked.push(...checkMilestoneAchievements(stats, achievements))
  newlyUnlocked.push(...checkWordCountAchievements(stats, achievements))
  newlyUnlocked.push(...checkStreakAchievements(stats, achievements))
  newlyUnlocked.push(...checkSpeedAchievements(stats, achievements))
  newlyUnlocked.push(...checkTimeAchievements(stats, achievements))
  newlyUnlocked.push(...checkLevelAchievements(level, achievements))

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
