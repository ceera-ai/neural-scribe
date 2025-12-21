/**
 * useAchievementNotifications Hook
 *
 * Custom hook for listening to achievement unlock events and displaying notifications.
 * Fetches achievement details and triggers the notification queue.
 */

import { useEffect, useCallback } from 'react'
import { showAchievementNotification } from '../components/gamification/NotificationQueue'

// Achievement definitions (mirrored from main process)
const ACHIEVEMENTS = [
  // Milestone
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first transcription session',
    icon: '🌱',
    xpReward: 50,
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 10 transcription sessions',
    icon: '🚀',
    xpReward: 100,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 100 transcription sessions',
    icon: '🎖️',
    xpReward: 500,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Complete 500 transcription sessions',
    icon: '👑',
    xpReward: 1000,
  },

  // Words
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Transcribe 1,000 words',
    icon: '💬',
    xpReward: 100,
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Transcribe 10,000 words',
    icon: '📝',
    xpReward: 300,
  },
  {
    id: 'eloquent',
    name: 'Eloquent',
    description: 'Transcribe 50,000 words',
    icon: '✍️',
    xpReward: 750,
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    description: 'Transcribe 100,000 words',
    icon: '🎙️',
    xpReward: 1500,
  },
  {
    id: 'word-wizard',
    name: 'Word Wizard',
    description: 'Transcribe 500,000 words',
    icon: '🧙',
    xpReward: 3000,
  },

  // Streak
  {
    id: 'committed',
    name: 'Committed',
    description: 'Maintain a 3 day streak',
    icon: '🔥',
    xpReward: 75,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7 day streak',
    icon: '💪',
    xpReward: 150,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30 day streak',
    icon: '⚡',
    xpReward: 500,
  },
  {
    id: 'legendary-streak',
    name: 'Legendary Streak',
    description: 'Maintain a 100 day streak',
    icon: '🌟',
    xpReward: 2000,
  },

  // Speed
  {
    id: 'fast-talker',
    name: 'Fast Talker',
    description: 'Achieve 150 words per minute average',
    icon: '🏃',
    xpReward: 200,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Achieve 200 words per minute average',
    icon: '💨',
    xpReward: 400,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    description: 'Achieve 250 words per minute average',
    icon: '⚡',
    xpReward: 800,
  },

  // Time
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Accumulate 1 hour of total recording time',
    icon: '⏱️',
    xpReward: 150,
  },
  {
    id: 'endurance',
    name: 'Endurance',
    description: 'Accumulate 10 hours of total recording time',
    icon: '⌛',
    xpReward: 500,
  },
  {
    id: 'time-lord',
    name: 'Time Lord',
    description: 'Accumulate 50 hours of total recording time',
    icon: '🕰️',
    xpReward: 1500,
  },
  {
    id: 'timeless',
    name: 'Timeless',
    description: 'Accumulate 100 hours of total recording time',
    icon: '♾️',
    xpReward: 3000,
  },

  // Level
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach Level 10',
    icon: '⭐',
    xpReward: 200,
  },
  {
    id: 'power-user',
    name: 'Power User',
    description: 'Reach Level 25',
    icon: '💎',
    xpReward: 500,
  },
  { id: 'elite', name: 'Elite', description: 'Reach Level 50', icon: '🏆', xpReward: 1000 },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Reach Level 100',
    icon: '✨',
    xpReward: 2500,
  },
]

/**
 * Get achievement details by ID
 */
function getAchievementById(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Hook for managing achievement notifications
 */
export function useAchievementNotifications(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _onAchievementClick?: (achievementId: string) => void
) {
  // Handle achievement unlocked event
  const handleAchievementUnlocked = useCallback((_event: unknown, achievementId: string) => {
    const achievement = getAchievementById(achievementId)
    if (!achievement) {
      console.warn(`Achievement not found: ${achievementId}`)
      return
    }

    // Show notification
    showAchievementNotification({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
    })
  }, [])

  // Set up IPC listener
  useEffect(() => {
    window.electron.ipcRenderer.on('achievement-unlocked', handleAchievementUnlocked)

    return () => {
      window.electron.ipcRenderer.removeListener('achievement-unlocked', handleAchievementUnlocked)
    }
  }, [handleAchievementUnlocked])

  // Manually trigger a notification (for testing or manual triggers)
  const showNotification = useCallback((achievementId: string) => {
    const achievement = getAchievementById(achievementId)
    if (!achievement) {
      console.warn(`Achievement not found: ${achievementId}`)
      return
    }

    showAchievementNotification({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
    })
  }, [])

  return {
    showNotification,
  }
}

export default useAchievementNotifications
