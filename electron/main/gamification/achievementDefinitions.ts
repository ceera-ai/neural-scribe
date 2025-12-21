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
  category: 'milestone' | 'words' | 'streak' | 'speed' | 'time' | 'level'
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
