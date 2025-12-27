/* eslint-disable max-lines */
/**
 * Achievement Definitions
 *
 * Defines all available achievements in the gamification system.
 * Each achievement has unique ID, name, description, icon, and XP reward.
 *
 * @module gamification/achievementDefinitions
 */

export interface Achievement {
  /** Unique achievement ID */
  id: string
  /** Achievement name */
  name: string
  /** Achievement description */
  description: string
  /** Achievement icon (emoji) */
  icon: string
  /** XP reward for unlocking */
  xpReward: number
  /** Achievement category */
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
  /** Sort order within category */
  order: number
}

/**
 * All available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first transcription session',
    icon: '🌱',
    xpReward: 50,
    category: 'milestone',
    order: 1,
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 10 transcription sessions',
    icon: '🚀',
    xpReward: 100,
    category: 'milestone',
    order: 2,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 100 transcription sessions',
    icon: '🎖️',
    xpReward: 500,
    category: 'milestone',
    order: 3,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Complete 500 transcription sessions',
    icon: '👑',
    xpReward: 1000,
    category: 'milestone',
    order: 4,
  },

  // Word Count Achievements
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Transcribe 1,000 words',
    icon: '💬',
    xpReward: 100,
    category: 'words',
    order: 1,
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Transcribe 10,000 words',
    icon: '📝',
    xpReward: 300,
    category: 'words',
    order: 2,
  },
  {
    id: 'eloquent',
    name: 'Eloquent',
    description: 'Transcribe 50,000 words',
    icon: '✍️',
    xpReward: 750,
    category: 'words',
    order: 3,
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    description: 'Transcribe 100,000 words',
    icon: '🎙️',
    xpReward: 1500,
    category: 'words',
    order: 4,
  },
  {
    id: 'word-wizard',
    name: 'Word Wizard',
    description: 'Transcribe 500,000 words',
    icon: '🧙',
    xpReward: 3000,
    category: 'words',
    order: 5,
  },

  // Streak Achievements
  {
    id: 'committed',
    name: 'Committed',
    description: 'Maintain a 3 day streak',
    icon: '🔥',
    xpReward: 75,
    category: 'streak',
    order: 1,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7 day streak',
    icon: '💪',
    xpReward: 150,
    category: 'streak',
    order: 2,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30 day streak',
    icon: '⚡',
    xpReward: 500,
    category: 'streak',
    order: 3,
  },
  {
    id: 'legendary-streak',
    name: 'Legendary Streak',
    description: 'Maintain a 100 day streak',
    icon: '🌟',
    xpReward: 2000,
    category: 'streak',
    order: 4,
  },

  // Speed Achievements
  {
    id: 'fast-talker',
    name: 'Fast Talker',
    description: 'Achieve 150 words per minute average',
    icon: '🏃',
    xpReward: 200,
    category: 'speed',
    order: 1,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Achieve 200 words per minute average',
    icon: '💨',
    xpReward: 400,
    category: 'speed',
    order: 2,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    description: 'Achieve 250 words per minute average',
    icon: '⚡',
    xpReward: 800,
    category: 'speed',
    order: 3,
  },

  // Time-Based Achievements
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Accumulate 1 hour of total recording time',
    icon: '⏱️',
    xpReward: 150,
    category: 'time',
    order: 1,
  },
  {
    id: 'endurance',
    name: 'Endurance',
    description: 'Accumulate 10 hours of total recording time',
    icon: '⌛',
    xpReward: 500,
    category: 'time',
    order: 2,
  },
  {
    id: 'time-lord',
    name: 'Time Lord',
    description: 'Accumulate 50 hours of total recording time',
    icon: '🕰️',
    xpReward: 1500,
    category: 'time',
    order: 3,
  },
  {
    id: 'timeless',
    name: 'Timeless',
    description: 'Accumulate 100 hours of total recording time',
    icon: '♾️',
    xpReward: 3000,
    category: 'time',
    order: 4,
  },

  // Level Achievements
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach Level 10',
    icon: '⭐',
    xpReward: 200,
    category: 'level',
    order: 1,
  },
  {
    id: 'power-user',
    name: 'Power User',
    description: 'Reach Level 25',
    icon: '💎',
    xpReward: 500,
    category: 'level',
    order: 2,
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Reach Level 50',
    icon: '🏆',
    xpReward: 1000,
    category: 'level',
    order: 3,
  },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Reach Level 100',
    icon: '✨',
    xpReward: 2500,
    category: 'level',
    order: 4,
  },

  // AI Mastery Achievements (12 achievements)
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Use AI formatting 10 times',
    icon: '🤖',
    xpReward: 100,
    category: 'ai-mastery',
    order: 1,
  },
  {
    id: 'formatting-pro',
    name: 'Formatting Pro',
    description: 'Use AI formatting 100 times',
    icon: '✨',
    xpReward: 300,
    category: 'ai-mastery',
    order: 2,
  },
  {
    id: 'claudes-partner',
    name: "Claude's Partner",
    description: 'Use AI formatting 1,000 times',
    icon: '🧠',
    xpReward: 1000,
    category: 'ai-mastery',
    order: 3,
  },
  {
    id: 'model-curious',
    name: 'Model Curious',
    description: 'Try all 3 AI models (Sonnet, Opus, Haiku)',
    icon: '🔬',
    xpReward: 150,
    category: 'ai-mastery',
    order: 4,
  },
  {
    id: 'sonnet-fan',
    name: 'Sonnet Fan',
    description: 'Use Sonnet model 50 times',
    icon: '🎵',
    xpReward: 200,
    category: 'ai-mastery',
    order: 5,
  },
  {
    id: 'opus-enthusiast',
    name: 'Opus Enthusiast',
    description: 'Use Opus model 25 times (quality seeker)',
    icon: '💎',
    xpReward: 250,
    category: 'ai-mastery',
    order: 6,
  },
  {
    id: 'haiku-speedster',
    name: 'Haiku Speedster',
    description: 'Use Haiku model 100 times (speed demon)',
    icon: '⚡',
    xpReward: 200,
    category: 'ai-mastery',
    order: 7,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Reformat the same text 5 times',
    icon: '🎯',
    xpReward: 150,
    category: 'ai-mastery',
    order: 8,
  },
  {
    id: 'version-control',
    name: 'Version Control',
    description: 'Create 10 formatted versions across history',
    icon: '📚',
    xpReward: 200,
    category: 'ai-mastery',
    order: 9,
  },
  {
    id: 'title-generator',
    name: 'Title Generator',
    description: 'Generate AI titles for 20 transcriptions',
    icon: '📝',
    xpReward: 100,
    category: 'ai-mastery',
    order: 10,
  },
  {
    id: 'librarian',
    name: 'Librarian',
    description: 'Generate AI titles for 100 transcriptions',
    icon: '📖',
    xpReward: 300,
    category: 'ai-mastery',
    order: 11,
  },
  {
    id: 'instruction-giver',
    name: 'Instruction Giver',
    description: 'Set custom formatting instructions',
    icon: '📋',
    xpReward: 75,
    category: 'ai-mastery',
    order: 12,
  },

  // Customization Achievements (13 achievements)
  {
    id: 'voice-commander',
    name: 'Voice Commander',
    description: 'Use a voice command for the first time',
    icon: '🎤',
    xpReward: 50,
    category: 'customization',
    order: 1,
  },
  {
    id: 'command-master',
    name: 'Command Master',
    description: 'Use voice commands 50 times',
    icon: '🗣️',
    xpReward: 200,
    category: 'customization',
    order: 2,
  },
  {
    id: 'custom-command-creator',
    name: 'Custom Command Creator',
    description: 'Add your first custom voice command',
    icon: '🎙️',
    xpReward: 100,
    category: 'customization',
    order: 3,
  },
  {
    id: 'command-library',
    name: 'Command Library',
    description: 'Add 5 custom voice commands',
    icon: '📚',
    xpReward: 250,
    category: 'customization',
    order: 4,
  },
  {
    id: 'word-smith-custom',
    name: 'Word Smith',
    description: 'Add your first word replacement rule',
    icon: '🔧',
    xpReward: 75,
    category: 'customization',
    order: 5,
  },
  {
    id: 'replacement-architect',
    name: 'Replacement Architect',
    description: 'Create 10 word replacement rules',
    icon: '🏗️',
    xpReward: 200,
    category: 'customization',
    order: 6,
  },
  {
    id: 'replacement-veteran',
    name: 'Replacement Veteran',
    description: 'Apply word replacements 100 times',
    icon: '♻️',
    xpReward: 300,
    category: 'customization',
    order: 7,
  },
  {
    id: 'case-sensitive-expert',
    name: 'Case Sensitive Expert',
    description: 'Create a case-sensitive replacement rule',
    icon: 'Aa',
    xpReward: 50,
    category: 'customization',
    order: 8,
  },
  {
    id: 'whole-word-master',
    name: 'Whole Word Master',
    description: 'Create a whole-word replacement rule',
    icon: '🎯',
    xpReward: 50,
    category: 'customization',
    order: 9,
  },
  {
    id: 'settings-explorer',
    name: 'Settings Explorer',
    description: 'Change 5 different settings',
    icon: '⚙️',
    xpReward: 100,
    category: 'customization',
    order: 10,
  },
  {
    id: 'feature-toggler',
    name: 'Feature Toggler',
    description: 'Enable/disable features 10 times',
    icon: '🔀',
    xpReward: 150,
    category: 'customization',
    order: 11,
  },
  {
    id: 'personalization-master',
    name: 'Personalization Master',
    description: 'Customize all available settings at least once',
    icon: '🎨',
    xpReward: 500,
    category: 'customization',
    order: 12,
  },
  {
    id: 'instruction-experimenter',
    name: 'Instruction Experimenter',
    description: 'Change custom formatting instructions 3 times',
    icon: '🧪',
    xpReward: 150,
    category: 'customization',
    order: 13,
  },

  // Efficiency Achievements (10 achievements)
  {
    id: 'hotkey-hero',
    name: 'Hotkey Hero',
    description: 'Change a keyboard shortcut',
    icon: '⌨️',
    xpReward: 75,
    category: 'efficiency',
    order: 1,
  },
  {
    id: 'shortcut-master',
    name: 'Shortcut Master',
    description: 'Use keyboard shortcuts 100 times',
    icon: '⚡',
    xpReward: 200,
    category: 'efficiency',
    order: 2,
  },
  {
    id: 'paste-master',
    name: 'Paste Master',
    description: 'Use paste hotkey 50 times',
    icon: '📋',
    xpReward: 150,
    category: 'efficiency',
    order: 3,
  },
  {
    id: 'record-ninja',
    name: 'Record Ninja',
    description: 'Use record hotkey 50 times',
    icon: '🥷',
    xpReward: 150,
    category: 'efficiency',
    order: 4,
  },
  {
    id: 'one-session-wonder',
    name: 'One Session Wonder',
    description: 'Complete a session in under 10 seconds',
    icon: '💨',
    xpReward: 100,
    category: 'efficiency',
    order: 5,
  },
  {
    id: 'productivity-streak',
    name: 'Productivity Streak',
    description: 'Complete 5 sessions in one hour',
    icon: '🔥',
    xpReward: 200,
    category: 'efficiency',
    order: 6,
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    description: 'Transcribe 500+ words in one session',
    icon: '💪',
    xpReward: 150,
    category: 'efficiency',
    order: 7,
  },
  {
    id: 'history-hunter',
    name: 'History Hunter',
    description: 'Use search in history 10 times',
    icon: '🔍',
    xpReward: 100,
    category: 'efficiency',
    order: 8,
  },
  {
    id: 'archivist',
    name: 'Archivist',
    description: 'Keep 100+ transcriptions in history',
    icon: '🗄️',
    xpReward: 200,
    category: 'efficiency',
    order: 9,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Set a history limit to keep things tidy',
    icon: '🧹',
    xpReward: 50,
    category: 'efficiency',
    order: 10,
  },

  // Integration Achievements (8 achievements)
  {
    id: 'terminal-novice',
    name: 'Terminal Novice',
    description: 'Paste to a terminal for the first time',
    icon: '💻',
    xpReward: 50,
    category: 'integration',
    order: 1,
  },
  {
    id: 'terminal-veteran',
    name: 'Terminal Veteran',
    description: 'Paste to terminal 50 times',
    icon: '🖥️',
    xpReward: 200,
    category: 'integration',
    order: 2,
  },
  {
    id: 'multi-terminal-user',
    name: 'Multi-Terminal User',
    description: 'Use 3 different terminal applications',
    icon: '🎛️',
    xpReward: 150,
    category: 'integration',
    order: 3,
  },
  {
    id: 'terminal-collector',
    name: 'Terminal Collector',
    description: 'Try all 8 supported terminals',
    icon: '🏆',
    xpReward: 500,
    category: 'integration',
    order: 4,
  },
  {
    id: 'window-targeter',
    name: 'Window Targeter',
    description: 'Paste to a specific terminal window',
    icon: '🎯',
    xpReward: 100,
    category: 'integration',
    order: 5,
  },
  {
    id: 'vscode-coder',
    name: 'VSCode Coder',
    description: 'Paste to VS Code terminal 10 times',
    icon: '📘',
    xpReward: 100,
    category: 'integration',
    order: 6,
  },
  {
    id: 'cursor-developer',
    name: 'Cursor Developer',
    description: 'Paste to Cursor terminal 10 times',
    icon: '🎯',
    xpReward: 100,
    category: 'integration',
    order: 7,
  },
  {
    id: 'iterm-enthusiast',
    name: 'iTerm Enthusiast',
    description: 'Paste to iTerm2 terminal 10 times',
    icon: '⚡',
    xpReward: 100,
    category: 'integration',
    order: 8,
  },

  // Exploration Achievements (11 achievements)
  {
    id: 'feature-discoverer',
    name: 'Feature Discoverer',
    description: 'Use 5 different features',
    icon: '🔭',
    xpReward: 150,
    category: 'exploration',
    order: 1,
  },
  {
    id: 'jack-of-all-trades',
    name: 'Jack of All Trades',
    description: 'Use all major features at least once',
    icon: '🌟',
    xpReward: 400,
    category: 'exploration',
    order: 2,
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Use 5 features in a single session',
    icon: '🎭',
    xpReward: 300,
    category: 'exploration',
    order: 3,
  },
  {
    id: 'api-key-setup',
    name: 'API Key Setup',
    description: 'Configure your ElevenLabs API key',
    icon: '🔑',
    xpReward: 50,
    category: 'exploration',
    order: 4,
  },
  {
    id: 'microphone-selector',
    name: 'Microphone Selector',
    description: 'Change microphone selection',
    icon: '🎙️',
    xpReward: 50,
    category: 'exploration',
    order: 5,
  },
  {
    id: 'elevenlabs-explorer',
    name: 'ElevenLabs Explorer',
    description: 'Use ElevenLabs Scribe transcription engine',
    icon: '🎤',
    xpReward: 50,
    category: 'exploration',
    order: 6,
  },
  {
    id: 'deepgram-discoverer',
    name: 'Deepgram Discoverer',
    description: 'Use Deepgram transcription engine',
    icon: '🌊',
    xpReward: 50,
    category: 'exploration',
    order: 7,
  },
  {
    id: 'engine-switcher',
    name: 'Engine Switcher',
    description: 'Switch between transcription engines',
    icon: '🔄',
    xpReward: 100,
    category: 'exploration',
    order: 8,
  },
  {
    id: 'multi-engine-master',
    name: 'Multi-Engine Master',
    description: 'Use both ElevenLabs and Deepgram engines',
    icon: '🎛️',
    xpReward: 150,
    category: 'exploration',
    order: 9,
  },
  {
    id: 'experimental-mode',
    name: 'Experimental Mode',
    description: "Try a feature you haven't used in 30 days",
    icon: '🧪',
    xpReward: 100,
    category: 'exploration',
    order: 10,
  },
  {
    id: 'renaissance-user',
    name: 'Renaissance User',
    description: 'Use every category of feature in one day',
    icon: '🎨',
    xpReward: 500,
    category: 'exploration',
    order: 11,
  },
]

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category).sort((a, b) => a.order - b.order)
}

/**
 * Get total XP available from all achievements
 */
export function getTotalAchievementXP(): number {
  return ACHIEVEMENTS.reduce((total, achievement) => total + achievement.xpReward, 0)
}

/**
 * Get total number of achievements
 */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length
}
