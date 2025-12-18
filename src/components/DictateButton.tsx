import { useState, useRef, useCallback } from 'react';
import { Scribe, RealtimeEvents } from '@elevenlabs/client';
import './DictateButton.css';

interface DictateButtonProps {
  onPartialTranscript: (text: string) => void; // Called with real-time updates
  onFinalTranscript: (text: string) => void;   // Called when recording stops
  onRecordingChange?: (isRecording: boolean) => void; // Called when recording state changes
  disabled?: boolean;
}

export function DictateButton({ onPartialTranscript, onFinalTranscript, onRecordingChange, disabled }: DictateButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<ReturnType<typeof Scribe.connect> | null>(null);
  const committedTextRef = useRef<string>('');
  const partialTextRef = useRef<string>('');
  const onRecordingChangeRef = useRef(onRecordingChange);
  onRecordingChangeRef.current = onRecordingChange;

  const updateTranscript = useCallback(() => {
    // Combine committed + current partial for real-time display
    const fullText = committedTextRef.current + (partialTextRef.current ? ' ' + partialTextRef.current : '');
    onPartialTranscript(fullText.trim());
  }, [onPartialTranscript]);

  const startRecording = useCallback(async () => {
    setError(null);
    committedTextRef.current = '';
    partialTextRef.current = '';

    try {
      const token = await window.electronAPI.getScribeToken();

      // Microphone configuration
      const microphoneConfig: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
      };

      // Create connection using the official SDK
      const connection = Scribe.connect({
        token,
        modelId: 'scribe_v2_realtime',
        microphone: microphoneConfig,
        includeTimestamps: false,
      });

      connectionRef.current = connection;

      // Handle connection opened
      connection.on(RealtimeEvents.OPEN, () => {
        console.log('[Dictate] WebSocket opened');
      });

      // Handle session started (recording active)
      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log('[Dictate] Session started');
        setIsRecording(true);
        onRecordingChangeRef.current?.(true);
      });

      // Handle partial (real-time) transcripts
      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string };
        console.log('[Dictate] Partial:', data.text);
        partialTextRef.current = data.text;
        updateTranscript();
      });

      // Handle committed transcripts
      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string };
        console.log('[Dictate] Committed:', data.text);
        // Add to committed text
        if (committedTextRef.current) {
          committedTextRef.current += ' ' + data.text;
        } else {
          committedTextRef.current = data.text;
        }
        // Clear partial since it's now committed
        partialTextRef.current = '';
        updateTranscript();
      });

      // Handle connection closed
      connection.on(RealtimeEvents.CLOSE, () => {
        console.log('[Dictate] Connection closed');
        setIsRecording(false);
        onRecordingChangeRef.current?.(false);
        // Send final transcript
        const finalText = committedTextRef.current.trim();
        if (finalText) {
          onFinalTranscript(finalText);
        }
        connectionRef.current = null;
      });

      // Handle errors
      connection.on(RealtimeEvents.ERROR, (...args: unknown[]) => {
        const err = args[0] as { message?: string };
        console.error('[Dictate] Error:', err);
        setError(err.message || 'Recording failed');
        setIsRecording(false);
      });

    } catch (err: any) {
      console.error('[Dictate] Failed to start:', err);
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, [onPartialTranscript, onFinalTranscript, updateTranscript]);

  const stopRecording = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
  }, []);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="dictate-container">
      <button
        type="button"
        className={`dictate-btn ${isRecording ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        title={isRecording ? 'Stop dictating' : 'Dictate instructions'}
      >
        {isRecording ? (
          <>
            <span className="dictate-stop-icon" />
            Stop
          </>
        ) : (
          <>
            <span className="dictate-mic-icon">🎤</span>
            Dictate
          </>
        )}
      </button>
      {error && <span className="dictate-error">{error}</span>}
    </div>
  );
}
