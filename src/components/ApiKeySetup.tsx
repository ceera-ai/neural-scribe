import { useState } from 'react'
import './ApiKeySetup.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface ApiKeySetupProps {
  onApiKeySet: () => void
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    if (!isElectron) {
      setError('Not in Electron environment')
      return
    }

    setIsLoading(true)

    try {
      // Save the API key
      await window.electronAPI.setApiKey(apiKey.trim())

      // Try to get a token to verify it works
      await window.electronAPI.getScribeToken()

      onApiKeySet()
    } catch (err) {
      console.error('API key validation failed:', err)
      setError('Invalid API key. Please check and try again.')
      // Clear the saved key since it's invalid
      await window.electronAPI.setApiKey('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="api-key-setup">
      <div className="api-key-card">
        <h2>Welcome to ElevenLabs Transcription</h2>
        <p className="api-key-description">
          To get started, enter your ElevenLabs API key. You can find this in your ElevenLabs
          dashboard under Settings &gt; API Keys.
        </p>

        <form onSubmit={handleSubmit} className="api-key-form">
          <div className="api-key-input-group">
            <label htmlFor="api-key-input">API Key</label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="xi_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="api-key-input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && <div className="api-key-error">{error}</div>}

          <button type="submit" className="api-key-submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Save & Continue'}
          </button>
        </form>

        <p className="api-key-note">
          Your API key is stored securely on your device and never sent anywhere except ElevenLabs.
        </p>
      </div>
    </div>
  )
}
