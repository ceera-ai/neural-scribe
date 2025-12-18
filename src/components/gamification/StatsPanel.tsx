import type { UserStats } from '../../types/gamification';
import './StatsPanel.css';

interface StatsPanelProps {
  stats: UserStats;
  compact?: boolean;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function StatsPanel({ stats, compact = false }: StatsPanelProps) {
  const statItems = [
    {
      icon: '📝',
      label: 'Words',
      value: formatNumber(stats.totalWordsTranscribed),
      color: 'cyan',
    },
    {
      icon: '⏱️',
      label: 'Time',
      value: formatDuration(stats.totalRecordingTimeMs),
      color: 'magenta',
    },
    {
      icon: '🎙️',
      label: 'Sessions',
      value: formatNumber(stats.totalSessions),
      color: 'blue',
    },
    {
      icon: '🔥',
      label: 'Streak',
      value: `${stats.currentStreak}d`,
      color: stats.currentStreak >= 7 ? 'orange' : 'green',
      highlight: stats.currentStreak >= 3,
    },
  ];

  return (
    <div className={`stats-panel ${compact ? 'stats-panel--compact' : ''}`}>
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`stats-panel__item stats-panel__item--${item.color} ${item.highlight ? 'stats-panel__item--highlight' : ''}`}
        >
          <span className="stats-panel__icon">{item.icon}</span>
          <div className="stats-panel__data">
            <span className="stats-panel__value">{item.value}</span>
            <span className="stats-panel__label">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
