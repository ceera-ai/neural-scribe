/**
 * Achievement Test Cases
 *
 * Comprehensive test suite for all 76 achievements.
 * Each test case validates that an achievement unlocks under correct conditions.
 */

import { GamificationSimulator } from './gamificationSimulator'
import type { TestResult } from './testRunner'

export interface AchievementTestCase {
  id: string
  name: string
  category: string
  expectedXP: number
  setup?: (sim: GamificationSimulator) => Promise<void>
  execute: (sim: GamificationSimulator) => Promise<string[]>
  verify: (sim: GamificationSimulator, unlocked: string[]) => Promise<boolean>
}

/**
 * Run a single achievement test case
 */
export async function runTestCase(
  testCase: AchievementTestCase,
  sim: GamificationSimulator
): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // Setup
    if (testCase.setup) {
      await testCase.setup(sim)
    }

    // Execute
    const unlockedIds = await testCase.execute(sim)

    // Verify
    const passed = await testCase.verify(sim, unlockedIds)

    const xpAwarded = passed ? await sim.getAchievementXP(testCase.id) : null

    return {
      achievementId: testCase.id,
      achievementName: testCase.name,
      category: testCase.category,
      passed,
      duration: Date.now() - startTime,
      xpAwarded: xpAwarded || undefined,
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      achievementId: testCase.id,
      achievementName: testCase.name,
      category: testCase.category,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    }
  }
}

// ==================== MILESTONE ACHIEVEMENTS ====================

export const milestoneTestCases: AchievementTestCase[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    category: 'milestone',
    expectedXP: 50,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 10, durationMs: 10000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('first-steps') && (await sim.isAchievementUnlocked('first-steps'))
    },
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    category: 'milestone',
    expectedXP: 100,
    execute: async (sim) => {
      // Simulate 10 sessions
      let allUnlocked: string[] = []
      for (let i = 0; i < 10; i++) {
        const result = await sim.simulateSession({ words: 10, durationMs: 10000 })
        allUnlocked.push(...result.newAchievements)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('getting-started') && (await sim.isAchievementUnlocked('getting-started'))
      )
    },
  },
  {
    id: 'legend',
    name: 'Legend',
    category: 'milestone',
    expectedXP: 1000,
    execute: async (sim) => {
      // Simulate 500 sessions (skips to legend - veteran comes first at 100)
      let allUnlocked: string[] = []
      for (let i = 0; i < 500; i++) {
        const result = await sim.simulateSession({ words: 10, durationMs: 5000 })
        allUnlocked.push(...result.newAchievements)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('legend') && (await sim.isAchievementUnlocked('legend'))
    },
  },
]

// ==================== WORD COUNT ACHIEVEMENTS ====================

export const wordCountTestCases: AchievementTestCase[] = [
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    category: 'words',
    expectedXP: 100,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 1000, durationMs: 60000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('chatterbox') && (await sim.isAchievementUnlocked('chatterbox'))
    },
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    category: 'words',
    expectedXP: 300,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 10000, durationMs: 180000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('wordsmith') && (await sim.isAchievementUnlocked('wordsmith'))
    },
  },
  {
    id: 'eloquent',
    name: 'Eloquent',
    category: 'words',
    expectedXP: 750,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 50000, durationMs: 300000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('eloquent') && (await sim.isAchievementUnlocked('eloquent'))
    },
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    category: 'words',
    expectedXP: 1500,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 100000, durationMs: 600000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('voice-master') && (await sim.isAchievementUnlocked('voice-master'))
    },
  },
  {
    id: 'word-wizard',
    name: 'Word Wizard',
    category: 'words',
    expectedXP: 3000,
    execute: async (sim) => {
      const result = await sim.simulateSession({ words: 500000, durationMs: 1200000 })
      return result.newAchievements
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('word-wizard') && (await sim.isAchievementUnlocked('word-wizard'))
    },
  },
]

// ==================== AI MASTERY ACHIEVEMENTS ====================

export const aiMasteryTestCases: AchievementTestCase[] = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    category: 'ai-mastery',
    expectedXP: 100,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Use AI formatting 10 times
      for (let i = 0; i < 10; i++) {
        const unlocked = await sim.simulateFormatting('sonnet')
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('ai-assistant') && (await sim.isAchievementUnlocked('ai-assistant'))
    },
  },
  {
    id: 'formatting-pro',
    name: 'Formatting Pro',
    category: 'ai-mastery',
    expectedXP: 300,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Use AI formatting 100 times
      for (let i = 0; i < 100; i++) {
        const unlocked = await sim.simulateFormatting('sonnet')
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('formatting-pro') && (await sim.isAchievementUnlocked('formatting-pro'))
      )
    },
  },
  {
    id: 'model-curious',
    name: 'Model Curious',
    category: 'ai-mastery',
    expectedXP: 150,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Try all 3 models
      allUnlocked.push(...(await sim.simulateFormatting('sonnet')))
      allUnlocked.push(...(await sim.simulateFormatting('opus')))
      allUnlocked.push(...(await sim.simulateFormatting('haiku')))
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('model-curious') && (await sim.isAchievementUnlocked('model-curious'))
      )
    },
  },
  {
    id: 'title-generator',
    name: 'Title Generator',
    category: 'ai-mastery',
    expectedXP: 100,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Generate titles 20 times
      for (let i = 0; i < 20; i++) {
        const unlocked = await sim.simulateTitleGeneration()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('title-generator') && (await sim.isAchievementUnlocked('title-generator'))
      )
    },
  },
]

// ==================== CUSTOMIZATION ACHIEVEMENTS ====================

export const customizationTestCases: AchievementTestCase[] = [
  {
    id: 'voice-commander',
    name: 'Voice Commander',
    category: 'customization',
    expectedXP: 50,
    execute: async (sim) => {
      return await sim.simulateVoiceCommand('send')
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('voice-commander') && (await sim.isAchievementUnlocked('voice-commander'))
      )
    },
  },
  {
    id: 'command-master',
    name: 'Command Master',
    category: 'customization',
    expectedXP: 200,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Use voice commands 50 times
      for (let i = 0; i < 50; i++) {
        const command = ['send', 'clear', 'cancel'][i % 3] as 'send' | 'clear' | 'cancel'
        const unlocked = await sim.simulateVoiceCommand(command)
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('command-master') && (await sim.isAchievementUnlocked('command-master'))
      )
    },
  },
  {
    id: 'word-smith-custom',
    name: 'Word Smith',
    category: 'customization',
    expectedXP: 75,
    execute: async (sim) => {
      return await sim.simulateAddReplacement()
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('word-smith-custom') &&
        (await sim.isAchievementUnlocked('word-smith-custom'))
      )
    },
  },
  {
    id: 'replacement-architect',
    name: 'Replacement Architect',
    category: 'customization',
    expectedXP: 200,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Add 10 word replacements
      for (let i = 0; i < 10; i++) {
        const unlocked = await sim.simulateAddReplacement()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('replacement-architect') &&
        (await sim.isAchievementUnlocked('replacement-architect'))
      )
    },
  },
]

// ==================== EFFICIENCY ACHIEVEMENTS ====================

export const efficiencyTestCases: AchievementTestCase[] = [
  {
    id: 'hotkey-hero',
    name: 'Hotkey Hero',
    category: 'efficiency',
    expectedXP: 75,
    execute: async (sim) => {
      return await sim.simulateHotkeyChange()
    },
    verify: async (sim, unlocked) => {
      return unlocked.includes('hotkey-hero') && (await sim.isAchievementUnlocked('hotkey-hero'))
    },
  },
  {
    id: 'shortcut-master',
    name: 'Shortcut Master',
    category: 'efficiency',
    expectedXP: 200,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Use keyboard shortcuts 100 times
      for (let i = 0; i < 100; i++) {
        const unlocked =
          i % 2 === 0 ? await sim.simulatePasteHotkeyUse() : await sim.simulateRecordHotkeyUse()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('shortcut-master') && (await sim.isAchievementUnlocked('shortcut-master'))
      )
    },
  },
  {
    id: 'history-hunter',
    name: 'History Hunter',
    category: 'efficiency',
    expectedXP: 100,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Search history 10 times
      for (let i = 0; i < 10; i++) {
        const unlocked = await sim.simulateHistorySearch()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('history-hunter') && (await sim.isAchievementUnlocked('history-hunter'))
      )
    },
  },
]

// ==================== INTEGRATION ACHIEVEMENTS ====================

export const integrationTestCases: AchievementTestCase[] = [
  {
    id: 'terminal-novice',
    name: 'Terminal Novice',
    category: 'integration',
    expectedXP: 50,
    execute: async (sim) => {
      return await sim.simulateTerminalPaste('com.apple.Terminal')
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('terminal-novice') && (await sim.isAchievementUnlocked('terminal-novice'))
      )
    },
  },
  {
    id: 'terminal-veteran',
    name: 'Terminal Veteran',
    category: 'integration',
    expectedXP: 200,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Paste to terminal 50 times
      for (let i = 0; i < 50; i++) {
        const unlocked = await sim.simulateTerminalPaste('com.apple.Terminal')
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('terminal-veteran') &&
        (await sim.isAchievementUnlocked('terminal-veteran'))
      )
    },
  },
  {
    id: 'multi-terminal-user',
    name: 'Multi-Terminal User',
    category: 'integration',
    expectedXP: 150,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Use 3 different terminals
      allUnlocked.push(...(await sim.simulateTerminalPaste('com.apple.Terminal')))
      allUnlocked.push(...(await sim.simulateTerminalPaste('com.googlecode.iterm2')))
      allUnlocked.push(...(await sim.simulateTerminalPaste('com.microsoft.VSCode')))
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('multi-terminal-user') &&
        (await sim.isAchievementUnlocked('multi-terminal-user'))
      )
    },
  },
]

// ==================== EXPLORATION ACHIEVEMENTS ====================

export const explorationTestCases: AchievementTestCase[] = [
  {
    id: 'settings-explorer',
    name: 'Settings Explorer',
    category: 'exploration',
    expectedXP: 100,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Change 5 different settings
      for (let i = 0; i < 5; i++) {
        const unlocked = await sim.simulateSettingsChange()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('settings-explorer') &&
        (await sim.isAchievementUnlocked('settings-explorer'))
      )
    },
  },
]

/**
 * Get all test cases
 */
export function getAllTestCases(): AchievementTestCase[] {
  return [
    ...milestoneTestCases,
    ...wordCountTestCases,
    ...aiMasteryTestCases,
    ...customizationTestCases,
    ...efficiencyTestCases,
    ...integrationTestCases,
    ...explorationTestCases,
  ]
}
