/**
 * AchievementBadge Component
 *
 * Circular badge displaying achievement icon with locked/unlocked states.
 */

import React from 'react'
import styles from './AchievementBadge.module.css'

export interface AchievementBadgeProps {
  /** Achievement icon (emoji) */
  icon: string
  /** Achievement name (for tooltip) */
  name: string
  /** Whether achievement is unlocked */
  isUnlocked: boolean
  /** Progress percentage (0-100) for locked achievements */
  progress?: number
  /** Size variant */
  size?: 'small' | 'medium' | 'large'
  /** Rarity tier */
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Click handler */
  onClick?: () => void
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  name,
  isUnlocked,
  progress = 0,
  size = 'medium',
  rarity = 'common',
  showTooltip = true,
  onClick,
}) => {
  return (
    <div
      className={`${styles.badge} ${styles[size]} ${styles[rarity]} ${
        isUnlocked ? styles.unlocked : styles.locked
      } ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={`${name} achievement, ${isUnlocked ? 'unlocked' : 'locked'}`}
    >
      {/* Icon */}
      <div className={styles.iconContainer}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
        {isUnlocked && <div className={styles.checkmark}>✓</div>}
      </div>

      {/* Progress ring for locked achievements */}
      {!isUnlocked && progress > 0 && (
        <svg className={styles.progressRing} viewBox="0 0 100 100">
          <circle
            className={styles.progressRingBg}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className={styles.progressRingFill}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeDasharray={`${progress * 2.827} 282.7`}
            strokeDashoffset="0"
          />
        </svg>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipName}>{name}</div>
          {!isUnlocked && progress > 0 && (
            <div className={styles.tooltipProgress}>{progress}% complete</div>
          )}
          {isUnlocked && <div className={styles.tooltipStatus}>Unlocked!</div>}
        </div>
      )}
    </div>
  )
}

export default AchievementBadge
