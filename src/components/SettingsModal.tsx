import { useState, useEffect } from 'react';
import type { VoiceCommandTrigger, AppSettings } from '../types/electron';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReplacements: () => void;
  voiceCommandsEnabled: boolean;
  onVoiceCommandsEnabledChange: (enabled: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  onOpenReplacements,
  voiceCommandsEnabled,
  onVoiceCommandsEnabledChange
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settings
  const [replacementsEnabled, setReplacementsEnabled] = useState(true);

  // Voice command triggers
  const [triggers, setTriggers] = useState<VoiceCommandTrigger[]>([]);
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
  const [newTriggerPhrase, setNewTriggerPhrase] = useState('');
  const [addingToCommand, setAddingToCommand] = useState<'send' | 'clear' | 'cancel' | null>(null);

  // Keyboard shortcuts
  const [recordHotkey, setRecordHotkey] = useState('CommandOrControl+Shift+R');
  const [pasteHotkey, setPasteHotkey] = useState('CommandOrControl+Shift+V');
  const [editingShortcut, setEditingShortcut] = useState<'record' | 'paste' | null>(null);
  const [shortcutError, setShortcutError] = useState<string | null>(null);

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadTriggers();
      setIsEditing(false);
      setNewApiKey('');
      setError(null);
      setSuccessMessage(null);
      setExpandedCommand(null);
      setAddingToCommand(null);
      setNewTriggerPhrase('');
      setEditingShortcut(null);
      setShortcutError(null);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const key = await window.electronAPI.getApiKey();
      setApiKey(key || '');

      const settings = await window.electronAPI.getSettings();
      setReplacementsEnabled(settings.replacementsEnabled ?? true);
      setRecordHotkey(settings.recordHotkey || 'CommandOrControl+Shift+R');
      setPasteHotkey(settings.pasteHotkey || 'CommandOrControl+Shift+V');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadTriggers = async () => {
    try {
      const data = await window.electronAPI.getVoiceCommandTriggers();
      setTriggers(data);
    } catch (err) {
      console.error('Failed to load voice command triggers:', err);
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
      await window.electronAPI.setApiKey(newApiKey.trim());
      await window.electronAPI.getScribeToken();

      setApiKey(newApiKey.trim());
      setNewApiKey('');
      setIsEditing(false);
      setSuccessMessage('API key updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('API key validation failed:', err);
      setError('Invalid API key. Please check and try again.');
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

  const handleReplacementsEnabledChange = async (enabled: boolean) => {
    setReplacementsEnabled(enabled);
    await window.electronAPI.setSettings({ replacementsEnabled: enabled });
  };

  const handleVoiceCommandsEnabledChange = async (enabled: boolean) => {
    onVoiceCommandsEnabledChange(enabled);
    await window.electronAPI.setSettings({ voiceCommandsEnabled: enabled });
  };

  const handleTriggerToggle = async (id: string, enabled: boolean) => {
    await window.electronAPI.updateVoiceCommandTrigger(id, { enabled });
    setTriggers(triggers.map(t => t.id === id ? { ...t, enabled } : t));
  };

  const handleDeleteTrigger = async (id: string) => {
    await window.electronAPI.deleteVoiceCommandTrigger(id);
    setTriggers(triggers.filter(t => t.id !== id));
  };

  const handleAddTrigger = async (command: 'send' | 'clear' | 'cancel') => {
    if (!newTriggerPhrase.trim()) return;

    const newTrigger: VoiceCommandTrigger = {
      id: `custom-${Date.now()}`,
      phrase: newTriggerPhrase.trim().toLowerCase(),
      command,
      enabled: true,
      isCustom: true
    };

    await window.electronAPI.addVoiceCommandTrigger(newTrigger);
    setTriggers([...triggers, newTrigger]);
    setNewTriggerPhrase('');
    setAddingToCommand(null);
  };

  const getTriggersByCommand = (command: 'send' | 'clear' | 'cancel') => {
    return triggers.filter(t => t.command === command);
  };

  // Convert Electron accelerator format to display format
  const formatHotkeyForDisplay = (hotkey: string) => {
    return hotkey
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Option', '⌥')
      .replace(/\+/g, ' ');
  };

  // Convert key event to Electron accelerator format
  const keyEventToAccelerator = (e: React.KeyboardEvent): string | null => {
    const parts: string[] = [];

    // Need at least one modifier
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      return null;
    }

    if (e.metaKey || e.ctrlKey) {
      parts.push('CommandOrControl');
    }
    if (e.shiftKey) {
      parts.push('Shift');
    }
    if (e.altKey) {
      parts.push('Alt');
    }

    // Get the key (ignore modifier-only presses)
    const key = e.key;
    if (['Meta', 'Control', 'Shift', 'Alt'].includes(key)) {
      return null;
    }

    // Convert key to Electron format
    let electronKey = key.toUpperCase();
    if (key.length === 1) {
      electronKey = key.toUpperCase();
    } else if (key === 'ArrowUp') {
      electronKey = 'Up';
    } else if (key === 'ArrowDown') {
      electronKey = 'Down';
    } else if (key === 'ArrowLeft') {
      electronKey = 'Left';
    } else if (key === 'ArrowRight') {
      electronKey = 'Right';
    }

    parts.push(electronKey);
    return parts.join('+');
  };

  const handleShortcutKeyDown = async (e: React.KeyboardEvent, type: 'record' | 'paste') => {
    e.preventDefault();
    e.stopPropagation();

    // Escape to cancel
    if (e.key === 'Escape') {
      setEditingShortcut(null);
      setShortcutError(null);
      return;
    }

    const accelerator = keyEventToAccelerator(e);
    if (!accelerator) {
      return; // Wait for a valid key combination
    }

    // Try to update the hotkey
    const result = await window.electronAPI.updateHotkey(type, accelerator);

    if (result.success) {
      if (type === 'record') {
        setRecordHotkey(accelerator);
      } else {
        setPasteHotkey(accelerator);
      }
      setEditingShortcut(null);
      setShortcutError(null);
    } else {
      setShortcutError(result.error || 'Failed to set shortcut');
    }
  };

  const commandLabels = {
    send: { title: 'Send / Paste', description: 'Stop recording and paste to terminal', icon: '📤' },
    clear: { title: 'Clear', description: 'Clear the current transcript', icon: '🗑️' },
    cancel: { title: 'Cancel', description: 'Cancel and discard recording', icon: '❌' }
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
            <div className="settings-section-header">
              <div>
                <h3>Word Replacements</h3>
                <p className="settings-description">
                  Automatically correct commonly misheard words.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={replacementsEnabled}
                  onChange={(e) => handleReplacementsEnabledChange(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <button
              className="btn-settings-action"
              onClick={onOpenReplacements}
              disabled={!replacementsEnabled}
            >
              <span className="btn-icon-left">📝</span>
              Manage Replacements
              <span className="btn-arrow">→</span>
            </button>
          </div>

          {/* Voice Commands Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div>
                <h3>Voice Commands</h3>
                <p className="settings-description">
                  Control the app with voice while recording.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={voiceCommandsEnabled}
                  onChange={(e) => handleVoiceCommandsEnabledChange(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {voiceCommandsEnabled && (
              <div className="voice-commands-list">
                {(['send', 'clear', 'cancel'] as const).map(command => {
                  const commandTriggers = getTriggersByCommand(command);
                  const isExpanded = expandedCommand === command;
                  const label = commandLabels[command];

                  return (
                    <div key={command} className="voice-command-group">
                      <button
                        className="voice-command-header"
                        onClick={() => setExpandedCommand(isExpanded ? null : command)}
                      >
                        <span className="command-icon">{label.icon}</span>
                        <div className="command-info">
                          <span className="command-title">{label.title}</span>
                          <span className="command-desc">{label.description}</span>
                        </div>
                        <span className="command-count">
                          {commandTriggers.filter(t => t.enabled).length}/{commandTriggers.length}
                        </span>
                        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
                      </button>

                      {isExpanded && (
                        <div className="voice-command-triggers">
                          {commandTriggers.map(trigger => (
                            <div key={trigger.id} className="trigger-item">
                              <label className="trigger-toggle">
                                <input
                                  type="checkbox"
                                  checked={trigger.enabled}
                                  onChange={(e) => handleTriggerToggle(trigger.id, e.target.checked)}
                                />
                                <span className="trigger-phrase">"{trigger.phrase}"</span>
                              </label>
                              {trigger.isCustom && (
                                <button
                                  className="trigger-delete"
                                  onClick={() => handleDeleteTrigger(trigger.id)}
                                  title="Delete"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}

                          {addingToCommand === command ? (
                            <div className="add-trigger-form">
                              <input
                                type="text"
                                value={newTriggerPhrase}
                                onChange={(e) => setNewTriggerPhrase(e.target.value)}
                                placeholder="Enter phrase..."
                                className="add-trigger-input"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddTrigger(command);
                                  if (e.key === 'Escape') {
                                    setAddingToCommand(null);
                                    setNewTriggerPhrase('');
                                  }
                                }}
                              />
                              <button
                                className="btn-small btn-primary"
                                onClick={() => handleAddTrigger(command)}
                                disabled={!newTriggerPhrase.trim()}
                              >
                                Add
                              </button>
                              <button
                                className="btn-small"
                                onClick={() => {
                                  setAddingToCommand(null);
                                  setNewTriggerPhrase('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="add-trigger-btn"
                              onClick={() => setAddingToCommand(command)}
                            >
                              + Add custom phrase
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Section */}
          <div className="settings-section">
            <h3>Keyboard Shortcuts</h3>
            <p className="settings-description">
              Global hotkeys that work from any application. Click to change.
            </p>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-label">Toggle Recording</span>
                {editingShortcut === 'record' ? (
                  <input
                    type="text"
                    className="shortcut-input"
                    placeholder="Press keys..."
                    autoFocus
                    onKeyDown={(e) => handleShortcutKeyDown(e, 'record')}
                    onBlur={() => {
                      setEditingShortcut(null);
                      setShortcutError(null);
                    }}
                    readOnly
                  />
                ) : (
                  <button
                    className="shortcut-key-btn"
                    onClick={() => {
                      setEditingShortcut('record');
                      setShortcutError(null);
                    }}
                  >
                    {formatHotkeyForDisplay(recordHotkey)}
                  </button>
                )}
              </div>
              <div className="shortcut-item">
                <span className="shortcut-label">Paste Last Transcription</span>
                {editingShortcut === 'paste' ? (
                  <input
                    type="text"
                    className="shortcut-input"
                    placeholder="Press keys..."
                    autoFocus
                    onKeyDown={(e) => handleShortcutKeyDown(e, 'paste')}
                    onBlur={() => {
                      setEditingShortcut(null);
                      setShortcutError(null);
                    }}
                    readOnly
                  />
                ) : (
                  <button
                    className="shortcut-key-btn"
                    onClick={() => {
                      setEditingShortcut('paste');
                      setShortcutError(null);
                    }}
                  >
                    {formatHotkeyForDisplay(pasteHotkey)}
                  </button>
                )}
              </div>
            </div>
            {shortcutError && (
              <div className="settings-error">{shortcutError}</div>
            )}
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
