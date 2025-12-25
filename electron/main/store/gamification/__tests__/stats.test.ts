/**
 * Tests for Gamification Stats Module
 */

import { describe, it, expect } from 'vitest'
import {
  updateSessionStats,
  updateStreak,
  getDerivedStats,
  getTodayString,
  isActiveToday,
  DEFAULT_STATS,
  type UserStats,
} from '../stats'

describe('Gamification Stats Module', () => {
  describe('DEFAULT_STATS', () => {
    it('has all required properties', () => {
      expect(DEFAULT_STATS).toHaveProperty('totalWordsTranscribed')
      expect(DEFAULT_STATS).toHaveProperty('totalRecordingTimeMs')
      expect(DEFAULT_STATS).toHaveProperty('totalSessions')
      expect(DEFAULT_STATS).toHaveProperty('currentStreak')
      expect(DEFAULT_STATS).toHaveProperty('longestStreak')
      expect(DEFAULT_STATS).toHaveProperty('lastActiveDate')
      expect(DEFAULT_STATS).toHaveProperty('firstSessionDate')
    })

    it('initializes counters to zero', () => {
      expect(DEFAULT_STATS.totalWordsTranscribed).toBe(0)
      expect(DEFAULT_STATS.totalRecordingTimeMs).toBe(0)
      expect(DEFAULT_STATS.totalSessions).toBe(0)
      expect(DEFAULT_STATS.currentStreak).toBe(0)
      expect(DEFAULT_STATS.longestStreak).toBe(0)
    })

    it('has empty lastActiveDate', () => {
      expect(DEFAULT_STATS.lastActiveDate).toBe('')
    })

    it('has firstSessionDate in YYYY-MM-DD format', () => {
      expect(DEFAULT_STATS.firstSessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('updateSessionStats', () => {
    const baseStats: UserStats = {
      totalWordsTranscribed: 100,
      totalRecordingTimeMs: 30000,
      totalSessions: 2,
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2025-12-19',
      firstSessionDate: '2025-12-01',
    }

    it('increments totalWordsTranscribed', () => {
      const updated = updateSessionStats(baseStats, 50, 10000)
      expect(updated.totalWordsTranscribed).toBe(150)
    })

    it('increments totalRecordingTimeMs', () => {
      const updated = updateSessionStats(baseStats, 50, 10000)
      expect(updated.totalRecordingTimeMs).toBe(40000)
    })

    it('increments totalSessions', () => {
      const updated = updateSessionStats(baseStats, 50, 10000)
      expect(updated.totalSessions).toBe(3)
    })

    it('preserves other properties unchanged', () => {
      const updated = updateSessionStats(baseStats, 50, 10000)
      expect(updated.currentStreak).toBe(3)
      expect(updated.longestStreak).toBe(5)
      expect(updated.lastActiveDate).toBe('2025-12-19')
      expect(updated.firstSessionDate).toBe('2025-12-01')
    })

    it('handles zero words', () => {
      const updated = updateSessionStats(baseStats, 0, 10000)
      expect(updated.totalWordsTranscribed).toBe(100)
      expect(updated.totalSessions).toBe(3)
    })

    it('handles zero duration', () => {
      const updated = updateSessionStats(baseStats, 50, 0)
      expect(updated.totalRecordingTimeMs).toBe(30000)
      expect(updated.totalSessions).toBe(3)
    })

    it('works with DEFAULT_STATS', () => {
      const updated = updateSessionStats(DEFAULT_STATS, 100, 45000)
      expect(updated.totalWordsTranscribed).toBe(100)
      expect(updated.totalRecordingTimeMs).toBe(45000)
      expect(updated.totalSessions).toBe(1)
    })

    it('handles large numbers', () => {
      const updated = updateSessionStats(baseStats, 10000, 3600000)
      expect(updated.totalWordsTranscribed).toBe(10100)
      expect(updated.totalRecordingTimeMs).toBe(3630000)
    })

    it('does not mutate original stats', () => {
      const original = { ...baseStats }
      updateSessionStats(baseStats, 50, 10000)
      expect(baseStats).toEqual(original)
    })
  })

  describe('updateStreak', () => {
    const baseStats: UserStats = {
      totalWordsTranscribed: 100,
      totalRecordingTimeMs: 30000,
      totalSessions: 2,
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2025-12-19',
      firstSessionDate: '2025-12-01',
    }

    it('returns unchanged stats if already active today', () => {
      const updated = updateStreak(baseStats, '2025-12-19')
      expect(updated).toEqual(baseStats)
    })

    it('increments streak for consecutive day', () => {
      const updated = updateStreak(baseStats, '2025-12-20')
      expect(updated.currentStreak).toBe(4)
      expect(updated.lastActiveDate).toBe('2025-12-20')
    })

    it('updates longestStreak when current exceeds it', () => {
      const stats = { ...baseStats, currentStreak: 5, longestStreak: 5 }
      const updated = updateStreak(stats, '2025-12-20')
      expect(updated.currentStreak).toBe(6)
      expect(updated.longestStreak).toBe(6)
    })

    it('preserves longestStreak when current is below it', () => {
      const updated = updateStreak(baseStats, '2025-12-20')
      expect(updated.currentStreak).toBe(4)
      expect(updated.longestStreak).toBe(5) // Unchanged
    })

    it('resets streak to 1 after gap >1 day', () => {
      const updated = updateStreak(baseStats, '2025-12-22') // 3 days gap
      expect(updated.currentStreak).toBe(1)
      expect(updated.lastActiveDate).toBe('2025-12-22')
    })

    it('preserves longestStreak when streak is reset', () => {
      const updated = updateStreak(baseStats, '2025-12-25')
      expect(updated.currentStreak).toBe(1)
      expect(updated.longestStreak).toBe(5) // Preserved
    })

    it('handles first session ever (empty lastActiveDate)', () => {
      const stats = { ...baseStats, lastActiveDate: '', currentStreak: 0, longestStreak: 0 }
      const updated = updateStreak(stats, '2025-12-20')
      expect(updated.currentStreak).toBe(1)
      expect(updated.longestStreak).toBe(1)
      expect(updated.lastActiveDate).toBe('2025-12-20')
    })

    it('handles first session with existing longestStreak', () => {
      const stats = { ...baseStats, lastActiveDate: '', currentStreak: 0, longestStreak: 10 }
      const updated = updateStreak(stats, '2025-12-20')
      expect(updated.currentStreak).toBe(1)
      expect(updated.longestStreak).toBe(10) // Preserved
    })

    it('handles 2-day gap correctly (resets)', () => {
      const updated = updateStreak(baseStats, '2025-12-21') // 2 days gap
      expect(updated.currentStreak).toBe(1)
    })

    it('preserves other stats unchanged', () => {
      const updated = updateStreak(baseStats, '2025-12-20')
      expect(updated.totalWordsTranscribed).toBe(100)
      expect(updated.totalRecordingTimeMs).toBe(30000)
      expect(updated.totalSessions).toBe(2)
      expect(updated.firstSessionDate).toBe('2025-12-01')
    })

    it('does not mutate original stats', () => {
      const original = { ...baseStats }
      updateStreak(baseStats, '2025-12-20')
      expect(baseStats).toEqual(original)
    })

    it('handles year boundaries correctly', () => {
      const stats = { ...baseStats, lastActiveDate: '2025-12-31' }
      const updated = updateStreak(stats, '2026-01-01')
      expect(updated.currentStreak).toBe(4) // Consecutive
    })

    it('handles month boundaries correctly', () => {
      const stats = { ...baseStats, lastActiveDate: '2025-11-30' }
      const updated = updateStreak(stats, '2025-12-01')
      expect(updated.currentStreak).toBe(4) // Consecutive
    })

    it('calculates day difference correctly', () => {
      const stats = { ...baseStats, lastActiveDate: '2025-12-15' }
      const updated = updateStreak(stats, '2025-12-20') // 5 days gap
      expect(updated.currentStreak).toBe(1) // Reset
    })
  })

  describe('getDerivedStats', () => {
    const baseStats: UserStats = {
      totalWordsTranscribed: 300,
      totalRecordingTimeMs: 60000, // 1 minute
      totalSessions: 3,
      currentStreak: 2,
      longestStreak: 4,
      lastActiveDate: '2025-12-19',
      firstSessionDate: '2025-12-01',
    }

    it('calculates averageWordsPerSession correctly', () => {
      const derived = getDerivedStats(baseStats)
      expect(derived.averageWordsPerSession).toBe(100) // 300 / 3
    })

    it('calculates averageSessionDuration in seconds', () => {
      const derived = getDerivedStats(baseStats)
      expect(derived.averageSessionDuration).toBe(20) // 60000ms / 3 / 1000
    })

    it('calculates totalHours correctly', () => {
      const derived = getDerivedStats(baseStats)
      expect(derived.totalHours).toBeCloseTo(0.0167, 3) // 1 minute = 0.0167 hours
    })

    it('calculates totalMinutes correctly', () => {
      const derived = getDerivedStats(baseStats)
      expect(derived.totalMinutes).toBe(1) // 60000ms / 60000
    })

    it('calculates wordsPerMinute correctly', () => {
      const derived = getDerivedStats(baseStats)
      expect(derived.wordsPerMinute).toBe(300) // 300 words / 1 minute
    })

    it('handles zero totalSessions (avoids division by zero)', () => {
      const stats = { ...baseStats, totalSessions: 0 }
      const derived = getDerivedStats(stats)
      expect(derived.averageWordsPerSession).toBe(300) // Uses 1 instead of 0
      expect(derived.averageSessionDuration).toBe(60)
    })

    it('returns zero wordsPerMinute when no recording time', () => {
      const stats = { ...baseStats, totalRecordingTimeMs: 0 }
      const derived = getDerivedStats(stats)
      expect(derived.wordsPerMinute).toBe(0)
    })

    it('handles DEFAULT_STATS (all zeros)', () => {
      const derived = getDerivedStats(DEFAULT_STATS)
      expect(derived.averageWordsPerSession).toBe(0)
      expect(derived.averageSessionDuration).toBe(0)
      expect(derived.totalHours).toBe(0)
      expect(derived.totalMinutes).toBe(0)
      expect(derived.wordsPerMinute).toBe(0)
    })

    it('calculates correct WPM for realistic scenario', () => {
      const stats: UserStats = {
        ...baseStats,
        totalWordsTranscribed: 600,
        totalRecordingTimeMs: 120000, // 2 minutes
        totalSessions: 5,
      }
      const derived = getDerivedStats(stats)
      expect(derived.wordsPerMinute).toBe(300) // 600 words / 2 minutes
    })

    it('handles large numbers correctly', () => {
      const stats: UserStats = {
        ...baseStats,
        totalWordsTranscribed: 100000,
        totalRecordingTimeMs: 3600000, // 1 hour
        totalSessions: 100,
      }
      const derived = getDerivedStats(stats)
      expect(derived.averageWordsPerSession).toBe(1000)
      expect(derived.totalHours).toBe(1)
      expect(derived.totalMinutes).toBe(60)
    })

    it('all derived values are numbers', () => {
      const derived = getDerivedStats(baseStats)
      expect(typeof derived.averageWordsPerSession).toBe('number')
      expect(typeof derived.averageSessionDuration).toBe('number')
      expect(typeof derived.totalHours).toBe('number')
      expect(typeof derived.totalMinutes).toBe('number')
      expect(typeof derived.wordsPerMinute).toBe('number')
    })
  })

  describe('getTodayString', () => {
    it('returns a string', () => {
      const today = getTodayString()
      expect(typeof today).toBe('string')
    })

    it('returns date in YYYY-MM-DD format', () => {
      const today = getTodayString()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('returns valid date', () => {
      const today = getTodayString()
      const date = new Date(today)
      expect(date.toString()).not.toBe('Invalid Date')
    })

    it('returns same value when called multiple times in same execution', () => {
      const today1 = getTodayString()
      const today2 = getTodayString()
      expect(today1).toBe(today2)
    })

    it('matches current year', () => {
      const today = getTodayString()
      const currentYear = new Date().getFullYear()
      expect(today.startsWith(currentYear.toString())).toBe(true)
    })
  })

  describe('isActiveToday', () => {
    it('returns true when lastActiveDate is today', () => {
      const today = getTodayString()
      const stats: UserStats = {
        ...DEFAULT_STATS,
        lastActiveDate: today,
      }
      expect(isActiveToday(stats)).toBe(true)
    })

    it('returns false when lastActiveDate is yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const stats: UserStats = {
        ...DEFAULT_STATS,
        lastActiveDate: yesterdayStr,
      }
      expect(isActiveToday(stats)).toBe(false)
    })

    it('returns false when lastActiveDate is empty', () => {
      const stats: UserStats = {
        ...DEFAULT_STATS,
        lastActiveDate: '',
      }
      expect(isActiveToday(stats)).toBe(false)
    })

    it('returns false for future date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const stats: UserStats = {
        ...DEFAULT_STATS,
        lastActiveDate: tomorrowStr,
      }
      expect(isActiveToday(stats)).toBe(false)
    })

    it('returns false for old date', () => {
      const stats: UserStats = {
        ...DEFAULT_STATS,
        lastActiveDate: '2020-01-01',
      }
      expect(isActiveToday(stats)).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('session update and streak update work together', () => {
      let stats = { ...DEFAULT_STATS }

      // First session
      stats = updateSessionStats(stats, 100, 30000)
      stats = updateStreak(stats, '2025-12-20')

      expect(stats.totalSessions).toBe(1)
      expect(stats.totalWordsTranscribed).toBe(100)
      expect(stats.currentStreak).toBe(1)

      // Second session next day
      stats = updateSessionStats(stats, 150, 45000)
      stats = updateStreak(stats, '2025-12-21')

      expect(stats.totalSessions).toBe(2)
      expect(stats.totalWordsTranscribed).toBe(250)
      expect(stats.currentStreak).toBe(2)
      expect(stats.longestStreak).toBe(2)
    })

    it('derived stats are correct after multiple updates', () => {
      let stats = { ...DEFAULT_STATS }

      stats = updateSessionStats(stats, 200, 60000) // 1 min
      stats = updateSessionStats(stats, 200, 60000) // 1 min
      stats = updateSessionStats(stats, 200, 60000) // 1 min

      const derived = getDerivedStats(stats)

      expect(derived.averageWordsPerSession).toBe(200)
      expect(derived.totalMinutes).toBe(3)
      expect(derived.wordsPerMinute).toBe(200)
    })
  })
})
