import { useEffect, useState } from 'react';
import type { Achievement } from '../../types/gamification';
import { getRarityColor } from '../../types/gamification';
import './AchievementPopup.css';

interface AchievementPopupProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementPopup({ achievements, onDismiss }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievements, currentIndex, onDismiss]);

  if (!currentAchievement || achievements.length === 0) return null;

  const rarityColor = getRarityColor(currentAchievement.rarity);

  return (
    <div className={`achievement-popup ${isVisible ? 'achievement-popup--visible' : ''}`}>
      <div className="achievement-popup__header">
        <span className="achievement-popup__label">Achievement Unlocked!</span>
        {achievements.length > 1 && (
          <span className="achievement-popup__count">
            {currentIndex + 1} / {achievements.length}
          </span>
        )}
      </div>

      <div
        className="achievement-popup__card"
        style={{ '--rarity-color': rarityColor } as React.CSSProperties}
      >
        <div className="achievement-popup__icon">{currentAchievement.icon}</div>
        <div className="achievement-popup__content">
          <h3 className="achievement-popup__name">{currentAchievement.name}</h3>
          <p className="achievement-popup__description">{currentAchievement.description}</p>
          <div className="achievement-popup__reward">
            <span className="achievement-popup__xp">+{currentAchievement.xpReward} XP</span>
            <span className={`achievement-popup__rarity achievement-popup__rarity--${currentAchievement.rarity}`}>
              {currentAchievement.rarity}
            </span>
          </div>
        </div>
      </div>

      <button className="achievement-popup__dismiss" onClick={onDismiss}>
        Click to dismiss
      </button>
    </div>
  );
}
