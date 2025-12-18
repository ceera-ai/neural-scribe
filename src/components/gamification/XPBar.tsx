import type { LevelSystem } from '../../types/gamification';
import './XPBar.css';

interface XPBarProps {
  level: LevelSystem;
  progress: number; // 0-1
  compact?: boolean;
}

export function XPBar({ level, progress, compact = false }: XPBarProps) {
  const xpInCurrentLevel = level.currentXP - level.xpForCurrentLevel;
  const xpNeededForLevel = level.totalXPForNextLevel - level.xpForCurrentLevel;

  return (
    <div className={`xp-bar ${compact ? 'xp-bar--compact' : ''}`}>
      <div className="xp-bar__header">
        <div className="xp-bar__level">
          <span className="xp-bar__level-label">LVL</span>
          <span className="xp-bar__level-value">{level.level}</span>
        </div>
        <div className="xp-bar__rank">{level.rank}</div>
        <div className="xp-bar__xp">
          <span className="xp-bar__xp-current">{xpInCurrentLevel.toLocaleString()}</span>
          <span className="xp-bar__xp-separator">/</span>
          <span className="xp-bar__xp-total">{xpNeededForLevel.toLocaleString()}</span>
          <span className="xp-bar__xp-label">XP</span>
        </div>
      </div>
      <div className="xp-bar__track">
        <div
          className="xp-bar__fill"
          style={{ '--progress': `${progress * 100}%` } as React.CSSProperties}
        />
        <div className="xp-bar__glow" />
      </div>
    </div>
  );
}
