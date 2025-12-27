interface SuccessStepProps {
  engine: 'elevenlabs' | 'deepgram'
  claudeCliAvailable: boolean
  claudeCliVersion: string | null
  onComplete: () => void
}

export function SuccessStep({
  engine,
  claudeCliAvailable,
  claudeCliVersion,
  onComplete,
}: SuccessStepProps) {
  const engineName = engine === 'elevenlabs' ? 'ElevenLabs Scribe' : 'Deepgram Nova'

  return (
    <div className="onboarding-step success-step">
      <div className="success-content">
        <div className="success-icon">
          <div className="success-glow" />
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="50" cy="50" r="45" className="check-circle" />
            <path d="M30 50 L45 65 L70 35" className="check-mark" />
          </svg>
        </div>

        <h2 className="success-title">
          <span className="gradient-text">You're All Set!</span>
        </h2>

        <p className="success-subtitle">Neural Scribe is ready to transform your voice into text</p>

        <div className="setup-summary">
          <h3>Setup Complete</h3>
          <div className="summary-items">
            <div className="summary-item success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{engineName} configured and validated</span>
            </div>

            <div className={`summary-item ${claudeCliAvailable ? 'success' : 'warning'}`}>
              {claudeCliAvailable ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Claude CLI ready (v{claudeCliVersion})</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4m0-4h.01" />
                  </svg>
                  <span>Claude CLI skipped - can enable in Settings</span>
                </>
              )}
            </div>

            <div className="summary-item success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>All permissions granted</span>
            </div>
          </div>
        </div>

        <div className="quick-tips">
          <h3>Quick Tips</h3>
          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="tip-text">
                <strong>⌘⇧R</strong> to start recording
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="tip-text">
                <strong>⌘⇧F</strong> to record with AI formatting
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="tip-text">
                Click the <strong>menu bar icon</strong> to access Neural Scribe anytime
              </div>
            </div>
          </div>
        </div>

        <button className="cyber-button primary large pulse" onClick={onComplete}>
          <span className="button-text">Start Transcribing</span>
          <span className="button-glow" />
        </button>
      </div>
    </div>
  )
}
