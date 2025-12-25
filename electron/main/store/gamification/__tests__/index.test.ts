/**
 * Tests for Gamification Index Module (Main Orchestrator)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock electron-store BEFORE imports
vi.mock('electron-store', () => {
  const defaultData = {
    gamification: {
      version: '2.0',
      stats: {
        totalWordsTranscribed: 0,
        totalRecordingTimeMs: 0,
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        firstSessionDate: '2025-12-20',
      },
      level: {
        currentXP: 0,
        level: 1,
        rank: 'Initiate',
        xpToNextLevel: 100,
        xpForCurrentLevel: 0,
        totalXPForNextLevel: 100,
      },
      achievements: {
        unlocked: {},
      },
      metadata: {
        lastSaved: 1234567890000,
        totalSaves: 0,
        backupCount: 0,
      },
    },
  }

  let mockData: any = JSON.parse(JSON.stringify(defaultData))

  return {
    default: class MockStore {
      constructor() {}
      get(key: string, defaultValue?: any) {
        if (key === 'gamification') {
          return mockData.gamification || defaultValue
        }
        return mockData[key] !== undefined ? mockData[key] : defaultValue
      }
      set(key: string, value: any) {
        mockData[key] = value
      }
      clear() {
        mockData = JSON.parse(JSON.stringify(defaultData))
      }
      // Add reset method for tests
      reset() {
        mockData = JSON.parse(JSON.stringify(defaultData))
      }
    },
  }
})

import {
  getGamificationData,
  saveGamificationData,
  recordGamificationSession,
  unlockGamificationAchievement,
  checkDailyLoginBonus,
  resetGamificationProgress,
} from '../index'

describe('Gamification Index Module', () => {
  beforeEach(() => {
    // Reset store before each test
    vi.clearAllMocks()
    resetGamificationProgress()
  })

  describe('getGamificationData', () => {
    it('returns gamification data', () => {
      const data = getGamificationData()
      expect(data).toBeDefined()
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('level')
      expect(data).toHaveProperty('achievements')
      expect(data).toHaveProperty('metadata')
    })

    it('returns default data for new user', () => {
      const data = getGamificationData()
      expect(data.version).toBe('2.0')
      expect(data.stats.totalSessions).toBe(0)
      expect(data.level.level).toBe(1)
      expect(data.level.rank).toBe('Initiate')
      expect(Object.keys(data.achievements.unlocked)).toHaveLength(0)
    })

    it('has metadata with required properties', () => {
      const data = getGamificationData()
      expect(data.metadata).toHaveProperty('lastSaved')
      expect(data.metadata).toHaveProperty('totalSaves')
      expect(data.metadata).toHaveProperty('backupCount')
    })
  })

  describe('saveGamificationData', () => {
    it('saves partial data', () => {
      const initialData = getGamificationData()
      const updatedStats = {
        ...initialData.stats,
        totalSessions: 5,
        totalWordsTranscribed: 500,
      }

      saveGamificationData({ stats: updatedStats })

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(5)
      expect(data.stats.totalWordsTranscribed).toBe(500)
      expect(data.level).toEqual(initialData.level) // Unchanged
    })

    it('updates metadata on save', () => {
      const initialData = getGamificationData()
      const initialSaves = initialData.metadata.totalSaves

      vi.spyOn(Date, 'now').mockReturnValue(9999999999)
      saveGamificationData({ stats: initialData.stats })

      const data = getGamificationData()
      expect(data.metadata.totalSaves).toBe(initialSaves + 1)
      expect(data.metadata.lastSaved).toBe(9999999999)
    })

    it('increments totalSaves on each save', () => {
      saveGamificationData({})
      expect(getGamificationData().metadata.totalSaves).toBe(1)

      saveGamificationData({})
      expect(getGamificationData().metadata.totalSaves).toBe(2)

      saveGamificationData({})
      expect(getGamificationData().metadata.totalSaves).toBe(3)
    })

    it('preserves existing data when updating partial', () => {
      const initialData = getGamificationData()

      // Update only stats
      saveGamificationData({
        stats: { ...initialData.stats, totalSessions: 10 },
      })

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(10)
      expect(data.level).toEqual(initialData.level)
      expect(data.achievements).toEqual(initialData.achievements)
    })
  })

  describe('recordGamificationSession', () => {
    it('records session and returns result', () => {
      const result = recordGamificationSession(100, 60000)

      expect(result).toHaveProperty('xpGained')
      expect(result).toHaveProperty('newAchievements')
      expect(result).toHaveProperty('leveledUp')
      expect(result).toHaveProperty('oldLevel')
      expect(result).toHaveProperty('newLevel')
    })

    it('calculates XP correctly (words + time + session bonus + achievement)', () => {
      // 100 words * 1 XP = 100
      // 60000ms = 1 minute * 10 XP = 10
      // session bonus = 25
      // first-steps achievement = 50 (first session always unlocks this)
      // Total = 185 XP
      const result = recordGamificationSession(100, 60000)
      expect(result.xpGained).toBe(185)
    })

    it('updates stats correctly', () => {
      recordGamificationSession(150, 45000)

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(1)
      expect(data.stats.totalWordsTranscribed).toBe(150)
      expect(data.stats.totalRecordingTimeMs).toBe(45000)
    })

    it('accumulates stats over multiple sessions', () => {
      recordGamificationSession(100, 30000)
      recordGamificationSession(150, 45000)
      recordGamificationSession(200, 60000)

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(3)
      expect(data.stats.totalWordsTranscribed).toBe(450)
      expect(data.stats.totalRecordingTimeMs).toBe(135000)
    })

    it('updates level when enough XP gained', () => {
      // 75 words + 0 minutes + session bonus (25) + first-steps (50) = 150 XP
      // Need 100 XP for level 2, so this will level up
      const result = recordGamificationSession(75, 0)

      expect(result.leveledUp).toBe(true)
      expect(result.oldLevel).toBe(1)
      expect(result.newLevel).toBe(2)

      const data = getGamificationData()
      expect(data.level.level).toBe(2)
      expect(data.level.currentXP).toBe(150)
    })

    it('does not level up with insufficient XP', () => {
      // First session gets to level 2 with 150 XP (need 200 for level 3)
      recordGamificationSession(75, 0) // 75 + 25 + 50 (achievement) = 150 XP

      // Second session with minimal XP (no achievements unlocked)
      // 0 words + 0 minutes + session bonus (25) = 25 XP
      // Total: 150 + 25 = 175 XP (still less than 200 needed for level 3)
      const result = recordGamificationSession(0, 0)

      expect(result.leveledUp).toBe(false)
      expect(result.oldLevel).toBe(2)
      expect(result.newLevel).toBe(2)
    })

    it('updates streak on first session of the day', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      recordGamificationSession(100, 30000)

      const data = getGamificationData()
      expect(data.stats.lastActiveDate).toBe('2025-12-20')
      expect(data.stats.currentStreak).toBe(1)
    })

    it('does not update streak on second session same day', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      recordGamificationSession(100, 30000)
      const data1 = getGamificationData()
      const streak1 = data1.stats.currentStreak

      recordGamificationSession(100, 30000)
      const data2 = getGamificationData()

      expect(data2.stats.currentStreak).toBe(streak1) // No change
    })

    it('handles zero words', () => {
      const result = recordGamificationSession(0, 60000)
      // 0 words + 1 minute (10 XP) + session bonus (25) + first-steps (50) = 85 XP
      expect(result.xpGained).toBe(85)
    })

    it('handles zero duration', () => {
      const result = recordGamificationSession(100, 0)
      // 100 words + 0 minutes + session bonus (25) + first-steps (50) = 175 XP
      expect(result.xpGained).toBe(175)
    })

    it('unlocks first-steps achievement on first session', () => {
      const result = recordGamificationSession(100, 60000)
      expect(result.newAchievements).toEqual(['first-steps'])
      expect(result.xpGained).toBe(185) // Includes achievement bonus
    })
  })

  describe('unlockGamificationAchievement', () => {
    it('unlocks new achievement', () => {
      unlockGamificationAchievement('first-session', 100)

      const data = getGamificationData()
      expect(data.achievements.unlocked['first-session']).toBeDefined()
      expect(data.achievements.unlocked['first-session'].xpAwarded).toBe(100)
    })

    it('awards XP when unlocking', () => {
      const initialData = getGamificationData()
      const initialXP = initialData.level.currentXP

      unlockGamificationAchievement('first-session', 50)

      const data = getGamificationData()
      expect(data.level.currentXP).toBe(initialXP + 50)
    })

    it('updates level if XP causes level up', () => {
      unlockGamificationAchievement('mega-achievement', 150)

      const data = getGamificationData()
      expect(data.level.level).toBeGreaterThan(1) // Should level up with 150 XP
      expect(data.level.currentXP).toBe(150)
    })

    it('does not unlock achievement twice', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1111111111)
      unlockGamificationAchievement('test', 100)

      const data1 = getGamificationData()
      const xp1 = data1.level.currentXP

      vi.spyOn(Date, 'now').mockReturnValue(2222222222)
      unlockGamificationAchievement('test', 100) // Try again

      const data2 = getGamificationData()
      expect(data2.level.currentXP).toBe(xp1) // No additional XP
      expect(data2.achievements.unlocked['test'].unlockedAt).toBe(1111111111) // Original timestamp
    })

    it('can unlock multiple achievements', () => {
      unlockGamificationAchievement('achievement-1', 50)
      unlockGamificationAchievement('achievement-2', 75)
      unlockGamificationAchievement('achievement-3', 100)

      const data = getGamificationData()
      expect(Object.keys(data.achievements.unlocked)).toHaveLength(3)
      expect(data.level.currentXP).toBe(225) // 50 + 75 + 100
    })
  })

  describe('checkDailyLoginBonus', () => {
    it('awards bonus on first login of the day', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      const result = checkDailyLoginBonus()

      expect(result.bonusAwarded).toBe(true)
      expect(result.xpGained).toBe(50) // Daily bonus
      expect(result.streakUpdated).toBe(true)
      expect(result.currentStreak).toBe(1)
    })

    it('updates lastActiveDate', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      checkDailyLoginBonus()

      const data = getGamificationData()
      expect(data.stats.lastActiveDate).toBe('2025-12-20')
    })

    it('awards XP and updates level', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      const initialData = getGamificationData()
      const initialXP = initialData.level.currentXP

      checkDailyLoginBonus()

      const data = getGamificationData()
      expect(data.level.currentXP).toBe(initialXP + 50)
    })

    it('does not award bonus twice on same day', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      checkDailyLoginBonus()
      const data1 = getGamificationData()
      const xp1 = data1.level.currentXP

      const result = checkDailyLoginBonus()

      expect(result.bonusAwarded).toBe(false)
      expect(result.xpGained).toBe(0)
      expect(result.streakUpdated).toBe(false)

      const data2 = getGamificationData()
      expect(data2.level.currentXP).toBe(xp1) // No change
    })

    it('increments streak on consecutive days', () => {
      // Day 1
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')
      const result1 = checkDailyLoginBonus()
      expect(result1.currentStreak).toBe(1)

      // Day 2
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-21T12:00:00.000Z')
      const result2 = checkDailyLoginBonus()
      expect(result2.currentStreak).toBe(2)
      expect(result2.bonusAwarded).toBe(true)
    })

    it('resets streak after gap', () => {
      // Day 1
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')
      checkDailyLoginBonus()

      // Day 4 (3 day gap)
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-23T12:00:00.000Z')
      const result = checkDailyLoginBonus()
      expect(result.currentStreak).toBe(1) // Reset
    })
  })

  describe('resetGamificationProgress', () => {
    it('resets all data to defaults', () => {
      // Make some changes
      recordGamificationSession(100, 60000)
      unlockGamificationAchievement('test', 50)

      // Reset
      resetGamificationProgress()

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(0)
      expect(data.stats.totalWordsTranscribed).toBe(0)
      expect(data.level.level).toBe(1)
      expect(data.level.currentXP).toBe(0)
      expect(Object.keys(data.achievements.unlocked)).toHaveLength(0)
    })

    it('resets metadata', () => {
      // Make multiple saves
      saveGamificationData({})
      saveGamificationData({})

      resetGamificationProgress()

      const data = getGamificationData()
      expect(data.metadata.totalSaves).toBe(0)
    })

    it('resets streak', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')
      checkDailyLoginBonus()

      resetGamificationProgress()

      const data = getGamificationData()
      expect(data.stats.currentStreak).toBe(0)
      expect(data.stats.longestStreak).toBe(0)
      expect(data.stats.lastActiveDate).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('complete user journey: session → level up → achievement', () => {
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')

      // Daily login bonus
      const login = checkDailyLoginBonus()
      expect(login.bonusAwarded).toBe(true)
      expect(login.xpGained).toBe(50)

      // Record session: 75 words + 25 session bonus + 50 first-steps achievement = 150 XP
      const session = recordGamificationSession(75, 0)
      expect(session.xpGained).toBe(150)
      expect(session.leveledUp).toBe(true) // 50 (login) + 150 (session) = 200 XP, level 2

      // Unlock additional achievement
      unlockGamificationAchievement('first-level-up', 100)

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(1)
      expect(data.stats.currentStreak).toBe(1)
      expect(data.level.currentXP).toBe(300) // 50 (login) + 150 (session) + 100 (achievement)
      expect(data.level.level).toBe(3) // With 300 XP
      expect(Object.keys(data.achievements.unlocked)).toHaveLength(2) // first-steps + first-level-up
    })

    it('multi-day streak with sessions', () => {
      // Day 1
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-20T12:00:00.000Z')
      checkDailyLoginBonus()
      recordGamificationSession(100, 60000)

      let data = getGamificationData()
      expect(data.stats.currentStreak).toBe(1)
      expect(data.stats.totalSessions).toBe(1)

      // Day 2
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-21T12:00:00.000Z')
      checkDailyLoginBonus()
      recordGamificationSession(100, 60000)

      data = getGamificationData()
      expect(data.stats.currentStreak).toBe(2)
      expect(data.stats.totalSessions).toBe(2)

      // Day 3
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-12-22T12:00:00.000Z')
      checkDailyLoginBonus()
      recordGamificationSession(100, 60000)

      data = getGamificationData()
      expect(data.stats.currentStreak).toBe(3)
      expect(data.stats.longestStreak).toBe(3)
      expect(data.stats.totalSessions).toBe(3)
    })

    it('data persists across multiple operations', () => {
      // Session 1: 50 words + 25 session bonus + 50 first-steps = 125 XP
      recordGamificationSession(50, 30000)
      // Manually unlock achievement
      unlockGamificationAchievement('test', 25)
      // Session 2: 50 words + 25 session bonus = 75 XP (no new achievements)
      recordGamificationSession(50, 30000)
      // Update metadata
      saveGamificationData({ metadata: { backupCount: 5 } })

      const data = getGamificationData()
      expect(data.stats.totalSessions).toBe(2)
      expect(data.stats.totalWordsTranscribed).toBe(100)
      expect(data.level.currentXP).toBe(225) // 125 (session 1) + 25 (achievement) + 75 (session 2)
      expect(Object.keys(data.achievements.unlocked)).toHaveLength(2) // first-steps + test
      expect(data.metadata.backupCount).toBe(5)
    })
  })
})
