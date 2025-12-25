import { FC } from 'react'
import { GlitchText } from '../cyberpunk/GlitchText'
import { MicrophoneSelector } from '../MicrophoneSelector'
import './AppHeader.css'

interface AppHeaderProps {
  isRecording: boolean
  isConnected: boolean
  recordingTime: number
  onOpenGamification: () => void
  onOpenSettings: () => void
}

/**
 * Application header with title, status, and action buttons
 *
 * @remarks
 * The header displays the app title with glitch effect, connection/recording status indicator,
 * microphone selector, and buttons to open gamification stats and settings modals.
 *
 * Status indicator shows:
 * - "Recording X:XX" when actively recording with elapsed time
 * - "Connected" when WebSocket is connected but not recording
 * - "Ready" when idle
 *
 * @param props - Component props
 * @param props.isRecording - Whether recording is currently active
 * @param props.isConnected - Whether WebSocket connection is active
 * @param props.recordingTime - Elapsed recording time in seconds
 * @param props.onOpenGamification - Callback to open gamification/stats modal
 * @param props.onOpenSettings - Callback to open settings modal
 */
export const AppHeader: FC<AppHeaderProps> = ({
  isRecording,
  isConnected,
  recordingTime,
  onOpenGamification,
  onOpenSettings,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const statusText = isRecording
    ? `Recording ${formatTime(recordingTime)}`
    : isConnected
      ? 'Connected'
      : 'Ready'

  const statusClass = isRecording ? 'recording' : isConnected ? 'connected' : ''

  return (
    <header className="app-header cyber-header">
      <div className="header-title">
        <GlitchText as="h1" intensity="subtle" className="cyber-title">
          Neural Scribe
        </GlitchText>
        <div className={`status-indicator cyber-status ${statusClass}`}>
          <span className="status-dot" />
          <span>{statusText}</span>
        </div>
      </div>
      <div className="header-center">{/* XP Bar moved to gamification modal */}</div>
      <div className="header-right">
        <MicrophoneSelector disabled={isRecording} />
        <button
          className="btn btn-icon cyber-btn"
          onClick={onOpenGamification}
          title="Stats & Progress"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-4"></path>
          </svg>
        </button>
        <button className="btn settings-btn cyber-btn" onClick={onOpenSettings} title="Settings">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}
