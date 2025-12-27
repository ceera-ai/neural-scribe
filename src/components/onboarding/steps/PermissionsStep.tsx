import { useState, useEffect } from 'react'

interface PermissionsStepProps {
  onComplete: () => void
  onAccessibilityGranted: (granted: boolean) => void
  onBack: () => void
}

export function PermissionsStep({
  onComplete,
  onAccessibilityGranted,
  onBack,
}: PermissionsStepProps) {
  const [accessibilityGranted, setAccessibilityGranted] = useState(false)
  const [checkingPermissions, setCheckingPermissions] = useState(true)

  const checkPermissions = async () => {
    setCheckingPermissions(true)
    try {
      const hasAccess = await window.electronAPI.checkAccessibilityPermissions()
      setAccessibilityGranted(hasAccess)
      onAccessibilityGranted(hasAccess)
    } catch (error) {
      console.error('Failed to check permissions:', error)
      setAccessibilityGranted(false)
    } finally {
      setCheckingPermissions(false)
    }
  }

  useEffect(() => {
    checkPermissions()

    // Poll for permission changes (when user comes back from System Settings)
    const interval = setInterval(checkPermissions, 2000)
    return () => clearInterval(interval)
  }, [])

  const requestAccessibility = async () => {
    try {
      await window.electronAPI.requestAccessibilityPermissions()
      // The system settings will open, and we'll detect the change via polling
    } catch (error) {
      console.error('Failed to request accessibility permissions:', error)
    }
  }

  const handleContinue = () => {
    if (accessibilityGranted) {
      onComplete()
    }
  }

  const grantedCount = accessibilityGranted ? 1 : 0
  const totalRequired = 1
  const progressPercent = (grantedCount / totalRequired) * 100

  return (
    <div className="onboarding-step permissions-step">
      <div className="step-header">
        <h2 className="step-title">Grant Permissions</h2>
        <p className="step-description">
          Neural Scribe needs the following permissions to function properly
        </p>
      </div>

      <div className="permissions-progress">
        <div className="progress-label">
          {grantedCount} of {totalRequired} permissions granted
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="permissions-list">
        {/* Accessibility Permission */}
        <div className={`permission-card ${accessibilityGranted ? 'granted' : 'not-granted'}`}>
          <div className="permission-header">
            <div className="permission-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="permission-info">
              <h3>
                Accessibility Access
                <span className="required-badge">Required</span>
              </h3>
              <p>Required for auto-paste and keyboard automation features</p>
            </div>
            <div className="permission-status">
              {checkingPermissions ? (
                <div className="status-checking-small">
                  <div className="spinner-small" />
                </div>
              ) : accessibilityGranted ? (
                <div className="status-granted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Granted</span>
                </div>
              ) : (
                <div className="status-not-granted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>Not Granted</span>
                </div>
              )}
            </div>
          </div>

          <div className="permission-details">
            <div className="why-needed">
              <strong>Why this is needed:</strong>
              <p>
                Allows Neural Scribe to automatically paste transcriptions into your active
                application, enabling seamless workflow integration.
              </p>
            </div>

            {!accessibilityGranted && (
              <div className="permission-actions">
                <button className="cyber-button primary small" onClick={requestAccessibility}>
                  <span className="button-text">Grant Access</span>
                  <span className="button-glow" />
                </button>
                <p className="action-note">
                  This will open System Settings. Add Neural Scribe to Accessibility, then return
                  here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Permission (Informational) */}
        <div className="permission-card info-only">
          <div className="permission-header">
            <div className="permission-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div className="permission-info">
              <h3>Microphone Access</h3>
              <p>Required for voice recording and transcription</p>
            </div>
            <div className="permission-status">
              <div className="status-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
                <span>Auto-granted</span>
              </div>
            </div>
          </div>

          <div className="permission-details">
            <div className="info-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <p>
                You'll be prompted for microphone access when you start your first recording. This
                is handled automatically by macOS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button className="cyber-button secondary" onClick={onBack}>
          <span className="button-text">Back</span>
        </button>
        <button
          className="cyber-button primary"
          onClick={handleContinue}
          disabled={!accessibilityGranted}
        >
          <span className="button-text">Continue</span>
          <span className="button-glow" />
        </button>
      </div>
    </div>
  )
}
