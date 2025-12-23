import { useState, useEffect, useCallback, useRef } from 'react'
import type { UserStats, LevelSystem, Achievement } from '../types/gamification'
import {
  ACHIEVEMENTS,
  getDefaultStats,
  getDefaultLevelSystem,
  calculateXPForLevel,
} from '../types/gamification'

interface UseGamificationReturn {
  stats: UserStats
  level: LevelSystem
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  recentUnlocks: Achievement[]
  xpProgress: number // 0-1, progress to next level

  // Actions
  recordSession: (words: number, durationMs: number) => Promise<void>
  checkDailyLogin: () => void
  clearRecentUnlocks: () => void
  resetProgress: () => void
}

export function useGamification(): UseGamificationReturn {
  const [stats, setStats] = useState<UserStats>(getDefaultStats)
  const [level, setLevel] = useState<LevelSystem>(getDefaultLevelSystem)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])

  const isInitialized = useRef(false)
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

  // Load saved state from Electron store on mount
  useEffect(() => {
    if (!isElectron) return

    async function loadFromElectronStore() {
      try {
        const data = await window.electronAPI.getGamificationData()

        setStats(data.stats)
        setLevel(data.level)
        setUnlockedIds(new Set(Object.keys(data.achievements.unlocked)))

        console.log('[Gamification] Loaded data from Electron store:', data)
      } catch (err) {
        console.error('[Gamification] Failed to load data:', err)
      }
    }

    loadFromElectronStore()
    isInitialized.current = true
  }, [isElectron])

  // Listen for gamification data changes from other windows or main process
  useEffect(() => {
    if (!isElectron) return

    const handleDataChanged = async () => {
      try {
        const data = await window.electronAPI.getGamificationData()
        setStats(data.stats)
        setLevel(data.level)
        setUnlockedIds(new Set(Object.keys(data.achievements.unlocked)))
        console.log('[Gamification] Data updated from external change')
      } catch (err) {
        console.error('[Gamification] Failed to refresh data:', err)
      }
    }

    window.electronAPI.onGamificationDataChanged(handleDataChanged)

    return () => {
      window.electronAPI.removeAllListeners('gamification-data-changed')
    }
  }, [isElectron])

  // Listen for achievement unlocks
  useEffect(() => {
    if (!isElectron) return

    const handleAchievementUnlocked = (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
      if (achievement && !recentUnlocks.find((a) => a.id === achievementId)) {
        setRecentUnlocks((prev) => [...prev, { ...achievement, unlockedAt: Date.now() }])
        console.log('[Gamification] Achievement unlocked:', achievementId)
      }
    }

    window.electronAPI.onAchievementUnlocked(handleAchievementUnlocked)

    return () => {
      window.electronAPI.removeAllListeners('achievement-unlocked')
    }
  }, [isElectron, recentUnlocks])

  // Debug: Track stats changes
  useEffect(() => {
    console.log('🎮 [STATE] Stats state updated:', {
      totalSessions: stats.totalSessions,
      totalWords: stats.totalWordsTranscribed,
      totalTime: stats.totalRecordingTimeMs,
      currentStreak: stats.currentStreak,
      lastActive: stats.lastActiveDate,
    })
  }, [stats])

  // Debug: Track level changes
  useEffect(() => {
    console.log('🎮 [STATE] Level state updated:', {
      currentXP: level.currentXP,
      level: level.level,
      rank: level.rank,
      xpToNext: level.xpToNextLevel,
    })
  }, [level])

  // Check and unlock achievements (client-side checking, server-side unlocking)
  const checkAchievements = useCallback(
    async (currentStats: UserStats, currentLevel: number) => {
      if (!isElectron) return

      const newUnlocks: Achievement[] = []

      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue

        let shouldUnlock = false
        const { type, value } = achievement.requirement

        switch (type) {
          case 'words':
            shouldUnlock = currentStats.totalWordsTranscribed >= value
            break
          case 'time_minutes':
            shouldUnlock = currentStats.totalRecordingTimeMs >= value * 60 * 1000
            break
          case 'sessions':
            shouldUnlock = currentStats.totalSessions >= value
            break
          case 'streak_days':
            shouldUnlock = currentStats.currentStreak >= value
            break
          case 'level':
            shouldUnlock = currentLevel >= value
            break
        }

        if (shouldUnlock) {
          newUnlocks.push({
            ...achievement,
            unlockedAt: Date.now(),
          })
        }
      }

      if (newUnlocks.length > 0) {
        console.log(
          '[Gamification] Unlocking achievements:',
          newUnlocks.map((a) => a.id)
        )

        // Unlock achievements via Electron store
        for (const achievement of newUnlocks) {
          try {
            await window.electronAPI.unlockGamificationAchievement({
              achievementId: achievement.id,
              xpReward: achievement.xpReward,
            })
          } catch (err) {
            console.error(`[Gamification] Failed to unlock achievement ${achievement.id}:`, err)
          }
        }

        // Update local state
        setUnlockedIds((prev) => {
          const newSet = new Set(prev)
          newUnlocks.forEach((a) => newSet.add(a.id))
          return newSet
        })

        // Add to recent unlocks for popup display
        setRecentUnlocks((prev) => [...prev, ...newUnlocks])
      }
    },
    [unlockedIds, isElectron]
  )

  // Record a completed session
  const recordSession = useCallback(
    async (words: number, durationMs: number) => {
      console.log('🎮 [DEBUG] recordSession called:', {
        words,
        durationMs,
        isElectron,
        currentStats: {
          totalSessions: stats.totalSessions,
          totalWords: stats.totalWordsTranscribed,
        },
        currentLevel: {
          currentXP: level.currentXP,
          level: level.level,
        },
      })

      if (!isElectron) {
        console.warn('[Gamification] Not in Electron environment, skipping')
        return
      }

      try {
        console.log('🎮 [DEBUG] Calling IPC record-gamification-session...')

        // Record session via Electron store
        const result = await window.electronAPI.recordGamificationSession({
          words,
          durationMs,
        })

        console.log('🎮 [DEBUG] IPC returned:', result)
        console.log('[Gamification] Session recorded:', result)

        console.log('🎮 [DEBUG] Reloading data from store...')

        // Reload data from store to get updated stats and level
        const data = await window.electronAPI.getGamificationData()

        console.log('🎮 [DEBUG] Data reloaded from store:', {
          totalSessions: data.stats.totalSessions,
          totalWords: data.stats.totalWordsTranscribed,
          totalTime: data.stats.totalRecordingTimeMs,
          currentXP: data.level.currentXP,
          level: data.level.level,
          rank: data.level.rank,
          unlockedAchievements: Object.keys(data.achievements.unlocked).length,
        })

        setStats(data.stats)
        setLevel(data.level)

        console.log('🎮 [DEBUG] React state updated')

        // Check for new achievements
        await checkAchievements(data.stats, data.level.level)

        // Show level up notification if applicable
        if (result.leveledUp) {
          console.log(`[Gamification] LEVEL UP! ${result.oldLevel} → ${result.newLevel}`)
          // TODO: Could show a level up notification here
        }
      } catch (err) {
        console.error('🎮 [DEBUG] recordSession ERROR:', err)
        console.error('[Gamification] Failed to record session:', err)
      }
    },
    [isElectron, checkAchievements, stats, level]
  )

  // Check daily login bonus
  const checkDailyLogin = useCallback(async () => {
    if (!isElectron) return

    try {
      const result = await window.electronAPI.checkGamificationDailyLogin()

      if (result.bonusAwarded) {
        console.log('[Gamification] Daily bonus awarded:', result)

        // Reload data from store
        const data = await window.electronAPI.getGamificationData()
        setStats(data.stats)
        setLevel(data.level)

        // Check for streak-based achievements
        await checkAchievements(data.stats, data.level.level)
      }
    } catch (err) {
      console.error('[Gamification] Failed to check daily login:', err)
    }
  }, [isElectron, checkAchievements])

  // Clear recent unlock notifications
  const clearRecentUnlocks = useCallback(() => {
    setRecentUnlocks([])
  }, [])

  // Reset all progress
  const resetProgress = useCallback(async () => {
    if (!isElectron) return

    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      try {
        await window.electronAPI.resetGamificationProgress()

        // Reload default state
        const data = await window.electronAPI.getGamificationData()
        setStats(data.stats)
        setLevel(data.level)
        setUnlockedIds(new Set())
        setRecentUnlocks([])

        console.log('[Gamification] Progress reset')
      } catch (err) {
        console.error('[Gamification] Failed to reset progress:', err)
      }
    }
  }, [isElectron])

  // Calculate XP progress (0-1)
  const xpForCurrentLevel = calculateXPForLevel(level.level)
  const xpForNextLevel = calculateXPForLevel(level.level + 1)
  const xpProgress =
    xpForNextLevel > xpForCurrentLevel
      ? (level.currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)
      : 0

  // Map achievements with progress and unlock status
  const achievements: Achievement[] = ACHIEVEMENTS.map((achievement) => {
    const isUnlocked = unlockedIds.has(achievement.id)
    let progress = 0

    if (!isUnlocked) {
      const { type, value } = achievement.requirement
      switch (type) {
        case 'words':
          progress = Math.min(1, stats.totalWordsTranscribed / value)
          break
        case 'time_minutes':
          progress = Math.min(1, stats.totalRecordingTimeMs / (value * 60 * 1000))
          break
        case 'sessions':
          progress = Math.min(1, stats.totalSessions / value)
          break
        case 'streak_days':
          progress = Math.min(1, stats.currentStreak / value)
          break
        case 'level':
          progress = Math.min(1, level.level / value)
          break
      }
    } else {
      progress = 1
    }

    return {
      ...achievement,
      progress,
      // NOTE: unlockedAt is NOT set here to avoid regenerating timestamps
      // It's loaded from Electron store when needed for display
    }
  })

  const unlockedAchievements = achievements.filter((a) => unlockedIds.has(a.id))

  return {
    stats,
    level,
    achievements,
    unlockedAchievements,
    recentUnlocks,
    xpProgress,
    recordSession,
    checkDailyLogin,
    clearRecentUnlocks,
    resetProgress,
  }
}
