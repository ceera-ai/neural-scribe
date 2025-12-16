import { useEffect, useRef, useState, useCallback } from 'react';
import { Scribe, RealtimeEvents } from '@elevenlabs/client';
import type { TranscriptionRecord } from '../types/electron';

interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface UseElevenLabsScribeReturn {
  isConnected: boolean;
  isRecording: boolean;
  transcriptSegments: TranscriptSegment[];
  editedTranscript: string | null;
  error: string | null;
  sessionId: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  setEditedTranscript: (text: string | null) => void;
}

interface UseElevenLabsScribeOptions {
  selectedMicrophoneId?: string | null;
  onRecordingStopped?: (transcript: string) => void;
}

export const useElevenLabsScribe = (options: UseElevenLabsScribeOptions = {}): UseElevenLabsScribeReturn => {
  const { selectedMicrophoneId, onRecordingStopped } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null);

  const connectionRef = useRef<any>(null);
  const transcriptSegmentsRef = useRef<TranscriptSegment[]>([]);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    transcriptSegmentsRef.current = transcriptSegments;
  }, [transcriptSegments]);

  const getFullTranscript = useCallback(() => {
    return transcriptSegmentsRef.current
      .map(segment => segment.text)
      .join(' ')
      .trim();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Generate session ID only if we don't have one
      if (!sessionId) {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        setSessionId(newSessionId);
        console.log('New session ID:', newSessionId);
      } else {
        console.log('Reconnecting to existing session:', sessionId);
      }

      // Get token from main process via IPC
      console.log('Getting token from main process...');
      const token = await window.electronAPI.getScribeToken();
      console.log('Token received successfully');

      // Build microphone config
      const microphoneConfig: any = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      };

      // Add specific device ID if selected
      if (selectedMicrophoneId) {
        microphoneConfig.deviceId = { exact: selectedMicrophoneId };
      }

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
        console.log('WebSocket connection opened');
        setIsConnected(true);
      });

      // Handle session started
      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log('Transcription session started');
        setIsRecording(true);
        // Notify main process
        window.electronAPI.notifyRecordingState(true);
      });

      // Handle partial (interim) transcripts
      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string };
        console.log('Partial transcript:', data.text);

        const newSegment: TranscriptSegment = {
          text: data.text || '',
          isFinal: false,
          timestamp: Date.now(),
        };

        setTranscriptSegments((prev) => {
          if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
            const updated = [...prev];
            updated[updated.length - 1] = newSegment;
            return updated;
          }
          return [...prev, newSegment];
        });
      });

      // Handle committed (final) transcripts
      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string };
        console.log('Committed transcript:', data.text);

        const newSegment: TranscriptSegment = {
          text: data.text || '',
          isFinal: true,
          timestamp: Date.now(),
        };

        setTranscriptSegments((prev) => {
          if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
            const updated = [...prev];
            updated[updated.length - 1] = newSegment;
            return updated;
          }
          return [...prev, newSegment];
        });
      });

      // Handle authentication errors
      connection.on(RealtimeEvents.AUTH_ERROR, (...args: unknown[]) => {
        const data = args[0] as { error: string };
        console.error('Authentication error:', data.error);
        setError('Authentication failed. Check your API key in settings.');
        setIsConnected(false);
        setIsRecording(false);
        window.electronAPI.notifyRecordingState(false);
      });

      // Handle general errors
      connection.on(RealtimeEvents.ERROR, (errorData: any) => {
        console.error('Transcription error:', errorData);
        setError(errorData?.message || 'An error occurred during transcription');
      });

      // Handle connection close
      connection.on(RealtimeEvents.CLOSE, () => {
        console.log('Connection closed');
        setIsConnected(false);
        setIsRecording(false);
        window.electronAPI.notifyRecordingState(false);
      });

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      setIsConnected(false);
      window.electronAPI.notifyRecordingState(false);
    }
  }, [sessionId, selectedMicrophoneId]);

  const stopRecording = useCallback(() => {
    if (connectionRef.current) {
      console.log('Stopping recording and closing connection...');
      try {
        connectionRef.current.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
      connectionRef.current = null;
    }

    // Get the full transcript before clearing state
    const transcript = getFullTranscript();

    setIsRecording(false);
    setIsConnected(false);
    window.electronAPI.notifyRecordingState(false);

    // Call callback if transcript has content
    if (transcript && onRecordingStopped) {
      onRecordingStopped(transcript);
    }
  }, [getFullTranscript, onRecordingStopped]);

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([]);
    setEditedTranscript(null);
  }, []);

  // Listen for toggle recording events from main process
  useEffect(() => {
    window.electronAPI.onToggleRecording(() => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    return () => {
      window.electronAPI.removeAllListeners('toggle-recording');
    };
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        console.log('Component unmounting - closing session');
        try {
          connectionRef.current.close();
        } catch (err) {
          console.error('Error closing connection on unmount:', err);
        }
      }
    };
  }, []);

  return {
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
  };
};
