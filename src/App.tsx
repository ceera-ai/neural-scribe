import { useRef, useEffect, useState } from 'react'
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe'
import { useMicrophoneDevices } from './hooks/useMicrophoneDevices'
import { useTranscriptionHistory } from './hooks/useTranscriptionHistory'
import { useGamification } from './hooks/useGamification'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import { useAppInitialization } from './hooks/useAppInitialization'
import { usePasteToTerminal } from './hooks/usePasteToTerminal'
import { useRecordingHandlers } from './hooks/useRecordingHandlers'
import { useRecordingEffects } from './hooks/useRecordingEffects'
import { HistoryPanel } from './components/HistoryPanel'
import { ApiKeySetup } from './components/ApiKeySetup'
import { AIOrb } from './components/orb/AIOrb'
import type { OrbState } from './components/orb/AIOrb'
import { ScanLines } from './components/cyberpunk/ScanLines'
import {
  NotificationQueue,
  showAchievementNotification,
} from './components/gamification/NotificationQueue'
import { XPNotification } from './components/gamification/XPNotification'
import { RecordingControls } from './components/controls/RecordingControls'
import { TranscriptDisplay } from './components/transcript/TranscriptDisplay'
import { AppHeader } from './components/header/AppHeader'
import { PasteButton } from './components/paste/PasteButton'
import { ToastNotifications } from './components/notifications/ToastNotifications'
import { HotkeyFooter } from './components/footer/HotkeyFooter'
import { ModalsContainer } from './components/modals/ModalsContainer'
import './App.css'

function App() {
  // App initialization (API key, settings, hotkeys)
  const {
    hasApiKey,
    initError,
    formattingEnabled,
    recordHotkey,
    pasteHotkey,
    setHasApiKey,
    setFormattingEnabled,
  } = useAppInitialization()

  const [showHistory, setShowHistory] = useState(false)
  const [showReplacements, setShowReplacements] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(
    null
  )
  const [replacementInitialText, setReplacementInitialText] = useState<string | undefined>(
    undefined
  )
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const transcriptInputRef = useRef<HTMLTextAreaElement>(null)
  const pendingPasteRef = useRef<string | null>(null)
  // Per-session formatting override from hotkey (null = use global setting)
  const [formattingOverride, setFormattingOverride] = useState<boolean | null>(null)

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

  // Determine effective formatting (override takes precedence)
  const effectiveFormatting = formattingOverride ?? formattingEnabled
  console.log('[App] Formatting state:', {
    override: formattingOverride,
    global: formattingEnabled,
    effective: effectiveFormatting,
  })

  // Paste to terminal with formatting
  const {
    pasteStatus,
    historySaved,
    formatAndPaste,
    handlePasteToTerminal: pasteToTerminal,
  } = usePasteToTerminal({
    formattingEnabled: effectiveFormatting,
    saveTranscriptionWithFormatting,
  })

  // Recording handlers
  const {
    lastVoiceCommand,
    lastXpGained,
    handleRecordingStopped,
    handleVoiceCommand,
    handleSaveTranscript,
  } = useRecordingHandlers({
    recordSession,
    saveTranscription,
    pendingPasteRef,
  })

  // Check daily login on mount
  useEffect(() => {
    checkDailyLogin()
  }, [checkDailyLogin])

  // Trigger notifications for recent unlocks
  useEffect(() => {
    recentUnlocks.forEach((achievement) => {
      showAchievementNotification({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      })
    })

    if (recentUnlocks.length > 0) {
      const timer = setTimeout(clearRecentUnlocks, 6000)
      return () => clearTimeout(timer)
    }
  }, [recentUnlocks, clearRecentUnlocks])

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
    onFormattingOverride: (override: boolean | null) => {
      setFormattingOverride(override)
      console.log('[App] Formatting override set to:', override)
    },
  })

  // Real audio level analysis from microphone
  const { audioLevel, frequencyData } = useAudioAnalyzer({
    enabled: isRecording,
    deviceId: selectedDeviceId,
    fftSize: 128, // 64 frequency bins - enough for visualization
    smoothingTimeConstant: 0.3, // Low smoothing = snappy response,
  })

  // Recording effects (timer, overlay updates, auto-scroll)
  const { recordingTime } = useRecordingEffects({
    isRecording,
    isConnected,
    formattingEnabled,
    transcriptSegments,
    transcriptEndRef,
    pendingPasteRef,
    formatAndPaste,
  })

  // Determine orb state based on app state
  const getOrbState = (): OrbState => {
    if (pasteStatus === 'formatting') return 'processing'
    if (pasteStatus === 'success') return 'success'
    if (pasteStatus === 'error' || pasteStatus === 'no-terminal') return 'error'
    if (isRecording) return 'recording'
    return 'idle'
  }

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
    const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined
    if (isElectron) {
      await window.electronAPI.copyToClipboard(text)
    }
  }

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTranscript(e.target.value)
  }

  const handleSelectFromHistory = (text: string) => {
    setEditedTranscript(text)
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

  // Handler for clearing transcript and starting new recording
  const handleClearAndStart = () => {
    clearTranscript()
    handleStartRecording()
  }

  // Handler for pasting to terminal
  const handlePasteClick = () => {
    pasteToTerminal(
      getCurrentTranscript,
      isRecording,
      stopRecording,
      recordingTime,
      pendingPasteRef
    )
  }

  // Handler for formatting setting change
  const handleFormattingChange = async (enabled: boolean) => {
    setFormattingEnabled(enabled)
    const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined
    if (isElectron) {
      await window.electronAPI.setPromptFormattingEnabled(enabled)
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

      {/* Achievement Notification Queue */}
      <NotificationQueue
        maxVisible={3}
        duration={5000}
        staggerDelay={500}
        onNotificationClick={() => setShowGamification(true)}
      />

      {/* XP Notification */}
      {lastXpGained !== null && lastXpGained > 0 && (
        <div style={{ position: 'fixed', top: '5rem', right: '1rem', zIndex: 1000 }}>
          <XPNotification
            xpGained={lastXpGained}
            isVisible={true}
            duration={3000}
            onDismiss={() => {}}
            onClick={() => setShowGamification(true)}
          />
        </div>
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
            onClearAndStart={handleClearAndStart}
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

          {/* Terminal Paste Section */}
          <PasteButton
            hasTranscript={hasTranscript}
            pasteStatus={pasteStatus}
            onPaste={handlePasteClick}
          />

          {/* Toast Notifications */}
          <ToastNotifications
            pasteStatus={pasteStatus}
            lastVoiceCommand={lastVoiceCommand}
            historySaved={historySaved}
          />

          {/* Hotkey Footer */}
          <HotkeyFooter
            recordHotkey={recordHotkey}
            pasteHotkey={pasteHotkey}
            formattingEnabled={formattingEnabled}
            formattingOverride={formattingOverride}
            voiceCommandsEnabled={voiceCommandsEnabled}
            onFormattingChange={handleFormattingChange}
            onVoiceCommandsChange={setVoiceCommandsEnabled}
          />
        </main>

        {showHistory && (
          <aside className="history-sidebar">
            <HistoryPanel onSelectTranscription={handleSelectFromHistory} />
          </aside>
        )}
      </div>

      {/* Modals */}
      <ModalsContainer
        contextMenu={contextMenu}
        onAddToReplacements={handleAddToReplacements}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        onOpenReplacements={() => {
          setShowSettings(false)
          setShowReplacements(true)
        }}
        voiceCommandsEnabled={voiceCommandsEnabled}
        onVoiceCommandsEnabledChange={setVoiceCommandsEnabled}
        showReplacements={showReplacements}
        onCloseReplacements={() => {
          setShowReplacements(false)
          setReplacementInitialText(undefined)
        }}
        replacementInitialText={replacementInitialText}
        showGamification={showGamification}
        onCloseGamification={() => setShowGamification(false)}
        stats={stats}
        level={level}
        xpProgress={xpProgress}
        achievements={achievements}
      />
    </div>
  )
}

export default App
