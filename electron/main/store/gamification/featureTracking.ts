/**
 * Feature Tracking Module
 *
 * Centralized tracking system for feature usage with automatic achievement checking.
 * This module handles all non-session based feature tracking.
 *
 * @module store/gamification/featureTracking
 */

import { getGamificationData, setGamificationData } from './index'
import { checkAchievements } from './achievementChecker'
import { unlockAchievement } from './achievements'
import { updateLevelFromXP } from './levels'
import { getTodayString, DEFAULT_FEATURE_USAGE } from './stats'
import { getAchievementById } from '../../gamification/achievementDefinitions'
import type { UserStats } from './stats'

/**
 * Feature types that can be tracked
 */
export type FeatureType =
  // AI Formatting
  | 'formatting-sonnet'
  | 'formatting-opus'
  | 'formatting-haiku'
  | 'reformatting-sonnet'
  | 'reformatting-opus'
  | 'reformatting-haiku'
  | 'title-generation'
  | 'custom-instructions-change'

  // Voice Commands
  | 'voice-command-send'
  | 'voice-command-clear'
  | 'voice-command-cancel'
  | 'custom-voice-command-add'
  | 'voice-trigger-modify'

  // Word Replacements
  | 'word-replacement-add'
  | 'word-replacement-apply'

  // Terminal Integration
  | 'terminal-paste'

  // Keyboard Shortcuts
  | 'hotkey-change'
  | 'paste-hotkey-use'
  | 'record-hotkey-use'

  // History & Settings
  | 'history-search'
  | 'settings-change'
  | 'feature-toggle'
  | 'microphone-change'

  // Transcription Engines
  | 'engine-change'
  | 'engine-use-elevenlabs'
  | 'engine-use-deepgram'

/**
 * Track a feature usage and check for newly unlocked achievements
 *
 * @param {FeatureType} featureType - The type of feature being tracked
 * @param {any} [metadata] - Optional metadata (e.g., terminal bundleId, model name)
 * @returns {Promise<string[]>} Array of newly unlocked achievement IDs
 *
 * @example
 * ```typescript
 * // Track AI formatting with Sonnet model
 * const unlocked = await trackFeatureUsage('formatting-sonnet')
 *
 * // Track terminal paste with bundle ID
 * const unlocked = await trackFeatureUsage('terminal-paste', { bundleId: 'com.apple.Terminal' })
 * ```
 */
export async function trackFeatureUsage(
  featureType: FeatureType,
  metadata?: { bundleId?: string }
): Promise<string[]> {
  try {
    console.log(`[FeatureTracking] Tracking feature: ${featureType}`, metadata)

    // Load current gamification data
    const data = getGamificationData()
    const stats = { ...data.stats }
    const today = getTodayString()

    console.log(`[FeatureTracking] Current feature usage stats:`, data.stats.featureUsage)

    // Ensure featureUsage exists (migration safety)
    if (!stats.featureUsage) {
      console.log('[FeatureTracking] featureUsage is undefined, initializing with defaults...')
      stats.featureUsage = { ...DEFAULT_FEATURE_USAGE }
    }

    // Update stats based on feature type
    updateFeatureStats(stats, featureType, metadata, today)

    console.log(`[FeatureTracking] Updated feature usage stats:`, stats.featureUsage)

    // Save updated stats
    data.stats = stats

    // Check for newly unlocked achievements
    const newAchievementIds = checkAchievements(data.stats, data.level, data.achievements)
    console.log(`[FeatureTracking] Checked achievements, newly unlocked:`, newAchievementIds)

    // Actually unlock achievements and award XP
    if (newAchievementIds.length > 0) {
      console.log('[FeatureTracking] Newly unlocked achievements:', newAchievementIds)

      let updatedAchievements = data.achievements
      let achievementXP = 0

      // Unlock each achievement and accumulate XP
      for (const achievementId of newAchievementIds) {
        const achievement = getAchievementById(achievementId)
        if (achievement) {
          const result = unlockAchievement(updatedAchievements, achievementId, achievement.xpReward)
          if (result.newlyUnlocked) {
            updatedAchievements = result.achievements
            achievementXP += result.xpAwarded
            console.log(
              `[FeatureTracking] Unlocked "${achievement.name}" (+${achievement.xpReward} XP)`
            )
          } else {
            console.log(`[FeatureTracking] Achievement "${achievement.name}" was already unlocked`)
          }
        } else {
          console.log(`[FeatureTracking] Achievement definition not found for ID: ${achievementId}`)
        }
      }

      // Update achievements state
      data.achievements = updatedAchievements

      // Award accumulated XP from achievements and check for level up
      if (achievementXP > 0) {
        const newTotalXP = data.level.currentXP + achievementXP
        data.level = updateLevelFromXP(newTotalXP)
        console.log(`[FeatureTracking] Awarded ${achievementXP} XP from achievements`)
      }
    }

    // Save all changes
    console.log('[FeatureTracking] Saving gamification data...')
    setGamificationData(data)
    console.log('[FeatureTracking] Gamification data saved successfully')

    return newAchievementIds
  } catch (error) {
    console.error('[FeatureTracking] Error tracking feature usage:', error)
    return []
  }
}

/**
 * Update feature usage statistics based on feature type
 *
 * @private
 */
function updateFeatureStats(
  stats: UserStats,
  featureType: FeatureType,
  metadata?: { bundleId?: string },
  today?: string
): void {
  const todayString = today || getTodayString()
  const { featureUsage } = stats

  switch (featureType) {
    // AI Formatting - Sonnet
    case 'formatting-sonnet':
      featureUsage.formattingOperations++
      featureUsage.modelUsageCounts.sonnet++
      if (!featureUsage.firstFormattingDate) {
        featureUsage.firstFormattingDate = todayString
      }
      break

    // AI Formatting - Opus
    case 'formatting-opus':
      featureUsage.formattingOperations++
      featureUsage.modelUsageCounts.opus++
      if (!featureUsage.firstFormattingDate) {
        featureUsage.firstFormattingDate = todayString
      }
      break

    // AI Formatting - Haiku
    case 'formatting-haiku':
      featureUsage.formattingOperations++
      featureUsage.modelUsageCounts.haiku++
      if (!featureUsage.firstFormattingDate) {
        featureUsage.firstFormattingDate = todayString
      }
      break

    // Reformatting - Sonnet
    case 'reformatting-sonnet':
      featureUsage.reformattingOperations++
      featureUsage.modelUsageCounts.sonnet++
      break

    // Reformatting - Opus
    case 'reformatting-opus':
      featureUsage.reformattingOperations++
      featureUsage.modelUsageCounts.opus++
      break

    // Reformatting - Haiku
    case 'reformatting-haiku':
      featureUsage.reformattingOperations++
      featureUsage.modelUsageCounts.haiku++
      break

    // Title Generation
    case 'title-generation':
      featureUsage.titleGenerationsCount++
      break

    // Custom Instructions
    case 'custom-instructions-change':
      featureUsage.customInstructionsChanges++
      break

    // Voice Commands
    case 'voice-command-send':
      featureUsage.voiceCommandsUsed++
      featureUsage.voiceCommandsByType.send++
      if (!featureUsage.firstVoiceCommandDate) {
        featureUsage.firstVoiceCommandDate = todayString
      }
      break

    case 'voice-command-clear':
      featureUsage.voiceCommandsUsed++
      featureUsage.voiceCommandsByType.clear++
      if (!featureUsage.firstVoiceCommandDate) {
        featureUsage.firstVoiceCommandDate = todayString
      }
      break

    case 'voice-command-cancel':
      featureUsage.voiceCommandsUsed++
      featureUsage.voiceCommandsByType.cancel++
      if (!featureUsage.firstVoiceCommandDate) {
        featureUsage.firstVoiceCommandDate = todayString
      }
      break

    case 'custom-voice-command-add':
      featureUsage.customVoiceCommandsAdded++
      break

    case 'voice-trigger-modify':
      featureUsage.voiceCommandTriggersModified++
      break

    // Word Replacements
    case 'word-replacement-add':
      featureUsage.wordReplacementsAdded++
      break

    case 'word-replacement-apply':
      featureUsage.wordReplacementsApplied++
      if (!featureUsage.firstReplacementDate) {
        featureUsage.firstReplacementDate = todayString
      }
      break

    // Terminal Integration
    case 'terminal-paste':
      featureUsage.terminalPasteOperations++
      if (!featureUsage.firstTerminalPasteDate) {
        featureUsage.firstTerminalPasteDate = todayString
      }

      // Track unique terminals and counts
      if (metadata?.bundleId) {
        const bundleId = metadata.bundleId
        if (!featureUsage.uniqueTerminalsUsed.includes(bundleId)) {
          featureUsage.uniqueTerminalsUsed.push(bundleId)
        }
        featureUsage.terminalUsageCounts[bundleId] =
          (featureUsage.terminalUsageCounts[bundleId] || 0) + 1
      }
      break

    // Keyboard Shortcuts
    case 'hotkey-change':
      featureUsage.hotkeyChanges++
      break

    case 'paste-hotkey-use':
      featureUsage.hotkeyUsageCount++
      featureUsage.pasteHotkeyCount++
      break

    case 'record-hotkey-use':
      featureUsage.hotkeyUsageCount++
      featureUsage.recordHotkeyCount++
      break

    // History & Settings
    case 'history-search':
      featureUsage.historySearchCount++
      break

    case 'settings-change':
      featureUsage.settingsChanges++
      break

    case 'feature-toggle':
      featureUsage.featureToggles++
      break

    case 'microphone-change':
      featureUsage.microphoneChanges++
      break

    // Transcription Engines
    case 'engine-change':
      featureUsage.engineChanges++
      break

    case 'engine-use-elevenlabs':
      if (!featureUsage.enginesUsed.includes('elevenlabs')) {
        featureUsage.enginesUsed.push('elevenlabs')
      }
      break

    case 'engine-use-deepgram':
      if (!featureUsage.enginesUsed.includes('deepgram')) {
        featureUsage.enginesUsed.push('deepgram')
      }
      break

    default:
      console.warn('[FeatureTracking] Unknown feature type:', featureType)
  }
}
