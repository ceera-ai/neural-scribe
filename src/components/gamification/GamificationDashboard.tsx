/**
 * GamificationDashboard Component
 *
 * Main dashboard showing overall gamification progress, stats, and recent achievements.
 */

import React from 'react'
import LevelProgressBar from './LevelProgressBar'
import StreakDisplay from './StreakDisplay'
import StatsCard from './StatsCard'
import styles from './GamificationDashboard.module.css'

export interface GamificationDashboardProps {
  /** Level system data */
  level: {
    currentLevel: number
    currentXP: number
    rank: string
    xpForCurrentLevel: number
    totalXPForNextLevel: number
    xpToNextLevel: number
  }
  /** Stats data */
  stats: {
    totalSessions: number
    totalWordsTranscribed: number
    totalRecordingTimeMs: number
    currentStreak: number
    longestStreak: number
    lastActiveDate: string
    firstSessionDate: string
  }
  /** Recent achievements (last 5 unlocked) */
  recentAchievements?: Array<{
    id: string
    name: string
    icon: string
    unlockedAt: number
  }>
  /** Click handlers */
  onViewAllAchievements?: () => void
  onViewAchievement?: (achievementId: string) => void
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  level,
  stats,
  recentAchievements = [],
  onViewAllAchievements,
  onViewAchievement,
}) => {
  // Calculate derived stats
  const totalHours = Math.floor(stats.totalRecordingTimeMs / 3600000)
  const totalMinutes = Math.floor((stats.totalRecordingTimeMs % 3600000) / 60000)
  const wordsPerMinute =
    stats.totalRecordingTimeMs > 0
      ? Math.round((stats.totalWordsTranscribed / stats.totalRecordingTimeMs) * 60000)
      : 0

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Your Progress</h1>
        <p className={styles.subtitle}>Track your transcription journey and unlock achievements</p>
      </div>

      {/* Level and Streak - Compact Side by Side */}
      <div className={styles.compactRow}>
        <LevelProgressBar
          currentLevel={level.currentLevel}
          currentXP={level.currentXP}
          rank={level.rank}
          xpForCurrentLevel={level.xpForCurrentLevel}
          totalXPForNextLevel={level.totalXPForNextLevel}
          xpToNextLevel={level.xpToNextLevel}
          compact
        />
        <StreakDisplay
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
          lastActiveDate={stats.lastActiveDate}
          compact
        />
      </div>

      {/* Quick Stats */}
      <div className={styles.section}>
        <div className={styles.quickStats}>
          <h2 className={styles.sectionTitle}>Quick Stats</h2>
          <div className={styles.statsGrid}>
            <StatsCard
              icon="🎤"
              label="Sessions"
              value={stats.totalSessions.toLocaleString()}
              color="blue"
            />
            <StatsCard
              icon="📝"
              label="Words"
              value={stats.totalWordsTranscribed.toLocaleString()}
              color="green"
            />
            <StatsCard
              icon="⏱️"
              label="Time"
              value={totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`}
              secondaryValue={`${Math.floor(stats.totalRecordingTimeMs / 60000)} total minutes`}
              color="purple"
            />
            <StatsCard
              icon="⚡"
              label="Speed"
              value={wordsPerMinute}
              secondaryValue="words per minute"
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Achievements</h2>
            {onViewAllAchievements && (
              <button onClick={onViewAllAchievements} className={styles.viewAllBtn}>
                View All →
              </button>
            )}
          </div>

          <div className={styles.achievementsList}>
            {recentAchievements.map((achievement) => {
              const timeAgo = getTimeAgo(achievement.unlockedAt)
              return (
                <div
                  key={achievement.id}
                  className={styles.achievementItem}
                  onClick={() => onViewAchievement?.(achievement.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onViewAchievement?.(achievement.id)
                    }
                  }}
                >
                  <span className={styles.achievementIcon}>{achievement.icon}</span>
                  <div className={styles.achievementInfo}>
                    <span className={styles.achievementName}>{achievement.name}</span>
                    <span className={styles.achievementTime}>{timeAgo}</span>
                  </div>
                  <span className={styles.achievementBadge}>✓</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state if no achievements */}
      {recentAchievements.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No achievements yet</h3>
          <p className={styles.emptyText}>
            Complete transcription sessions to start unlocking achievements!
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function to format time ago
function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default GamificationDashboard
