import { useRef, useEffect, useState, useCallback } from 'react'
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe'
import { useMicrophoneDevices } from './hooks/useMicrophoneDevices'
import { useTranscriptionHistory } from './hooks/useTranscriptionHistory'
import { useGamification } from './hooks/useGamification'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import { MicrophoneSelector } from './components/MicrophoneSelector'
import { HistoryPanel } from './components/HistoryPanel'
import { ApiKeySetup } from './components/ApiKeySetup'
import { ReplacementsModal } from './components/ReplacementsModal'
import { SettingsModal } from './components/SettingsModal'
import { AIOrb } from './components/orb/AIOrb'
import type { OrbState } from './components/orb/AIOrb'
import { ScanLines } from './components/cyberpunk/ScanLines'
import { GlitchText } from './components/cyberpunk/GlitchText'
import { AchievementPopup } from './components/gamification/AchievementPopup'
import { GamificationModal } from './components/gamification/GamificationModal'
import { RecordingControls } from './components/controls/RecordingControls'
import { TranscriptDisplay } from './components/transcript/TranscriptDisplay'
import { AppHeader } from './components/header/AppHeader'
import './App.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showReplacements, setShowReplacements] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null)
  const [pasteStatus, setPasteStatus] = useState<
    'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'
  >('idle')
  const [historySaved, setHistorySaved] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(
    null
  )
  const [replacementInitialText, setReplacementInitialText] = useState<string | undefined>(
    undefined
  )
  const [formattingEnabled, setFormattingEnabled] = useState(true)
  const [recordHotkey, setRecordHotkey] = useState('CommandOrControl+Shift+R')
  const [pasteHotkey, setPasteHotkey] = useState('CommandOrControl+Shift+V')
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const transcriptInputRef = useRef<HTMLTextAreaElement>(null)
  const pendingPasteRef = useRef<string | null>(null)
  const isPastingRef = useRef<boolean>(false) // Lock to prevent multiple simultaneous pastes

  const { selectedDeviceId } = useMicrophoneDevices()
  const { saveTranscription, saveTranscriptionWithFormatting } = useTranscriptionHistory()
  const {
    stats,
    level,
    achievements,
    recentUnlocks,
    xpProgress,
    recordSession,
    checkDailyLogin,
    clearRecentUnlocks,
  } = useGamification()

  // Check daily login on mount
  useEffect(() => {
    checkDailyLogin()
  }, [checkDailyLogin])

  // Check if API key is configured on mount
  useEffect(() => {
    if (!isElectron) {
      setInitError('This app requires Electron. The preload script may not have loaded correctly.')
      return
    }
    window.electronAPI
      .hasApiKey()
      .then(setHasApiKey)
      .catch((err) => {
        console.error('Failed to check API key:', err)
        setInitError('Failed to initialize: ' + err.message)
      })
    // Load formatting setting and shortcuts
    window.electronAPI
      .getPromptFormattingSettings()
      .then((settings) => {
        setFormattingEnabled(settings.enabled)
      })
      .catch((err) => {
        console.error('Failed to load formatting settings:', err)
      })
    window.electronAPI
      .getSettings()
      .then((settings) => {
        if (settings.recordHotkey) setRecordHotkey(settings.recordHotkey)
        if (settings.pasteHotkey) setPasteHotkey(settings.pasteHotkey)
      })
      .catch((err) => {
        console.error('Failed to load shortcut settings:', err)
      })
  }, [])

  // CENTRALIZED RECORDING COMPLETION - Ensures gamification is ALWAYS triggered
  const handleRecordingComplete = useCallback(
    async (
      transcript: string,
      duration: number,
      source:
        | 'stop_button'
        | 'voice_send'
        | 'voice_clear'
        | 'voice_cancel'
        | 'hotkey'
        | 'paste'
        | 'auto'
    ) => {
      console.log(`[App] Recording complete via: ${source}, duration: ${duration}s`)

      // Apply word replacements if enabled
      let processedTranscript = transcript
      try {
        const settings = await window.electronAPI.getSettings()
        if (settings.replacementsEnabled) {
          processedTranscript = await window.electronAPI.applyReplacements(transcript)
        }
      } catch (err) {
        console.error('Failed to apply replacements:', err)
      }

      // CRITICAL: Always record session for gamification (except for cancel)
      // This fixes the bug where voice commands weren't being tracked
      if (source !== 'voice_cancel' && processedTranscript.trim()) {
        const wordCount = processedTranscript.trim().split(/\s+/).length
        if (wordCount > 0) {
          console.log(`[App] Recording gamification: ${wordCount} words, ${duration}s`)
          await recordSession(wordCount, duration * 1000) // Convert to milliseconds
        }
      }

      return processedTranscript
    },
    [recordSession]
  )

  const handleRecordingStopped = useCallback(
    async (transcript: string, duration: number) => {
      // Determine source based on context
      const source = pendingPasteRef.current ? 'voice_send' : 'auto'

      // Always trigger gamification via centralized handler
      const processedTranscript = await handleRecordingComplete(transcript, duration, source)

      // Only auto-save if there's no pending paste operation
      // If there's a pending paste, formatAndPaste will handle saving with formatting
      if (processedTranscript.trim() && !pendingPasteRef.current) {
        await saveTranscription(processedTranscript, duration)
      }

      // Return the processed transcript to update the UI
      return processedTranscript
    },
    [saveTranscription, handleRecordingComplete]
  )

  // Handle voice commands
  const handleVoiceCommand = useCallback(
    async (command: 'send' | 'clear' | 'cancel', transcript: string) => {
      console.log(`[App] Voice command received: ${command}, transcript: "${transcript}"`)
      setLastVoiceCommand(command)
      setTimeout(() => setLastVoiceCommand(null), 2000)

      switch (command) {
        case 'send':
          // Store transcript for paste, will be executed after recording stops
          if (transcript.trim()) {
            pendingPasteRef.current = transcript
          }
          break
        case 'clear':
          // Will be handled after recording stops
          break
        case 'cancel':
          // Will be handled after recording stops
          break
      }
    },
    []
  )

  // Handle saving transcript when starting new recording via hotkey
  const handleSaveTranscript = useCallback(
    async (transcript: string) => {
      if (transcript.trim()) {
        // Apply word replacements before saving
        let processedText = transcript
        try {
          const settings = await window.electronAPI.getSettings()
          if (settings.replacementsEnabled) {
            processedText = await window.electronAPI.applyReplacements(transcript)
          }
        } catch (err) {
          console.error('Failed to apply replacements:', err)
        }
        // Save to history with 0 duration (since we don't track it for hotkey-triggered saves)
        await saveTranscription(processedText, 0)
      }
    },
    [saveTranscription]
  )

  const {
    isConnected,
    isRecording,
    transcriptSegments,
    editedTranscript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    setEditedTranscript,
  } = useElevenLabsScribe({
    selectedMicrophoneId: selectedDeviceId,
    onRecordingStopped: handleRecordingStopped,
    onVoiceCommand: handleVoiceCommand,
    voiceCommandsEnabled,
    onSaveTranscript: handleSaveTranscript,
  })

  // Real audio level analysis from microphone
  const { audioLevel, frequencyData } = useAudioAnalyzer({
    enabled: isRecording,
    deviceId: selectedDeviceId,
    fftSize: 128, // 64 frequency bins - enough for visualization
    smoothingTimeConstant: 0.3, // Low smoothing = snappy response
  })

  // Determine orb state based on app state
  const getOrbState = (): OrbState => {
    if (pasteStatus === 'formatting') return 'processing'
    if (pasteStatus === 'success') return 'success'
    if (pasteStatus === 'error' || pasteStatus === 'no-terminal') return 'error'
    if (isRecording) return 'recording'
    return 'idle'
  }

  // Handle pending paste after recording stops (triggered by "send it" voice command)
  useEffect(() => {
    if (!isRecording && pendingPasteRef.current) {
      const textToPaste = pendingPasteRef.current
      const duration = recordingTime // Capture duration before it resets
      pendingPasteRef.current = null

      // Execute paste to terminal with formatting
      ;(async () => {
        try {
          // Apply replacements first
          const processedText = await window.electronAPI.applyReplacements(textToPaste)
          console.log('[App] Voice command paste:', processedText, 'duration:', duration)

          // Use the formatAndPaste helper with duration
          await formatAndPaste(processedText, true, duration)
        } catch (err) {
          console.error('[App] Voice command paste error:', err)
          setPasteStatus('error')
          setTimeout(() => setPasteStatus('idle'), 3000)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]) // Only trigger when isRecording changes

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      setRecordingTime(0)
      window.electronAPI.sendRecordingTime(0)
      interval = setInterval(() => {
        setRecordingTime((t) => {
          const newTime = t + 1
          window.electronAPI.sendRecordingTime(newTime)
          return newTime
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // Send voice commands and status to overlay when recording starts
  useEffect(() => {
    if (isRecording) {
      // Send voice commands
      window.electronAPI
        .getEnabledVoiceCommands()
        .then((commands) => {
          window.electronAPI.sendVoiceCommands(commands)
        })
        .catch((err) => {
          console.error('Failed to get voice commands for overlay:', err)
        })

      // Send status (connected, formatting enabled)
      window.electronAPI.sendOverlayStatus({
        connected: isConnected,
        formattingEnabled: formattingEnabled,
      })
    }
  }, [isRecording, isConnected, formattingEnabled])

  // Send live transcript preview to overlay
  useEffect(() => {
    if (isRecording) {
      const fullText = transcriptSegments
        .map((s) => s.text)
        .join(' ')
        .trim()
      const wordCount = fullText ? fullText.split(/\s+/).length : 0
      window.electronAPI.sendTranscriptPreview(fullText, wordCount)
    }
  }, [transcriptSegments, isRecording])

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format hotkey for display
  const formatHotkeyForDisplay = (hotkey: string) => {
    return hotkey
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Option', '⌥')
      .replace(/\+/g, ' ')
      .trim()
  }

  // Auto-scroll to bottom when new transcript appears
  useEffect(() => {
    requestAnimationFrame(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [transcriptSegments])

  const handleStartRecording = async () => {
    try {
      await startRecording()
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const getFullTranscript = () => {
    return transcriptSegments
      .map((segment) => segment.text)
      .join(' ')
      .trim()
  }

  const getCurrentTranscript = () => {
    if (editedTranscript !== null) {
      return editedTranscript
    }
    return getFullTranscript()
  }

  const copyToClipboard = async () => {
    const text = getCurrentTranscript()
    await window.electronAPI.copyToClipboard(text)
  }

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTranscript(e.target.value)
  }

  const handleSelectFromHistory = (text: string) => {
    setEditedTranscript(text)
  }

  // Helper function to format and paste text
  const formatAndPaste = async (
    text: string,
    shouldSaveToHistory: boolean = true,
    duration: number = 0
  ): Promise<void> => {
    // Prevent multiple simultaneous paste operations
    if (isPastingRef.current) {
      console.log('[App] Paste already in progress, skipping...')
      return
    }

    isPastingRef.current = true
    console.log('[App] Starting paste operation...')

    try {
      let textToPaste = text
      let formattedText: string | undefined
      let title: string | undefined
      const originalText = text

      // Format with Claude if enabled
      if (formattingEnabled) {
        setPasteStatus('formatting')
        console.log('[App] Formatting text with Claude...')
        const formatResult = await window.electronAPI.formatPrompt(text)

        if (formatResult.success && !formatResult.skipped) {
          textToPaste = formatResult.formatted
          formattedText = formatResult.formatted
          console.log('[App] Formatted text:', textToPaste)
        } else if (formatResult.error) {
          console.warn('[App] Formatting failed, using original text:', formatResult.error)
        }
      }

      // Paste to terminal first
      const result = await window.electronAPI.pasteToLastActiveTerminal(textToPaste)
      console.log('[App] Paste result:', result)

      // Show notification IMMEDIATELY after paste
      if (result.success) {
        setPasteStatus('success')
        setTimeout(() => setPasteStatus('idle'), 2000)
      } else if (!result.targetApp) {
        setPasteStatus('no-terminal')
        setTimeout(() => setPasteStatus('idle'), 3000)
      } else if (result.needsPermission) {
        setPasteStatus('permission')
      } else {
        setPasteStatus('permission')
      }

      // Save to history in background (don't block UI)
      if (shouldSaveToHistory && (result.success || result.copied)) {
        // Run title generation and saving in background
        ;(async () => {
          const textForTitle = formattedText || originalText
          if (textForTitle) {
            try {
              console.log('[App] Generating title in background...')
              const titleResult = await window.electronAPI.generateTitle(textForTitle)
              if (titleResult.success && titleResult.title) {
                title = titleResult.title
                console.log('[App] Generated title:', title)
              }
            } catch (err) {
              console.warn('[App] Title generation failed:', err)
            }
          }

          await saveTranscriptionWithFormatting({
            originalText,
            formattedText,
            title,
            duration,
          })

          // Show notification that history was saved
          setHistorySaved(title || 'Transcription')
          setTimeout(() => setHistorySaved(null), 3000)
        })()
      }
    } catch (err) {
      console.error('[App] Format/paste error:', err)
      setPasteStatus('error')
      setTimeout(() => setPasteStatus('idle'), 3000)
    } finally {
      isPastingRef.current = false
      console.log('[App] Paste operation completed')
    }
  }

  // Handle right-click on transcript textarea
  const handleTranscriptContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const selectedText = textarea.value
      .substring(textarea.selectionStart, textarea.selectionEnd)
      .trim()

    // Only show context menu if there's selected text
    if (selectedText) {
      e.preventDefault()
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        text: selectedText,
      })
    }
  }

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Handle adding selected text to replacements
  const handleAddToReplacements = () => {
    if (contextMenu?.text) {
      setReplacementInitialText(contextMenu.text)
      setShowReplacements(true)
      setContextMenu(null)
    }
  }

  const handlePasteToTerminal = async () => {
    // Clear any pending voice command paste to prevent duplicate
    pendingPasteRef.current = null

    // Capture the recording time before stopping
    const currentDuration = recordingTime

    // Stop recording first if active
    if (isRecording) {
      stopRecording()
      // Small delay to ensure transcript is finalized
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    const text = getCurrentTranscript()
    if (text) {
      console.log('[App] Attempting to paste to terminal...')
      await formatAndPaste(text, true, currentDuration)
    }
  }

  // Show loading state while checking for API key
  if (hasApiKey === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Show error state
  if (initError) {
    return (
      <div className="app-error">
        <p>{initError}</p>
      </div>
    )
  }

  // Show API key setup if not configured
  if (!hasApiKey) {
    return <ApiKeySetup onApiKeySet={() => setHasApiKey(true)} />
  }

  const hasTranscript = transcriptSegments.length > 0 || editedTranscript !== null

  return (
    <div className="app-container cyber-app">
      {/* Cyberpunk Scan Lines Overlay */}
      <ScanLines opacity={0.03} animate={true} />

      {/* Achievement Popup */}
      {recentUnlocks.length > 0 && (
        <AchievementPopup achievements={recentUnlocks} onDismiss={clearRecentUnlocks} />
      )}

      <AppHeader
        isRecording={isRecording}
        isConnected={isConnected}
        recordingTime={recordingTime}
        onOpenGamification={() => setShowGamification(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="main-layout">
        <main className="main-content">
          {/* Recording Controls */}
          <RecordingControls
            isRecording={isRecording}
            hasTranscript={hasTranscript}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onClearAndStart={() => {
              clearTranscript()
              handleStartRecording()
            }}
            onCopy={copyToClipboard}
            onClear={clearTranscript}
            onToggleHistory={() => setShowHistory(!showHistory)}
            showHistory={showHistory}
          />

          {error && <div className="error-banner">{error}</div>}

          {/* AI Orb Visualizer */}
          <div className="orb-container">
            <AIOrb
              state={getOrbState()}
              size="lg"
              audioLevel={audioLevel}
              frequencyData={frequencyData}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            />
          </div>

          {/* Transcript Area */}
          <TranscriptDisplay
            hasTranscript={hasTranscript}
            transcript={getCurrentTranscript()}
            transcriptInputRef={transcriptInputRef}
            transcriptEndRef={transcriptEndRef}
            recordHotkey={recordHotkey}
            onChange={handleTranscriptChange}
            onContextMenu={handleTranscriptContextMenu}
          />

          {/* Terminal Paste Section - Always visible */}
          <div className="terminal-section">
            <div className="paste-button-row">
              <button
                onClick={handlePasteToTerminal}
                className="btn btn-paste"
                disabled={!hasTranscript || pasteStatus === 'formatting'}
              >
                {pasteStatus === 'formatting' ? (
                  <>
                    <span className="formatting-spinner" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    Paste to Terminal
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toast Notifications */}
          {(pasteStatus !== 'idle' || lastVoiceCommand || historySaved) && (
            <div className="toast-container">
              {lastVoiceCommand && (
                <div className="toast toast-voice">
                  <span className="toast-icon">🎤</span>
                  <span className="toast-message">Voice: {lastVoiceCommand}</span>
                </div>
              )}
              {pasteStatus === 'formatting' && (
                <div className="toast toast-processing">
                  <span className="toast-icon">
                    <span className="formatting-spinner" />
                  </span>
                  <span className="toast-message">Formatting with Claude...</span>
                </div>
              )}
              {pasteStatus === 'permission' && (
                <div className="toast toast-info">
                  <span className="toast-icon">📋</span>
                  <span className="toast-message">Copied! Press ⌘V to paste</span>
                </div>
              )}
              {pasteStatus === 'success' && (
                <div className="toast toast-success">
                  <span className="toast-icon">✓</span>
                  <span className="toast-message">Pasted successfully</span>
                </div>
              )}
              {pasteStatus === 'no-terminal' && (
                <div className="toast toast-error">
                  <span className="toast-icon">!</span>
                  <span className="toast-message">No terminal app running</span>
                </div>
              )}
              {pasteStatus === 'error' && (
                <div className="toast toast-error">
                  <span className="toast-icon">!</span>
                  <span className="toast-message">Paste failed - copied to clipboard</span>
                </div>
              )}
              {historySaved && (
                <div className="toast toast-history">
                  <span className="toast-icon">📝</span>
                  <span className="toast-message">Saved: {historySaved}</span>
                </div>
              )}
            </div>
          )}

          {/* Voice Command Indicator - now shown as toast */}

          {/* Stats Panel moved to gamification modal */}

          {/* Hotkey Footer */}
          <div className="hotkey-bar cyber-hotkey-bar">
            <div className="hotkey-left">
              <span>
                <kbd className="cyber-kbd">{formatHotkeyForDisplay(recordHotkey)}</kbd> Toggle
                recording
              </span>
              <span>
                <kbd className="cyber-kbd">{formatHotkeyForDisplay(pasteHotkey)}</kbd> Copy last
              </span>
            </div>
            <div className="hotkey-right">
              <label
                className="footer-switch"
                title={formattingEnabled ? 'AI formatting enabled' : 'AI formatting disabled'}
              >
                <span className="switch-label">Format</span>
                <input
                  type="checkbox"
                  checked={formattingEnabled}
                  onChange={async (e) => {
                    const newValue = e.target.checked
                    setFormattingEnabled(newValue)
                    await window.electronAPI.setPromptFormattingEnabled(newValue)
                  }}
                />
                <span className="switch-track">
                  <span className="switch-thumb" />
                </span>
              </label>
              <label
                className="footer-switch"
                title={voiceCommandsEnabled ? 'Voice commands enabled' : 'Voice commands disabled'}
              >
                <span className="switch-label">Voice commands</span>
                <input
                  type="checkbox"
                  checked={voiceCommandsEnabled}
                  onChange={(e) => setVoiceCommandsEnabled(e.target.checked)}
                />
                <span className="switch-track">
                  <span className="switch-thumb" />
                </span>
              </label>
              {voiceCommandsEnabled && <span className="voice-hint">Say "send it" to paste</span>}
            </div>
          </div>
        </main>

        {showHistory && (
          <aside className="history-sidebar">
            <HistoryPanel onSelectTranscription={handleSelectFromHistory} />
          </aside>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button onClick={handleAddToReplacements} className="context-menu-item">
            Add "
            {contextMenu.text.length > 20
              ? contextMenu.text.slice(0, 20) + '...'
              : contextMenu.text}
            " to replacements
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenReplacements={() => {
          setShowSettings(false)
          setShowReplacements(true)
        }}
        voiceCommandsEnabled={voiceCommandsEnabled}
        onVoiceCommandsEnabledChange={setVoiceCommandsEnabled}
      />

      {/* Replacements Modal */}
      <ReplacementsModal
        isOpen={showReplacements}
        onClose={() => {
          setShowReplacements(false)
          setReplacementInitialText(undefined)
        }}
        initialFromText={replacementInitialText}
      />

      {/* Gamification Stats Modal */}
      <GamificationModal
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
        stats={stats}
        level={level}
        xpProgress={xpProgress}
        achievements={achievements}
      />
    </div>
  )
}

export default App
