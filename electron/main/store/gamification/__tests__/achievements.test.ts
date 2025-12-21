/**
 * Tests for Gamification Achievements Module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isAchievementUnlocked,
  unlockAchievement,
  getUnlockedAchievementIds,
  getTotalAchievementXP,
  getAchievementUnlockTime,
  DEFAULT_ACHIEVEMENTS,
  type AchievementsState,
} from '../achievements'

describe('Gamification Achievements Module', () => {
  describe('DEFAULT_ACHIEVEMENTS', () => {
    it('has unlocked property', () => {
      expect(DEFAULT_ACHIEVEMENTS).toHaveProperty('unlocked')
    })

    it('unlocked is empty object', () => {
      expect(DEFAULT_ACHIEVEMENTS.unlocked).toEqual({})
      expect(Object.keys(DEFAULT_ACHIEVEMENTS.unlocked)).toHaveLength(0)
    })
  })

  describe('isAchievementUnlocked', () => {
    it('returns false for empty achievements', () => {
      expect(isAchievementUnlocked(DEFAULT_ACHIEVEMENTS, 'any-id')).toBe(false)
    })

    it('returns false for non-existent achievement', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      expect(isAchievementUnlocked(achievements, 'non-existent')).toBe(false)
    })

    it('returns true for unlocked achievement', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      expect(isAchievementUnlocked(achievements, 'first-session')).toBe(true)
    })

    it('works with multiple achievements', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
          'word-warrior': { unlockedAt: 1234567900, xpAwarded: 100 },
          'speed-demon': { unlockedAt: 1234567910, xpAwarded: 150 },
        },
      }
      expect(isAchievementUnlocked(achievements, 'first-session')).toBe(true)
      expect(isAchievementUnlocked(achievements, 'word-warrior')).toBe(true)
      expect(isAchievementUnlocked(achievements, 'speed-demon')).toBe(true)
      expect(isAchievementUnlocked(achievements, 'not-unlocked')).toBe(false)
    })

    it('handles special characters in achievement IDs', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'test-123_special!': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      expect(isAchievementUnlocked(achievements, 'test-123_special!')).toBe(true)
    })
  })

  describe('unlockAchievement', () => {
    beforeEach(() => {
      // Mock Date.now() for consistent timestamps
      vi.spyOn(Date, 'now').mockReturnValue(1234567890000)
    })

    it('unlocks new achievement', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'first-session', 50)
      expect(result.newlyUnlocked).toBe(true)
      expect(result.xpAwarded).toBe(50)
      expect(result.achievements.unlocked['first-session']).toBeDefined()
    })

    it('sets correct unlockedAt timestamp', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'first-session', 50)
      expect(result.achievements.unlocked['first-session'].unlockedAt).toBe(1234567890000)
    })

    it('sets correct xpAwarded', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'first-session', 75)
      expect(result.achievements.unlocked['first-session'].xpAwarded).toBe(75)
    })

    it('prevents duplicate unlocks', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1111111111, xpAwarded: 50 },
        },
      }

      const result = unlockAchievement(achievements, 'first-session', 100)

      expect(result.newlyUnlocked).toBe(false)
      expect(result.xpAwarded).toBe(0)
      expect(result.achievements.unlocked['first-session'].unlockedAt).toBe(1111111111) // Original timestamp
      expect(result.achievements.unlocked['first-session'].xpAwarded).toBe(50) // Original XP
    })

    it('preserves existing achievements when unlocking new one', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1111111111, xpAwarded: 50 },
        },
      }

      const result = unlockAchievement(achievements, 'word-warrior', 100)

      expect(result.newlyUnlocked).toBe(true)
      expect(result.achievements.unlocked['first-session']).toBeDefined()
      expect(result.achievements.unlocked['word-warrior']).toBeDefined()
      expect(Object.keys(result.achievements.unlocked)).toHaveLength(2)
    })

    it('does not mutate original achievements state', () => {
      const original = { ...DEFAULT_ACHIEVEMENTS }
      unlockAchievement(DEFAULT_ACHIEVEMENTS, 'test', 50)
      expect(DEFAULT_ACHIEVEMENTS).toEqual(original)
    })

    it('handles zero XP reward', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'no-reward', 0)
      expect(result.newlyUnlocked).toBe(true)
      expect(result.xpAwarded).toBe(0)
      expect(result.achievements.unlocked['no-reward'].xpAwarded).toBe(0)
    })

    it('handles large XP rewards', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'mega-achievement', 10000)
      expect(result.xpAwarded).toBe(10000)
      expect(result.achievements.unlocked['mega-achievement'].xpAwarded).toBe(10000)
    })

    it('handles negative XP rewards', () => {
      const result = unlockAchievement(DEFAULT_ACHIEVEMENTS, 'penalty', -50)
      expect(result.xpAwarded).toBe(-50)
      expect(result.achievements.unlocked['penalty'].xpAwarded).toBe(-50)
    })

    it('unlocks multiple achievements sequentially', () => {
      let state = DEFAULT_ACHIEVEMENTS

      const result1 = unlockAchievement(state, 'achievement-1', 50)
      state = result1.achievements

      const result2 = unlockAchievement(state, 'achievement-2', 75)
      state = result2.achievements

      const result3 = unlockAchievement(state, 'achievement-3', 100)

      expect(Object.keys(result3.achievements.unlocked)).toHaveLength(3)
      expect(result3.achievements.unlocked['achievement-1']).toBeDefined()
      expect(result3.achievements.unlocked['achievement-2']).toBeDefined()
      expect(result3.achievements.unlocked['achievement-3']).toBeDefined()
    })
  })

  describe('getUnlockedAchievementIds', () => {
    it('returns empty array for no achievements', () => {
      const ids = getUnlockedAchievementIds(DEFAULT_ACHIEVEMENTS)
      expect(ids).toEqual([])
      expect(ids).toHaveLength(0)
    })

    it('returns single achievement ID', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      const ids = getUnlockedAchievementIds(achievements)
      expect(ids).toEqual(['first-session'])
      expect(ids).toHaveLength(1)
    })

    it('returns multiple achievement IDs', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
          'word-warrior': { unlockedAt: 1234567900, xpAwarded: 100 },
          'speed-demon': { unlockedAt: 1234567910, xpAwarded: 150 },
        },
      }
      const ids = getUnlockedAchievementIds(achievements)
      expect(ids).toHaveLength(3)
      expect(ids).toContain('first-session')
      expect(ids).toContain('word-warrior')
      expect(ids).toContain('speed-demon')
    })

    it('returns array (not modifying original)', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      const ids = getUnlockedAchievementIds(achievements)
      ids.push('fake-id')
      expect(Object.keys(achievements.unlocked)).toHaveLength(1)
    })
  })

  describe('getTotalAchievementXP', () => {
    it('returns 0 for no achievements', () => {
      const total = getTotalAchievementXP(DEFAULT_ACHIEVEMENTS)
      expect(total).toBe(0)
    })

    it('returns XP for single achievement', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      const total = getTotalAchievementXP(achievements)
      expect(total).toBe(50)
    })

    it('sums XP for multiple achievements', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
          'word-warrior': { unlockedAt: 1234567900, xpAwarded: 100 },
          'speed-demon': { unlockedAt: 1234567910, xpAwarded: 150 },
        },
      }
      const total = getTotalAchievementXP(achievements)
      expect(total).toBe(300) // 50 + 100 + 150
    })

    it('handles zero XP achievements', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'no-reward': { unlockedAt: 1234567890, xpAwarded: 0 },
          'some-reward': { unlockedAt: 1234567900, xpAwarded: 75 },
        },
      }
      const total = getTotalAchievementXP(achievements)
      expect(total).toBe(75)
    })

    it('handles negative XP (penalties)', () => {
      const achievements: AchievementsState = {
        unlocked: {
          reward: { unlockedAt: 1234567890, xpAwarded: 100 },
          penalty: { unlockedAt: 1234567900, xpAwarded: -25 },
        },
      }
      const total = getTotalAchievementXP(achievements)
      expect(total).toBe(75) // 100 - 25
    })

    it('handles large XP values', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'mega-1': { unlockedAt: 1234567890, xpAwarded: 5000 },
          'mega-2': { unlockedAt: 1234567900, xpAwarded: 7500 },
          'mega-3': { unlockedAt: 1234567910, xpAwarded: 10000 },
        },
      }
      const total = getTotalAchievementXP(achievements)
      expect(total).toBe(22500)
    })
  })

  describe('getAchievementUnlockTime', () => {
    it('returns null for non-existent achievement', () => {
      const time = getAchievementUnlockTime(DEFAULT_ACHIEVEMENTS, 'non-existent')
      expect(time).toBe(null)
    })

    it('returns null for locked achievement', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890, xpAwarded: 50 },
        },
      }
      const time = getAchievementUnlockTime(achievements, 'other-achievement')
      expect(time).toBe(null)
    })

    it('returns timestamp for unlocked achievement', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1234567890000, xpAwarded: 50 },
        },
      }
      const time = getAchievementUnlockTime(achievements, 'first-session')
      expect(time).toBe(1234567890000)
    })

    it('returns correct timestamps for multiple achievements', () => {
      const achievements: AchievementsState = {
        unlocked: {
          'first-session': { unlockedAt: 1111111111, xpAwarded: 50 },
          'word-warrior': { unlockedAt: 2222222222, xpAwarded: 100 },
          'speed-demon': { unlockedAt: 3333333333, xpAwarded: 150 },
        },
      }

      expect(getAchievementUnlockTime(achievements, 'first-session')).toBe(1111111111)
      expect(getAchievementUnlockTime(achievements, 'word-warrior')).toBe(2222222222)
      expect(getAchievementUnlockTime(achievements, 'speed-demon')).toBe(3333333333)
    })

    it('timestamp can be converted to Date', () => {
      const achievements: AchievementsState = {
        unlocked: {
          test: { unlockedAt: 1234567890000, xpAwarded: 50 },
        },
      }
      const time = getAchievementUnlockTime(achievements, 'test')
      expect(time).not.toBe(null)
      const date = new Date(time!)
      expect(date.toString()).not.toBe('Invalid Date')
    })
  })

  describe('Integration Tests', () => {
    it('full achievement lifecycle', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890000)

      let state = DEFAULT_ACHIEVEMENTS

      // Check initial state
      expect(isAchievementUnlocked(state, 'first-session')).toBe(false)
      expect(getTotalAchievementXP(state)).toBe(0)
      expect(getUnlockedAchievementIds(state)).toHaveLength(0)

      // Unlock achievement
      const result = unlockAchievement(state, 'first-session', 50)
      state = result.achievements

      // Verify unlock
      expect(result.newlyUnlocked).toBe(true)
      expect(result.xpAwarded).toBe(50)
      expect(isAchievementUnlocked(state, 'first-session')).toBe(true)
      expect(getTotalAchievementXP(state)).toBe(50)
      expect(getUnlockedAchievementIds(state)).toEqual(['first-session'])
      expect(getAchievementUnlockTime(state, 'first-session')).toBe(1234567890000)

      // Try to unlock again (should fail)
      const duplicate = unlockAchievement(state, 'first-session', 100)
      expect(duplicate.newlyUnlocked).toBe(false)
      expect(duplicate.xpAwarded).toBe(0)
      expect(getTotalAchievementXP(duplicate.achievements)).toBe(50) // Still 50, not 150
    })

    it('multiple achievements workflow', () => {
      let state = DEFAULT_ACHIEVEMENTS

      // Unlock three achievements
      state = unlockAchievement(state, 'achievement-1', 50).achievements
      state = unlockAchievement(state, 'achievement-2', 75).achievements
      state = unlockAchievement(state, 'achievement-3', 100).achievements

      // Verify all unlocked
      expect(getUnlockedAchievementIds(state)).toHaveLength(3)
      expect(getTotalAchievementXP(state)).toBe(225) // 50 + 75 + 100
      expect(isAchievementUnlocked(state, 'achievement-1')).toBe(true)
      expect(isAchievementUnlocked(state, 'achievement-2')).toBe(true)
      expect(isAchievementUnlocked(state, 'achievement-3')).toBe(true)
      expect(isAchievementUnlocked(state, 'achievement-4')).toBe(false)
    })
  })
})
