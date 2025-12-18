import { useState } from 'react';
import type { Achievement, AchievementCategory } from '../../types/gamification';
import { getRarityColor } from '../../types/gamification';
import { AchievementBadge } from './AchievementBadge';
import './AchievementsModal.css';

interface AchievementsModalProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = AchievementCategory | 'all';

const CATEGORY_INFO: Record<FilterCategory, { label: string; icon: string }> = {
  all: { label: 'All', icon: '🏆' },
  words: { label: 'Words', icon: '📝' },
  time: { label: 'Time', icon: '⏱️' },
  sessions: { label: 'Sessions', icon: '🎙️' },
  streaks: { label: 'Streaks', icon: '🔥' },
  special: { label: 'Special', icon: '⭐' },
};

export function AchievementsModal({ achievements, isOpen, onClose }: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  if (!isOpen) return null;

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt !== undefined || a.progress === 1).length;
  const totalCount = achievements.length;

  return (
    <div className="achievements-modal-overlay" onClick={onClose}>
      <div className="achievements-modal" onClick={e => e.stopPropagation()}>
        <div className="achievements-modal__header">
          <h2 className="achievements-modal__title">
            <span className="achievements-modal__title-icon">🏆</span>
            Achievements
            <span className="achievements-modal__count">
              {unlockedCount} / {totalCount}
            </span>
          </h2>
          <button className="achievements-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="achievements-modal__filters">
          {(Object.entries(CATEGORY_INFO) as [FilterCategory, { label: string; icon: string }][]).map(
            ([category, info]) => (
              <button
                key={category}
                className={`achievements-modal__filter ${selectedCategory === category ? 'achievements-modal__filter--active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="achievements-modal__filter-icon">{info.icon}</span>
                <span className="achievements-modal__filter-label">{info.label}</span>
              </button>
            )
          )}
        </div>

        <div className="achievements-modal__grid">
          {filteredAchievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>

        {selectedAchievement && (
          <div className="achievements-modal__detail" onClick={() => setSelectedAchievement(null)}>
            <div
              className="achievements-modal__detail-card"
              style={{ '--rarity-color': getRarityColor(selectedAchievement.rarity) } as React.CSSProperties}
              onClick={e => e.stopPropagation()}
            >
              <div className="achievements-modal__detail-icon">{selectedAchievement.icon}</div>
              <h3 className="achievements-modal__detail-name">{selectedAchievement.name}</h3>
              <p className="achievements-modal__detail-description">{selectedAchievement.description}</p>
              <div className="achievements-modal__detail-meta">
                <span className="achievements-modal__detail-xp">+{selectedAchievement.xpReward} XP</span>
                <span className={`achievements-modal__detail-rarity achievements-modal__detail-rarity--${selectedAchievement.rarity}`}>
                  {selectedAchievement.rarity}
                </span>
              </div>
              {selectedAchievement.progress !== undefined && selectedAchievement.progress < 1 && (
                <div className="achievements-modal__detail-progress">
                  <div className="achievements-modal__detail-progress-bar">
                    <div
                      className="achievements-modal__detail-progress-fill"
                      style={{ width: `${selectedAchievement.progress * 100}%` }}
                    />
                  </div>
                  <span className="achievements-modal__detail-progress-text">
                    {Math.round(selectedAchievement.progress * 100)}%
                  </span>
                </div>
              )}
              <button
                className="achievements-modal__detail-close"
                onClick={() => setSelectedAchievement(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
