import { useState, useEffect, useCallback, useRef } from 'react'
import type { UserStats, LevelSystem, Achievement } from '../types/gamification'
import { getDefaultStats, getDefaultLevelSystem, calculateXPForLevel } from '../types/gamification'

// Backend achievement type (simpler structure from main process)
interface BackendAchievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  category:
    | 'milestone'
    | 'words'
    | 'streak'
    | 'speed'
    | 'time'
    | 'level'
    | 'ai-mastery'
    | 'customization'
    | 'efficiency'
    | 'integration'
    | 'exploration'
  order: number
}

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
  const [unlockedData, setUnlockedData] = useState<
    Record<string, { unlockedAt: number; xpAwarded: number }>
  >({})
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])
  const [backendAchievements, setBackendAchievements] = useState<BackendAchievement[]>([])

  const isInitialized = useRef(false)
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

  // Load achievement definitions from backend on mount
  useEffect(() => {
    if (!isElectron) return

    async function loadAchievements() {
      try {
        const achievements = await window.electronAPI.getAchievementDefinitions()
        setBackendAchievements(achievements)
        console.log(
          '[Gamification] Loaded achievement definitions from backend:',
          achievements.length
        )
      } catch (err) {
        console.error('[Gamification] Failed to load achievement definitions:', err)
      }
    }

    loadAchievements()
  }, [isElectron])

  // Load saved state from Electron store on mount
  useEffect(() => {
    if (!isElectron) return

    async function loadFromElectronStore() {
      try {
        const data = await window.electronAPI.getGamificationData()

        // Fetch history stats to ensure consistency with database
        const historyStats = await window.electronAPI.getHistoryStats()

        // Override gamification stats with actual database values
        // This ensures stats are always accurate and match what's in the history
        const mergedStats = {
          ...data.stats,
          totalWordsTranscribed: historyStats.totalWords,
          totalRecordingTimeMs: historyStats.totalDuration * 1000, // Convert seconds to ms
          totalSessions: historyStats.totalRecords,
        }

        setStats(mergedStats)
        setLevel(data.level)
        setUnlockedIds(new Set(Object.keys(data.achievements.unlocked)))
        setUnlockedData(data.achievements.unlocked)

        console.log('[Gamification] Loaded data from Electron store (with history merge):', {
          gamificationStats: data.stats,
          historyStats,
          mergedStats,
        })

        // Check and unlock any achievements that should already be unlocked based on current stats
        // This handles retroactive unlocking for existing progress
        try {
          const unlockedIds = await window.electronAPI.checkAndUnlockAllAchievements()
          if (unlockedIds.length > 0) {
            console.log('[Gamification] Retroactively unlocked achievements:', unlockedIds)
          }
        } catch (err) {
          console.error('[Gamification] Failed to check retroactive achievements:', err)
        }
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

        // Fetch history stats to ensure consistency
        const historyStats = await window.electronAPI.getHistoryStats()

        // Merge with history stats
        const mergedStats = {
          ...data.stats,
          totalWordsTranscribed: historyStats.totalWords,
          totalRecordingTimeMs: historyStats.totalDuration * 1000,
          totalSessions: historyStats.totalRecords,
        }

        setStats(mergedStats)
        setLevel(data.level)
        setUnlockedIds(new Set(Object.keys(data.achievements.unlocked)))
        setUnlockedData(data.achievements.unlocked)
        console.log('[Gamification] Data updated from external change (with history merge)')
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
    if (!isElectron || backendAchievements.length === 0) return

    const handleAchievementUnlocked = (achievementId: string) => {
      const backendAchievement = backendAchievements.find((a) => a.id === achievementId)
      if (backendAchievement && !recentUnlocks.find((a) => a.id === achievementId)) {
        // Create achievement from backend achievement data
        const achievement: Achievement = {
          id: backendAchievement.id,
          name: backendAchievement.name,
          description: backendAchievement.description,
          icon: backendAchievement.icon,
          xpReward: backendAchievement.xpReward,
          category: 'special', // Will be properly set when we map all achievements
          requirement: { type: 'special', value: 1 },
          rarity: 'uncommon',
          unlockedAt: Date.now(),
        }
        setRecentUnlocks((prev) => [...prev, achievement])
        console.log('[Gamification] Achievement unlocked:', achievementId)
      }
    }

    window.electronAPI.onAchievementUnlocked(handleAchievementUnlocked)

    return () => {
      window.electronAPI.removeAllListeners('achievement-unlocked')
    }
  }, [isElectron, recentUnlocks, backendAchievements])

  // Check and unlock achievements (now handled by backend, this just updates UI state)
  const checkAchievements = useCallback(async () => {
    if (!isElectron || backendAchievements.length === 0) return

    // Backend now handles achievement checking and unlocking
    // This function just ensures UI state is in sync
  }, [isElectron, backendAchievements])

  // Record a completed session
  const recordSession = useCallback(
    async (words: number, durationMs: number): Promise<number> => {
      if (!isElectron) {
        console.warn('[Gamification] Not in Electron environment, skipping')
        return 0
      }

      try {
        // Record session via Electron store
        const result = await window.electronAPI.recordGamificationSession({
          words,
          durationMs,
        })

        console.log('[Gamification] Session recorded:', result)

        // Reload data from store to get updated stats and level
        const data = await window.electronAPI.getGamificationData()

        // Fetch history stats to ensure consistency
        const historyStats = await window.electronAPI.getHistoryStats()

        // Merge with history stats
        const mergedStats = {
          ...data.stats,
          totalWordsTranscribed: historyStats.totalWords,
          totalRecordingTimeMs: historyStats.totalDuration * 1000,
          totalSessions: historyStats.totalRecords,
        }

        setStats(mergedStats)
        setLevel(data.level)

        // Check for new achievements
        await checkAchievements()

        // Show level up notification if applicable
        if (result.leveledUp) {
          console.log(`[Gamification] LEVEL UP! ${result.oldLevel} → ${result.newLevel}`)
          // TODO: Could show a level up notification here
        }

        return result.xpGained
      } catch (err) {
        console.error('[Gamification] Failed to record session:', err)
        return 0
      }
    },
    [isElectron, checkAchievements]
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

        // Fetch history stats to ensure consistency
        const historyStats = await window.electronAPI.getHistoryStats()

        // Merge with history stats
        const mergedStats = {
          ...data.stats,
          totalWordsTranscribed: historyStats.totalWords,
          totalRecordingTimeMs: historyStats.totalDuration * 1000,
          totalSessions: historyStats.totalRecords,
        }

        setStats(mergedStats)
        setLevel(data.level)

        // Check for streak-based achievements
        await checkAchievements()
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

        // Fetch history stats to ensure consistency
        const historyStats = await window.electronAPI.getHistoryStats()

        // Merge with history stats
        const mergedStats = {
          ...data.stats,
          totalWordsTranscribed: historyStats.totalWords,
          totalRecordingTimeMs: historyStats.totalDuration * 1000,
          totalSessions: historyStats.totalRecords,
        }

        setStats(mergedStats)
        setLevel(data.level)
        setUnlockedIds(new Set())
        setRecentUnlocks([])

        console.log('[Gamification] Progress reset (with history merge)')
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

  // Helper to map backend achievements to frontend Achievement type with progress
  const mapBackendAchievement = (backend: BackendAchievement): Achievement => {
    const isUnlocked = unlockedIds.has(backend.id)

    // Map backend achievement to requirement structure
    // These thresholds match the backend achievement checker
    const requirementMap: Record<
      string,
      { type: Achievement['requirement']['type']; value: number }
    > = {
      // Milestones (sessions)
      'first-steps': { type: 'sessions', value: 1 },
      'getting-started': { type: 'sessions', value: 10 },
      veteran: { type: 'sessions', value: 100 },
      legend: { type: 'sessions', value: 500 },
      // Words
      chatterbox: { type: 'words', value: 1000 },
      wordsmith: { type: 'words', value: 10000 },
      eloquent: { type: 'words', value: 50000 },
      'voice-master': { type: 'words', value: 100000 },
      'word-wizard': { type: 'words', value: 500000 },
      // Streaks
      committed: { type: 'streak_days', value: 3 },
      dedicated: { type: 'streak_days', value: 7 },
      unstoppable: { type: 'streak_days', value: 30 },
      'legendary-streak': { type: 'streak_days', value: 100 },
      // Speed (words per minute) - special calculation
      'fast-talker': { type: 'special', value: 150 },
      'speed-demon': { type: 'special', value: 200 },
      lightning: { type: 'special', value: 250 },
      // Time (total hours)
      marathon: { type: 'time_minutes', value: 60 },
      endurance: { type: 'time_minutes', value: 600 },
      'time-lord': { type: 'time_minutes', value: 3000 },
      timeless: { type: 'time_minutes', value: 6000 },
      // Level
      'rising-star': { type: 'level', value: 10 },
      'power-user': { type: 'level', value: 25 },
      elite: { type: 'level', value: 50 },
      transcendent: { type: 'level', value: 100 },

      // AI Mastery Achievements
      'ai-assistant': { type: 'special', value: 10 },
      'formatting-pro': { type: 'special', value: 100 },
      'claudes-partner': { type: 'special', value: 1000 },
      'model-curious': { type: 'special', value: 3 },
      'sonnet-fan': { type: 'special', value: 50 },
      'opus-enthusiast': { type: 'special', value: 25 },
      'haiku-speedster': { type: 'special', value: 100 },
      perfectionist: { type: 'special', value: 5 },
      'version-control': { type: 'special', value: 10 },
      'title-generator': { type: 'special', value: 20 },
      librarian: { type: 'special', value: 100 },
      'instruction-giver': { type: 'special', value: 1 },

      // Customization Achievements
      'voice-commander': { type: 'special', value: 1 },
      'command-master': { type: 'special', value: 50 },
      'custom-command-creator': { type: 'special', value: 1 },
      'command-library': { type: 'special', value: 5 },
      'word-smith-custom': { type: 'special', value: 1 },
      'replacement-architect': { type: 'special', value: 10 },
      'replacement-veteran': { type: 'special', value: 100 },
      'case-sensitive-expert': { type: 'special', value: 1 },
      'whole-word-master': { type: 'special', value: 1 },
      'settings-explorer': { type: 'special', value: 5 },
      'feature-toggler': { type: 'special', value: 10 },
      'personalization-master': { type: 'special', value: 1 },
      'instruction-experimenter': { type: 'special', value: 3 },

      // Efficiency Achievements
      'hotkey-hero': { type: 'special', value: 1 },
      'shortcut-master': { type: 'special', value: 100 },
      'paste-master': { type: 'special', value: 50 },
      'record-ninja': { type: 'special', value: 50 },
      'one-session-wonder': { type: 'special', value: 1 },
      'productivity-streak': { type: 'special', value: 5 },
      'power-hour': { type: 'special', value: 500 },
      'history-hunter': { type: 'special', value: 10 },
      archivist: { type: 'special', value: 100 },
      minimalist: { type: 'special', value: 1 },

      // Integration Achievements
      'terminal-novice': { type: 'special', value: 1 },
      'terminal-veteran': { type: 'special', value: 50 },
      'multi-terminal-user': { type: 'special', value: 3 },
      'terminal-collector': { type: 'special', value: 8 },
      'window-targeter': { type: 'special', value: 1 },
      'vscode-coder': { type: 'special', value: 10 },
      'cursor-developer': { type: 'special', value: 10 },
      'iterm-enthusiast': { type: 'special', value: 10 },

      // Exploration Achievements
      'feature-discoverer': { type: 'special', value: 5 },
      'jack-of-all-trades': { type: 'special', value: 1 },
      'combo-master': { type: 'special', value: 5 },
      'api-key-setup': { type: 'special', value: 1 },
      'microphone-selector': { type: 'special', value: 1 },
      'experimental-mode': { type: 'special', value: 1 },
      'renaissance-user': { type: 'special', value: 1 },
    }

    const requirement = requirementMap[backend.id] || { type: 'special', value: 1 }

    // Calculate progress
    let progress = 0
    if (!isUnlocked) {
      // Check if featureUsage exists (for post-migration)
      const featureUsage = stats.featureUsage

      switch (requirement.type) {
        case 'words':
          progress = Math.min(1, stats.totalWordsTranscribed / requirement.value)
          break
        case 'time_minutes':
          progress = Math.min(1, stats.totalRecordingTimeMs / (requirement.value * 60 * 1000))
          break
        case 'sessions':
          progress = Math.min(1, stats.totalSessions / requirement.value)
          break
        case 'streak_days':
          progress = Math.min(1, stats.longestStreak / requirement.value)
          break
        case 'level':
          progress = Math.min(1, level.level / requirement.value)
          break
        case 'special': {
          // Handle feature-based and special achievements
          if (!featureUsage) {
            progress = 0
            break
          }

          // Calculate progress based on achievement ID
          const achievementId = backend.id
          let current = 0

          // AI Mastery achievements
          if (
            achievementId === 'ai-assistant' ||
            achievementId === 'formatting-pro' ||
            achievementId === 'claudes-partner'
          ) {
            current = featureUsage.formattingOperations + featureUsage.reformattingOperations
          } else if (achievementId === 'model-curious') {
            current = Object.values(featureUsage.modelUsageCounts).filter((c) => c > 0).length
          } else if (achievementId === 'sonnet-fan') {
            current = featureUsage.modelUsageCounts.sonnet
          } else if (achievementId === 'opus-enthusiast') {
            current = featureUsage.modelUsageCounts.opus
          } else if (achievementId === 'haiku-speedster') {
            current = featureUsage.modelUsageCounts.haiku
          } else if (achievementId === 'perfectionist' || achievementId === 'version-control') {
            current = featureUsage.reformattingOperations
          } else if (achievementId === 'title-generator' || achievementId === 'librarian') {
            current = featureUsage.titleGenerationsCount
          } else if (
            achievementId === 'instruction-giver' ||
            achievementId === 'instruction-experimenter'
          ) {
            current = featureUsage.customInstructionsChanges
          }

          // Customization achievements
          else if (achievementId === 'voice-commander' || achievementId === 'command-master') {
            current = featureUsage.voiceCommandsUsed
          } else if (
            achievementId === 'custom-command-creator' ||
            achievementId === 'command-library'
          ) {
            current = featureUsage.customVoiceCommandsAdded
          } else if (
            achievementId === 'word-smith-custom' ||
            achievementId === 'replacement-architect'
          ) {
            current = featureUsage.wordReplacementsAdded
          } else if (achievementId === 'replacement-veteran') {
            current = featureUsage.wordReplacementsApplied
          } else if (achievementId === 'settings-explorer') {
            current = featureUsage.settingsChanges
          } else if (achievementId === 'feature-toggler') {
            current = featureUsage.featureToggles
          }

          // Efficiency achievements
          else if (achievementId === 'hotkey-hero') {
            current = featureUsage.hotkeyChanges
          } else if (achievementId === 'shortcut-master') {
            current = featureUsage.hotkeyUsageCount
          } else if (achievementId === 'paste-master') {
            current = featureUsage.pasteHotkeyCount
          } else if (achievementId === 'record-ninja') {
            current = featureUsage.recordHotkeyCount
          } else if (achievementId === 'history-hunter') {
            current = featureUsage.historySearchCount
          }

          // Integration achievements
          else if (achievementId === 'terminal-novice' || achievementId === 'terminal-veteran') {
            current = featureUsage.terminalPasteOperations
          } else if (
            achievementId === 'multi-terminal-user' ||
            achievementId === 'terminal-collector'
          ) {
            current = featureUsage.uniqueTerminalsUsed.length
          } else if (achievementId === 'vscode-coder') {
            current =
              (featureUsage.terminalUsageCounts['com.microsoft.VSCode'] || 0) +
              (featureUsage.terminalUsageCounts['com.visualstudio.code.oss'] || 0)
          } else if (achievementId === 'cursor-developer') {
            current = featureUsage.terminalUsageCounts['com.todesktop.230313mzl4w4u92'] || 0
          } else if (achievementId === 'iterm-enthusiast') {
            current = featureUsage.terminalUsageCounts['com.googlecode.iterm2'] || 0
          }

          // Exploration achievements
          else if (achievementId === 'feature-discoverer') {
            current = [
              featureUsage.formattingOperations + featureUsage.reformattingOperations > 0,
              featureUsage.voiceCommandsUsed > 0,
              featureUsage.wordReplacementsApplied > 0,
              featureUsage.terminalPasteOperations > 0,
              featureUsage.hotkeyUsageCount > 0,
              featureUsage.historySearchCount > 0,
            ].filter(Boolean).length
          } else if (achievementId === 'microphone-selector') {
            current = featureUsage.microphoneChanges || 0
          }

          // Old speed achievements (WPM)
          else if (
            achievementId === 'fast-talker' ||
            achievementId === 'speed-demon' ||
            achievementId === 'lightning'
          ) {
            if (stats.totalRecordingTimeMs > 0) {
              const wpm = stats.totalWordsTranscribed / (stats.totalRecordingTimeMs / 60000)
              current = wpm
            }
          }

          progress = Math.min(1, current / requirement.value)
          break
        }
      }
    } else {
      progress = 1
    }

    // Map category to frontend category type
    const categoryMap: Record<BackendAchievement['category'], Achievement['category']> = {
      milestone: 'milestone',
      words: 'words',
      streak: 'streak',
      speed: 'speed',
      time: 'time',
      level: 'level',
      'ai-mastery': 'ai-mastery',
      customization: 'customization',
      efficiency: 'efficiency',
      integration: 'integration',
      exploration: 'exploration',
    }

    // Determine rarity based on XP reward
    let rarity: Achievement['rarity'] = 'common'
    if (backend.xpReward >= 2000) rarity = 'legendary'
    else if (backend.xpReward >= 1000) rarity = 'epic'
    else if (backend.xpReward >= 500) rarity = 'rare'
    else if (backend.xpReward >= 100) rarity = 'uncommon'

    return {
      id: backend.id,
      name: backend.name,
      description: backend.description,
      icon: backend.icon,
      category: categoryMap[backend.category] || 'special',
      requirement,
      xpReward: backend.xpReward,
      rarity,
      progress,
      unlockedAt: isUnlocked ? unlockedData[backend.id]?.unlockedAt : undefined,
    }
  }

  // Map backend achievements to frontend Achievement type
  const achievements: Achievement[] = backendAchievements.map(mapBackendAchievement)

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
