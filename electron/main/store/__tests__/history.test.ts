/**
 * History Module Tests
 *
 * Tests for electron/main/store/history.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock electron-store
vi.mock('electron-store', () => {
  let mockData: any = {
    history: [],
  }

  return {
    default: class MockStore {
      get(key: string) {
        return mockData[key]
      }

      set(key: string, value: any) {
        mockData[key] = value
      }

      clear() {
        mockData = { history: [] }
      }
    },
  }
})

// Mock settings module
vi.mock('../settings', () => ({
  getHistoryLimit: vi.fn(() => 500),
}))

import {
  getHistory,
  getLastTranscription,
  searchHistory,
  findTranscriptionById,
  saveTranscription,
  updateTranscription,
  deleteTranscription,
  deleteTranscriptions,
  clearHistory,
  getHistoryStats,
  getRecentTranscriptions,
  getTranscriptionsByDateRange,
  type TranscriptionRecord,
} from '../history'
import { getHistoryLimit } from '../settings'

describe('History Module', () => {
  const mockRecord1: TranscriptionRecord = {
    id: 'test-id-1',
    text: 'npm install express',
    originalText: 'install express',
    timestamp: Date.now(),
    wordCount: 3,
    duration: 2.5,
    wasFormatted: true,
    title: 'Install Express',
  }

  const mockRecord2: TranscriptionRecord = {
    id: 'test-id-2',
    text: 'docker-compose up -d',
    originalText: 'docker compose up',
    timestamp: Date.now() - 1000,
    wordCount: 3,
    duration: 1.8,
    wasFormatted: true,
    title: 'Start Docker',
  }

  const mockRecord3: TranscriptionRecord = {
    id: 'test-id-3',
    text: 'git status',
    timestamp: Date.now() - 2000,
    wordCount: 2,
    duration: 1.2,
    wasFormatted: false,
  }

  beforeEach(() => {
    clearHistory()
  })

  describe('getHistory', () => {
    it('returns empty array when no history exists', () => {
      expect(getHistory()).toEqual([])
    })

    it('returns all history records', () => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)

      const history = getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].id).toBe('test-id-2') // Most recent first
      expect(history[1].id).toBe('test-id-1')
    })
  })

  describe('getLastTranscription', () => {
    it('returns null when history is empty', () => {
      expect(getLastTranscription()).toBeNull()
    })

    it('returns most recent transcription', () => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)

      const last = getLastTranscription()
      expect(last?.id).toBe('test-id-2')
    })
  })

  describe('searchHistory', () => {
    beforeEach(() => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
      saveTranscription(mockRecord3)
    })

    it('finds records by text content', () => {
      const results = searchHistory('docker')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('test-id-2')
    })

    it('finds records by title', () => {
      const results = searchHistory('Express')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('test-id-1')
    })

    it('finds records by original text', () => {
      const results = searchHistory('compose')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('test-id-2')
    })

    it('is case-insensitive', () => {
      const results = searchHistory('DOCKER')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('test-id-2')
    })

    it('returns empty array when no matches', () => {
      const results = searchHistory('nonexistent')
      expect(results).toEqual([])
    })

    it('returns multiple matches', () => {
      const results = searchHistory('git')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('findTranscriptionById', () => {
    beforeEach(() => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
    })

    it('finds record by ID', () => {
      const record = findTranscriptionById('test-id-1')
      expect(record).not.toBeNull()
      expect(record?.text).toBe('npm install express')
    })

    it('returns null when record not found', () => {
      const record = findTranscriptionById('nonexistent')
      expect(record).toBeNull()
    })
  })

  describe('saveTranscription', () => {
    it('adds new record to beginning of history', () => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)

      const history = getHistory()
      expect(history[0].id).toBe('test-id-2')
      expect(history[1].id).toBe('test-id-1')
    })

    it('updates existing record in place', () => {
      saveTranscription(mockRecord1)

      const updated: TranscriptionRecord = {
        ...mockRecord1,
        text: 'UPDATED TEXT',
      }
      saveTranscription(updated)

      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].text).toBe('UPDATED TEXT')
    })

    it('respects history limit for new records', () => {
      vi.mocked(getHistoryLimit).mockReturnValue(2)

      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
      saveTranscription(mockRecord3)

      const history = getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].id).toBe('test-id-3') // Most recent
      expect(history[1].id).toBe('test-id-2')
      // mockRecord1 should be removed due to limit
    })

    it('allows unlimited history when limit is 0', () => {
      vi.mocked(getHistoryLimit).mockReturnValue(0)

      for (let i = 0; i < 100; i++) {
        saveTranscription({
          id: `test-id-${i}`,
          text: `Test ${i}`,
          timestamp: Date.now(),
          wordCount: 2,
          duration: 1,
        })
      }

      const history = getHistory()
      expect(history).toHaveLength(100)
    })
  })

  describe('updateTranscription', () => {
    beforeEach(() => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
    })

    it('updates existing record partially', () => {
      const success = updateTranscription('test-id-1', {
        title: 'New Title',
        wasFormatted: false,
      })

      expect(success).toBe(true)

      const record = findTranscriptionById('test-id-1')
      expect(record?.title).toBe('New Title')
      expect(record?.wasFormatted).toBe(false)
      expect(record?.text).toBe('npm install express') // Unchanged
    })

    it('returns false when record not found', () => {
      const success = updateTranscription('nonexistent', {
        title: 'New Title',
      })

      expect(success).toBe(false)
    })

    it('preserves other fields', () => {
      updateTranscription('test-id-1', { title: 'Updated' })

      const record = findTranscriptionById('test-id-1')
      expect(record?.wordCount).toBe(3)
      expect(record?.duration).toBe(2.5)
      expect(record?.text).toBe('npm install express')
    })
  })

  describe('deleteTranscription', () => {
    beforeEach(() => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
      saveTranscription(mockRecord3)
    })

    it('deletes record by ID', () => {
      const success = deleteTranscription('test-id-2')

      expect(success).toBe(true)
      expect(getHistory()).toHaveLength(2)
      expect(findTranscriptionById('test-id-2')).toBeNull()
    })

    it('returns false when record not found', () => {
      const success = deleteTranscription('nonexistent')

      expect(success).toBe(false)
      expect(getHistory()).toHaveLength(3)
    })
  })

  describe('deleteTranscriptions', () => {
    beforeEach(() => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
      saveTranscription(mockRecord3)
    })

    it('deletes multiple records', () => {
      const deletedCount = deleteTranscriptions(['test-id-1', 'test-id-3'])

      expect(deletedCount).toBe(2)
      expect(getHistory()).toHaveLength(1)
      expect(getHistory()[0].id).toBe('test-id-2')
    })

    it('handles non-existent IDs gracefully', () => {
      const deletedCount = deleteTranscriptions(['test-id-1', 'nonexistent'])

      expect(deletedCount).toBe(1)
      expect(getHistory()).toHaveLength(2)
    })

    it('returns 0 when no records deleted', () => {
      const deletedCount = deleteTranscriptions(['nonexistent1', 'nonexistent2'])

      expect(deletedCount).toBe(0)
      expect(getHistory()).toHaveLength(3)
    })
  })

  describe('clearHistory', () => {
    it('removes all records', () => {
      saveTranscription(mockRecord1)
      saveTranscription(mockRecord2)
      saveTranscription(mockRecord3)

      clearHistory()

      expect(getHistory()).toEqual([])
      expect(getLastTranscription()).toBeNull()
    })
  })

  describe('getHistoryStats', () => {
    it('returns zero stats for empty history', () => {
      const stats = getHistoryStats()

      expect(stats.totalRecords).toBe(0)
      expect(stats.totalWords).toBe(0)
      expect(stats.totalDuration).toBe(0)
      expect(stats.formattedCount).toBe(0)
      expect(stats.averageWordCount).toBe(0)
      expect(stats.averageDuration).toBe(0)
    })

    it('calculates stats correctly', () => {
      saveTranscription(mockRecord1) // 3 words, 2.5s, formatted
      saveTranscription(mockRecord2) // 3 words, 1.8s, formatted
      saveTranscription(mockRecord3) // 2 words, 1.2s, not formatted

      const stats = getHistoryStats()

      expect(stats.totalRecords).toBe(3)
      expect(stats.totalWords).toBe(8)
      expect(stats.totalDuration).toBeCloseTo(5.5, 1)
      expect(stats.formattedCount).toBe(2)
      expect(stats.averageWordCount).toBeCloseTo(2.67, 2)
      expect(stats.averageDuration).toBeCloseTo(1.83, 2)
    })
  })

  describe('getRecentTranscriptions', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        saveTranscription({
          id: `test-id-${i}`,
          text: `Test ${i}`,
          timestamp: Date.now() - i * 1000,
          wordCount: 2,
          duration: 1,
        })
      }
    })

    it('returns limited number of recent records', () => {
      const recent = getRecentTranscriptions(5)

      expect(recent).toHaveLength(5)
      expect(recent[0].id).toBe('test-id-9') // Most recent
      expect(recent[4].id).toBe('test-id-5')
    })

    it('returns all records if limit exceeds total', () => {
      const recent = getRecentTranscriptions(100)

      expect(recent).toHaveLength(10)
    })

    it('returns empty array when history is empty', () => {
      clearHistory()
      const recent = getRecentTranscriptions(10)

      expect(recent).toEqual([])
    })
  })

  describe('getTranscriptionsByDateRange', () => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const twoHoursAgo = now - 2 * 60 * 60 * 1000

    beforeEach(() => {
      saveTranscription({ ...mockRecord1, timestamp: now })
      saveTranscription({ ...mockRecord2, timestamp: oneHourAgo })
      saveTranscription({ ...mockRecord3, timestamp: twoHoursAgo })
    })

    it('returns records within date range', () => {
      const results = getTranscriptionsByDateRange(oneHourAgo - 1, now + 1)

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.id)).toContain('test-id-1')
      expect(results.map((r) => r.id)).toContain('test-id-2')
    })

    it('excludes records outside range', () => {
      const results = getTranscriptionsByDateRange(now - 1000, now + 1000)

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('test-id-1')
    })

    it('returns empty array when no records in range', () => {
      const futureStart = now + 60 * 60 * 1000
      const futureEnd = futureStart + 60 * 60 * 1000

      const results = getTranscriptionsByDateRange(futureStart, futureEnd)

      expect(results).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles records with missing optional fields', () => {
      const minimal: TranscriptionRecord = {
        id: 'minimal',
        text: 'test',
        timestamp: Date.now(),
        wordCount: 1,
        duration: 1,
      }

      saveTranscription(minimal)

      const retrieved = findTranscriptionById('minimal')
      expect(retrieved).not.toBeNull()
      expect(retrieved?.wasFormatted).toBeUndefined()
      expect(retrieved?.title).toBeUndefined()
    })

    it('handles formatted versions array', () => {
      const withVersions: TranscriptionRecord = {
        id: 'versioned',
        text: 'npm install',
        originalText: 'install',
        timestamp: Date.now(),
        wordCount: 2,
        duration: 1,
        formattedVersions: [
          {
            id: 'v1',
            text: 'npm install',
            timestamp: Date.now(),
            sourceVersion: 'original',
          },
          {
            id: 'v2',
            text: 'npm i',
            timestamp: Date.now(),
            sourceVersion: 'v1',
            customInstructions: 'Use short form',
          },
        ],
      }

      saveTranscription(withVersions)

      const retrieved = findTranscriptionById('versioned')
      expect(retrieved?.formattedVersions).toHaveLength(2)
      expect(retrieved?.formattedVersions?.[1].customInstructions).toBe('Use short form')
    })
  })
})
