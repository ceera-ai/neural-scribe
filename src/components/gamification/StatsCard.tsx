/**
 * StatsCard Component
 *
 * Displays an individual stat with icon, label, value, and optional progress.
 */

import React from 'react'
import styles from './StatsCard.module.css'

export interface StatsCardProps {
  /** Icon (emoji) */
  icon: string
  /** Stat label */
  label: string
  /** Stat value */
  value: string | number
  /** Optional secondary value */
  secondaryValue?: string
  /** Optional progress (0-100) */
  progress?: number
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral'
  /** Optional color theme */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  /** Click handler */
  onClick?: () => void
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  secondaryValue,
  progress,
  trend,
  color = 'blue',
  onClick,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return styles.trendUp
      case 'down':
        return styles.trendDown
      default:
        return styles.trendNeutral
    }
  }

  return (
    <div
      className={`${styles.card} ${styles[color]} ${onClick ? styles.clickable : ''}`}
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
    >
      {/* Icon */}
      <div className={styles.iconContainer}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.valueContainer}>
          <span className={styles.value}>{value}</span>
          {trend && <span className={`${styles.trend} ${getTrendColor()}`}>{getTrendIcon()}</span>}
        </div>
        {secondaryValue && <div className={styles.secondary}>{secondaryValue}</div>}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
