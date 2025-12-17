import { useRef, useEffect, useState, useCallback } from 'react';
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe';
import { useMicrophoneDevices } from './hooks/useMicrophoneDevices';
import { useTranscriptionHistory } from './hooks/useTranscriptionHistory';
import { MicrophoneSelector } from './components/MicrophoneSelector';
import { HistoryPanel } from './components/HistoryPanel';
import { TerminalSelector } from './components/TerminalSelector';
import { ApiKeySetup } from './components/ApiKeySetup';
import './App.css';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const handleRecordingStopped = useCallback(async (transcript: string) => {
    // Auto-save transcription to history
    if (transcript.trim()) {
      await saveTranscription(transcript);
    }
  }, [saveTranscription]);

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
  });

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

  const [pasteStatus, setPasteStatus] = useState<'idle' | 'success' | 'permission'>('idle');

  const handlePasteToTerminal = async (bundleId: string, windowName?: string) => {
    // Stop recording first if active
    if (isRecording) {
      stopRecording();
      // Small delay to ensure transcript is finalized
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const text = getCurrentTranscript();
    if (text) {
      setPasteStatus('idle');
      const result = windowName
        ? await window.electronAPI.pasteToTerminalWindow(text, bundleId, windowName)
        : await window.electronAPI.pasteToTerminal(text, bundleId);
      if (result.success) {
        setPasteStatus('success');
        setTimeout(() => setPasteStatus('idle'), 2000);
      } else if (result.needsPermission) {
        setPasteStatus('permission');
      }
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
        <MicrophoneSelector disabled={isRecording} />
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
                className="transcript-input"
                value={getCurrentTranscript()}
                onChange={handleTranscriptChange}
                placeholder="Your transcript will appear here..."
              />
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Terminal Paste Section */}
          {hasTranscript && (
            <div className="terminal-section">
              <TerminalSelector
                onPaste={handlePasteToTerminal}
                disabled={!hasTranscript}
              />
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
            </div>
          )}

          {/* Hotkey Footer */}
          <div className="hotkey-bar">
            <span><kbd>Cmd+Shift+R</kbd> Toggle recording</span>
            <span><kbd>Cmd+Shift+V</kbd> Copy last to clipboard</span>
          </div>
        </main>

        {showHistory && (
          <aside className="history-sidebar">
            <HistoryPanel onSelectTranscription={handleSelectFromHistory} />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
