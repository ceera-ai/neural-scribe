import { useRef, useEffect, useState, useCallback } from 'react';
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe';
import { useMicrophoneDevices } from './hooks/useMicrophoneDevices';
import { useTranscriptionHistory } from './hooks/useTranscriptionHistory';
import { MicrophoneSelector } from './components/MicrophoneSelector';
import { HistoryPanel } from './components/HistoryPanel';
import { ApiKeySetup } from './components/ApiKeySetup';
import './App.css';

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { selectedDeviceId } = useMicrophoneDevices();
  const { saveTranscription } = useTranscriptionHistory();

  // Check if API key is configured on mount
  useEffect(() => {
    window.electronAPI.hasApiKey().then(setHasApiKey);
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
    sessionId,
    startRecording,
    stopRecording,
    clearTranscript,
    setEditedTranscript,
  } = useElevenLabsScribe({
    selectedMicrophoneId: selectedDeviceId,
    onRecordingStopped: handleRecordingStopped,
  });

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

  // Show loading state while checking for API key
  if (hasApiKey === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Show API key setup if not configured
  if (!hasApiKey) {
    return <ApiKeySetup onApiKeySet={() => setHasApiKey(true)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>Transcription</h1>
          <div className="status-indicators">
            <div className={`status-dot ${isConnected ? 'connected' : ''}`} />
            <span className="status-text">
              {isRecording ? 'Recording' : isConnected ? 'Connected' : 'Ready'}
            </span>
          </div>
        </div>
        <div className="header-right">
          <MicrophoneSelector disabled={isRecording} />
        </div>
      </header>

      <div className="main-layout">
        <main className="main-content">
          <div className="controls">
            {!isRecording ? (
              <button onClick={handleStartRecording} className="btn btn-start">
                Start Recording
              </button>
            ) : (
              <button onClick={handleStopRecording} className="btn btn-stop">
                Stop Recording
              </button>
            )}
            {transcriptSegments.length > 0 && (
              <>
                <button onClick={copyToClipboard} className="btn btn-secondary">
                  Copy
                </button>
                <button onClick={clearTranscript} className="btn btn-secondary">
                  Clear
                </button>
              </>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`btn btn-secondary btn-toggle ${showHistory ? 'active' : ''}`}
            >
              History
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="transcript-container">
            <div className="transcript-box">
              {transcriptSegments.length === 0 && editedTranscript === null ? (
                <div className="placeholder">
                  <p>Press "Start Recording" to begin transcription</p>
                  <p className="placeholder-hint">
                    Tip: Use <kbd>Cmd+Shift+R</kbd> to toggle recording from anywhere
                  </p>
                </div>
              ) : (
                <textarea
                  className="transcript-textarea"
                  value={getCurrentTranscript()}
                  onChange={handleTranscriptChange}
                  placeholder="Your transcript will appear here..."
                />
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          <div className="hotkey-hints">
            <span><kbd>Cmd+Shift+R</kbd> Toggle recording</span>
            <span><kbd>Cmd+Shift+V</kbd> Copy last transcription</span>
          </div>
        </main>

        {showHistory && (
          <aside className="sidebar">
            <HistoryPanel onSelectTranscription={handleSelectFromHistory} />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
