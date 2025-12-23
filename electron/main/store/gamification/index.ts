/**
 * Gamification Store Module - Main Orchestrator
 *
 * Coordinates stats tracking, level progression, and achievement unlocking.
 * This is the main entry point for all gamification functionality.
 *
 * @module store/gamification
 */

import Store from 'electron-store'
import { updateLevelFromXP, getXPRewards, type LevelSystem } from './levels'
import {
  updateSessionStats,
  updateStreak,
  getTodayString,
  isActiveToday,
  type UserStats,
  DEFAULT_STATS,
} from './stats'
import { unlockAchievement, type AchievementsState, DEFAULT_ACHIEVEMENTS } from './achievements'
import { checkAchievements } from './achievementChecker'
import { getAchievementById } from '../../gamification/achievementDefinitions'
import { migrateGamificationData, needsMigration, getDataVersion } from './migration'

// Re-export types from sub-modules
export type { LevelSystem, Rank } from './levels'
export type { UserStats } from './stats'
export type { AchievementsState, UnlockedAchievement } from './achievements'

/**
 * Complete gamification data structure
 *
 * @interface GamificationData
 */
export interface GamificationData {
  /** Data format version */
  version: string
  /** User statistics */
  stats: UserStats
  /** Level system data */
  level: LevelSystem
  /** Achievements state */
  achievements: AchievementsState
  /** Metadata */
  metadata: {
    /** Last save timestamp */
    lastSaved: number
    /** Total number of saves */
    totalSaves: number
    /** Number of backups created */
    backupCount: number
  }
}

/**
 * Default gamification data for new users
 */
const DEFAULT_GAMIFICATION_DATA: GamificationData = {
  version: '2.0',
  stats: DEFAULT_STATS,
  level: {
    currentXP: 0,
    level: 1,
    rank: 'Initiate',
    xpToNextLevel: 100,
    xpForCurrentLevel: 0,
    totalXPForNextLevel: 100,
  },
  achievements: DEFAULT_ACHIEVEMENTS,
  metadata: {
    lastSaved: Date.now(),
    totalSaves: 0,
    backupCount: 0,
  },
}

interface GamificationStore {
  gamification: GamificationData
}

const store = new Store<GamificationStore>({
  defaults: {
    gamification: DEFAULT_GAMIFICATION_DATA,
  },
  encryptionKey: 'elevenlabs-transcription-secure-key',
})

// ============================================================================
// Data Access
// ============================================================================

/**
 * Gets all gamification data
 *
 * Automatically migrates data from older versions if needed.
 *
 * @returns {GamificationData} Complete gamification state
 *
 * @example
 * ```typescript
 * const data = getGamificationData()
 * console.log(`Level ${data.level.level} - ${data.level.rank}`)
 * console.log(`${data.stats.currentStreak} day streak`)
 * ```
 */
export function getGamificationData(): GamificationData {
  const rawData = store.get('gamification', DEFAULT_GAMIFICATION_DATA)

  // Check if migration is needed
  if (needsMigration(rawData)) {
    const version = getDataVersion(rawData)
    console.log(`[Gamification] Migrating data from version ${version} to 2.0`)

    const migratedData = migrateGamificationData(rawData)

    // Save migrated data
    store.set('gamification', migratedData)

    console.log('[Gamification] Migration complete, data saved')
    return migratedData
  }

  return rawData
}

/**
 * Sets gamification data directly
 *
 * This is a low-level function used by feature tracking and other internal modules.
 * Use saveGamificationData() for partial updates with automatic metadata handling.
 *
 * @param {GamificationData} data - Complete gamification data to save
 */
export function setGamificationData(data: GamificationData): void {
  store.set('gamification', data)
}

/**
 * Saves gamification data (partial update)
 *
 * Automatically updates metadata (lastSaved, totalSaves).
 *
 * @param {Partial<GamificationData>} data - Data to update
 *
 * @example
 * ```typescript
 * saveGamificationData({
 *   stats: updatedStats,
 *   level: updatedLevel
 * })
 * ```
 */
export function saveGamificationData(data: Partial<GamificationData>): void {
  const current = getGamificationData()
  const updated: GamificationData = {
    ...current,
    ...data,
    metadata: {
      ...current.metadata,
      ...(data.metadata || {}),
      lastSaved: Date.now(),
      totalSaves: current.metadata.totalSaves + 1,
    },
  }

  store.set('gamification', updated)

  // TODO: Create backup every 10 saves
  // if (updated.metadata.totalSaves % 10 === 0) {
  //   createBackup(updated)
  // }
}

// ============================================================================
// Session Recording
// ============================================================================

/**
 * Records a transcription session
 *
 * Updates stats, calculates XP, updates level, and checks streak.
 *
 * @param {number} words - Words transcribed
 * @param {number} durationMs - Session duration in milliseconds
 * @returns Session results including XP gained and level changes
 *
 * @example
 * ```typescript
 * const result = recordGamificationSession(150, 45000)
 * console.log(`+${result.xpGained} XP`)
 * if (result.leveledUp) {
 *   console.log(`Leveled up! ${result.oldLevel} → ${result.newLevel}`)
 * }
 * ```
 */
export function recordGamificationSession(
  words: number,
  durationMs: number
): {
  xpGained: number
  newAchievements: string[]
  leveledUp: boolean
  oldLevel: number
  newLevel: number
} {
  const data = getGamificationData()

  // Update stats
  let updatedStats = updateSessionStats(data.stats, words, durationMs)

  // Update streak
  const today = getTodayString()
  if (!isActiveToday(data.stats)) {
    updatedStats = updateStreak(updatedStats, today)
  }

  // Calculate XP
  const rewards = getXPRewards()
  const wordXP = words * rewards.perWord
  const timeXP = Math.floor(durationMs / 60000) * rewards.perMinute
  const sessionXP = rewards.sessionBonus
  const totalXP = wordXP + timeXP + sessionXP

  const oldLevel = data.level.level
  const oldXP = data.level.currentXP
  const newXP = oldXP + totalXP

  // Update level
  const updatedLevel = updateLevelFromXP(newXP)

  // Check achievements
  const newAchievementIds = checkAchievements(updatedStats, updatedLevel, data.achievements)

  // Unlock and award XP for new achievements
  let achievementXP = 0
  let updatedAchievements = data.achievements

  if (newAchievementIds.length > 0) {
    for (const achievementId of newAchievementIds) {
      const achievement = getAchievementById(achievementId)
      if (achievement) {
        const result = unlockAchievement(updatedAchievements, achievementId, achievement.xpReward)
        if (result.newlyUnlocked) {
          updatedAchievements = result.achievements
          achievementXP += result.xpAwarded
        }
      }
    }
  }

  // Recalculate level with achievement XP bonus
  const finalXP = newXP + achievementXP
  const updatedLevelWithBonus = updateLevelFromXP(finalXP)
  const finalLevel = updatedLevelWithBonus.level
  const finalLeveledUp = finalLevel > oldLevel

  // Save everything
  saveGamificationData({
    stats: updatedStats,
    level: updatedLevelWithBonus,
    achievements: updatedAchievements,
  })

  return {
    xpGained: totalXP + achievementXP,
    newAchievements: newAchievementIds,
    leveledUp: finalLeveledUp,
    oldLevel,
    newLevel: finalLevel,
  }
}

// ============================================================================
// Achievement Management
// ============================================================================

/**
 * Unlocks an achievement and awards XP
 *
 * Automatically updates level if XP gain causes level up.
 * Only unlocks if not already unlocked.
 *
 * @param {string} achievementId - Achievement ID
 * @param {number} xpReward - XP to award
 *
 * @example
 * ```typescript
 * unlockGamificationAchievement('first-session', 100)
 * // Awards 100 XP and may trigger level up
 * ```
 */
export function unlockGamificationAchievement(achievementId: string, xpReward: number): void {
  const data = getGamificationData()

  // Try to unlock
  const result = unlockAchievement(data.achievements, achievementId, xpReward)

  if (!result.newlyUnlocked) {
    return // Already unlocked
  }

  // Add XP and recalculate level
  const newXP = data.level.currentXP + xpReward
  const updatedLevel = updateLevelFromXP(newXP)

  // Save
  saveGamificationData({
    achievements: result.achievements,
    level: updatedLevel,
  })
}

// ============================================================================
// Daily Login Bonus
// ============================================================================

/**
 * Checks and awards daily login bonus
 *
 * Only awards if user hasn't logged in today. Updates streak and awards XP.
 *
 * @returns Bonus information
 *
 * @example
 * ```typescript
 * const result = checkDailyLoginBonus()
 * if (result.bonusAwarded) {
 *   console.log(`+${result.xpGained} XP daily bonus!`)
 *   console.log(`${result.currentStreak} day streak!`)
 * }
 * ```
 */
export function checkDailyLoginBonus(): {
  bonusAwarded: boolean
  xpGained: number
  streakUpdated: boolean
  currentStreak: number
} {
  const data = getGamificationData()
  const today = getTodayString()

  // Check if already logged in today
  if (isActiveToday(data.stats)) {
    return {
      bonusAwarded: false,
      xpGained: 0,
      streakUpdated: false,
      currentStreak: data.stats.currentStreak,
    }
  }

  // Award daily bonus
  const dailyBonus = getXPRewards().dailyBonus
  const updatedStats = updateStreak({ ...data.stats }, today)

  // Add XP and update level
  const newXP = data.level.currentXP + dailyBonus
  const updatedLevel = updateLevelFromXP(newXP)

  // Save
  saveGamificationData({
    stats: updatedStats,
    level: updatedLevel,
  })

  return {
    bonusAwarded: true,
    xpGained: dailyBonus,
    streakUpdated: true,
    currentStreak: updatedStats.currentStreak,
  }
}

// ============================================================================
// Retroactive Achievement Checking
// ============================================================================

/**
 * Checks all achievements based on current stats and unlocks eligible ones
 *
 * This is useful for retroactively unlocking achievements for existing progress
 * or when the achievement system is first initialized.
 *
 * @returns Array of newly unlocked achievement IDs
 */
export function checkAndUnlockAllAchievements(): string[] {
  const data = getGamificationData()

  // Check which achievements should be unlocked
  const newAchievementIds = checkAchievements(data.stats, data.level, data.achievements)

  if (newAchievementIds.length === 0) {
    return []
  }

  console.log('[Gamification] Retroactively unlocking achievements:', newAchievementIds)

  // Unlock each achievement and award XP
  let totalXP = 0
  let updatedAchievements = data.achievements

  for (const achievementId of newAchievementIds) {
    const achievement = getAchievementById(achievementId)
    if (achievement) {
      const result = unlockAchievement(updatedAchievements, achievementId, achievement.xpReward)
      if (result.newlyUnlocked) {
        updatedAchievements = result.achievements
        totalXP += result.xpAwarded
      }
    }
  }

  // Update level with bonus XP
  const newXP = data.level.currentXP + totalXP
  const updatedLevel = updateLevelFromXP(newXP)

  // Save updated data
  saveGamificationData({
    achievements: updatedAchievements,
    level: updatedLevel,
  })

  console.log(
    `[Gamification] Unlocked ${newAchievementIds.length} achievements, awarded ${totalXP} XP`
  )

  return newAchievementIds
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets all gamification progress
 *
 * @warning This operation cannot be undone
 *
 * @example
 * ```typescript
 * resetGamificationProgress()
 * ```
 */
export function resetGamificationProgress(): void {
  store.set('gamification', DEFAULT_GAMIFICATION_DATA)
}
