import { useEffect, useRef, useState, useCallback } from 'react';
import { Scribe, RealtimeEvents } from '@elevenlabs/client';
import { getScribeToken } from '../utils/getScribeToken';

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

export const useElevenLabsScribe = (apiKey: string): UseElevenLabsScribeReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null);

  const connectionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Generate session ID only if we don't have one (first start or after page refresh)
      if (!sessionId) {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        setSessionId(newSessionId);
        console.log('New session ID:', newSessionId);
      } else {
        console.log('Reconnecting to existing session:', sessionId);
      }

      // Generate single-use token from API key
      console.log('Generating single-use token...');
      const token = await getScribeToken(apiKey);
      console.log('Token generated successfully');

      // Create connection using the official SDK
      const connection = Scribe.connect({
        token,
        modelId: 'scribe_v2_realtime',
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
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
          // Replace the last non-final segment with the new partial
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
          // Replace the last segment if it's non-final, otherwise add
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
        setError('Authentication failed. Check your API key.');
        setIsConnected(false);
        setIsRecording(false);
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
      });

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      setIsConnected(false);
    }
  }, [apiKey, sessionId]);

  const stopRecording = useCallback(() => {
    // Close the connection to stop microphone streaming
    // We need to create a new connection when starting again
    if (connectionRef.current) {
      console.log('Stopping recording and closing connection...');
      try {
        connectionRef.current.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
      connectionRef.current = null;
    }
    setIsRecording(false);
    setIsConnected(false);
    // Note: We keep transcriptSegments and sessionId intact for the session
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([]);
    setEditedTranscript(null);
  }, []);

  // Cleanup on unmount (page refresh)
  useEffect(() => {
    return () => {
      // Only disconnect when component unmounts (page refresh)
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
