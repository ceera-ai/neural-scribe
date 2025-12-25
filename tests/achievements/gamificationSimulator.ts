/**
 * Gamification Simulator
 *
 * Test utility for simulating gamification system behavior without running the full app.
 * Provides programmatic access to stats, achievements, and level system for testing.
 */

import { checkAchievements } from '../../electron/main/store/gamification/achievementChecker'
import { unlockAchievement } from '../../electron/main/store/gamification/achievements'
import { updateLevelFromXP } from '../../electron/main/store/gamification/levels'
import {
  updateSessionStats,
  DEFAULT_STATS,
  getTodayString,
} from '../../electron/main/store/gamification/stats'
import { DEFAULT_ACHIEVEMENTS } from '../../electron/main/store/gamification/achievements'
import { DEFAULT_FEATURE_USAGE } from '../../electron/main/store/gamification/stats'
import { getAchievementById } from '../../electron/main/gamification/achievementDefinitions'
import type { GamificationData } from '../../electron/main/store/gamification/types'
import type { UserStats } from '../../electron/main/store/gamification/stats'

/**
 * Isolated gamification simulator for testing
 */
export class GamificationSimulator {
  private data: GamificationData

  constructor() {
    // Initialize with default data
    this.data = {
      version: '2.0',
      stats: {
        ...DEFAULT_STATS,
        featureUsage: { ...DEFAULT_FEATURE_USAGE },
      },
      level: {
        currentXP: 0,
        level: 1,
      },
      achievements: { ...DEFAULT_ACHIEVEMENTS },
    }
  }

  /**
   * Reset gamification data to clean slate
   */
  async reset(): Promise<void> {
    this.data = {
      version: '2.0',
      stats: {
        ...DEFAULT_STATS,
        featureUsage: { ...DEFAULT_FEATURE_USAGE },
      },
      level: {
        currentXP: 0,
        level: 1,
      },
      achievements: { ...DEFAULT_ACHIEVEMENTS },
    }
  }

  /**
   * Get current gamification state
   */
  async getState(): Promise<GamificationData> {
    return JSON.parse(JSON.stringify(this.data))
  }

  /**
   * Simulate a recording session
   */
  async simulateSession(params: {
    words: number
    durationMs: number
  }): Promise<{ xpGained: number; newAchievements: string[] }> {
    const today = getTodayString()

    // Update stats
    this.data.stats = updateSessionStats(this.data.stats, params.words, params.durationMs, today)

    // Calculate XP
    const sessionXP = params.words + Math.floor(params.durationMs / 60000) * 10 + 25

    // Check for newly unlocked achievements
    const newAchievementIds = checkAchievements(
      this.data.stats,
      this.data.level,
      this.data.achievements
    )

    // Unlock achievements and award XP
    let achievementXP = 0
    for (const achievementId of newAchievementIds) {
      const achievement = getAchievementById(achievementId)
      if (achievement) {
        const result = unlockAchievement(
          this.data.achievements,
          achievementId,
          achievement.xpReward
        )
        if (result.newlyUnlocked) {
          this.data.achievements = result.achievements
          achievementXP += result.xpAwarded
        }
      }
    }

    // Update level
    const totalXP = sessionXP + achievementXP
    const newTotalXP = this.data.level.currentXP + totalXP
    this.data.level = updateLevelFromXP(newTotalXP)

    return {
      xpGained: totalXP,
      newAchievements: newAchievementIds,
    }
  }

  /**
   * Track feature usage and check for achievements
   */
  private async trackFeature(updateFn: (stats: UserStats) => void): Promise<string[]> {
    // Update stats
    updateFn(this.data.stats)

    // Check for newly unlocked achievements
    const newAchievementIds = checkAchievements(
      this.data.stats,
      this.data.level,
      this.data.achievements
    )

    // Unlock achievements and award XP
    let achievementXP = 0
    for (const achievementId of newAchievementIds) {
      const achievement = getAchievementById(achievementId)
      if (achievement) {
        const result = unlockAchievement(
          this.data.achievements,
          achievementId,
          achievement.xpReward
        )
        if (result.newlyUnlocked) {
          this.data.achievements = result.achievements
          achievementXP += result.xpAwarded
        }
      }
    }

    // Update level
    if (achievementXP > 0) {
      const newTotalXP = this.data.level.currentXP + achievementXP
      this.data.level = updateLevelFromXP(newTotalXP)
    }

    return newAchievementIds
  }

  /**
   * Simulate AI formatting usage
   */
  async simulateFormatting(model: 'sonnet' | 'opus' | 'haiku'): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.formattingOperations++
      stats.featureUsage.modelUsageCounts[model]++
      if (!stats.featureUsage.firstFormattingDate) {
        stats.featureUsage.firstFormattingDate = getTodayString()
      }
    })
  }

  /**
   * Simulate reformatting
   */
  async simulateReformatting(model: 'sonnet' | 'opus' | 'haiku'): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.reformattingOperations++
      stats.featureUsage.modelUsageCounts[model]++
    })
  }

  /**
   * Simulate title generation
   */
  async simulateTitleGeneration(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.titleGenerationsCount++
    })
  }

  /**
   * Simulate custom instructions change
   */
  async simulateCustomInstructionsChange(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.customInstructionsChanges++
    })
  }

  /**
   * Simulate voice command usage
   */
  async simulateVoiceCommand(command: 'send' | 'clear' | 'cancel'): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.voiceCommandsUsed++
      stats.featureUsage.voiceCommandsByType[command]++
      if (!stats.featureUsage.firstVoiceCommandDate) {
        stats.featureUsage.firstVoiceCommandDate = getTodayString()
      }
    })
  }

  /**
   * Simulate adding custom voice command
   */
  async simulateAddVoiceCommand(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.customVoiceCommandsAdded++
    })
  }

  /**
   * Simulate voice trigger modification
   */
  async simulateVoiceTriggerModify(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.voiceCommandTriggersModified++
    })
  }

  /**
   * Simulate adding word replacement
   */
  async simulateAddReplacement(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.wordReplacementsAdded++
    })
  }

  /**
   * Simulate applying word replacement
   */
  async simulateApplyReplacement(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.wordReplacementsApplied++
      if (!stats.featureUsage.firstReplacementDate) {
        stats.featureUsage.firstReplacementDate = getTodayString()
      }
    })
  }

  /**
   * Simulate terminal paste
   */
  async simulateTerminalPaste(bundleId?: string): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.terminalPasteOperations++
      if (!stats.featureUsage.firstTerminalPasteDate) {
        stats.featureUsage.firstTerminalPasteDate = getTodayString()
      }
      if (bundleId) {
        if (!stats.featureUsage.uniqueTerminalsUsed.includes(bundleId)) {
          stats.featureUsage.uniqueTerminalsUsed.push(bundleId)
        }
        stats.featureUsage.terminalUsageCounts[bundleId] =
          (stats.featureUsage.terminalUsageCounts[bundleId] || 0) + 1
      }
    })
  }

  /**
   * Simulate hotkey change
   */
  async simulateHotkeyChange(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.hotkeyChanges++
    })
  }

  /**
   * Simulate paste hotkey usage
   */
  async simulatePasteHotkeyUse(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.hotkeyUsageCount++
      stats.featureUsage.pasteHotkeyCount++
    })
  }

  /**
   * Simulate record hotkey usage
   */
  async simulateRecordHotkeyUse(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.hotkeyUsageCount++
      stats.featureUsage.recordHotkeyCount++
    })
  }

  /**
   * Simulate history search
   */
  async simulateHistorySearch(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.historySearchCount++
    })
  }

  /**
   * Simulate settings change
   */
  async simulateSettingsChange(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.settingsChanges++
    })
  }

  /**
   * Simulate feature toggle
   */
  async simulateFeatureToggle(): Promise<string[]> {
    return this.trackFeature((stats) => {
      stats.featureUsage.featureToggles++
    })
  }

  /**
   * Check if achievement is unlocked
   */
  async isAchievementUnlocked(achievementId: string): Promise<boolean> {
    const data = await this.getState()
    return !!data.achievements.unlocked[achievementId]
  }

  /**
   * Get XP awarded for achievement
   */
  async getAchievementXP(achievementId: string): Promise<number | null> {
    const data = await this.getState()
    return data.achievements.unlocked[achievementId]?.xpAwarded || null
  }

  /**
   * Get current level
   */
  async getLevel(): Promise<number> {
    const data = await this.getState()
    return data.level.level
  }

  /**
   * Get current XP
   */
  async getCurrentXP(): Promise<number> {
    const data = await this.getState()
    return data.level.currentXP
  }

  /**
   * Get total sessions
   */
  async getTotalSessions(): Promise<number> {
    const data = await this.getState()
    return data.stats.totalSessions
  }

  /**
   * Get total words
   */
  async getTotalWords(): Promise<number> {
    const data = await this.getState()
    return data.stats.totalWordsTranscribed
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(): Promise<number> {
    const data = await this.getState()
    return data.stats.currentStreak
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    console.log('[TestSim] Cleanup test data')
    // TODO: Remove test store files
  }
}
