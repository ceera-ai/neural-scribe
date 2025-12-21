/**
 * Gamification Achievements Module
 *
 * Manages achievement unlocking and tracking.
 *
 * @module store/gamification/achievements
 */

/**
 * Unlocked achievement data
 *
 * @interface UnlockedAchievement
 */
export interface UnlockedAchievement {
  /** When the achievement was unlocked (Unix timestamp) */
  unlockedAt: number
  /** XP awarded for this achievement */
  xpAwarded: number
}

/**
 * Achievement state
 *
 * @interface AchievementsState
 */
export interface AchievementsState {
  /** Map of achievement ID to unlock data */
  unlocked: Record<string, UnlockedAchievement>
}

/**
 * Default achievements state
 */
export const DEFAULT_ACHIEVEMENTS: AchievementsState = {
  unlocked: {},
}

/**
 * Checks if an achievement is unlocked
 *
 * @param {AchievementsState} achievements - Current achievements state
 * @param {string} achievementId - Achievement ID to check
 * @returns {boolean} True if unlocked
 *
 * @example
 * ```typescript
 * if (isAchievementUnlocked(achievements, 'first-session')) {
 *   console.log('First session completed!')
 * }
 * ```
 */
export function isAchievementUnlocked(
  achievements: AchievementsState,
  achievementId: string
): boolean {
  return !!achievements.unlocked[achievementId]
}

/**
 * Unlocks an achievement
 *
 * Only unlocks if not already unlocked. Returns the achievement data
 * and whether it was newly unlocked.
 *
 * @param {AchievementsState} achievements - Current achievements state
 * @param {string} achievementId - Achievement ID to unlock
 * @param {number} xpReward - XP to award for this achievement
 * @returns Object with new state and unlock status
 *
 * @example
 * ```typescript
 * const result = unlockAchievement(achievements, 'word-warrior', 100)
 * if (result.newlyUnlocked) {
 *   console.log('Achievement unlocked! +100 XP')
 *   showAchievementPopup('word-warrior')
 * }
 * ```
 */
export function unlockAchievement(
  achievements: AchievementsState,
  achievementId: string,
  xpReward: number
): {
  achievements: AchievementsState
  newlyUnlocked: boolean
  xpAwarded: number
} {
  // Check if already unlocked
  if (achievements.unlocked[achievementId]) {
    return {
      achievements,
      newlyUnlocked: false,
      xpAwarded: 0,
    }
  }

  // Unlock the achievement
  const unlocked: UnlockedAchievement = {
    unlockedAt: Date.now(),
    xpAwarded: xpReward,
  }

  const updatedAchievements: AchievementsState = {
    ...achievements,
    unlocked: {
      ...achievements.unlocked,
      [achievementId]: unlocked,
    },
  }

  return {
    achievements: updatedAchievements,
    newlyUnlocked: true,
    xpAwarded: xpReward,
  }
}

/**
 * Gets all unlocked achievement IDs
 *
 * @param {AchievementsState} achievements - Current achievements state
 * @returns {string[]} Array of unlocked achievement IDs
 */
export function getUnlockedAchievementIds(achievements: AchievementsState): string[] {
  return Object.keys(achievements.unlocked)
}

/**
 * Gets total XP earned from achievements
 *
 * @param {AchievementsState} achievements - Current achievements state
 * @returns {number} Total XP from all unlocked achievements
 *
 * @example
 * ```typescript
 * const totalXP = getTotalAchievementXP(achievements)
 * console.log(`Earned ${totalXP} XP from ${count} achievements`)
 * ```
 */
export function getTotalAchievementXP(achievements: AchievementsState): number {
  return Object.values(achievements.unlocked).reduce(
    (total, achievement) => total + achievement.xpAwarded,
    0
  )
}

/**
 * Gets achievement unlock time
 *
 * @param {AchievementsState} achievements - Current achievements state
 * @param {string} achievementId - Achievement ID
 * @returns {number | null} Unix timestamp or null if not unlocked
 */
export function getAchievementUnlockTime(
  achievements: AchievementsState,
  achievementId: string
): number | null {
  return achievements.unlocked[achievementId]?.unlockedAt || null
}
