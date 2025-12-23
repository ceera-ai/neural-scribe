import { useState, useEffect } from 'react'
import type { UserStats, LevelSystem, Achievement } from '../../types/gamification'
import { ACHIEVEMENTS } from '../../types/gamification'
import { GamificationDashboard } from './GamificationDashboard'
import { AchievementGrid } from './AchievementGrid'
import type { UnlockedAchievement } from './AchievementGrid'
import { AchievementDetail } from './AchievementDetail'
import './GamificationModal.css'

interface GamificationModalProps {
  isOpen: boolean
  onClose: () => void
  stats: UserStats
  level: LevelSystem
  xpProgress: number
  achievements: Achievement[]
}

export function GamificationModal({
  isOpen,
  onClose,
  stats,
  level,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  xpProgress: _xpProgress,
  achievements,
}: GamificationModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  // Debug: Log modal state when opened
  useEffect(() => {
    if (isOpen) {
      console.log('🎮 [MODAL] Gamification modal opened with data:', {
        stats: {
          totalSessions: stats.totalSessions,
          totalWords: stats.totalWordsTranscribed,
          totalTime: stats.totalRecordingTimeMs,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          lastActive: stats.lastActiveDate,
          firstSession: stats.firstSessionDate,
        },
        level: {
          currentXP: level.currentXP,
          level: level.level,
          rank: level.rank,
          xpToNext: level.xpToNextLevel,
          xpForCurrent: level.xpForCurrentLevel,
          totalForNext: level.totalXPForNextLevel,
        },
        achievements: {
          total: achievements.length,
          unlocked: achievements.filter((a) => a.unlockedAt).length,
          unlockedList: achievements
            .filter((a) => a.unlockedAt)
            .map((a) => ({ id: a.id, name: a.name })),
        },
      })
    }
  }, [isOpen, stats, level, achievements])

  if (!isOpen) return null

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length

  // Prepare data for GamificationDashboard
  const dashboardLevel = {
    currentLevel: level.level,
    currentXP: level.currentXP,
    rank: level.rank,
    xpForCurrentLevel: level.xpForCurrentLevel,
    totalXPForNextLevel: level.totalXPForNextLevel,
    xpToNextLevel: level.xpToNextLevel,
  }

  const recentAchievements = achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      unlockedAt: a.unlockedAt!,
    }))

  // Prepare data for AchievementGrid
  const unlockedMap = achievements.reduce(
    (acc, achievement) => {
      if (achievement.unlockedAt) {
        acc[achievement.id] = {
          achievementId: achievement.id,
          unlockedAt: achievement.unlockedAt,
          xpAwarded: achievement.xpReward,
        }
      }
      return acc
    },
    {} as Record<string, UnlockedAchievement>
  )

  const progressMap = achievements.reduce(
    (acc, achievement) => {
      if (achievement.progress !== undefined && !achievement.unlockedAt) {
        acc[achievement.id] = Math.round(achievement.progress * 100)
      }
      return acc
    },
    {} as Record<string, number>
  )

  const gridAchievements = ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    category: a.category,
    order: ACHIEVEMENTS.indexOf(a),
  }))

  return (
    <div
      className="gamification-modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="presentation"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="gamification-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gamification-modal-title"
      >
        <div className="gamification-modal-header">
          <h2 id="gamification-modal-title">Your Progress</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
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
        </div>

        {/* Tabs */}
        <div className="gamification-tabs">
          <button
            className={`gamification-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
          <button
            className={`gamification-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements ({unlockedCount}/{achievements.length})
          </button>
        </div>

        <div className="gamification-modal-content">
          {activeTab === 'stats' && (
            <GamificationDashboard
              level={dashboardLevel}
              stats={stats}
              recentAchievements={recentAchievements}
              onViewAllAchievements={() => setActiveTab('achievements')}
              onViewAchievement={(id) => {
                const achievement = achievements.find((a) => a.id === id)
                if (achievement) setSelectedAchievement(achievement)
              }}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementGrid
              achievements={gridAchievements}
              unlockedAchievements={unlockedMap}
              progressMap={progressMap}
              onAchievementClick={(achievement) => {
                const fullAchievement = achievements.find((a) => a.id === achievement.id)
                if (fullAchievement) setSelectedAchievement(fullAchievement)
              }}
            />
          )}
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <AchievementDetail
            id={selectedAchievement.id}
            name={selectedAchievement.name}
            description={selectedAchievement.description}
            icon={selectedAchievement.icon}
            xpReward={selectedAchievement.xpReward}
            category={selectedAchievement.category}
            isUnlocked={!!selectedAchievement.unlockedAt}
            unlockedAt={selectedAchievement.unlockedAt}
            progress={
              selectedAchievement.progress ? Math.round(selectedAchievement.progress * 100) : 0
            }
            isOpen={selectedAchievement !== null}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </div>
    </div>
  )
}
