/**
 * Gamification Components
 *
 * Centralized exports for all gamification-related components.
 */

// Achievement Components
export { default as AchievementCard } from './AchievementCard'
export type { AchievementCardProps } from './AchievementCard'

export { default as AchievementGrid } from './AchievementGrid'
export type { AchievementGridProps, Achievement, UnlockedAchievement } from './AchievementGrid'

export { default as AchievementDetail } from './AchievementDetail'
export type { AchievementDetailProps } from './AchievementDetail'

export { default as AchievementBadge } from './AchievementBadge'
export type { AchievementBadgeProps } from './AchievementBadge'

export { default as BadgeShowcase } from './BadgeShowcase'
export type { BadgeShowcaseProps, ShowcaseAchievement } from './BadgeShowcase'

// Notification Components
export { default as AchievementNotification } from './AchievementNotification'
export type { AchievementNotificationProps } from './AchievementNotification'

export { default as NotificationQueue, showAchievementNotification } from './NotificationQueue'
export type { NotificationQueueProps, NotificationData } from './NotificationQueue'

// Dashboard Components
export { default as GamificationDashboard } from './GamificationDashboard'
export type { GamificationDashboardProps } from './GamificationDashboard'

export { default as StatsCard } from './StatsCard'
export type { StatsCardProps } from './StatsCard'

export { default as LevelProgressBar } from './LevelProgressBar'
export type { LevelProgressBarProps } from './LevelProgressBar'

export { default as StreakDisplay } from './StreakDisplay'
export type { StreakDisplayProps } from './StreakDisplay'
