import { FC } from 'react'
import './ToastNotifications.css'

interface ToastNotificationsProps {
  pasteStatus: 'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'
  lastVoiceCommand: string | null
  historySaved: string | null
}

export const ToastNotifications: FC<ToastNotificationsProps> = ({
  pasteStatus,
  lastVoiceCommand,
  historySaved,
}) => {
  const hasNotifications = pasteStatus !== 'idle' || lastVoiceCommand || historySaved

  if (!hasNotifications) return null

  return (
    <div className="toast-container">
      {lastVoiceCommand && (
        <div className="toast toast-voice">
          <span className="toast-icon">🎤</span>
          <span className="toast-message">Voice: {lastVoiceCommand}</span>
        </div>
      )}
      {pasteStatus === 'formatting' && (
        <div className="toast toast-processing">
          <span className="toast-icon">
            <span className="formatting-spinner" />
          </span>
          <span className="toast-message">Formatting with Claude...</span>
        </div>
      )}
      {pasteStatus === 'permission' && (
        <div className="toast toast-info">
          <span className="toast-icon">📋</span>
          <span className="toast-message">Copied! Press ⌘V to paste</span>
        </div>
      )}
      {pasteStatus === 'success' && (
        <div className="toast toast-success">
          <span className="toast-icon">✓</span>
          <span className="toast-message">Pasted successfully</span>
        </div>
      )}
      {pasteStatus === 'no-terminal' && (
        <div className="toast toast-error">
          <span className="toast-icon">!</span>
          <span className="toast-message">No terminal app running</span>
        </div>
      )}
      {pasteStatus === 'error' && (
        <div className="toast toast-error">
          <span className="toast-icon">!</span>
          <span className="toast-message">Paste failed - copied to clipboard</span>
        </div>
      )}
      {historySaved && (
        <div className="toast toast-history">
          <span className="toast-icon">📝</span>
          <span className="toast-message">Saved: {historySaved}</span>
        </div>
      )}
    </div>
  )
}
