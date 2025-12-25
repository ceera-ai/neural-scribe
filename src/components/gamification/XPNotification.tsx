/**
 * XPNotification Component
 *
 * Toast-style notification shown when XP is gained from a session.
 * Displays XP amount with animations.
 */

import React, { useEffect, useState, useCallback } from 'react'
import styles from './XPNotification.module.css'

export interface XPNotificationProps {
  /** XP amount gained */
  xpGained: number
  /** Whether notification is visible */
  isVisible: boolean
  /** Duration before auto-dismiss (ms) */
  duration?: number
  /** Callback when notification is dismissed */
  onDismiss: () => void
  /** Click handler */
  onClick?: () => void
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  xpGained,
  isVisible,
  duration = 3000,
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
    }
    handleDismiss()
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
      role={onClick ? 'button' : 'status'}
      aria-live="polite"
      aria-atomic="true"
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon with pulse effect */}
      <div className={styles.iconContainer}>
        <span className={styles.icon} aria-hidden="true">
          ⚡
        </span>
        <div className={styles.glow} />
      </div>

      {/* XP Amount */}
      <div className={styles.content}>
        <span className={styles.xpText}>+{xpGained} XP</span>
        <span className={styles.label}>Experience Gained</span>
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

export default XPNotification
