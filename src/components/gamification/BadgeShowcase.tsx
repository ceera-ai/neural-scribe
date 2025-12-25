/**
 * BadgeShowcase Component
 *
 * Displays a showcase of featured/top achievements with rotation effect.
 */

import React, { useState } from 'react'
import AchievementBadge from './AchievementBadge'
import styles from './BadgeShowcase.module.css'

export interface ShowcaseAchievement {
  id: string
  name: string
  icon: string
  isUnlocked: boolean
  progress?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface BadgeShowcaseProps {
  /** Featured achievements to display */
  achievements: ShowcaseAchievement[]
  /** Maximum number of badges to show */
  maxDisplay?: number
  /** Show only unlocked achievements */
  unlockedOnly?: boolean
  /** Title for the showcase */
  title?: string
  /** Click handler for badges */
  onBadgeClick?: (achievementId: string) => void
  /** Edit mode - allow user to select featured achievements */
  editable?: boolean
  /** Available achievements for selection (in edit mode) */
  availableAchievements?: ShowcaseAchievement[]
  /** Save handler for edit mode */
  onSave?: (selectedIds: string[]) => void
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  achievements,
  maxDisplay = 5,
  unlockedOnly = false,
  title = 'Featured Achievements',
  onBadgeClick,
  editable = false,
  availableAchievements = [],
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(achievements.map((a) => a.id))

  // Filter achievements
  const displayAchievements = unlockedOnly ? achievements.filter((a) => a.isUnlocked) : achievements

  const showcaseAchievements = displayAchievements.slice(0, maxDisplay)

  const handleToggleEdit = () => {
    if (isEditing && onSave) {
      onSave(selectedIds)
    }
    setIsEditing(!isEditing)
  }

  const handleToggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else if (selectedIds.length < maxDisplay) {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (isEditing) {
    return (
      <div className={styles.showcase}>
        <div className={styles.header}>
          <h3 className={styles.title}>Select Featured Achievements</h3>
          <div className={styles.actions}>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handleToggleEdit} className={styles.saveBtn}>
              Save
            </button>
          </div>
        </div>

        <div className={styles.editGrid}>
          {availableAchievements.map((achievement) => {
            const isSelected = selectedIds.includes(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`${styles.editItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleToggleSelection(achievement.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleToggleSelection(achievement.id)
                  }
                }}
              >
                <AchievementBadge
                  icon={achievement.icon}
                  name={achievement.name}
                  isUnlocked={achievement.isUnlocked}
                  progress={achievement.progress}
                  rarity={achievement.rarity}
                  size="medium"
                  showTooltip={false}
                />
                <span className={styles.achievementName}>{achievement.name}</span>
                {isSelected && <span className={styles.selectedBadge}>✓</span>}
              </div>
            )
          })}
        </div>

        <div className={styles.hint}>
          Selected {selectedIds.length} of {maxDisplay}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {editable && (
          <button onClick={handleToggleEdit} className={styles.editBtn}>
            ✏️ Edit
          </button>
        )}
      </div>

      {showcaseAchievements.length > 0 ? (
        <div className={styles.badgeContainer}>
          {showcaseAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={styles.badgeWrapper}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <AchievementBadge
                icon={achievement.icon}
                name={achievement.name}
                isUnlocked={achievement.isUnlocked}
                progress={achievement.progress}
                rarity={achievement.rarity}
                size="large"
                onClick={() => onBadgeClick?.(achievement.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <p className={styles.emptyText}>
            {unlockedOnly
              ? 'Unlock achievements to showcase them here'
              : 'No featured achievements'}
          </p>
        </div>
      )}
    </div>
  )
}

export default BadgeShowcase
