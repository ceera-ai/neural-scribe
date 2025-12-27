interface WelcomeStepProps {
  onContinue: () => void
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="onboarding-step welcome-step">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-glow" />
          <svg
            viewBox="0 0 100 100"
            className="neural-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* Neural network node icon */}
            <circle cx="50" cy="20" r="8" className="node" />
            <circle cx="30" cy="50" r="8" className="node" />
            <circle cx="70" cy="50" r="8" className="node" />
            <circle cx="50" cy="80" r="8" className="node" />
            {/* Connections */}
            <line x1="50" y1="28" x2="30" y2="42" className="connection" />
            <line x1="50" y1="28" x2="70" y2="42" className="connection" />
            <line x1="30" y1="58" x2="50" y2="72" className="connection" />
            <line x1="70" y1="58" x2="50" y2="72" className="connection" />
            <line x1="38" y1="50" x2="62" y2="50" className="connection" />
          </svg>
        </div>

        <h1 className="welcome-title">
          <span className="gradient-text">Neural Scribe</span>
        </h1>

        <p className="welcome-subtitle">AI-Powered Voice Transcription</p>

        <p className="welcome-description">
          Transform your voice into text with cutting-edge AI transcription. Neural Scribe brings
          professional-grade speech-to-text directly to your workflow.
        </p>

        <div className="welcome-features">
          <div className="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>Real-time transcription</span>
          </div>
          <div className="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <span>Multiple AI engines</span>
          </div>
          <div className="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Secure & private</span>
          </div>
        </div>

        <button className="cyber-button primary large" onClick={onContinue}>
          <span className="button-text">Get Started</span>
          <span className="button-glow" />
        </button>
      </div>
    </div>
  )
}
