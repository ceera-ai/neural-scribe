/**
 * Gamification Levels Module
 *
 * Handles XP calculations, level progression, and rank assignments.
 * Uses exponential growth for level requirements to maintain engagement.
 *
 * @module store/gamification/levels
 */

/**
 * Level system data
 *
 * @interface LevelSystem
 */
export interface LevelSystem {
  /** Current XP points */
  currentXP: number
  /** Current level */
  level: number
  /** Rank name (e.g., "Initiate", "Scribe") */
  rank: string
  /** XP needed to reach next level */
  xpToNextLevel: number
  /** Total XP accumulated at current level start */
  xpForCurrentLevel: number
  /** Total XP needed to reach next level */
  totalXPForNextLevel: number
}

/**
 * Rank definition
 *
 * @interface Rank
 */
export interface Rank {
  /** Minimum level required for this rank */
  minLevel: number
  /** Rank name */
  name: string
  /** Rank icon emoji */
  icon: string
}

/**
 * All available ranks in ascending order
 *
 * Players progress through ranks as they level up.
 */
export const RANKS: Rank[] = [
  { minLevel: 1, name: 'Initiate', icon: '🌱' },
  { minLevel: 5, name: 'Apprentice', icon: '📝' },
  { minLevel: 10, name: 'Scribe', icon: '✍️' },
  { minLevel: 15, name: 'Transcriber', icon: '🎙️' },
  { minLevel: 20, name: 'Linguist', icon: '🗣️' },
  { minLevel: 30, name: 'Oracle', icon: '🔮' },
  { minLevel: 40, name: 'Cyberscribe', icon: '⚡' },
  { minLevel: 50, name: 'Neural Sage', icon: '🧠' },
  { minLevel: 75, name: 'Transcendent', icon: '✨' },
  { minLevel: 100, name: 'Singularity', icon: '🌌' },
]

/**
 * Base XP required for level 1 → 2
 */
const BASE_XP = 100

/**
 * Exponential growth rate for level requirements
 *
 * Each level requires growthRate^(level-1) times the base XP
 */
const GROWTH_RATE = 1.5

/**
 * Calculates the level from total XP using exponential growth
 *
 * Formula: XP for level N = baseXP * growthRate^(N-1)
 *
 * @param {number} xp - Total XP accumulated
 * @param {number} [baseXP=100] - Base XP for first level
 * @param {number} [growthRate=1.5] - Exponential growth rate
 * @returns {number} Calculated level
 *
 * @example
 * ```typescript
 * calculateLevelFromXP(0)      // Returns 1
 * calculateLevelFromXP(100)    // Returns 2
 * calculateLevelFromXP(250)    // Returns 3 (100 + 150 = 250)
 * calculateLevelFromXP(1000)   // Returns higher level
 * ```
 */
export function calculateLevelFromXP(
  xp: number,
  baseXP: number = BASE_XP,
  growthRate: number = GROWTH_RATE
): number {
  if (xp < 0) return 1

  let level = 1
  let xpRequired = 0

  while (xp >= xpRequired + Math.floor(baseXP * Math.pow(growthRate, level - 1))) {
    xpRequired += Math.floor(baseXP * Math.pow(growthRate, level - 1))
    level++
  }

  return level
}

/**
 * Calculates total XP required to reach a specific level
 *
 * @param {number} level - Target level
 * @param {number} [baseXP=100] - Base XP for first level
 * @param {number} [growthRate=1.5] - Exponential growth rate
 * @returns {number} Total XP needed to reach this level
 *
 * @example
 * ```typescript
 * calculateXPForLevel(1)  // Returns 0 (starting level)
 * calculateXPForLevel(2)  // Returns 100
 * calculateXPForLevel(3)  // Returns 250 (100 + 150)
 * ```
 */
export function calculateXPForLevel(
  level: number,
  baseXP: number = BASE_XP,
  growthRate: number = GROWTH_RATE
): number {
  if (level <= 1) return 0

  let total = 0
  for (let i = 1; i < level; i++) {
    total += Math.floor(baseXP * Math.pow(growthRate, i - 1))
  }

  return total
}

/**
 * Gets the rank for a given level
 *
 * Returns the highest rank the player qualifies for based on their level.
 *
 * @param {number} level - Player level
 * @returns {Rank} Rank information
 *
 * @example
 * ```typescript
 * getRankForLevel(1)   // { minLevel: 1, name: 'Initiate', icon: '🌱' }
 * getRankForLevel(7)   // { minLevel: 5, name: 'Apprentice', icon: '📝' }
 * getRankForLevel(15)  // { minLevel: 15, name: 'Transcriber', icon: '🎙️' }
 * ```
 */
export function getRankForLevel(level: number): Rank {
  // Sort ranks in descending order and find first match
  const sorted = [...RANKS].sort((a, b) => b.minLevel - a.minLevel)
  return sorted.find((r) => level >= r.minLevel) || RANKS[0]
}

/**
 * Creates a complete LevelSystem object from XP
 *
 * Calculates all derived values (level, rank, XP to next level, etc.)
 *
 * @param {number} currentXP - Current XP
 * @returns {LevelSystem} Complete level system data
 *
 * @example
 * ```typescript
 * const levelData = updateLevelFromXP(350)
 * console.log(levelData.level)              // 3
 * console.log(levelData.rank)               // "Initiate"
 * console.log(levelData.xpToNextLevel)      // XP still needed
 * console.log(levelData.xpForCurrentLevel)  // 250
 * console.log(levelData.totalXPForNextLevel)// 475
 * ```
 */
export function updateLevelFromXP(currentXP: number): LevelSystem {
  const level = calculateLevelFromXP(currentXP)
  const rank = getRankForLevel(level)
  const xpForCurrentLevel = calculateXPForLevel(level)
  const totalXPForNextLevel = calculateXPForLevel(level + 1)
  const xpToNextLevel = totalXPForNextLevel - currentXP

  return {
    currentXP,
    level,
    rank: rank.name,
    xpToNextLevel,
    xpForCurrentLevel,
    totalXPForNextLevel,
  }
}

/**
 * Gets XP reward amounts for different actions
 *
 * @returns XP reward configuration
 */
export function getXPRewards() {
  return {
    /** XP per word transcribed */
    perWord: 1,
    /** XP per minute of recording */
    perMinute: 10,
    /** Bonus XP for completing a session */
    sessionBonus: 25,
    /** Daily login bonus */
    dailyBonus: 50,
  }
}
