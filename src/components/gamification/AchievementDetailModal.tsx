import type { Achievement, UserStats, LevelSystem } from '../../types/gamification'
import './AchievementDetailModal.css'

interface AchievementDetailModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
  onShare?: (achievement: Achievement) => void
  stats: UserStats
  level: LevelSystem
}

export function AchievementDetailModal({
  achievement,
  isOpen,
  onClose,
  onShare,
  stats,
  level,
}: AchievementDetailModalProps) {
  if (!isOpen || !achievement) return null

  const isUnlocked = achievement.unlockedAt !== undefined || achievement.progress === 1

  // Calculate current progress toward requirement
  const getProgressInfo = () => {
    const { type, value } = achievement.requirement
    let current = 0
    let target = value
    let unit = ''
    let description = ''

    switch (type) {
      case 'words':
        current = stats.totalWordsTranscribed
        target = value
        unit = current === 1 ? 'word' : 'words'
        description = `Transcribe ${value.toLocaleString()} ${value === 1 ? 'word' : 'words'}`
        break
      case 'time_minutes':
        current = Math.floor(stats.totalRecordingTimeMs / 60000)
        target = value
        unit = value === 1 ? 'minute' : 'minutes'
        description = `Record for ${value} ${unit} total`
        break
      case 'sessions':
        current = stats.totalSessions
        target = value
        unit = value === 1 ? 'session' : 'sessions'
        description = `Complete ${value} ${unit}`
        break
      case 'streak_days':
        current = stats.currentStreak
        target = value
        unit = 'days'
        description = `Maintain a ${value}-day streak`
        break
      case 'level':
        current = level.level
        target = value
        unit = ''
        description = `Reach level ${value}`
        break
    }

    return { current, target, unit, description }
  }

  const progressInfo = getProgressInfo()
  const progress = achievement.progress || 0

  return (
    <div
      className="achievement-detail-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="button"
      tabIndex={0}
      aria-label="Close achievement modal"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="achievement-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-name"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="achievement-detail-close-btn" onClick={onClose}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="achievement-detail-icon-container">
          <div className="achievement-detail-icon-badge">
            <div className="achievement-detail-icon">{isUnlocked ? achievement.icon : '🔒'}</div>
          </div>
        </div>

        {/* Name */}
        <h2 id="achievement-name" className="achievement-detail-name">
          {isUnlocked ? achievement.name : '??? ????????'}
        </h2>

        {/* Description */}
        <p className="achievement-detail-description">
          {isUnlocked
            ? achievement.description
            : 'Complete the requirements to reveal this achievement'}
        </p>

        {/* Rarity Badge */}
        <div
          className={`achievement-detail-rarity achievement-detail-rarity--${achievement.rarity}`}
        >
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </div>

        {/* Progress Section (for locked achievements) */}
        {!isUnlocked && (
          <div className="achievement-detail-progress-section">
            <h3>Progress</h3>
            <div className="achievement-detail-progress-bar">
              <div
                className="achievement-detail-progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
              <span className="achievement-detail-progress-text">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Requirements Section */}
        <div className="achievement-detail-requirements">
          <h3>{isUnlocked ? 'Requirement' : 'Requirements'}</h3>
          <div className="achievement-detail-requirement-item">
            <span className="achievement-detail-requirement-icon">{isUnlocked ? '✅' : '🎯'}</span>
            <div className="achievement-detail-requirement-info">
              <p className="achievement-detail-requirement-description">
                {progressInfo.description}
              </p>
              {!isUnlocked && (
                <p className="achievement-detail-requirement-progress">
                  <span className="achievement-detail-requirement-current">
                    {progressInfo.current.toLocaleString()}
                  </span>
                  {' / '}
                  <span className="achievement-detail-requirement-target">
                    {progressInfo.target.toLocaleString()}
                  </span>
                  {progressInfo.unit && ` ${progressInfo.unit}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Unlock Date (for unlocked achievements) */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="achievement-detail-unlock-info">
            <span className="achievement-detail-unlock-label">Unlocked on</span>
            <span className="achievement-detail-unlock-date">
              {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* XP Reward */}
        <div className="achievement-detail-xp-reward">
          <span className="achievement-detail-xp-icon">⭐</span>
          <span className="achievement-detail-xp-text">+{achievement.xpReward} XP</span>
        </div>

        {/* Action Buttons */}
        <div className="achievement-detail-actions">
          {isUnlocked && onShare && (
            <button
              className="btn achievement-detail-btn achievement-detail-btn--share"
              onClick={() => onShare(achievement)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share Achievement
            </button>
          )}
          <button
            className="btn achievement-detail-btn achievement-detail-btn--close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
