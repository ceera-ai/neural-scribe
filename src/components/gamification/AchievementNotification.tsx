/**
 * AchievementNotification Component
 *
 * Toast-style notification shown when an achievement is unlocked.
 * Displays achievement icon, name, and XP reward with animations.
 */

import React, { useEffect, useState, useCallback } from 'react'
import styles from './AchievementNotification.module.css'

export interface AchievementNotificationProps {
  /** Achievement name */
  name: string
  /** Achievement description */
  description: string
  /** Achievement icon (emoji) */
  icon: string
  /** XP reward */
  xpReward: number
  /** Whether notification is visible */
  isVisible: boolean
  /** Duration before auto-dismiss (ms) */
  duration?: number
  /** Callback when notification is dismissed */
  onDismiss: () => void
  /** Click handler to view details */
  onClick?: () => void
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  name,
  description,
  icon,
  xpReward,
  isVisible,
  duration = 5000,
  onDismiss,
  onClick,
}) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
      setIsExiting(false)
    }, 300) // Match exit animation duration
  }, [onDismiss])

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, handleDismiss])

  const handleClick = () => {
    if (onClick) {
      onClick()
      handleDismiss()
    }
  }

  if (!isVisible && !isExiting) return null

  return (
    <div
      className={`${styles.notification} ${isExiting ? styles.exiting : styles.entering}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role={onClick ? 'button' : 'alert'}
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Achievement Unlocked Badge */}
      <div className={styles.badge}>
        <span className={styles.badgeText}>Achievement Unlocked!</span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Icon with shine effect */}
        <div className={styles.iconContainer}>
          <div className={styles.shine} />
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <div className={styles.glow} />
        </div>

        {/* Details */}
        <div className={styles.details}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.xpBadge}>
            <span className={styles.xpIcon}>⭐</span>
            <span className={styles.xpText}>+{xpReward} XP</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className={styles.closeBtn}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  )
}

export default AchievementNotification
