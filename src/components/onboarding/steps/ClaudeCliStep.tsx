import { useState, useEffect } from 'react'

interface ClaudeCliStepProps {
  onComplete: (available: boolean, version: string | null) => void
  onSkip: () => void
  onBack: () => void
}

export function ClaudeCliStep({ onComplete, onSkip, onBack }: ClaudeCliStepProps) {
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState<{
    available: boolean
    version: string | null
  } | null>(null)

  const checkClaudeCli = async () => {
    setChecking(true)
    try {
      const result = await window.electronAPI.checkClaudeCli()
      setStatus(result)
    } catch (error) {
      console.error('Failed to check Claude CLI:', error)
      setStatus({ available: false, version: null })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkClaudeCli()
  }, [])

  const handleContinue = () => {
    if (status) {
      onComplete(status.available, status.version)
    }
  }

  return (
    <div className="onboarding-step claude-cli-step">
      <div className="step-header">
        <h2 className="step-title">Claude CLI Setup</h2>
        <p className="step-description">
          Neural Scribe uses Claude CLI for AI-powered prompt formatting
        </p>
      </div>

      <div className="claude-status-container">
        {checking ? (
          <div className="status-checking">
            <div className="spinner" />
            <p>Checking for Claude CLI...</p>
          </div>
        ) : status?.available ? (
          // Claude CLI is installed and ready
          <div className="status-success">
            <div className="status-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Claude CLI is Ready!</h3>
            <p className="status-message">
              Claude CLI version {status.version} is installed and authenticated
            </p>
            <div className="feature-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>AI prompt formatting enabled</span>
            </div>
          </div>
        ) : (
          // Claude CLI is not installed
          <div className="status-warning">
            <div className="status-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3>Claude CLI Not Found</h3>
            <p className="status-message">
              Claude CLI is not installed or not authenticated. This feature is optional but
              recommended for AI-powered prompt formatting.
            </p>

            <div className="installation-steps">
              <h4>To enable AI formatting features:</h4>
              <ol>
                <li>
                  <strong>Install Claude CLI:</strong>
                  <code>npm install -g @anthropics/claude-cli</code>
                </li>
                <li>
                  <strong>Authenticate:</strong>
                  <code>claude auth login</code>
                </li>
                <li>Click "Check Again" below</li>
              </ol>
            </div>

            <button className="cyber-button secondary" onClick={checkClaudeCli}>
              <span className="button-text">Check Again</span>
            </button>

            <div className="skip-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <span>You can skip this step and enable it later in Settings</span>
            </div>
          </div>
        )}
      </div>

      <div className="step-navigation">
        <button className="cyber-button secondary" onClick={onBack} disabled={checking}>
          <span className="button-text">Back</span>
        </button>
        <div className="nav-buttons-right">
          {!status?.available && (
            <button className="cyber-button secondary" onClick={onSkip} disabled={checking}>
              <span className="button-text">Skip for Now</span>
            </button>
          )}
          <button
            className="cyber-button primary"
            onClick={handleContinue}
            disabled={checking || !status}
          >
            <span className="button-text">Continue</span>
            <span className="button-glow" />
          </button>
        </div>
      </div>
    </div>
  )
}
