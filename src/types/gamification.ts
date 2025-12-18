// Gamification System Types

export interface UserStats {
  totalWordsTranscribed: number;
  totalRecordingTimeMs: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string (YYYY-MM-DD)
  firstSessionDate: string; // ISO date string
}

export interface LevelSystem {
  currentXP: number;
  level: number;
  rank: string;
  xpToNextLevel: number;
  xpForCurrentLevel: number;
  totalXPForNextLevel: number;
}

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory = 'words' | 'time' | 'sessions' | 'streaks' | 'special';

export interface AchievementRequirement {
  type: 'words' | 'time_minutes' | 'sessions' | 'streak_days' | 'level' | 'special';
  value: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  category: AchievementCategory;
  requirement: AchievementRequirement;
  xpReward: number;
  rarity: AchievementRarity;
  unlockedAt?: number; // Timestamp when unlocked
  progress?: number; // Current progress toward achievement
}

export interface GamificationState {
  stats: UserStats;
  level: LevelSystem;
  achievements: Achievement[];
  unlockedAchievementIds: string[];
  recentUnlocks: Achievement[]; // Achievements unlocked in current session
}

// XP Reward configuration
export interface XPConfig {
  perWord: number;
  perMinute: number;
  perSession: number;
  dailyLoginBonus: number;
}

// Level configuration
export interface LevelConfig {
  baseXP: number;
  growthRate: number;
  ranks: RankInfo[];
}

export interface RankInfo {
  minLevel: number;
  name: string;
  icon: string;
}

// Event types for gamification updates
export type GamificationEvent =
  | { type: 'SESSION_START' }
  | { type: 'SESSION_END'; words: number; durationMs: number }
  | { type: 'WORDS_TRANSCRIBED'; count: number }
  | { type: 'DAILY_LOGIN' }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievement: Achievement };

// Default configurations
export const DEFAULT_XP_CONFIG: XPConfig = {
  perWord: 1,
  perMinute: 10,
  perSession: 25,
  dailyLoginBonus: 50,
};

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  baseXP: 100,
  growthRate: 1.5,
  ranks: [
    { minLevel: 1, name: 'Initiate', icon: '🌱' },
    { minLevel: 5, name: 'Apprentice', icon: '📝' },
    { minLevel: 10, name: 'Scribe', icon: '✍️' },
    { minLevel: 15, name: 'Transcriber', icon: '🎙️' },
    { minLevel: 20, name: 'Linguist', icon: '🗣️' },
    { minLevel: 30, name: 'Oracle', icon: '🔮' },
    { minLevel: 40, name: 'Cyberscribe', icon: '⚡' },
    { minLevel: 50, name: 'Neural Sage', icon: '🧠' },
    { minLevel: 75, name: 'Transcendant', icon: '✨' },
    { minLevel: 100, name: 'Singularity', icon: '🌌' },
  ],
};

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Words achievements
  {
    id: 'first_words',
    name: 'First Words',
    description: 'Transcribe your first 10 words',
    icon: '🎤',
    category: 'words',
    requirement: { type: 'words', value: 10 },
    xpReward: 25,
    rarity: 'common',
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Transcribe 100 words',
    icon: '💯',
    category: 'words',
    requirement: { type: 'words', value: 100 },
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Transcribe 1,000 words',
    icon: '📖',
    category: 'words',
    requirement: { type: 'words', value: 1000 },
    xpReward: 100,
    rarity: 'uncommon',
  },
  {
    id: 'novelist',
    name: 'Novelist',
    description: 'Transcribe 10,000 words',
    icon: '📚',
    category: 'words',
    requirement: { type: 'words', value: 10000 },
    xpReward: 250,
    rarity: 'rare',
  },
  {
    id: 'living_library',
    name: 'Living Library',
    description: 'Transcribe 100,000 words',
    icon: '🏛️',
    category: 'words',
    requirement: { type: 'words', value: 100000 },
    xpReward: 1000,
    rarity: 'legendary',
  },

  // Time achievements
  {
    id: 'first_minute',
    name: 'First Minute',
    description: 'Record for 1 minute total',
    icon: '⏱️',
    category: 'time',
    requirement: { type: 'time_minutes', value: 1 },
    xpReward: 25,
    rarity: 'common',
  },
  {
    id: 'ten_minutes',
    name: 'Ten Minutes',
    description: 'Record for 10 minutes total',
    icon: '⏰',
    category: 'time',
    requirement: { type: 'time_minutes', value: 10 },
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'hour_of_power',
    name: 'Hour of Power',
    description: 'Record for 1 hour total',
    icon: '🕐',
    category: 'time',
    requirement: { type: 'time_minutes', value: 60 },
    xpReward: 150,
    rarity: 'uncommon',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Record for 10 hours total',
    icon: '🏃',
    category: 'time',
    requirement: { type: 'time_minutes', value: 600 },
    xpReward: 500,
    rarity: 'epic',
  },

  // Session achievements
  {
    id: 'hello_world',
    name: 'Hello World',
    description: 'Complete your first session',
    icon: '👋',
    category: 'sessions',
    requirement: { type: 'sessions', value: 1 },
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Complete 10 sessions',
    icon: '🔄',
    category: 'sessions',
    requirement: { type: 'sessions', value: 10 },
    xpReward: 100,
    rarity: 'uncommon',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 100 sessions',
    icon: '🎖️',
    category: 'sessions',
    requirement: { type: 'sessions', value: 100 },
    xpReward: 300,
    rarity: 'rare',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Complete 1,000 sessions',
    icon: '👑',
    category: 'sessions',
    requirement: { type: 'sessions', value: 1000 },
    xpReward: 1000,
    rarity: 'legendary',
  },

  // Streak achievements
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 3 },
    xpReward: 75,
    rarity: 'common',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 7 },
    xpReward: 150,
    rarity: 'uncommon',
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 30 },
    xpReward: 500,
    rarity: 'epic',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '💎',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 100 },
    xpReward: 2000,
    rarity: 'legendary',
  },

  // Level achievements
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'special',
    requirement: { type: 'level', value: 5 },
    xpReward: 100,
    rarity: 'common',
  },
  {
    id: 'level_10',
    name: 'Dedicated',
    description: 'Reach level 10',
    icon: '🌟',
    category: 'special',
    requirement: { type: 'level', value: 10 },
    xpReward: 200,
    rarity: 'uncommon',
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Reach level 25',
    icon: '💫',
    category: 'special',
    requirement: { type: 'level', value: 25 },
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: 'level_50',
    name: 'Master',
    description: 'Reach level 50',
    icon: '🌠',
    category: 'special',
    requirement: { type: 'level', value: 50 },
    xpReward: 1000,
    rarity: 'epic',
  },
];

// Helper functions
export function getDefaultStats(): UserStats {
  const today = new Date().toISOString().split('T')[0];
  return {
    totalWordsTranscribed: 0,
    totalRecordingTimeMs: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    firstSessionDate: today,
  };
}

export function getDefaultLevelSystem(): LevelSystem {
  return {
    currentXP: 0,
    level: 1,
    rank: DEFAULT_LEVEL_CONFIG.ranks[0].name,
    xpToNextLevel: DEFAULT_LEVEL_CONFIG.baseXP,
    xpForCurrentLevel: 0,
    totalXPForNextLevel: DEFAULT_LEVEL_CONFIG.baseXP,
  };
}

export function calculateXPForLevel(level: number, config = DEFAULT_LEVEL_CONFIG): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(config.baseXP * Math.pow(config.growthRate, i - 1));
  }
  return total;
}

export function calculateLevelFromXP(xp: number, config = DEFAULT_LEVEL_CONFIG): number {
  let level = 1;
  let xpRequired = 0;
  while (xp >= xpRequired + Math.floor(config.baseXP * Math.pow(config.growthRate, level - 1))) {
    xpRequired += Math.floor(config.baseXP * Math.pow(config.growthRate, level - 1));
    level++;
  }
  return level;
}

export function getRankForLevel(level: number, config = DEFAULT_LEVEL_CONFIG): RankInfo {
  const ranks = [...config.ranks].sort((a, b) => b.minLevel - a.minLevel);
  return ranks.find(r => level >= r.minLevel) || config.ranks[0];
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common': return '#a0a0a0';
    case 'uncommon': return '#00ff88';
    case 'rare': return '#00aaff';
    case 'epic': return '#aa00ff';
    case 'legendary': return '#ffaa00';
    default: return '#ffffff';
  }
}
