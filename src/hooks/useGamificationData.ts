/**
 * useGamificationData Hook
 *
 * Custom hook for fetching and managing gamification data from Electron store.
 * Provides real-time updates when gamification data changes.
 */

import { useState, useEffect, useCallback } from 'react'

export interface LevelSystem {
  currentXP: number
  level: number
  rank: string
  xpToNextLevel: number
  xpForCurrentLevel: number
  totalXPForNextLevel: number
}

export interface UserStats {
  totalWordsTranscribed: number
  totalRecordingTimeMs: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  firstSessionDate: string
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: number
  xpAwarded: number
}

export interface AchievementsState {
  unlocked: Record<string, UnlockedAchievement>
}

export interface GamificationData {
  version: string
  stats: UserStats
  level: LevelSystem
  achievements: AchievementsState
  metadata: {
    lastSaved: number
    totalSaves: number
    backupCount: number
  }
}

export interface UseGamificationDataReturn {
  /** Gamification data */
  data: GamificationData | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Refresh data */
  refresh: () => Promise<void>
  /** Record a session */
  recordSession: (
    words: number,
    durationMs: number
  ) => Promise<{
    xpGained: number
    newAchievements: string[]
    leveledUp: boolean
    oldLevel: number
    newLevel: number
  }>
  /** Check daily login bonus */
  checkDailyBonus: () => Promise<{
    bonusAwarded: boolean
    xpGained: number
    streakUpdated: boolean
    currentStreak: number
  }>
}

/**
 * Hook for managing gamification data
 */
export function useGamificationData(): UseGamificationDataReturn {
  const [data, setData] = useState<GamificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch gamification data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await window.electron.ipcRenderer.invoke('get-gamification-data')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gamification data'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Record a transcription session
  const recordSession = useCallback(async (words: number, durationMs: number) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('record-gamification-session', {
        words,
        durationMs,
      })
      // Data will be updated via the event listener
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to record session')
    }
  }, [])

  // Check daily login bonus
  const checkDailyBonus = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('check-gamification-daily-login')
      // Data will be updated via the event listener
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to check daily bonus')
    }
  }, [])

  // Listen for gamification data changes
  useEffect(() => {
    // Initial fetch
    fetchData()

    // Listen for changes
    const handleDataChanged = () => {
      fetchData()
    }

    window.electron.ipcRenderer.on('gamification-data-changed', handleDataChanged)

    return () => {
      window.electron.ipcRenderer.removeListener('gamification-data-changed', handleDataChanged)
    }
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    recordSession,
    checkDailyBonus,
  }
}

export default useGamificationData
