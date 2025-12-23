/**
 * StreakDisplay Component
 *
 * Displays current and longest streak with visual fire indicators.
 */

import React from 'react'
import styles from './StreakDisplay.module.css'

export interface StreakDisplayProps {
  /** Current active streak */
  currentStreak: number
  /** Longest streak ever achieved */
  longestStreak: number
  /** Last active date (ISO string) */
  lastActiveDate: string
  /** Show tips for maintaining streak */
  showTips?: boolean
  /** Compact mode for side-by-side layouts */
  compact?: boolean
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  lastActiveDate,
  showTips = false,
  compact = false,
}) => {
  // Check if active today
  const today = new Date().toISOString().split('T')[0]
  const isActiveToday = lastActiveDate === today

  // Calculate streak status
  const getStreakStatus = () => {
    if (currentStreak === 0) return 'none'
    if (currentStreak < 3) return 'starting'
    if (currentStreak < 7) return 'building'
    if (currentStreak < 30) return 'strong'
    return 'legendary'
  }

  const streakStatus = getStreakStatus()

  const getStatusMessage = () => {
    switch (streakStatus) {
      case 'none':
        return 'Start your streak today!'
      case 'starting':
        return "You're getting started!"
      case 'building':
        return "You're building momentum!"
      case 'strong':
        return "You're on fire!"
      case 'legendary':
        return "You're unstoppable!"
      default:
        return ''
    }
  }

  const getFireCount = () => {
    if (currentStreak === 0) return 0
    if (currentStreak < 7) return 1
    if (currentStreak < 30) return 2
    return 3
  }

  if (compact) {
    // Compact mode: Centered badge design
    return (
      <div className={`${styles.container} ${styles[streakStatus]} ${styles.compact}`}>
        {/* Fire Badge */}
        <div className={styles.badgeContainer}>
          <div className={styles.fireBadge}>
            {Array.from({ length: getFireCount() }).map((_, i) => (
              <span
                key={i}
                className={styles.fire}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                🔥
              </span>
            ))}
            {currentStreak === 0 && <span className={styles.fireOff}>💨</span>}
          </div>
        </div>

        {/* Streak Title */}
        <div className={styles.streakTitle}>{currentStreak} Day Streak</div>

        {/* Bottom Info Row */}
        <div className={styles.bottomRow}>
          {isActiveToday && (
            <div className={styles.activeToday}>
              <span className={styles.checkmark}>✓</span> Today
            </div>
          )}
          <div className={styles.divider}></div>
          <div className={styles.bestStreak}>
            <span className={styles.trophy}>🏆</span> Best: {longestStreak}
          </div>
        </div>
      </div>
    )
  }

  // Full mode: Original detailed layout
  return (
    <div className={`${styles.container} ${styles[streakStatus]}`}>
      {/* Current Streak */}
      <div className={styles.currentStreak}>
        <div className={styles.fireContainer}>
          {Array.from({ length: getFireCount() }).map((_, i) => (
            <span
              key={i}
              className={styles.fire}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            >
              🔥
            </span>
          ))}
          {currentStreak === 0 && <span className={styles.fireOff}>💨</span>}
        </div>
        <div className={styles.streakInfo}>
          <div className={styles.streakNumber}>{currentStreak}</div>
          <div className={styles.streakLabel}>Day Streak</div>
          {isActiveToday && (
            <div className={styles.activeToday}>
              <span className={styles.checkmark}>✓</span> Active today
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className={styles.status}>
        <span className={styles.statusMessage}>{getStatusMessage()}</span>
      </div>

      {/* Longest Streak */}
      <div className={styles.longestStreak}>
        <div className={styles.trophy}>🏆</div>
        <div className={styles.longestInfo}>
          <div className={styles.longestLabel}>Longest Streak</div>
          <div className={styles.longestNumber}>{longestStreak} days</div>
        </div>
      </div>

      {/* Tips */}
      {showTips && currentStreak > 0 && (
        <div className={styles.tips}>
          <div className={styles.tipsTitle}>💡 Streak Tips</div>
          <ul className={styles.tipsList}>
            <li>Use the app every day to maintain your streak</li>
            <li>Set a daily reminder to stay consistent</li>
            {currentStreak >= 7 && <li>You've built a great habit! Keep it up!</li>}
          </ul>
        </div>
      )}

      {/* Warning if streak is at risk */}
      {!isActiveToday && currentStreak > 0 && (
        <div className={styles.warning}>
          <span className={styles.warningIcon}>⚠️</span>
          <span className={styles.warningText}>
            Use the app today to maintain your {currentStreak}-day streak!
          </span>
        </div>
      )}
    </div>
  )
}

export default StreakDisplay
