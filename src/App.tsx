import { useRef, useEffect } from 'react';
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe';
import './App.css';

function App() {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
  } = useElevenLabsScribe(apiKey);

  // Auto-scroll to bottom when new transcript appears
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Get the current transcript text (edited version takes priority)
  const getCurrentTranscript = () => {
    if (editedTranscript !== null) {
      return editedTranscript;
    }
    return getFullTranscript();
  };

  const copyToClipboard = () => {
    const text = getCurrentTranscript();
    navigator.clipboard.writeText(text);
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTranscript(e.target.value);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ElevenLabs Scribe v2 Transcription</h1>
        <div className="status-indicators">
          <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected to ElevenLabs' : '🔴 Disconnected'}
          </div>
          <div className={`status-badge ${isRecording ? 'recording' : ''}`}>
            {isRecording ? '🔴 Recording' : '⏹️ Paused'}
          </div>
          {sessionId && (
            <div className="status-badge session-badge">
              📋 Session: {sessionId.slice(-8)}
            </div>
          )}
        </div>
      </header>

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
                Copy Transcript
              </button>
              <button onClick={clearTranscript} className="btn btn-secondary">
                Clear Transcript
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div className="transcript-container">
          <h2>Transcript</h2>
          <div className="transcript-box">
            {transcriptSegments.length === 0 && editedTranscript === null ? (
              <p className="placeholder">Start recording to see transcription...</p>
            ) : (
              <>
                <textarea
                  className="transcript-textarea"
                  value={getCurrentTranscript()}
                  onChange={handleTranscriptChange}
                  placeholder="Your transcript will appear here..."
                />
                <div ref={transcriptEndRef} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
