/**
 * LevelProgressBar Component
 *
 * Displays XP progress towards the next level with animated progress bar.
 */

import React from 'react'
import styles from './LevelProgressBar.module.css'

export interface LevelProgressBarProps {
  /** Current level */
  currentLevel: number
  /** Current XP */
  currentXP: number
  /** Rank name */
  rank: string
  /** XP needed for current level */
  xpForCurrentLevel: number
  /** Total XP needed for next level */
  totalXPForNextLevel: number
  /** XP still needed to reach next level */
  xpToNextLevel: number
  /** Size variant */
  size?: 'small' | 'medium' | 'large'
  /** Show detailed stats */
  showDetails?: boolean
  /** Compact mode for side-by-side layouts */
  compact?: boolean
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentLevel,
  currentXP,
  rank,
  xpForCurrentLevel,
  totalXPForNextLevel,
  xpToNextLevel,
  size = 'medium',
  showDetails = true,
  compact = false,
}) => {
  // Calculate progress percentage
  const progress = Math.min(
    100,
    ((currentXP - xpForCurrentLevel) / (totalXPForNextLevel - xpForCurrentLevel)) * 100
  )

  return (
    <div className={`${styles.container} ${styles[size]} ${compact ? styles.compact : ''}`}>
      {/* Level and Rank Header */}
      <div className={styles.header}>
        <div className={styles.levelBadge}>
          <span className={styles.levelLabel}>Level</span>
          <span className={styles.levelNumber}>{currentLevel}</span>
        </div>
        <div className={styles.rankInfo}>
          <span className={styles.rank}>{rank}</span>
          {showDetails && <span className={styles.nextLevel}>Next: Level {currentLevel + 1}</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${Math.round(progress)}% progress to next level`}
        >
          <div className={styles.progressFill} style={{ width: `${progress}%` }}>
            <div className={styles.progressGlow} />
          </div>
        </div>
        {showDetails && <div className={styles.progressLabel}>{Math.round(progress)}%</div>}
      </div>

      {/* XP Details */}
      {showDetails && (
        <div className={styles.details}>
          {!compact && (
            <>
              <div className={styles.xpCurrent}>
                <span className={styles.xpValue}>{currentXP.toLocaleString()}</span>
                <span className={styles.xpLabel}>Current XP</span>
              </div>
              <div className={styles.xpDivider}>/</div>
              <div className={styles.xpNext}>
                <span className={styles.xpValue}>{totalXPForNextLevel.toLocaleString()}</span>
                <span className={styles.xpLabel}>Next Level</span>
              </div>
            </>
          )}
          <div className={styles.xpRemaining}>
            <span className={styles.xpRemainingValue}>
              {xpToNextLevel.toLocaleString()} XP to go
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelProgressBar
