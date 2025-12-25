/**
 * Gamification-related constants for the Neural Scribe application
 */

export const GAMIFICATION = {
  // XP Rewards
  XP_PER_WORD: 1,
  XP_PER_MINUTE: 10,
  XP_PER_SESSION: 25,
  DAILY_LOGIN_BONUS_XP: 50,

  // Level System
  LEVEL_BASE_XP: 100,
  LEVEL_GROWTH_RATE: 1.5,

  // Achievements
  TOTAL_ACHIEVEMENTS: 32,
} as const
