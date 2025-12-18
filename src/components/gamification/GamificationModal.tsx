import { useState } from 'react';
import type { UserStats, LevelSystem, Achievement } from '../../types/gamification';
import { XPBar } from './XPBar';
import { AchievementBadge } from './AchievementBadge';
import './GamificationModal.css';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  level: LevelSystem;
  xpProgress: number;
  achievements: Achievement[];
}

export function GamificationModal({
  isOpen,
  onClose,
  stats,
  level,
  xpProgress,
  achievements,
}: GamificationModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="gamification-modal-overlay" onClick={onClose}>
      <div className="gamification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gamification-modal-header">
          <h2>Your Progress</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <>
              {/* Level & XP Section */}
              <div className="gamification-section">
                <div className="level-display">
                  <div className="level-badge">
                    <span className="level-number">{level.level}</span>
                  </div>
                  <div className="level-info">
                    <span className="rank-title">{level.rank}</span>
                    <span className="xp-text">{level.currentXP.toLocaleString()} XP</span>
                  </div>
                </div>
                <XPBar level={level} progress={xpProgress} />
                <p className="xp-to-next">{level.xpToNextLevel.toLocaleString()} XP to next level</p>
              </div>

              {/* Stats Grid */}
              <div className="gamification-section">
                <h3>Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">{stats.totalWordsTranscribed.toLocaleString()}</span>
                    <span className="stat-label">Words Transcribed</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{formatTime(stats.totalRecordingTimeMs)}</span>
                    <span className="stat-label">Recording Time</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🎙️</span>
                    <span className="stat-value">{stats.totalSessions}</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-value">{stats.currentStreak}</span>
                    <span className="stat-label">Day Streak</span>
                  </div>
                </div>
              </div>

              {/* Streak Info */}
              <div className="gamification-section streak-section">
                <div className="streak-info">
                  <span className="streak-label">Longest Streak</span>
                  <span className="streak-value">{stats.longestStreak} days</span>
                </div>
                <div className="streak-info">
                  <span className="streak-label">Last Active</span>
                  <span className="streak-value">
                    {stats.lastActiveDate ? new Date(stats.lastActiveDate).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
