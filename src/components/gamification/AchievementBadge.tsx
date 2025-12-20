import type { Achievement } from '../../types/gamification'
import { getRarityColor } from '../../types/gamification'
import './AchievementBadge.css'

interface AchievementBadgeProps {
  achievement: Achievement
  showProgress?: boolean
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  showProgress = true,
  onClick,
}: AchievementBadgeProps) {
  const isUnlocked = achievement.unlockedAt !== undefined || achievement.progress === 1
  const progress = achievement.progress || 0
  const rarityColor = getRarityColor(achievement.rarity)

  return (
    <button
      className={`achievement-badge ${isUnlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'} achievement-badge--${achievement.rarity}`}
      style={{ '--rarity-color': rarityColor } as React.CSSProperties}
      onClick={onClick}
      title={`${achievement.name}: ${achievement.description}`}
    >
      <div className="achievement-badge__icon">{isUnlocked ? achievement.icon : '🔒'}</div>

      {showProgress && !isUnlocked && (
        <div className="achievement-badge__progress">
          <div
            className="achievement-badge__progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div className="achievement-badge__info">
        <span className="achievement-badge__name">{achievement.name}</span>
        <span className="achievement-badge__xp">+{achievement.xpReward} XP</span>
      </div>

      {isUnlocked && <div className="achievement-badge__glow" />}
    </button>
  )
}
