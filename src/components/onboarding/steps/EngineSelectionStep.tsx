import { useState } from 'react'

interface EngineSelectionStepProps {
  onEngineSelected: (engine: 'elevenlabs' | 'deepgram') => void
  onBack: () => void
}

export function EngineSelectionStep({ onEngineSelected, onBack }: EngineSelectionStepProps) {
  const [selectedEngine, setSelectedEngine] = useState<'elevenlabs' | 'deepgram' | null>(null)

  const handleSelectEngine = (engine: 'elevenlabs' | 'deepgram') => {
    setSelectedEngine(engine)
  }

  const handleContinue = () => {
    if (selectedEngine) {
      onEngineSelected(selectedEngine)
    }
  }

  const openLink = (url: string) => {
    if (window.electronAPI) {
      // Use shell.openExternal via IPC if available
      window.open(url, '_blank')
    }
  }

  return (
    <div className="onboarding-step engine-selection-step">
      <div className="step-header">
        <h2 className="step-title">Choose Your Transcription Engine</h2>
        <p className="step-description">
          Select your preferred AI speech-to-text provider to get started
        </p>
      </div>

      <div className="engine-cards">
        {/* ElevenLabs Card */}
        <div
          className={`engine-card ${selectedEngine === 'elevenlabs' ? 'selected' : ''}`}
          onClick={() => handleSelectEngine('elevenlabs')}
        >
          <div className="card-glow" />
          <div className="card-content">
            <div className="engine-icon elevenlabs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            <div className="engine-header">
              <h3>ElevenLabs Scribe</h3>
              <span className="recommended-badge">Recommended</span>
            </div>

            <p className="engine-description">
              High-quality transcription with advanced AI processing and voice cloning support
            </p>

            <ul className="engine-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Premium accuracy
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Voice cloning integration
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Multiple languages
              </li>
            </ul>

            <div className="engine-requirement">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <span>Requires ElevenLabs API subscription</span>
            </div>

            <button
              className="link-button"
              onClick={(e) => {
                e.stopPropagation()
                openLink('https://elevenlabs.io/app/settings/api-keys')
              }}
            >
              Get API Key →
            </button>
          </div>
        </div>

        {/* Deepgram Card */}
        <div
          className={`engine-card ${selectedEngine === 'deepgram' ? 'selected' : ''}`}
          onClick={() => handleSelectEngine('deepgram')}
        >
          <div className="card-glow" />
          <div className="card-content">
            <div className="engine-icon deepgram-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            <div className="engine-header">
              <h3>Deepgram Nova</h3>
            </div>

            <p className="engine-description">
              Fast, accurate transcription with multiple specialized models and flexible pricing
            </p>

            <ul className="engine-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Lightning fast
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Multiple specialized models
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Competitive pricing
              </li>
            </ul>

            <div className="engine-requirement">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <span>Requires Deepgram API subscription</span>
            </div>

            <button
              className="link-button"
              onClick={(e) => {
                e.stopPropagation()
                openLink('https://console.deepgram.com/')
              }}
            >
              Get API Key →
            </button>
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
          disabled={!selectedEngine}
        >
          <span className="button-text">Continue</span>
          <span className="button-glow" />
        </button>
      </div>
    </div>
  )
}
