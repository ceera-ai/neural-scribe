import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UserStats,
  LevelSystem,
  Achievement,
  GamificationState,
} from '../types/gamification';
import {
  ACHIEVEMENTS,
  DEFAULT_XP_CONFIG,
  DEFAULT_LEVEL_CONFIG,
  getDefaultStats,
  getDefaultLevelSystem,
  calculateLevelFromXP,
  calculateXPForLevel,
  getRankForLevel,
} from '../types/gamification';

const STORAGE_KEY = 'neural_scribe_gamification';

interface UseGamificationReturn {
  stats: UserStats;
  level: LevelSystem;
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  recentUnlocks: Achievement[];
  xpProgress: number; // 0-1, progress to next level

  // Actions
  recordSession: (words: number, durationMs: number) => void;
  checkDailyLogin: () => void;
  clearRecentUnlocks: () => void;
  resetProgress: () => void;
}

function loadState(): GamificationState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load gamification state:', e);
  }
  return null;
}

function saveState(state: GamificationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save gamification state:', e);
  }
}

export function useGamification(): UseGamificationReturn {
  const [stats, setStats] = useState<UserStats>(getDefaultStats);
  const [level, setLevel] = useState<LevelSystem>(getDefaultLevelSystem);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);

  const isInitialized = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setStats(saved.stats);
      setLevel(saved.level);
      setUnlockedIds(new Set(saved.unlockedAchievementIds));
    }
    isInitialized.current = true;
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (!isInitialized.current) return;

    const state: GamificationState = {
      stats,
      level,
      achievements: ACHIEVEMENTS,
      unlockedAchievementIds: Array.from(unlockedIds),
      recentUnlocks,
    };
    saveState(state);
  }, [stats, level, unlockedIds, recentUnlocks]);

  // Add XP and handle level ups
  const addXP = useCallback((xp: number) => {
    setLevel(prev => {
      const newXP = prev.currentXP + xp;
      const newLevel = calculateLevelFromXP(newXP);
      const xpForCurrentLevel = calculateXPForLevel(newLevel);
      const xpForNextLevel = calculateXPForLevel(newLevel + 1);
      const rank = getRankForLevel(newLevel);

      return {
        currentXP: newXP,
        level: newLevel,
        rank: rank.name,
        xpForCurrentLevel,
        totalXPForNextLevel: xpForNextLevel,
        xpToNextLevel: xpForNextLevel - newXP,
      };
    });
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback((currentStats: UserStats, currentLevel: number) => {
    const newUnlocks: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      const { type, value } = achievement.requirement;

      switch (type) {
        case 'words':
          shouldUnlock = currentStats.totalWordsTranscribed >= value;
          break;
        case 'time_minutes':
          shouldUnlock = currentStats.totalRecordingTimeMs >= value * 60 * 1000;
          break;
        case 'sessions':
          shouldUnlock = currentStats.totalSessions >= value;
          break;
        case 'streak_days':
          shouldUnlock = currentStats.currentStreak >= value;
          break;
        case 'level':
          shouldUnlock = currentLevel >= value;
          break;
      }

      if (shouldUnlock) {
        newUnlocks.push({
          ...achievement,
          unlockedAt: Date.now(),
        });
      }
    }

    if (newUnlocks.length > 0) {
      // Update unlocked IDs
      setUnlockedIds(prev => {
        const newSet = new Set(prev);
        newUnlocks.forEach(a => newSet.add(a.id));
        return newSet;
      });

      // Add to recent unlocks
      setRecentUnlocks(prev => [...prev, ...newUnlocks]);

      // Award XP for achievements
      const totalXP = newUnlocks.reduce((sum, a) => sum + a.xpReward, 0);
      if (totalXP > 0) {
        addXP(totalXP);
      }
    }
  }, [unlockedIds, addXP]);

  // Update streak based on date
  const updateStreak = useCallback((currentStats: UserStats): UserStats => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = currentStats.lastActiveDate;

    if (!lastActive) {
      // First session ever
      return {
        ...currentStats,
        currentStreak: 1,
        longestStreak: Math.max(1, currentStats.longestStreak),
        lastActiveDate: today,
      };
    }

    if (lastActive === today) {
      // Already active today
      return currentStats;
    }

    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day - extend streak
      const newStreak = currentStats.currentStreak + 1;
      return {
        ...currentStats,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, currentStats.longestStreak),
        lastActiveDate: today,
      };
    } else {
      // Streak broken - reset
      return {
        ...currentStats,
        currentStreak: 1,
        lastActiveDate: today,
      };
    }
  }, []);

  // Record a completed session
  const recordSession = useCallback((words: number, durationMs: number) => {
    setStats(prev => {
      const updated = updateStreak({
        ...prev,
        totalWordsTranscribed: prev.totalWordsTranscribed + words,
        totalRecordingTimeMs: prev.totalRecordingTimeMs + durationMs,
        totalSessions: prev.totalSessions + 1,
      });

      // Schedule achievement check after state update
      setTimeout(() => {
        checkAchievements(updated, level.level);
      }, 0);

      return updated;
    });

    // Calculate and add XP
    const wordXP = words * DEFAULT_XP_CONFIG.perWord;
    const timeXP = Math.floor(durationMs / 60000) * DEFAULT_XP_CONFIG.perMinute;
    const sessionXP = DEFAULT_XP_CONFIG.perSession;
    addXP(wordXP + timeXP + sessionXP);
  }, [updateStreak, checkAchievements, addXP, level.level]);

  // Check daily login bonus
  const checkDailyLogin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    if (stats.lastActiveDate !== today) {
      setStats(prev => updateStreak(prev));
      addXP(DEFAULT_XP_CONFIG.dailyLoginBonus);
    }
  }, [stats.lastActiveDate, updateStreak, addXP]);

  // Clear recent unlock notifications
  const clearRecentUnlocks = useCallback(() => {
    setRecentUnlocks([]);
  }, []);

  // Reset all progress
  const resetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setStats(getDefaultStats());
      setLevel(getDefaultLevelSystem());
      setUnlockedIds(new Set());
      setRecentUnlocks([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Calculate XP progress (0-1)
  const xpProgress = level.totalXPForNextLevel > level.xpForCurrentLevel
    ? (level.currentXP - level.xpForCurrentLevel) / (level.totalXPForNextLevel - level.xpForCurrentLevel)
    : 0;

  // Map achievements with progress and unlock status
  const achievements: Achievement[] = ACHIEVEMENTS.map(achievement => {
    const isUnlocked = unlockedIds.has(achievement.id);
    let progress = 0;

    if (!isUnlocked) {
      const { type, value } = achievement.requirement;
      switch (type) {
        case 'words':
          progress = Math.min(1, stats.totalWordsTranscribed / value);
          break;
        case 'time_minutes':
          progress = Math.min(1, stats.totalRecordingTimeMs / (value * 60 * 1000));
          break;
        case 'sessions':
          progress = Math.min(1, stats.totalSessions / value);
          break;
        case 'streak_days':
          progress = Math.min(1, stats.currentStreak / value);
          break;
        case 'level':
          progress = Math.min(1, level.level / value);
          break;
      }
    } else {
      progress = 1;
    }

    return {
      ...achievement,
      progress,
      unlockedAt: isUnlocked ? Date.now() : undefined,
    };
  });

  const unlockedAchievements = achievements.filter(a => unlockedIds.has(a.id));

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
  };
}
