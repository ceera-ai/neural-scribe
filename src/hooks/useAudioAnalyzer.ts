import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAudioAnalyzerOptions {
  enabled: boolean;
  deviceId?: string | null;
  fftSize?: number;
  smoothingTimeConstant?: number;
}

interface UseAudioAnalyzerReturn {
  audioLevel: number; // 0-1 normalized volume level
  frequencyData: Uint8Array | null; // Raw frequency data for advanced visualizations
  isAnalyzing: boolean;
  error: string | null;
}

export function useAudioAnalyzer({
  enabled,
  deviceId,
  fftSize = 256,
  smoothingTimeConstant = 0.8,
}: UseAudioAnalyzerOptions): UseAudioAnalyzerReturn {
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const cleanup = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    analyzerRef.current = null;
    dataArrayRef.current = null;
    setIsAnalyzing(false);
    setAudioLevel(0);
    setFrequencyData(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    let mounted = true;

    const startAnalyzer = async () => {
      try {
        setError(null);

        // Build audio constraints
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
        };

        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        // Create audio context and analyzer
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = fftSize;
        analyzer.smoothingTimeConstant = smoothingTimeConstant;
        analyzerRef.current = analyzer;

        // Connect microphone to analyzer
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);

        // Create data array for frequency analysis
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        setIsAnalyzing(true);

        // Analysis loop
        const analyze = () => {
          if (!mounted || !analyzerRef.current || !dataArrayRef.current) {
            return;
          }

          // Get frequency data
          analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

          // Calculate average volume (RMS-like)
          let sum = 0;
          const data = dataArrayRef.current;

          // Focus on voice frequency range (roughly 85-255 Hz to 3400 Hz)
          // With 256 FFT at 44100Hz, each bin is ~172Hz
          // So bins 0-20 roughly cover human voice range
          const voiceRangeEnd = Math.min(20, data.length);

          for (let i = 0; i < voiceRangeEnd; i++) {
            sum += data[i];
          }

          const average = sum / voiceRangeEnd;

          // Normalize to 0-1 with some scaling for better responsiveness
          // Voice typically doesn't hit max, so we scale up a bit
          const normalized = Math.min(1, (average / 255) * 1.5);

          // Apply easing for smooth but snappy transitions
          setAudioLevel(prev => {
            const diff = normalized - prev;
            // Fast rise, fast fall for snappy interactive feel
            const factor = diff > 0 ? 0.5 : 0.4;
            return prev + diff * factor;
          });

          // Update frequency data for advanced visualizations
          setFrequencyData(new Uint8Array(dataArrayRef.current));

          animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();

      } catch (err) {
        console.error('Failed to start audio analyzer:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to access microphone');
          setIsAnalyzing(false);
        }
      }
    };

    startAnalyzer();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [enabled, deviceId, fftSize, smoothingTimeConstant, cleanup]);

  return {
    audioLevel,
    frequencyData,
    isAnalyzing,
    error,
  };
}
