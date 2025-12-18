import { useState, useEffect } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReplacements: () => void;
}

export function SettingsModal({ isOpen, onClose, onOpenReplacements }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load current API key on open
  useEffect(() => {
    if (isOpen) {
      loadApiKey();
      setIsEditing(false);
      setNewApiKey('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const loadApiKey = async () => {
    try {
      const key = await window.electronAPI.getApiKey();
      setApiKey(key || '');
    } catch (err) {
      console.error('Failed to load API key:', err);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setError(null);
    setIsValidating(true);

    try {
      // Save the new API key
      await window.electronAPI.setApiKey(newApiKey.trim());

      // Verify it works by getting a token
      await window.electronAPI.getScribeToken();

      // Success - update state
      setApiKey(newApiKey.trim());
      setNewApiKey('');
      setIsEditing(false);
      setSuccessMessage('API key updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('API key validation failed:', err);
      setError('Invalid API key. Please check and try again.');
      // Restore the old key
      await window.electronAPI.setApiKey(apiKey);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewApiKey('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-body">
          {/* API Key Section */}
          <div className="settings-section">
            <h3>API Key</h3>
            <p className="settings-description">
              Your ElevenLabs API key for speech recognition.
            </p>

            {!isEditing ? (
              <div className="api-key-display">
                <div className="api-key-value">
                  {showApiKey ? apiKey : maskApiKey(apiKey)}
                </div>
                <div className="api-key-actions">
                  <button
                    className="btn-small"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    className="btn-small btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="api-key-edit">
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter new API key"
                  className="api-key-input"
                  autoFocus
                  disabled={isValidating}
                />
                <div className="api-key-edit-actions">
                  <button
                    className="btn-small"
                    onClick={handleCancelEdit}
                    disabled={isValidating}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-small btn-primary"
                    onClick={handleSaveApiKey}
                    disabled={isValidating || !newApiKey.trim()}
                  >
                    {isValidating ? 'Validating...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {error && <div className="settings-error">{error}</div>}
            {successMessage && <div className="settings-success">{successMessage}</div>}
          </div>

          {/* Word Replacements Section */}
          <div className="settings-section">
            <h3>Word Replacements</h3>
            <p className="settings-description">
              Configure automatic word corrections for commonly misheard words.
            </p>
            <button
              className="btn-settings-action"
              onClick={() => {
                onOpenReplacements();
              }}
            >
              <span className="btn-icon-left">📝</span>
              Manage Replacements
              <span className="btn-arrow">→</span>
            </button>
          </div>

          {/* About Section */}
          <div className="settings-section settings-about">
            <p className="about-text">
              ElevenLabs Transcription v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
