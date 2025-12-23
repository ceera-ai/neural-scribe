/**
 * AchievementCard Component
 *
 * Displays an individual achievement with icon, name, description, and progress.
 * Shows locked/unlocked state with visual indicators.
 */

import React from 'react'
import styles from './AchievementCard.module.css'

export interface AchievementCardProps {
  /** Achievement ID */
  id: string
  /** Achievement name */
  name: string
  /** Achievement description */
  description: string
  /** Achievement icon (emoji) */
  icon: string
  /** XP reward for unlocking */
  xpReward: number
  /** Category (milestone, words, streak, etc.) */
  category: string
  /** Whether achievement is unlocked */
  isUnlocked: boolean
  /** Unlock timestamp (if unlocked) */
  unlockedAt?: number
  /** Progress percentage (0-100) for locked achievements */
  progress?: number
  /** Click handler */
  onClick?: () => void
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'compact'
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  name,
  description,
  icon,
  xpReward,
  category,
  isUnlocked,
  unlockedAt,
  progress = 0,
  onClick,
  size = 'medium',
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`${styles.card} ${styles[size]} ${isUnlocked ? styles.unlocked : styles.locked}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`${name} achievement, ${isUnlocked ? 'unlocked' : `locked, ${progress}% complete`}`}
      style={
        size === 'compact' && !isUnlocked
          ? ({ '--progress': progress || 0 } as React.CSSProperties)
          : undefined
      }
    >
      {/* Icon */}
      <div className={styles.iconContainer}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.xp}>{xpReward} XP</span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.meta}>
          <span className={styles.category}>{category}</span>
          {isUnlocked && unlockedAt && (
            <span className={styles.unlockDate}>Unlocked {formatDate(unlockedAt)}</span>
          )}
        </div>

        {/* Progress Bar (for locked achievements) */}
        {!isUnlocked && progress > 0 && (
          <div
            className={styles.progressContainer}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AchievementCard
