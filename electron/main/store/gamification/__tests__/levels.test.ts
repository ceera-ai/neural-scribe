/**
 * Tests for Gamification Levels Module
 */

import { describe, it, expect } from 'vitest'
import {
  calculateLevelFromXP,
  calculateXPForLevel,
  getRankForLevel,
  updateLevelFromXP,
  getXPRewards,
  RANKS,
} from '../levels'

describe('Gamification Levels Module', () => {
  describe('calculateLevelFromXP', () => {
    it('returns level 1 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1)
    })

    it('returns level 1 for negative XP', () => {
      expect(calculateLevelFromXP(-100)).toBe(1)
    })

    it('returns level 2 for exactly 100 XP (base XP)', () => {
      expect(calculateLevelFromXP(100)).toBe(2)
    })

    it('returns level 3 for 250 XP (100 + 150)', () => {
      // Level 2 requires 100 XP
      // Level 3 requires 100 + 150 = 250 XP
      expect(calculateLevelFromXP(250)).toBe(3)
    })

    it('returns level 4 for 475 XP (100 + 150 + 225)', () => {
      // Level 2: 100
      // Level 3: 150 (100 * 1.5)
      // Level 4: 225 (100 * 1.5^2)
      // Total: 475
      expect(calculateLevelFromXP(475)).toBe(4)
    })

    it('calculates correct level for large XP amounts', () => {
      const level = calculateLevelFromXP(10000)
      expect(level).toBeGreaterThanOrEqual(10)
      expect(level).toBeLessThan(50)
    })

    it('uses custom base XP when provided', () => {
      expect(calculateLevelFromXP(200, 200, 1.5)).toBe(2)
    })

    it('uses custom growth rate when provided', () => {
      const level1 = calculateLevelFromXP(500, 100, 2.0) // Faster growth
      const level2 = calculateLevelFromXP(500, 100, 1.5) // Normal growth
      expect(level1).toBeLessThan(level2) // Faster growth = higher requirements = lower level
    })

    it('returns consistent results for same XP', () => {
      const xp = 1234
      const level1 = calculateLevelFromXP(xp)
      const level2 = calculateLevelFromXP(xp)
      expect(level1).toBe(level2)
    })
  })

  describe('calculateXPForLevel', () => {
    it('returns 0 for level 1', () => {
      expect(calculateXPForLevel(1)).toBe(0)
    })

    it('returns 0 for level 0 or below', () => {
      expect(calculateXPForLevel(0)).toBe(0)
      expect(calculateXPForLevel(-5)).toBe(0)
    })

    it('returns 100 for level 2', () => {
      expect(calculateXPForLevel(2)).toBe(100)
    })

    it('returns 250 for level 3 (100 + 150)', () => {
      expect(calculateXPForLevel(3)).toBe(250)
    })

    it('returns 475 for level 4 (100 + 150 + 225)', () => {
      expect(calculateXPForLevel(4)).toBe(475)
    })

    it('uses custom base XP when provided', () => {
      expect(calculateXPForLevel(2, 200, 1.5)).toBe(200)
    })

    it('uses custom growth rate when provided', () => {
      const xp1 = calculateXPForLevel(3, 100, 2.0)
      const xp2 = calculateXPForLevel(3, 100, 1.5)
      expect(xp1).toBeGreaterThan(xp2) // Higher growth rate = more XP needed
    })

    it('calculates XP for high levels', () => {
      const xp = calculateXPForLevel(20)
      expect(xp).toBeGreaterThan(10000)
    })

    it('XP requirements grow exponentially', () => {
      const xp10 = calculateXPForLevel(10)
      const xp20 = calculateXPForLevel(20)
      expect(xp20).toBeGreaterThan(xp10 * 10) // Should be much more than 10x
    })
  })

  describe('getRankForLevel', () => {
    it('returns Initiate for level 1', () => {
      const rank = getRankForLevel(1)
      expect(rank.name).toBe('Initiate')
      expect(rank.icon).toBe('🌱')
      expect(rank.minLevel).toBe(1)
    })

    it('returns Initiate for levels 1-4', () => {
      expect(getRankForLevel(1).name).toBe('Initiate')
      expect(getRankForLevel(2).name).toBe('Initiate')
      expect(getRankForLevel(3).name).toBe('Initiate')
      expect(getRankForLevel(4).name).toBe('Initiate')
    })

    it('returns Apprentice for level 5', () => {
      const rank = getRankForLevel(5)
      expect(rank.name).toBe('Apprentice')
      expect(rank.icon).toBe('📝')
    })

    it('returns Apprentice for levels 5-9', () => {
      expect(getRankForLevel(5).name).toBe('Apprentice')
      expect(getRankForLevel(7).name).toBe('Apprentice')
      expect(getRankForLevel(9).name).toBe('Apprentice')
    })

    it('returns Scribe for level 10', () => {
      const rank = getRankForLevel(10)
      expect(rank.name).toBe('Scribe')
      expect(rank.icon).toBe('✍️')
    })

    it('returns Transcriber for level 15', () => {
      const rank = getRankForLevel(15)
      expect(rank.name).toBe('Transcriber')
      expect(rank.icon).toBe('🎙️')
    })

    it('returns Linguist for level 20', () => {
      const rank = getRankForLevel(20)
      expect(rank.name).toBe('Linguist')
      expect(rank.icon).toBe('🗣️')
    })

    it('returns Oracle for level 30', () => {
      const rank = getRankForLevel(30)
      expect(rank.name).toBe('Oracle')
      expect(rank.icon).toBe('🔮')
    })

    it('returns Cyberscribe for level 40', () => {
      const rank = getRankForLevel(40)
      expect(rank.name).toBe('Cyberscribe')
      expect(rank.icon).toBe('⚡')
    })

    it('returns Neural Sage for level 50', () => {
      const rank = getRankForLevel(50)
      expect(rank.name).toBe('Neural Sage')
      expect(rank.icon).toBe('🧠')
    })

    it('returns Transcendent for level 75', () => {
      const rank = getRankForLevel(75)
      expect(rank.name).toBe('Transcendent')
      expect(rank.icon).toBe('✨')
    })

    it('returns Singularity for level 100+', () => {
      expect(getRankForLevel(100).name).toBe('Singularity')
      expect(getRankForLevel(150).name).toBe('Singularity')
      expect(getRankForLevel(1000).name).toBe('Singularity')
    })

    it('returns Singularity with correct icon', () => {
      const rank = getRankForLevel(100)
      expect(rank.icon).toBe('🌌')
    })

    it('handles level 0', () => {
      const rank = getRankForLevel(0)
      expect(rank.name).toBe('Initiate')
    })
  })

  describe('updateLevelFromXP', () => {
    it('creates correct LevelSystem for 0 XP', () => {
      const system = updateLevelFromXP(0)
      expect(system.currentXP).toBe(0)
      expect(system.level).toBe(1)
      expect(system.rank).toBe('Initiate')
      expect(system.xpForCurrentLevel).toBe(0)
      expect(system.totalXPForNextLevel).toBe(100)
      expect(system.xpToNextLevel).toBe(100)
    })

    it('creates correct LevelSystem for 50 XP (mid-level)', () => {
      const system = updateLevelFromXP(50)
      expect(system.currentXP).toBe(50)
      expect(system.level).toBe(1)
      expect(system.rank).toBe('Initiate')
      expect(system.xpToNextLevel).toBe(50) // 100 - 50
    })

    it('creates correct LevelSystem for exactly 100 XP', () => {
      const system = updateLevelFromXP(100)
      expect(system.currentXP).toBe(100)
      expect(system.level).toBe(2)
      expect(system.rank).toBe('Initiate')
      expect(system.xpForCurrentLevel).toBe(100)
      expect(system.totalXPForNextLevel).toBe(250)
      expect(system.xpToNextLevel).toBe(150) // 250 - 100
    })

    it('creates correct LevelSystem for 250 XP (level 3)', () => {
      const system = updateLevelFromXP(250)
      expect(system.currentXP).toBe(250)
      expect(system.level).toBe(3)
      expect(system.rank).toBe('Initiate')
      expect(system.xpForCurrentLevel).toBe(250)
      expect(system.totalXPForNextLevel).toBe(475)
      expect(system.xpToNextLevel).toBe(225) // 475 - 250
    })

    it('includes correct rank for higher levels', () => {
      const system = updateLevelFromXP(10000)
      expect(system.level).toBeGreaterThanOrEqual(10)
      expect(['Scribe', 'Transcriber', 'Linguist', 'Oracle']).toContain(system.rank)
    })

    it('calculates xpToNextLevel correctly', () => {
      const system = updateLevelFromXP(300)
      const expected = system.totalXPForNextLevel - system.currentXP
      expect(system.xpToNextLevel).toBe(expected)
    })

    it('xpToNextLevel is always positive', () => {
      const testCases = [0, 100, 250, 500, 1000, 5000]
      testCases.forEach((xp) => {
        const system = updateLevelFromXP(xp)
        expect(system.xpToNextLevel).toBeGreaterThan(0)
      })
    })

    it('has all required properties', () => {
      const system = updateLevelFromXP(123)
      expect(system).toHaveProperty('currentXP')
      expect(system).toHaveProperty('level')
      expect(system).toHaveProperty('rank')
      expect(system).toHaveProperty('xpToNextLevel')
      expect(system).toHaveProperty('xpForCurrentLevel')
      expect(system).toHaveProperty('totalXPForNextLevel')
    })
  })

  describe('getXPRewards', () => {
    it('returns reward configuration object', () => {
      const rewards = getXPRewards()
      expect(rewards).toBeDefined()
      expect(typeof rewards).toBe('object')
    })

    it('has perWord reward', () => {
      const rewards = getXPRewards()
      expect(rewards.perWord).toBe(1)
    })

    it('has perMinute reward', () => {
      const rewards = getXPRewards()
      expect(rewards.perMinute).toBe(10)
    })

    it('has sessionBonus reward', () => {
      const rewards = getXPRewards()
      expect(rewards.sessionBonus).toBe(25)
    })

    it('has dailyBonus reward', () => {
      const rewards = getXPRewards()
      expect(rewards.dailyBonus).toBe(50)
    })

    it('all rewards are positive numbers', () => {
      const rewards = getXPRewards()
      expect(rewards.perWord).toBeGreaterThan(0)
      expect(rewards.perMinute).toBeGreaterThan(0)
      expect(rewards.sessionBonus).toBeGreaterThan(0)
      expect(rewards.dailyBonus).toBeGreaterThan(0)
    })
  })

  describe('RANKS constant', () => {
    it('has 10 ranks', () => {
      expect(RANKS).toHaveLength(10)
    })

    it('all ranks have required properties', () => {
      RANKS.forEach((rank) => {
        expect(rank).toHaveProperty('minLevel')
        expect(rank).toHaveProperty('name')
        expect(rank).toHaveProperty('icon')
      })
    })

    it('ranks are in ascending order by minLevel', () => {
      for (let i = 1; i < RANKS.length; i++) {
        expect(RANKS[i].minLevel).toBeGreaterThan(RANKS[i - 1].minLevel)
      }
    })

    it('first rank starts at level 1', () => {
      expect(RANKS[0].minLevel).toBe(1)
    })

    it('last rank is Singularity at level 100', () => {
      const lastRank = RANKS[RANKS.length - 1]
      expect(lastRank.name).toBe('Singularity')
      expect(lastRank.minLevel).toBe(100)
    })

    it('all rank names are unique', () => {
      const names = RANKS.map((r) => r.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(RANKS.length)
    })

    it('all rank icons are non-empty strings', () => {
      RANKS.forEach((rank) => {
        expect(rank.icon).toBeTruthy()
        expect(typeof rank.icon).toBe('string')
        expect(rank.icon.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Level-Rank Integration', () => {
    it('level and rank progression is consistent', () => {
      // Test that as XP increases, both level and rank progress correctly
      const xpProgression = [0, 100, 500, 1000, 5000, 10000, 50000]
      let previousLevel = 0

      xpProgression.forEach((xp) => {
        const system = updateLevelFromXP(xp)
        expect(system.level).toBeGreaterThanOrEqual(previousLevel)
        previousLevel = system.level
      })
    })

    it('rank changes occur at correct level boundaries', () => {
      const testCases = [
        { level: 4, expectedRank: 'Initiate' },
        { level: 5, expectedRank: 'Apprentice' },
        { level: 9, expectedRank: 'Apprentice' },
        { level: 10, expectedRank: 'Scribe' },
        { level: 14, expectedRank: 'Scribe' },
        { level: 15, expectedRank: 'Transcriber' },
      ]

      testCases.forEach(({ level, expectedRank }) => {
        const xp = calculateXPForLevel(level)
        const system = updateLevelFromXP(xp)
        expect(system.rank).toBe(expectedRank)
      })
    })
  })

  describe('Edge Cases and Boundaries', () => {
    it('handles maximum safe integer XP', () => {
      const maxXP = Number.MAX_SAFE_INTEGER
      expect(() => calculateLevelFromXP(maxXP)).not.toThrow()
      const level = calculateLevelFromXP(maxXP)
      expect(level).toBeGreaterThan(1)
    })

    it('level boundaries are exact', () => {
      // Test that XP at level boundary gives correct level
      const level3XP = calculateXPForLevel(3)
      expect(calculateLevelFromXP(level3XP)).toBe(3)
      expect(calculateLevelFromXP(level3XP - 1)).toBe(2)
    })

    it('fractional XP is handled correctly', () => {
      expect(calculateLevelFromXP(99.9)).toBe(1)
      expect(calculateLevelFromXP(100.1)).toBe(2)
    })
  })
})
