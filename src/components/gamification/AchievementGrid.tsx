/**
 * AchievementGrid Component
 *
 * Displays a grid of achievement cards with filtering and sorting options.
 */

import React, { useState, useMemo } from 'react'
import AchievementCard from './AchievementCard'
import styles from './AchievementGrid.module.css'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  category:
    | 'milestone'
    | 'words'
    | 'streak'
    | 'speed'
    | 'time'
    | 'level'
    | 'ai-mastery'
    | 'customization'
    | 'efficiency'
    | 'integration'
    | 'exploration'
  order: number
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: number
  xpAwarded: number
}

export interface AchievementGridProps {
  /** All available achievements */
  achievements: Achievement[]
  /** Unlocked achievements map */
  unlockedAchievements: Record<string, UnlockedAchievement>
  /** Progress map for locked achievements (achievementId -> progress 0-100) */
  progressMap?: Record<string, number>
  /** Click handler for achievement card */
  onAchievementClick?: (achievement: Achievement) => void
  /** Card size variant */
  cardSize?: 'small' | 'medium' | 'large' | 'compact'
}

type SortOption = 'category' | 'xp-high' | 'xp-low' | 'unlock-date' | 'progress'
type FilterOption = 'all' | 'unlocked' | 'locked' | Achievement['category']

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  unlockedAchievements,
  progressMap = {},
  onAchievementClick,
  cardSize = 'medium',
}) => {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [sort, setSort] = useState<SortOption>('category')

  // Filter and sort achievements
  const filteredAndSorted = useMemo(() => {
    let result = [...achievements]

    // Category/status filter
    if (filter === 'unlocked') {
      result = result.filter((a) => unlockedAchievements[a.id])
    } else if (filter === 'locked') {
      result = result.filter((a) => !unlockedAchievements[a.id])
    } else if (filter !== 'all') {
      result = result.filter((a) => a.category === filter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'category':
          return a.category.localeCompare(b.category) || a.order - b.order
        case 'xp-high':
          return b.xpReward - a.xpReward
        case 'xp-low':
          return a.xpReward - b.xpReward
        case 'unlock-date': {
          const aUnlocked = unlockedAchievements[a.id]
          const bUnlocked = unlockedAchievements[b.id]
          if (!aUnlocked && !bUnlocked) return 0
          if (!aUnlocked) return 1
          if (!bUnlocked) return -1
          return bUnlocked.unlockedAt - aUnlocked.unlockedAt
        }
        case 'progress': {
          const aProgress = progressMap[a.id] || 0
          const bProgress = progressMap[b.id] || 0
          return bProgress - aProgress
        }
        default:
          return 0
      }
    })

    return result
  }, [achievements, filter, sort, unlockedAchievements, progressMap])

  // Group achievements by category (only when filter is 'all')
  const groupedByCategory = useMemo(() => {
    if (filter !== 'all') return null

    const groups: Record<Achievement['category'], Achievement[]> = {
      milestone: [],
      words: [],
      streak: [],
      speed: [],
      time: [],
      level: [],
      'ai-mastery': [],
      customization: [],
      efficiency: [],
      integration: [],
      exploration: [],
    }

    filteredAndSorted.forEach((achievement) => {
      groups[achievement.category].push(achievement)
    })

    // Filter out empty categories and return in order
    return Object.entries(groups).filter(([_category, achievements]) => achievements.length > 0)
  }, [filter, filteredAndSorted])

  // Category display names
  const categoryNames: Record<Achievement['category'], string> = {
    milestone: 'Milestone',
    words: 'Words',
    streak: 'Streak',
    speed: 'Speed',
    time: 'Time',
    level: 'Level',
    'ai-mastery': 'AI Mastery',
    customization: 'Customization',
    efficiency: 'Efficiency',
    integration: 'Integration',
    exploration: 'Exploration',
  }

  // Stats
  const totalAchievements = achievements.length
  const unlockedCount = Object.keys(unlockedAchievements).length
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100)

  return (
    <div className={styles.container}>
      {/* Header with stats */}
      <div className={styles.header}>
        <div className={styles.stats}>
          <h2 className={styles.title}>Achievements</h2>
          <div className={styles.statsBar}>
            <span className={styles.statItem}>
              {unlockedCount} / {totalAchievements} Unlocked
            </span>
            <span className={styles.statItem}>{completionPercentage}% Complete</span>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className={styles.controls}>
        <div className={styles.filterContainer}>
          <label htmlFor="filter-select" className={styles.filterLabel}>
            Filter:
          </label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
            <option value="milestone">Milestone</option>
            <option value="words">Words</option>
            <option value="streak">Streak</option>
            <option value="speed">Speed</option>
            <option value="time">Time</option>
            <option value="level">Level</option>
            <option value="ai-mastery">AI Mastery</option>
            <option value="customization">Customization</option>
            <option value="efficiency">Efficiency</option>
            <option value="integration">Integration</option>
            <option value="exploration">Exploration</option>
          </select>
        </div>

        <div className={styles.sortContainer}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Sort:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="category">Category</option>
            <option value="xp-high">XP (High to Low)</option>
            <option value="xp-low">XP (Low to High)</option>
            <option value="unlock-date">Recently Unlocked</option>
            <option value="progress">Progress</option>
          </select>
        </div>
      </div>

      {/* Achievement Grid */}
      {filteredAndSorted.length > 0 ? (
        groupedByCategory ? (
          // Show grouped sections when filter is 'all'
          <div className={styles.sectionsContainer}>
            {groupedByCategory.map(([category, categoryAchievements]) => (
              <div key={category} className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  {categoryNames[category as Achievement['category']]}
                </h3>
                <div className={styles.grid}>
                  {categoryAchievements.map((achievement) => {
                    const unlocked = unlockedAchievements[achievement.id]
                    return (
                      <AchievementCard
                        key={achievement.id}
                        id={achievement.id}
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        xpReward={achievement.xpReward}
                        category={achievement.category}
                        isUnlocked={!!unlocked}
                        unlockedAt={unlocked?.unlockedAt}
                        progress={progressMap[achievement.id]}
                        onClick={() => onAchievementClick?.(achievement)}
                        size={cardSize}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show flat grid for filtered views
          <div className={styles.grid}>
            {filteredAndSorted.map((achievement) => {
              const unlocked = unlockedAchievements[achievement.id]
              return (
                <AchievementCard
                  key={achievement.id}
                  id={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  xpReward={achievement.xpReward}
                  category={achievement.category}
                  isUnlocked={!!unlocked}
                  unlockedAt={unlocked?.unlockedAt}
                  progress={progressMap[achievement.id]}
                  onClick={() => onAchievementClick?.(achievement)}
                  size={cardSize}
                />
              )
            })}
          </div>
        )
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No achievements found</h3>
          <p className={styles.emptyText}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default AchievementGrid
