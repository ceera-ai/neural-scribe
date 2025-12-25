/**
 * NotificationQueue Component
 *
 * Manages a queue of achievement notifications and displays them
 * in a stacked layout with proper timing and transitions.
 */

import React, { useState, useEffect, useCallback } from 'react'
import AchievementNotification from './AchievementNotification'
import styles from './NotificationQueue.module.css'

export interface NotificationData {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
}

export interface NotificationQueueProps {
  /** Maximum number of visible notifications at once */
  maxVisible?: number
  /** Duration each notification is shown (ms) */
  duration?: number
  /** Gap between notifications when stacking (ms) */
  staggerDelay?: number
  /** Click handler for notification */
  onNotificationClick?: (notification: NotificationData) => void
}

interface QueuedNotification extends NotificationData {
  timestamp: number
  isVisible: boolean
}

export const NotificationQueue: React.FC<NotificationQueueProps> = ({
  maxVisible = 3,
  duration = 5000,
  staggerDelay = 500,
  onNotificationClick,
}) => {
  const [queue, setQueue] = useState<QueuedNotification[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<QueuedNotification[]>([])

  // Add notification to queue
  const addNotification = useCallback((notification: NotificationData) => {
    setQueue((prev) => [
      ...prev,
      {
        ...notification,
        timestamp: Date.now(),
        isVisible: false,
      },
    ])
  }, [])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Process queue - show notifications with stagger delay
  useEffect(() => {
    if (queue.length === 0 || visibleNotifications.length >= maxVisible) {
      return
    }

    const nextNotification = queue[0]
    if (!nextNotification) return

    // Stagger notification appearance
    const timer = setTimeout(
      () => {
        setQueue((prev) => prev.slice(1))
        setVisibleNotifications((prev) => [...prev, { ...nextNotification, isVisible: true }])
      },
      visibleNotifications.length > 0 ? staggerDelay : 0
    )

    return () => clearTimeout(timer)
  }, [queue, visibleNotifications, maxVisible, staggerDelay])

  // Expose addNotification method via custom event
  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationData>
      addNotification(customEvent.detail)
    }

    window.addEventListener('achievement-unlocked', handleCustomEvent)
    return () => {
      window.removeEventListener('achievement-unlocked', handleCustomEvent)
    }
  }, [addNotification])

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={styles.notificationWrapper}
          style={{
            zIndex: 1000 - index,
          }}
        >
          <AchievementNotification
            name={notification.name}
            description={notification.description}
            icon={notification.icon}
            xpReward={notification.xpReward}
            isVisible={notification.isVisible}
            duration={duration}
            onDismiss={() => removeNotification(notification.id)}
            onClick={() => {
              onNotificationClick?.(notification)
              removeNotification(notification.id)
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Helper function to trigger notification from anywhere in the app
// eslint-disable-next-line react-refresh/only-export-components
export function showAchievementNotification(notification: NotificationData) {
  window.dispatchEvent(
    new CustomEvent('achievement-unlocked', {
      detail: notification,
    })
  )
}

export default NotificationQueue
