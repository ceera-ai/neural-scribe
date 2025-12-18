import { useRef, useEffect, useState, useCallback } from 'react';
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe';
import { useMicrophoneDevices } from './hooks/useMicrophoneDevices';
import { useTranscriptionHistory } from './hooks/useTranscriptionHistory';
import { MicrophoneSelector } from './components/MicrophoneSelector';
import { HistoryPanel } from './components/HistoryPanel';
import { ApiKeySetup } from './components/ApiKeySetup';
import { ReplacementsModal } from './components/ReplacementsModal';
import { SettingsModal } from './components/SettingsModal';
import './App.css';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showReplacements, setShowReplacements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'>('idle');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const [replacementInitialText, setReplacementInitialText] = useState<string | undefined>(undefined);
  const [formattingEnabled, setFormattingEnabled] = useState(true);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptInputRef = useRef<HTMLTextAreaElement>(null);
  const pendingPasteRef = useRef<string | null>(null);

  const { selectedDeviceId } = useMicrophoneDevices();
  const { saveTranscription } = useTranscriptionHistory();

  // Check if API key is configured on mount
  useEffect(() => {
    if (!isElectron) {
      setInitError('This app requires Electron. The preload script may not have loaded correctly.');
      return;
    }
    window.electronAPI.hasApiKey().then(setHasApiKey).catch(err => {
      console.error('Failed to check API key:', err);
      setInitError('Failed to initialize: ' + err.message);
    });
    // Load formatting setting
    window.electronAPI.getPromptFormattingSettings().then(settings => {
      setFormattingEnabled(settings.enabled);
    }).catch(err => {
      console.error('Failed to load formatting settings:', err);
    });
  }, []);

  const handleRecordingStopped = useCallback(async (transcript: string, duration: number) => {
    // Apply word replacements if enabled
    let processedTranscript = transcript;
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.replacementsEnabled) {
        processedTranscript = await window.electronAPI.applyReplacements(transcript);
      }
    } catch (err) {
      console.error('Failed to apply replacements:', err);
    }

    // Auto-save transcription to history with duration
    if (processedTranscript.trim()) {
      await saveTranscription(processedTranscript, duration);
    }

    // Return the processed transcript to update the UI
    return processedTranscript;
  }, [saveTranscription]);

  // Handle voice commands
  const handleVoiceCommand = useCallback(async (command: 'send' | 'clear' | 'cancel', transcript: string) => {
    console.log(`[App] Voice command received: ${command}, transcript: "${transcript}"`);
    setLastVoiceCommand(command);
    setTimeout(() => setLastVoiceCommand(null), 2000);

    switch (command) {
      case 'send':
        // Store transcript for paste, will be executed after recording stops
        if (transcript.trim()) {
          pendingPasteRef.current = transcript;
        }
        break;
      case 'clear':
        // Will be handled after recording stops
        break;
      case 'cancel':
        // Will be handled after recording stops
        break;
    }
  }, []);

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
  });

  // Handle pending paste after recording stops (triggered by "send it" voice command)
  useEffect(() => {
    if (!isRecording && pendingPasteRef.current) {
      const textToPaste = pendingPasteRef.current;
      pendingPasteRef.current = null;

      // Execute paste to terminal with formatting
      (async () => {
        try {
          // Apply replacements first
          const processedText = await window.electronAPI.applyReplacements(textToPaste);
          console.log('[App] Voice command paste:', processedText);

          // Use the formatAndPaste helper
          await formatAndPaste(processedText);
        } catch (err) {
          console.error('[App] Voice command paste error:', err);
          setPasteStatus('error');
          setTimeout(() => setPasteStatus('idle'), 3000);
        }
      })();
    }
  }, [isRecording, formattingEnabled]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll to bottom when new transcript appears
  useEffect(() => {
    requestAnimationFrame(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [transcriptSegments]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const getFullTranscript = () => {
    return transcriptSegments
      .map(segment => segment.text)
      .join(' ')
      .trim();
  };

  const getCurrentTranscript = () => {
    if (editedTranscript !== null) {
      return editedTranscript;
    }
    return getFullTranscript();
  };

  const copyToClipboard = async () => {
    const text = getCurrentTranscript();
    await window.electronAPI.copyToClipboard(text);
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTranscript(e.target.value);
  };

  const handleSelectFromHistory = (text: string) => {
    setEditedTranscript(text);
  };

  // Helper function to format and paste text
  const formatAndPaste = async (text: string): Promise<void> => {
    try {
      let textToPaste = text;

      // Format with Claude if enabled
      if (formattingEnabled) {
        setPasteStatus('formatting');
        console.log('[App] Formatting text with Claude...');
        const formatResult = await window.electronAPI.formatPrompt(text);

        if (formatResult.success && !formatResult.skipped) {
          textToPaste = formatResult.formatted;
          console.log('[App] Formatted text:', textToPaste);
        } else if (formatResult.error) {
          console.warn('[App] Formatting failed, using original text:', formatResult.error);
        }
      }

      // Paste to terminal
      const result = await window.electronAPI.pasteToLastActiveTerminal(textToPaste);
      console.log('[App] Paste result:', result);

      if (result.success) {
        setPasteStatus('success');
        setTimeout(() => setPasteStatus('idle'), 2000);
      } else if (!result.targetApp) {
        setPasteStatus('no-terminal');
        setTimeout(() => setPasteStatus('idle'), 3000);
      } else if (result.needsPermission) {
        setPasteStatus('permission');
      } else {
        setPasteStatus('permission');
      }
    } catch (err) {
      console.error('[App] Format/paste error:', err);
      setPasteStatus('error');
      setTimeout(() => setPasteStatus('idle'), 3000);
    }
  };

  // Handle right-click on transcript textarea
  const handleTranscriptContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();

    // Only show context menu if there's selected text
    if (selectedText) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        text: selectedText,
      });
    }
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Handle adding selected text to replacements
  const handleAddToReplacements = () => {
    if (contextMenu?.text) {
      setReplacementInitialText(contextMenu.text);
      setShowReplacements(true);
      setContextMenu(null);
    }
  };

  const handlePasteToTerminal = async () => {
    // Stop recording first if active
    if (isRecording) {
      stopRecording();
      // Small delay to ensure transcript is finalized
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const text = getCurrentTranscript();
    if (text) {
      console.log('[App] Attempting to paste to terminal...');
      await formatAndPaste(text);
    }
  };

  // Show loading state while checking for API key
  if (hasApiKey === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Show error state
  if (initError) {
    return (
      <div className="app-error">
        <p>{initError}</p>
      </div>
    );
  }

  // Show API key setup if not configured
  if (!hasApiKey) {
    return <ApiKeySetup onApiKeySet={() => setHasApiKey(true)} />;
  }

  const hasTranscript = transcriptSegments.length > 0 || editedTranscript !== null;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <h1>Transcription</h1>
          <div className={`status-indicator ${isRecording ? 'recording' : isConnected ? 'connected' : ''}`}>
            <span className="status-dot" />
            <span>{isRecording ? `Recording ${formatTime(recordingTime)}` : isConnected ? 'Connected' : 'Ready'}</span>
          </div>
        </div>
        <div className="header-right">
          <MicrophoneSelector disabled={isRecording} />
          <button
            className="btn settings-btn"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <div className="main-layout">
        <main className="main-content">
          {/* Recording Controls */}
          <div className="controls-bar">
            <div className="controls-left">
              {!isRecording ? (
                <>
                  <button onClick={handleStartRecording} className="btn btn-record">
                    <span className="record-icon" />
                    {hasTranscript ? 'Continue' : 'Start Recording'}
                  </button>
                  {hasTranscript && (
                    <button
                      onClick={() => {
                        clearTranscript();
                        handleStartRecording();
                      }}
                      className="btn btn-new"
                      title="Clear and start new recording"
                    >
                      New
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleStopRecording} className="btn btn-stop">
                  <span className="stop-icon" />
                  Stop
                </button>
              )}
            </div>
            <div className="controls-right">
              {hasTranscript && (
                <>
                  <button onClick={copyToClipboard} className="btn btn-icon" title="Copy to clipboard">
                    Copy
                  </button>
                  <button onClick={clearTranscript} className="btn btn-icon" title="Clear transcript">
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`btn btn-icon ${showHistory ? 'active' : ''}`}
                title="Toggle history"
              >
                History
              </button>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Transcript Area */}
          <div className="transcript-area">
            {!hasTranscript ? (
              <div className="transcript-placeholder">
                <div className="placeholder-icon">🎤</div>
                <p>Press "Start Recording" to begin</p>
                <p className="placeholder-hint">
                  Or use <kbd>Cmd+Shift+R</kbd> from anywhere
                </p>
              </div>
            ) : (
              <textarea
                ref={transcriptInputRef}
                className="transcript-input"
                value={getCurrentTranscript()}
                onChange={handleTranscriptChange}
                onContextMenu={handleTranscriptContextMenu}
                placeholder="Your transcript will appear here..."
              />
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Terminal Paste Section */}
          {hasTranscript && (
            <div className="terminal-section">
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
                  'Paste to Terminal'
                )}
              </button>
              {pasteStatus === 'formatting' && (
                <div className="paste-notice paste-formatting">
                  Claude is formatting your prompt...
                </div>
              )}
              {pasteStatus === 'permission' && (
                <div className="paste-notice">
                  Copied to clipboard! Press <kbd>Cmd+V</kbd> in the terminal.
                  <span className="paste-hint">
                    (Grant Accessibility access in System Preferences for auto-paste)
                  </span>
                </div>
              )}
              {pasteStatus === 'success' && (
                <div className="paste-notice paste-success">
                  Pasted successfully!
                </div>
              )}
              {pasteStatus === 'no-terminal' && (
                <div className="paste-notice paste-error">
                  No terminal app running. Open Terminal, VS Code, or Cursor first.
                </div>
              )}
              {pasteStatus === 'error' && (
                <div className="paste-notice paste-error">
                  Failed to paste. Text copied to clipboard - press Cmd+V manually.
                </div>
              )}
            </div>
          )}

          {/* Voice Command Indicator */}
          {lastVoiceCommand && (
            <div className="voice-command-indicator">
              Voice command: <strong>{lastVoiceCommand}</strong>
            </div>
          )}

          {/* Hotkey Footer */}
          <div className="hotkey-bar">
            <div className="hotkey-left">
              <span><kbd>Cmd+Shift+R</kbd> Toggle recording</span>
              <span><kbd>Cmd+Shift+V</kbd> Copy last to clipboard</span>
            </div>
            <div className="hotkey-right">
              <button
                className={`voice-cmd-toggle ${voiceCommandsEnabled ? 'active' : ''}`}
                onClick={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)}
                title={voiceCommandsEnabled ? 'Voice commands enabled' : 'Voice commands disabled'}
              >
                🎤 {voiceCommandsEnabled ? 'Voice Cmds ON' : 'Voice Cmds OFF'}
              </button>
              {voiceCommandsEnabled && (
                <span className="voice-hint">Say "send it" to paste</span>
              )}
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
            Add "{contextMenu.text.length > 20 ? contextMenu.text.slice(0, 20) + '...' : contextMenu.text}" to replacements
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenReplacements={() => {
          setShowSettings(false);
          setShowReplacements(true);
        }}
        voiceCommandsEnabled={voiceCommandsEnabled}
        onVoiceCommandsEnabledChange={setVoiceCommandsEnabled}
      />

      {/* Replacements Modal */}
      <ReplacementsModal
        isOpen={showReplacements}
        onClose={() => {
          setShowReplacements(false);
          setReplacementInitialText(undefined);
        }}
        initialFromText={replacementInitialText}
      />
    </div>
  );
}

export default App;
