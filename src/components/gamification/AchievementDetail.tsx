/**
 * AchievementDetail Component
 *
 * Modal dialog showing detailed information about a specific achievement.
 */

import React, { useEffect, useRef } from 'react'
import styles from './AchievementDetail.module.css'

export interface AchievementDetailProps {
  /** Achievement ID */
  id: string
  /** Achievement name */
  name: string
  /** Achievement description */
  description: string
  /** Achievement icon (emoji) */
  icon: string
  /** XP reward */
  xpReward: number
  /** Category */
  category: string
  /** Whether unlocked */
  isUnlocked: boolean
  /** Unlock timestamp (if unlocked) */
  unlockedAt?: number
  /** Progress percentage (0-100) */
  progress?: number
  /** Whether modal is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Related achievements (IDs of similar achievements) */
  relatedAchievements?: Array<{
    id: string
    name: string
    icon: string
    isUnlocked: boolean
  }>
}

export const AchievementDetail: React.FC<AchievementDetailProps> = ({
  name,
  description,
  icon,
  xpReward,
  category,
  isUnlocked,
  unlockedAt,
  progress = 0,
  isOpen,
  onClose,
  relatedAchievements = [],
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      firstElement?.focus()

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
      role="presentation"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={modalRef}
        className={`${styles.modal} ${isUnlocked ? styles.unlocked : styles.locked}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-title"
        aria-describedby="achievement-description"
      >
        {/* Close button */}
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close dialog">
          ✕
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
            {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
            {isUnlocked && <div className={styles.unlockBadge}>✓</div>}
          </div>

          <div className={styles.headerContent}>
            <span className={styles.category}>{category}</span>
            <h2 id="achievement-title" className={styles.title}>
              {name}
            </h2>
            <div className={styles.xpBadge}>
              <span className={styles.xpIcon}>⭐</span>
              <span>{xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={styles.status}>
          {isUnlocked ? (
            <div className={styles.statusUnlocked}>
              <span className={styles.statusIcon}>🎉</span>
              <div>
                <div className={styles.statusLabel}>Unlocked!</div>
                {unlockedAt && <div className={styles.statusDate}>{formatDate(unlockedAt)}</div>}
              </div>
            </div>
          ) : (
            <div className={styles.statusLocked}>
              <div className={styles.statusLabel}>
                {progress > 0 ? `${progress}% Complete` : 'Not Started'}
              </div>
              {progress > 0 && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <p id="achievement-description" className={styles.description}>
            {description}
          </p>
        </div>

        {/* Requirements (for locked achievements) */}
        {!isUnlocked && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>How to Unlock</h3>
            <div className={styles.requirements}>
              <p className={styles.requirementText}>{getRequirementText(category, name)}</p>
            </div>
          </div>
        )}

        {/* Related Achievements */}
        {relatedAchievements.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Related Achievements</h3>
            <div className={styles.relatedGrid}>
              {relatedAchievements.map((related) => (
                <div key={related.id} className={styles.relatedCard}>
                  <span className={styles.relatedIcon}>{related.icon}</span>
                  <span className={styles.relatedName}>{related.name}</span>
                  {related.isUnlocked && <span className={styles.relatedBadge}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to generate requirement text based on category
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getRequirementText(category: string, _name: string): string {
  const texts: Record<string, string> = {
    milestone: 'Complete the required number of transcription sessions to unlock this achievement.',
    words:
      'Transcribe the required number of words across all your sessions to unlock this achievement.',
    streak: 'Maintain a consecutive daily streak by using the app each day without missing a day.',
    speed: 'Achieve the required words per minute average across your transcription sessions.',
    time: 'Accumulate the required total recording time across all your transcription sessions.',
    level:
      'Reach the required level by earning XP through sessions and unlocking other achievements.',
  }

  return texts[category] || 'Complete the requirements shown in the achievement description.'
}

export default AchievementDetail
