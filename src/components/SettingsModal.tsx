import { useState, useEffect } from 'react'
import type { VoiceCommandTrigger } from '../types/electron'
import './SettingsModal.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenReplacements: () => void
  voiceCommandsEnabled: boolean
  onVoiceCommandsEnabledChange: (enabled: boolean) => void
}

type SettingsTab = 'general' | 'voice' | 'formatting' | 'shortcuts'

export function SettingsModal({
  isOpen,
  onClose,
  onOpenReplacements,
  voiceCommandsEnabled,
  onVoiceCommandsEnabledChange,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  // API Key state
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isEditingApiKey, setIsEditingApiKey] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [apiKeySuccess, setApiKeySuccess] = useState(false)

  // Word Replacements
  const [replacementsEnabled, setReplacementsEnabled] = useState(true)

  // Voice Commands
  const [triggers, setTriggers] = useState<VoiceCommandTrigger[]>([])
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null)
  const [newTriggerPhrase, setNewTriggerPhrase] = useState('')
  const [addingToCommand, setAddingToCommand] = useState<'send' | 'clear' | 'cancel' | null>(null)

  // Prompt Formatting
  const [formattingEnabled, setFormattingEnabled] = useState(true)
  const [formattingModel, setFormattingModel] = useState<'sonnet' | 'opus' | 'haiku'>('sonnet')
  const [formattingInstructions, setFormattingInstructions] = useState('')
  const [defaultInstructions, setDefaultInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [claudeCliStatus, setClaudeCliStatus] = useState<{
    available: boolean
    version: string | null
  } | null>(null)

  // Keyboard Shortcuts
  const [recordHotkey, setRecordHotkey] = useState('CommandOrControl+Shift+R')
  const [recordWithFormattingHotkey, setRecordWithFormattingHotkey] = useState(
    'CommandOrControl+Shift+F'
  )
  const [pasteHotkey, setPasteHotkey] = useState('CommandOrControl+Shift+V')
  const [editingShortcut, setEditingShortcut] = useState<
    'record' | 'recordWithFormatting' | 'paste' | null
  >(null)
  const [shortcutError, setShortcutError] = useState<string | null>(null)

  // Paste Settings
  const [submitAfterPaste, setSubmitAfterPaste] = useState<boolean>(true)

  // History Settings
  const [historyLimit, setHistoryLimit] = useState<number>(500)
  const [customHistoryLimit, setCustomHistoryLimit] = useState<string>('')

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      loadAllSettings()
      resetState()
    }
  }, [isOpen])

  const resetState = () => {
    setIsEditingApiKey(false)
    setNewApiKey('')
    setApiKeyError(null)
    setApiKeySuccess(false)
    setExpandedCommand(null)
    setAddingToCommand(null)
    setNewTriggerPhrase('')
    setEditingShortcut(null)
    setShortcutError(null)
    setShowInstructions(false)
  }

  const loadAllSettings = async () => {
    if (!isElectron) return

    try {
      const [key, settings, triggersData, formattingSettings, defaultInstr, cliStatus] =
        await Promise.all([
          window.electronAPI.getApiKey(),
          window.electronAPI.getSettings(),
          window.electronAPI.getVoiceCommandTriggers(),
          window.electronAPI.getPromptFormattingSettings(),
          window.electronAPI.getDefaultFormattingInstructions(),
          window.electronAPI.checkClaudeCli(),
        ])

      setApiKey(key || '')
      setReplacementsEnabled(settings.replacementsEnabled ?? true)
      setRecordHotkey(settings.recordHotkey || 'CommandOrControl+Shift+R')
      setRecordWithFormattingHotkey(
        settings.recordWithFormattingHotkey || 'CommandOrControl+Shift+F'
      )
      setPasteHotkey(settings.pasteHotkey || 'CommandOrControl+Shift+V')
      setSubmitAfterPaste(settings.submitAfterPaste ?? true)
      setHistoryLimit(settings.historyLimit ?? 500)
      setTriggers(triggersData)
      setFormattingEnabled(formattingSettings.enabled)
      setFormattingModel(formattingSettings.model)
      setFormattingInstructions(formattingSettings.instructions)
      setDefaultInstructions(defaultInstr)
      setClaudeCliStatus(cliStatus)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return '•'.repeat(key.length)
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4)
  }

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      setApiKeyError('Please enter an API key')
      return
    }

    if (!isElectron) return

    setApiKeyError(null)
    setIsValidating(true)

    try {
      await window.electronAPI.setApiKey(newApiKey.trim())
      await window.electronAPI.getScribeToken()

      setApiKey(newApiKey.trim())
      setNewApiKey('')
      setIsEditingApiKey(false)
      setApiKeySuccess(true)
      setTimeout(() => setApiKeySuccess(false), 3000)
    } catch (err) {
      console.error('API key validation failed:', err)
      setApiKeyError('Invalid API key. Please check and try again.')
      await window.electronAPI.setApiKey(apiKey)
    } finally {
      setIsValidating(false)
    }
  }

  const handleReplacementsEnabledChange = async (enabled: boolean) => {
    setReplacementsEnabled(enabled)
    if (isElectron) {
      await window.electronAPI.setSettings({ replacementsEnabled: enabled })
    }
  }

  const handleHistoryLimitChange = async (limit: number) => {
    setHistoryLimit(limit)
    setCustomHistoryLimit('')
    if (isElectron) {
      await window.electronAPI.setSettings({ historyLimit: limit })
    }
  }

  const handleCustomHistoryLimitSubmit = async () => {
    const value = parseInt(customHistoryLimit, 10)
    if (!isNaN(value) && value >= 0) {
      await handleHistoryLimitChange(value)
    }
  }

  const handleVoiceCommandsChange = async (enabled: boolean) => {
    onVoiceCommandsEnabledChange(enabled)
    if (isElectron) {
      await window.electronAPI.setSettings({ voiceCommandsEnabled: enabled })
    }
  }

  const handleSubmitAfterPasteChange = async (enabled: boolean) => {
    setSubmitAfterPaste(enabled)
    if (isElectron) {
      await window.electronAPI.setSettings({ submitAfterPaste: enabled })
    }
  }

  const handleFormattingEnabledChange = async (enabled: boolean) => {
    setFormattingEnabled(enabled)
    if (isElectron) {
      await window.electronAPI.setPromptFormattingEnabled(enabled)
    }
  }

  const handleFormattingModelChange = async (model: 'sonnet' | 'opus' | 'haiku') => {
    setFormattingModel(model)
    if (isElectron) {
      await window.electronAPI.setPromptFormattingModel(model)
    }
  }

  const handleFormattingInstructionsChange = async (instructions: string) => {
    setFormattingInstructions(instructions)
    if (isElectron) {
      await window.electronAPI.setPromptFormattingInstructions(instructions)
    }
  }

  const handleResetInstructions = async () => {
    setFormattingInstructions('')
    if (isElectron) {
      await window.electronAPI.setPromptFormattingInstructions('')
    }
  }

  const handleTriggerToggle = async (id: string, enabled: boolean) => {
    if (isElectron) {
      await window.electronAPI.updateVoiceCommandTrigger(id, { enabled })
    }
    setTriggers(triggers.map((t) => (t.id === id ? { ...t, enabled } : t)))
  }

  const handleDeleteTrigger = async (id: string) => {
    if (isElectron) {
      await window.electronAPI.deleteVoiceCommandTrigger(id)
    }
    setTriggers(triggers.filter((t) => t.id !== id))
  }

  const handleAddTrigger = async (command: 'send' | 'clear' | 'cancel') => {
    if (!newTriggerPhrase.trim()) return

    const newTrigger: VoiceCommandTrigger = {
      id: `custom-${Date.now()}`,
      phrase: newTriggerPhrase.trim().toLowerCase(),
      command,
      enabled: true,
      isCustom: true,
    }

    if (isElectron) {
      await window.electronAPI.addVoiceCommandTrigger(newTrigger)
    }
    setTriggers([...triggers, newTrigger])
    setNewTriggerPhrase('')
    setAddingToCommand(null)
  }

  const getTriggersByCommand = (command: 'send' | 'clear' | 'cancel') => {
    return triggers.filter((t) => t.command === command)
  }

  const formatHotkeyForDisplay = (hotkey: string) => {
    return hotkey
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Option', '⌥')
      .replace(/\+/g, ' ')
  }

  const keyEventToAccelerator = (e: React.KeyboardEvent): string | null => {
    const parts: string[] = []

    if (!e.metaKey && !e.ctrlKey && !e.altKey) return null

    if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
    if (e.shiftKey) parts.push('Shift')
    if (e.altKey) parts.push('Alt')

    const key = e.key
    if (['Meta', 'Control', 'Shift', 'Alt'].includes(key)) return null

    let electronKey = key.toUpperCase()
    if (key === 'ArrowUp') electronKey = 'Up'
    else if (key === 'ArrowDown') electronKey = 'Down'
    else if (key === 'ArrowLeft') electronKey = 'Left'
    else if (key === 'ArrowRight') electronKey = 'Right'

    parts.push(electronKey)
    return parts.join('+')
  }

  const handleShortcutKeyDown = async (
    e: React.KeyboardEvent,
    type: 'record' | 'recordWithFormatting' | 'paste'
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === 'Escape') {
      setEditingShortcut(null)
      setShortcutError(null)
      return
    }

    if (!isElectron) return

    const accelerator = keyEventToAccelerator(e)
    if (!accelerator) return

    const result = await window.electronAPI.updateHotkey(type, accelerator)

    if (result.success) {
      if (type === 'record') setRecordHotkey(accelerator)
      else if (type === 'recordWithFormatting') setRecordWithFormattingHotkey(accelerator)
      else setPasteHotkey(accelerator)
      setEditingShortcut(null)
      setShortcutError(null)
    } else {
      setShortcutError(result.error || 'Failed to set shortcut')
    }
  }

  const commandConfig = {
    send: { title: 'Send / Paste', description: 'Stop and paste to terminal', icon: '📤' },
    clear: { title: 'Clear', description: 'Clear transcript', icon: '🗑️' },
    cancel: { title: 'Cancel', description: 'Discard recording', icon: '❌' },
  }

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: '⚙️' },
    { id: 'voice' as SettingsTab, label: 'Voice', icon: '🎤' },
    { id: 'formatting' as SettingsTab, label: 'AI Format', icon: '✨' },
    { id: 'shortcuts' as SettingsTab, label: 'Shortcuts', icon: '⌨️' },
  ]

  if (!isOpen) return null

  return (
    <div className="cyber-modal-overlay" onClick={onClose}>
      <div className="cyber-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cyber-modal-header">
          <h2>Settings</h2>
          <button className="cyber-close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="cyber-settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`cyber-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="cyber-settings-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              {/* API Key */}
              <div className="cyber-setting-group">
                <div className="setting-header">
                  <div className="setting-icon">🔑</div>
                  <div className="setting-info">
                    <h3>API Key</h3>
                    <p>Your ElevenLabs API key for speech recognition</p>
                  </div>
                </div>

                {!isEditingApiKey ? (
                  <div className="api-key-display">
                    <code className="api-key-value">
                      {showApiKey ? apiKey : maskApiKey(apiKey)}
                    </code>
                    <div className="api-key-actions">
                      <button className="cyber-btn-sm" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="cyber-btn-sm cyber-btn-primary"
                        onClick={() => setIsEditingApiKey(true)}
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
                      className="cyber-input"
                      autoFocus
                      disabled={isValidating}
                    />
                    <div className="api-key-actions">
                      <button
                        className="cyber-btn-sm"
                        onClick={() => {
                          setIsEditingApiKey(false)
                          setNewApiKey('')
                          setApiKeyError(null)
                        }}
                        disabled={isValidating}
                      >
                        Cancel
                      </button>
                      <button
                        className="cyber-btn-sm cyber-btn-primary"
                        onClick={handleSaveApiKey}
                        disabled={isValidating || !newApiKey.trim()}
                      >
                        {isValidating ? 'Validating...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}

                {apiKeyError && <div className="cyber-error">{apiKeyError}</div>}
                {apiKeySuccess && <div className="cyber-success">API key updated successfully</div>}
              </div>

              {/* Word Replacements */}
              <div className="cyber-setting-group">
                <div className="setting-row">
                  <div className="setting-header">
                    <div className="setting-icon">📝</div>
                    <div className="setting-info">
                      <h3>Word Replacements</h3>
                      <p>Auto-correct misheard words</p>
                    </div>
                  </div>
                  <label className="cyber-toggle">
                    <input
                      type="checkbox"
                      checked={replacementsEnabled}
                      onChange={(e) => handleReplacementsEnabledChange(e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>

                <button
                  className="cyber-action-btn"
                  onClick={onOpenReplacements}
                  disabled={!replacementsEnabled}
                >
                  <span>Manage Replacements</span>
                  <span className="action-arrow">→</span>
                </button>
              </div>

              {/* History Limit */}
              <div className="cyber-setting-group">
                <div className="setting-header">
                  <div className="setting-icon">📚</div>
                  <div className="setting-info">
                    <h3>History Limit</h3>
                    <p>Maximum transcriptions to keep</p>
                  </div>
                </div>

                <div className="history-limit-options">
                  {[100, 250, 500, 1000, 0].map((limit) => (
                    <button
                      key={limit}
                      className={`history-limit-btn ${historyLimit === limit ? 'active' : ''}`}
                      onClick={() => handleHistoryLimitChange(limit)}
                    >
                      {limit === 0 ? 'No Limit' : limit}
                    </button>
                  ))}
                </div>

                <div className="custom-limit-row">
                  <input
                    type="number"
                    className="cyber-input cyber-input-sm"
                    placeholder="Custom..."
                    value={customHistoryLimit}
                    onChange={(e) => setCustomHistoryLimit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomHistoryLimitSubmit()
                    }}
                    min="0"
                  />
                  <button
                    className="cyber-btn-sm cyber-btn-primary"
                    onClick={handleCustomHistoryLimitSubmit}
                    disabled={!customHistoryLimit.trim()}
                  >
                    Set
                  </button>
                </div>

                {![100, 250, 500, 1000, 0].includes(historyLimit) && (
                  <p className="current-limit-hint">Current: {historyLimit} items</p>
                )}
              </div>

              {/* Submit After Paste Toggle */}
              <div className="cyber-setting-group">
                <div className="setting-row">
                  <div className="setting-header">
                    <div className="setting-icon">⏎</div>
                    <div className="setting-info">
                      <h3>Submit After Paste</h3>
                      <p>Press Enter after pasting to terminal (submit command)</p>
                    </div>
                  </div>
                  <label className="cyber-toggle">
                    <input
                      type="checkbox"
                      checked={submitAfterPaste}
                      onChange={(e) => handleSubmitAfterPasteChange(e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>
              </div>

              {/* About */}
              <div className="cyber-setting-group about-section">
                <p className="about-text">Neural Scribe v1.0.0</p>
                <p className="about-subtext">Powered by ElevenLabs Scribe</p>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="settings-panel">
              <div className="cyber-setting-group">
                <div className="setting-row">
                  <div className="setting-header">
                    <div className="setting-icon">🎤</div>
                    <div className="setting-info">
                      <h3>Voice Commands</h3>
                      <p>Control the app with your voice while recording</p>
                    </div>
                  </div>
                  <label className="cyber-toggle">
                    <input
                      type="checkbox"
                      checked={voiceCommandsEnabled}
                      onChange={(e) => handleVoiceCommandsChange(e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>
              </div>

              {voiceCommandsEnabled && (
                <div className="voice-commands-section">
                  {(['send', 'clear', 'cancel'] as const).map((command) => {
                    const cmdTriggers = getTriggersByCommand(command)
                    const isExpanded = expandedCommand === command
                    const config = commandConfig[command]

                    return (
                      <div key={command} className="cyber-command-group">
                        <button
                          className={`cyber-command-header ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => setExpandedCommand(isExpanded ? null : command)}
                        >
                          <span className="command-icon">{config.icon}</span>
                          <div className="command-info">
                            <span className="command-title">{config.title}</span>
                            <span className="command-desc">{config.description}</span>
                          </div>
                          <span className="command-count">
                            {cmdTriggers.filter((t) => t.enabled).length}/{cmdTriggers.length}
                          </span>
                          <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                        </button>

                        {isExpanded && (
                          <div className="command-triggers">
                            {cmdTriggers.map((trigger) => (
                              <div key={trigger.id} className="trigger-item">
                                <label className="cyber-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={trigger.enabled}
                                    onChange={(e) =>
                                      handleTriggerToggle(trigger.id, e.target.checked)
                                    }
                                  />
                                  <span className="checkbox-mark" />
                                </label>
                                <span className="trigger-phrase">"{trigger.phrase}"</span>
                                {trigger.isCustom && (
                                  <button
                                    className="trigger-delete"
                                    onClick={() => handleDeleteTrigger(trigger.id)}
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
                                  className="cyber-input cyber-input-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTrigger(command)
                                    if (e.key === 'Escape') {
                                      setAddingToCommand(null)
                                      setNewTriggerPhrase('')
                                    }
                                  }}
                                />
                                <button
                                  className="cyber-btn-sm cyber-btn-primary"
                                  onClick={() => handleAddTrigger(command)}
                                  disabled={!newTriggerPhrase.trim()}
                                >
                                  Add
                                </button>
                              </div>
                            ) : (
                              <button
                                className="add-trigger-btn"
                                onClick={() => setAddingToCommand(command)}
                              >
                                + Add phrase
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Formatting Tab */}
          {activeTab === 'formatting' && (
            <div className="settings-panel">
              <div className="cyber-setting-group">
                <div className="setting-row">
                  <div className="setting-header">
                    <div className="setting-icon">✨</div>
                    <div className="setting-info">
                      <h3>AI Formatting</h3>
                      <p>Use Claude to format your transcription</p>
                    </div>
                  </div>
                  <label className="cyber-toggle">
                    <input
                      type="checkbox"
                      checked={formattingEnabled}
                      onChange={(e) => handleFormattingEnabledChange(e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>

                {claudeCliStatus && !claudeCliStatus.available && (
                  <div className="cyber-error">
                    Claude CLI not found. Install Claude Code to use this feature.
                  </div>
                )}
              </div>

              {formattingEnabled && claudeCliStatus?.available && (
                <>
                  <div className="cyber-setting-group">
                    <h4 className="setting-label">Model</h4>
                    <div className="model-selector">
                      {(['haiku', 'sonnet', 'opus'] as const).map((model) => (
                        <button
                          key={model}
                          className={`model-btn ${formattingModel === model ? 'active' : ''}`}
                          onClick={() => handleFormattingModelChange(model)}
                        >
                          <span className="model-name">
                            {model.charAt(0).toUpperCase() + model.slice(1)}
                          </span>
                          <span className="model-badge">
                            {model === 'haiku' && 'Fast'}
                            {model === 'sonnet' && 'Balanced'}
                            {model === 'opus' && 'Best'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cyber-setting-group">
                    <button
                      className="cyber-action-btn"
                      onClick={() => setShowInstructions(!showInstructions)}
                    >
                      <span>{showInstructions ? 'Hide' : 'View'} Instructions</span>
                      <span className="action-arrow">{showInstructions ? '↑' : '→'}</span>
                    </button>

                    {showInstructions && (
                      <div className="instructions-editor">
                        <textarea
                          className="cyber-textarea"
                          value={formattingInstructions || defaultInstructions}
                          onChange={(e) => handleFormattingInstructionsChange(e.target.value)}
                          placeholder="Enter custom formatting instructions..."
                          rows={8}
                        />
                        <button
                          className="cyber-btn-sm"
                          onClick={handleResetInstructions}
                          disabled={!formattingInstructions}
                        >
                          Reset to Default
                        </button>
                      </div>
                    )}
                  </div>

                  {claudeCliStatus?.version && (
                    <p className="cli-version">Claude CLI {claudeCliStatus.version}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="settings-panel">
              <div className="cyber-setting-group">
                <div className="setting-header">
                  <div className="setting-icon">⌨️</div>
                  <div className="setting-info">
                    <h3>Keyboard Shortcuts</h3>
                    <p>Global hotkeys that work from any app</p>
                  </div>
                </div>
              </div>

              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <span className="shortcut-label">Start Recording (No Formatting)</span>
                  {editingShortcut === 'record' ? (
                    <input
                      type="text"
                      className="cyber-input cyber-input-sm shortcut-input"
                      placeholder="Press keys..."
                      autoFocus
                      onKeyDown={(e) => handleShortcutKeyDown(e, 'record')}
                      onBlur={() => {
                        setEditingShortcut(null)
                        setShortcutError(null)
                      }}
                      readOnly
                    />
                  ) : (
                    <button
                      className="shortcut-key"
                      onClick={() => {
                        setEditingShortcut('record')
                        setShortcutError(null)
                      }}
                    >
                      {formatHotkeyForDisplay(recordHotkey)}
                    </button>
                  )}
                </div>

                <div className="shortcut-item">
                  <span className="shortcut-label">Start Recording (With Formatting)</span>
                  {editingShortcut === 'recordWithFormatting' ? (
                    <input
                      type="text"
                      className="cyber-input cyber-input-sm shortcut-input"
                      placeholder="Press keys..."
                      autoFocus
                      onKeyDown={(e) => handleShortcutKeyDown(e, 'recordWithFormatting')}
                      onBlur={() => {
                        setEditingShortcut(null)
                        setShortcutError(null)
                      }}
                      readOnly
                    />
                  ) : (
                    <button
                      className="shortcut-key"
                      onClick={() => {
                        setEditingShortcut('recordWithFormatting')
                        setShortcutError(null)
                      }}
                    >
                      {formatHotkeyForDisplay(recordWithFormattingHotkey)}
                    </button>
                  )}
                </div>

                <div className="shortcut-item">
                  <span className="shortcut-label">Paste Last Transcription</span>
                  {editingShortcut === 'paste' ? (
                    <input
                      type="text"
                      className="cyber-input cyber-input-sm shortcut-input"
                      placeholder="Press keys..."
                      autoFocus
                      onKeyDown={(e) => handleShortcutKeyDown(e, 'paste')}
                      onBlur={() => {
                        setEditingShortcut(null)
                        setShortcutError(null)
                      }}
                      readOnly
                    />
                  ) : (
                    <button
                      className="shortcut-key"
                      onClick={() => {
                        setEditingShortcut('paste')
                        setShortcutError(null)
                      }}
                    >
                      {formatHotkeyForDisplay(pasteHotkey)}
                    </button>
                  )}
                </div>
              </div>

              {shortcutError && <div className="cyber-error">{shortcutError}</div>}

              <p className="shortcut-hint">
                Click a shortcut to change it. Press Escape to cancel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
