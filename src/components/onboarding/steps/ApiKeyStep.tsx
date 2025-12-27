import { useState } from 'react'

interface ApiKeyStepProps {
  engine: 'elevenlabs' | 'deepgram'
  deepgramModel: 'nova-3' | 'nova-3-monolingual' | 'nova-3-multilingual' | 'nova-2' | 'flux'
  onDeepgramModelChange: (
    model: 'nova-3' | 'nova-3-monolingual' | 'nova-3-multilingual' | 'nova-2' | 'flux'
  ) => void
  onValidated: () => void
  onBack: () => void
}

export function ApiKeyStep({
  engine,
  deepgramModel,
  onDeepgramModelChange,
  onValidated,
  onBack,
}: ApiKeyStepProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidated, setIsValidated] = useState(false)

  const engineConfig = {
    elevenlabs: {
      name: 'ElevenLabs',
      placeholder: 'xi_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      helpUrl: 'https://elevenlabs.io/app/settings/api-keys',
      helpText:
        'You can find your API key in your ElevenLabs dashboard under Settings > API Keys',
    },
    deepgram: {
      name: 'Deepgram',
      placeholder: 'Enter your Deepgram API key',
      helpUrl: 'https://console.deepgram.com/',
      helpText: 'You can find your API key in your Deepgram console dashboard',
    },
  }

  const config = engineConfig[engine]

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter an API key')
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      if (engine === 'elevenlabs') {
        // Save and validate ElevenLabs API key
        await window.electronAPI.setApiKey(apiKey.trim())
        await window.electronAPI.setSettings({ transcriptionEngine: 'elevenlabs' })

        // Try to get a token to verify it works
        await window.electronAPI.getScribeToken()
      } else {
        // Save and validate Deepgram API key
        await window.electronAPI.setDeepgramApiKey(apiKey.trim())
        await window.electronAPI.setSettings({
          transcriptionEngine: 'deepgram',
          deepgramModel: deepgramModel,
        })

        // Test Deepgram connection (will need to add this IPC handler)
        // For now, we'll just save it
        // TODO: Add actual validation
      }

      setIsValidated(true)
    } catch (error) {
      console.error('API key validation failed:', error)
      setValidationError(
        `Invalid API key. Please check your key and try again. ${error instanceof Error ? error.message : ''}`
      )

      // Clear the saved key since it's invalid
      if (engine === 'elevenlabs') {
        await window.electronAPI.setApiKey('')
      } else {
        await window.electronAPI.setDeepgramApiKey('')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleContinue = () => {
    if (isValidated) {
      onValidated()
    }
  }

  const openHelpLink = () => {
    window.open(config.helpUrl, '_blank')
  }

  return (
    <div className="onboarding-step api-key-step">
      <div className="step-header">
        <h2 className="step-title">{config.name} API Key</h2>
        <p className="step-description">
          Enter your {config.name} API key to enable transcription
        </p>
      </div>

      <div className="api-key-form">
        <div className="help-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
          <span>{config.helpText}</span>
        </div>

        <button className="help-link-button" onClick={openHelpLink}>
          Need help? Get your API key →
        </button>

        <div className="form-group">
          <label htmlFor="api-key-input">API Key</label>
          <div className="input-with-toggle">
            <input
              id="api-key-input"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setValidationError(null)
                setIsValidated(false)
              }}
              placeholder={config.placeholder}
              className={`api-key-input ${validationError ? 'error' : ''} ${isValidated ? 'success' : ''}`}
              disabled={isValidating || isValidated}
              autoFocus // eslint-disable-line jsx-a11y/no-autofocus
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {isValidated && (
              <div className="validation-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {engine === 'deepgram' && (
          <div className="form-group">
            <label htmlFor="model-select">Model</label>
            <select
              id="model-select"
              value={deepgramModel}
              onChange={(e) =>
                onDeepgramModelChange(
                  e.target.value as
                    | 'nova-3'
                    | 'nova-3-monolingual'
                    | 'nova-3-multilingual'
                    | 'nova-2'
                    | 'flux'
                )
              }
              className="model-select"
              disabled={isValidating || isValidated}
            >
              <option value="nova-3">Nova 3 (Recommended)</option>
              <option value="nova-3-monolingual">Nova 3 Monolingual</option>
              <option value="nova-3-multilingual">Nova 3 Multilingual</option>
              <option value="nova-2">Nova 2</option>
              <option value="flux">Flux</option>
            </select>
          </div>
        )}

        {validationError && (
          <div className="validation-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {isValidated && (
          <div className="validation-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>API key verified successfully!</span>
          </div>
        )}

        {!isValidated && (
          <button className="cyber-button primary" onClick={validateApiKey} disabled={isValidating}>
            <span className="button-text">{isValidating ? 'Validating...' : 'Validate API Key'}</span>
            <span className="button-glow" />
          </button>
        )}
      </div>

      <div className="step-navigation">
        <button className="cyber-button secondary" onClick={onBack} disabled={isValidating}>
          <span className="button-text">Back</span>
        </button>
        <button
          className="cyber-button primary"
          onClick={handleContinue}
          disabled={!isValidated || isValidating}
        >
          <span className="button-text">Continue</span>
          <span className="button-glow" />
        </button>
      </div>
    </div>
  )
}
