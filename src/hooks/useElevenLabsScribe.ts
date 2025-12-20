import { useEffect, useRef, useState, useCallback } from 'react'
import { Scribe, RealtimeEvents } from '@elevenlabs/client'
import type { TranscriptionRecord } from '../types/electron'

interface TranscriptSegment {
  text: string
  isFinal: boolean
  timestamp: number
}

interface UseElevenLabsScribeReturn {
  isConnected: boolean
  isRecording: boolean
  transcriptSegments: TranscriptSegment[]
  editedTranscript: string | null
  error: string | null
  sessionId: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  setEditedTranscript: (text: string | null) => void
}

// Voice commands interface
interface VoiceCommands {
  send: string[]
  clear: string[]
  cancel: string[]
}

interface UseElevenLabsScribeOptions {
  selectedMicrophoneId?: string | null
  onRecordingStopped?: (transcript: string, duration: number) => Promise<string> | string | void
  onVoiceCommand?: (command: 'send' | 'clear' | 'cancel', transcript: string) => void
  voiceCommandsEnabled?: boolean
  onSaveTranscript?: (transcript: string) => Promise<void> | void
}

/**
 * Detects voice commands in transcribed text and extracts the command with cleaned text
 *
 * @remarks
 * This function analyzes transcribed text to detect voice commands like "send it",
 * "clear that", or "cancel". It performs case-insensitive matching and removes
 * trailing punctuation before matching. When a command is detected, the function
 * returns both the command type and the text with the command phrase removed.
 *
 * @param text - The transcribed text to analyze for voice commands
 * @param voiceCommands - Object containing arrays of command phrases for each command type
 *
 * @returns Object containing the detected command ('send' | 'clear' | 'cancel' | null)
 * and the cleaned text with the command phrase removed
 *
 * @example
 * ```typescript
 * const result = detectVoiceCommand("Hello world send it", {
 *   send: ["send it", "send"],
 *   clear: ["clear"],
 *   cancel: ["cancel"]
 * })
 * // Returns: { command: 'send', cleanedText: 'Hello world' }
 * ```
 */
function detectVoiceCommand(
  text: string,
  voiceCommands: VoiceCommands
): { command: 'send' | 'clear' | 'cancel' | null; cleanedText: string } {
  // Normalize: lowercase, trim, and remove trailing punctuation for matching
  const normalizedText = text
    .toLowerCase()
    .trim()
    .replace(/[.,!?]+$/, '')

  console.log('[VoiceCommand] Checking text:', `"${text}"`, '-> normalized:', `"${normalizedText}"`)

  // Check for send commands at the end
  for (const phrase of voiceCommands.send) {
    if (normalizedText.endsWith(phrase)) {
      // Find where the phrase starts in the original text (case-insensitive)
      const phraseStart = normalizedText.lastIndexOf(phrase)
      const cleanedText = text
        .slice(0, phraseStart)
        .trim()
        .replace(/[.,!?]+$/, '')
        .trim()
      console.log('[VoiceCommand] DETECTED "send" command, cleaned text:', `"${cleanedText}"`)
      return { command: 'send', cleanedText }
    }
  }

  // Check for clear commands
  for (const phrase of voiceCommands.clear) {
    if (normalizedText.endsWith(phrase) || normalizedText === phrase) {
      console.log('[VoiceCommand] DETECTED "clear" command')
      return { command: 'clear', cleanedText: '' }
    }
  }

  // Check for cancel commands
  for (const phrase of voiceCommands.cancel) {
    if (normalizedText.endsWith(phrase) || normalizedText === phrase) {
      console.log('[VoiceCommand] DETECTED "cancel" command')
      return { command: 'cancel', cleanedText: '' }
    }
  }

  return { command: null, cleanedText: text }
}

/**
 * React hook for real-time speech transcription using ElevenLabs Scribe v2 API
 *
 * @remarks
 * This hook manages the complete WebSocket lifecycle for real-time transcription,
 * including connection management, microphone streaming, transcript reception,
 * and automatic cleanup. It provides both partial (real-time) and committed (final)
 * transcription results.
 *
 * Features:
 * - Real-time partial transcripts that update as you speak
 * - Committed transcripts that are finalized and won't change
 * - Voice command detection (e.g., "send it", "clear", "cancel")
 * - Automatic token refresh and connection management
 * - Microphone device selection
 * - Session tracking with unique IDs
 *
 * WebSocket Events Handled:
 * - OPEN: Connection established
 * - SESSION_STARTED: Session ID received
 * - PARTIAL_TRANSCRIPT: Real-time updates (not final)
 * - COMMITTED_TRANSCRIPT: Final transcript segment
 * - CLOSE: Connection closed
 * - ERROR: Error occurred
 *
 * @param options - Configuration options for the transcription hook
 * @param options.selectedMicrophoneId - ID of the microphone device to use
 * @param options.onRecordingStopped - Callback when recording stops, receives transcript and duration
 * @param options.onVoiceCommand - Callback when a voice command is detected
 * @param options.voiceCommandsEnabled - Whether to detect voice commands (default: true)
 * @param options.onSaveTranscript - Callback to save the transcript
 *
 * @returns Object containing transcription state and control functions
 *
 * @example
 * ```typescript
 * const {
 *   isConnected,
 *   isRecording,
 *   transcriptSegments,
 *   startRecording,
 *   stopRecording,
 *   clearTranscript
 * } = useElevenLabsScribe({
 *   selectedMicrophoneId: 'default',
 *   voiceCommandsEnabled: true,
 *   onRecordingStopped: async (transcript, duration) => {
 *     console.log(`Recorded ${duration}ms:`, transcript)
 *   }
 * })
 * ```
 */
export const useElevenLabsScribe = (
  options: UseElevenLabsScribeOptions = {}
): UseElevenLabsScribeReturn => {
  const {
    selectedMicrophoneId,
    onRecordingStopped,
    onVoiceCommand,
    voiceCommandsEnabled = true,
    onSaveTranscript,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null)

  const connectionRef = useRef<any>(null)
  const transcriptSegmentsRef = useRef<TranscriptSegment[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const voiceCommandTriggeredRef = useRef<boolean>(false) // Prevent multiple triggers
  const voiceCommandsEnabledRef = useRef<boolean>(voiceCommandsEnabled) // Track current setting
  const onVoiceCommandRef = useRef(onVoiceCommand) // Track current callback
  const voiceCommandsRef = useRef<VoiceCommands>({ send: [], clear: [], cancel: [] }) // Dynamic voice commands

  // Audio level analysis refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Keep refs in sync with props
  useEffect(() => {
    voiceCommandsEnabledRef.current = voiceCommandsEnabled
  }, [voiceCommandsEnabled])

  useEffect(() => {
    onVoiceCommandRef.current = onVoiceCommand
  }, [onVoiceCommand])

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    transcriptSegmentsRef.current = transcriptSegments
  }, [transcriptSegments])

  const getFullTranscript = useCallback(() => {
    return transcriptSegmentsRef.current
      .map((segment) => segment.text)
      .join(' ')
      .trim()
  }, [])

  // Start audio level analysis for overlay visualization
  const startAudioAnalysis = useCallback(async (microphoneId?: string | null) => {
    try {
      // Create audio context
      audioContextRef.current = new AudioContext()

      // Get microphone stream
      const constraints: MediaStreamConstraints = {
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true,
      }
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints)

      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8

      // Connect microphone to analyser
      const source = audioContextRef.current.createMediaStreamSource(audioStreamRef.current)
      source.connect(analyserRef.current)

      // Start analyzing using frequency data (matching useAudioAnalyzer approach)
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      let prevLevel = 0
      const prevBars = new Array(24).fill(0)

      const analyze = () => {
        if (!analyserRef.current) return

        // Get frequency data
        analyserRef.current.getByteFrequencyData(dataArray)

        // Focus on voice frequency range (roughly 85-255 Hz to 3400 Hz)
        // With 256 FFT at 44100Hz, each bin is ~172Hz
        // So bins 0-20 roughly cover human voice range
        const voiceRangeEnd = Math.min(20, bufferLength)

        let sum = 0
        for (let i = 0; i < voiceRangeEnd; i++) {
          sum += dataArray[i]
        }

        const average = sum / voiceRangeEnd

        // Normalize to 0-1 with scaling for better responsiveness
        const normalized = Math.min(1, (average / 255) * 1.5)

        // Apply easing for smooth but snappy transitions
        const diff = normalized - prevLevel
        const factor = diff > 0 ? 0.5 : 0.4 // Fast rise, fast fall
        const smoothedLevel = prevLevel + diff * factor
        prevLevel = smoothedLevel

        // Send audio level for cloud animations
        window.electronAPI.sendAudioLevel(smoothedLevel)

        // Extract 24 frequency bins for spectrum visualization
        // Map first 48 bins to 24 bars (averaging pairs)
        const frequencyData: number[] = []
        const binsPerBar = 2
        for (let i = 0; i < 24; i++) {
          let barSum = 0
          for (let j = 0; j < binsPerBar; j++) {
            const binIndex = i * binsPerBar + j
            if (binIndex < bufferLength) {
              barSum += dataArray[binIndex]
            }
          }
          const barAvg = barSum / binsPerBar
          // Normalize and scale
          const normalizedBar = Math.min(1, (barAvg / 255) * 1.8)
          // Apply easing per bar
          const barDiff = normalizedBar - prevBars[i]
          const barFactor = barDiff > 0 ? 0.6 : 0.4 // Fast rise, medium fall
          prevBars[i] = prevBars[i] + barDiff * barFactor
          frequencyData.push(prevBars[i])
        }

        // Send frequency data for spectrum bars
        window.electronAPI.sendFrequencyData(frequencyData)

        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      analyze()
      console.log('[AudioAnalysis] Started')
    } catch (err) {
      console.error('[AudioAnalysis] Failed to start:', err)
    }
  }, [])

  // Stop audio level analysis
  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null

    // Reset overlay to zero level
    window.electronAPI.sendAudioLevel(0)
    // Reset spectrum bars
    window.electronAPI.sendFrequencyData(new Array(24).fill(0))

    console.log('[AudioAnalysis] Stopped')
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      voiceCommandTriggeredRef.current = false // Reset for new recording

      // Load voice commands from store
      try {
        const commands = await window.electronAPI.getEnabledVoiceCommands()
        voiceCommandsRef.current = commands
        console.log('[VoiceCommand] Loaded triggers:', commands)
      } catch (err) {
        console.error('Failed to load voice commands:', err)
        voiceCommandsRef.current = { send: [], clear: [], cancel: [] }
      }

      // Generate session ID only if we don't have one
      if (!sessionId) {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        setSessionId(newSessionId)
        console.log('New session ID:', newSessionId)
      } else {
        console.log('Reconnecting to existing session:', sessionId)
      }

      // Get token from main process via IPC
      console.log('Getting token from main process...')
      const token = await window.electronAPI.getScribeToken()
      console.log('Token received successfully')

      // Build microphone config
      const microphoneConfig: any = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      }

      // Add specific device ID if selected
      if (selectedMicrophoneId) {
        microphoneConfig.deviceId = { exact: selectedMicrophoneId }
      }

      // Create connection using the official SDK
      const connection = Scribe.connect({
        token,
        modelId: 'scribe_v2_realtime',
        microphone: microphoneConfig,
        includeTimestamps: false,
      })

      connectionRef.current = connection

      // Handle connection opened
      connection.on(RealtimeEvents.OPEN, () => {
        console.log('WebSocket connection opened')
        setIsConnected(true)
      })

      // Handle session started
      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log('Transcription session started')
        setIsRecording(true)
        recordingStartTimeRef.current = Date.now()
        // Notify main process
        window.electronAPI.notifyRecordingState(true)
        // Start audio level analysis for overlay visualization
        startAudioAnalysis(selectedMicrophoneId)
      })

      // Handle partial (interim) transcripts
      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string }
        console.log('Partial transcript:', data.text)

        // Check for voice commands in partial transcripts (real-time detection)
        // Use ref to get current value (not captured value from when handler was created)
        if (voiceCommandsEnabledRef.current && data.text && !voiceCommandTriggeredRef.current) {
          const { command, cleanedText } = detectVoiceCommand(data.text, voiceCommandsRef.current)

          if (command) {
            console.log(`[VoiceCommand] Detected in partial: "${command}"`)
            voiceCommandTriggeredRef.current = true // Prevent multiple triggers

            // Get full transcript with cleaned text
            const existingFinalText = transcriptSegmentsRef.current
              .filter((s) => s.isFinal)
              .map((s) => s.text)
              .join(' ')
            const fullCleanedTranscript = existingFinalText
              ? `${existingFinalText} ${cleanedText}`.trim()
              : cleanedText

            // Update segment with cleaned text (without the command)
            const cleanedSegment: TranscriptSegment = {
              text: cleanedText,
              isFinal: false,
              timestamp: Date.now(),
            }

            setTranscriptSegments((prev) => {
              if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
                const updated = [...prev]
                updated[updated.length - 1] = cleanedSegment
                return updated
              }
              return [...prev, cleanedSegment]
            })

            // Trigger voice command callback (use ref for current callback)
            if (onVoiceCommandRef.current) {
              onVoiceCommandRef.current(command, fullCleanedTranscript)
            }

            // Auto-stop recording after voice command
            setTimeout(() => {
              console.log('[VoiceCommand] Auto-stopping recording...')
              stopAudioAnalysis()
              if (connectionRef.current) {
                try {
                  connectionRef.current.close()
                } catch (err) {
                  console.error('Error closing connection:', err)
                }
                connectionRef.current = null
              }
              setIsRecording(false)
              setIsConnected(false)
              window.electronAPI.notifyRecordingState(false)
            }, 200)

            return // Don't update segment again
          }
        }

        const newSegment: TranscriptSegment = {
          text: data.text || '',
          isFinal: false,
          timestamp: Date.now(),
        }

        setTranscriptSegments((prev) => {
          if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
            const updated = [...prev]
            updated[updated.length - 1] = newSegment
            return updated
          }
          return [...prev, newSegment]
        })
      })

      // Handle committed (final) transcripts
      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string }
        console.log('Committed transcript:', data.text)

        // Check for voice commands if enabled (use ref for current value)
        if (voiceCommandsEnabledRef.current && data.text && !voiceCommandTriggeredRef.current) {
          const { command, cleanedText } = detectVoiceCommand(data.text, voiceCommandsRef.current)

          if (command) {
            console.log(`[VoiceCommand] Detected: "${command}", cleaned text: "${cleanedText}"`)

            // Update the segment with cleaned text (without the command)
            if (cleanedText) {
              const cleanedSegment: TranscriptSegment = {
                text: cleanedText,
                isFinal: true,
                timestamp: Date.now(),
              }

              setTranscriptSegments((prev) => {
                if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
                  const updated = [...prev]
                  updated[updated.length - 1] = cleanedSegment
                  return updated
                }
                return [...prev, cleanedSegment]
              })
            }

            // Trigger the voice command callback (use ref for current callback)
            if (onVoiceCommandRef.current) {
              // Get full transcript including the cleaned segment
              const fullTranscript = cleanedText
                ? [
                    ...transcriptSegmentsRef.current.filter((s) => s.isFinal).map((s) => s.text),
                    cleanedText,
                  ]
                    .join(' ')
                    .trim()
                : transcriptSegmentsRef.current
                    .filter((s) => s.isFinal)
                    .map((s) => s.text)
                    .join(' ')
                    .trim()

              onVoiceCommandRef.current(command, fullTranscript)

              // Auto-stop recording after voice command (with small delay)
              setTimeout(() => {
                stopAudioAnalysis()
                if (connectionRef.current) {
                  console.log('[VoiceCommand] Auto-stopping recording...')
                  try {
                    connectionRef.current.close()
                  } catch (err) {
                    console.error('Error closing connection:', err)
                  }
                  connectionRef.current = null
                }
                setIsRecording(false)
                setIsConnected(false)
                window.electronAPI.notifyRecordingState(false)
              }, 100)
            }
            return
          }
        }

        const newSegment: TranscriptSegment = {
          text: data.text || '',
          isFinal: true,
          timestamp: Date.now(),
        }

        setTranscriptSegments((prev) => {
          if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
            const updated = [...prev]
            updated[updated.length - 1] = newSegment
            return updated
          }
          return [...prev, newSegment]
        })
      })

      // Handle authentication errors
      connection.on(RealtimeEvents.AUTH_ERROR, (...args: unknown[]) => {
        const data = args[0] as { error: string }
        console.error('Authentication error:', data.error)
        setError('Authentication failed. Check your API key in settings.')
        setIsConnected(false)
        setIsRecording(false)
        window.electronAPI.notifyRecordingState(false)
      })

      // Handle general errors
      connection.on(RealtimeEvents.ERROR, (errorData: any) => {
        console.error('Transcription error:', errorData)
        setError(errorData?.message || 'An error occurred during transcription')
      })

      // Handle connection close
      connection.on(RealtimeEvents.CLOSE, () => {
        console.log('Connection closed')
        setIsConnected(false)
        setIsRecording(false)
        window.electronAPI.notifyRecordingState(false)
      })
    } catch (err) {
      console.error('Error starting recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setIsRecording(false)
      setIsConnected(false)
      window.electronAPI.notifyRecordingState(false)
    }
  }, [sessionId, selectedMicrophoneId, startAudioAnalysis])

  const stopRecording = useCallback(async () => {
    // Stop audio level analysis
    stopAudioAnalysis()

    if (connectionRef.current) {
      console.log('Stopping recording and closing connection...')
      try {
        connectionRef.current.close()
      } catch (err) {
        console.error('Error closing connection:', err)
      }
      connectionRef.current = null
    }

    // Get the full transcript before clearing state
    let transcript = getFullTranscript()

    // Calculate recording duration in seconds
    const duration =
      recordingStartTimeRef.current > 0
        ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        : 0

    // Check for voice commands in the final transcript (in case it wasn't committed yet)
    // Use refs to get current values
    if (voiceCommandsEnabledRef.current && transcript && !voiceCommandTriggeredRef.current) {
      const { command, cleanedText } = detectVoiceCommand(transcript, voiceCommandsRef.current)
      if (command) {
        console.log(`[VoiceCommand] Detected on stop: "${command}", cleaned text: "${cleanedText}"`)
        voiceCommandTriggeredRef.current = true
        transcript = cleanedText // Use cleaned transcript

        // Update the last segment with cleaned text
        if (cleanedText) {
          setTranscriptSegments((prev) => {
            if (prev.length > 0) {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: cleanedText,
              }
              return updated
            }
            return prev
          })
        }

        if (onVoiceCommandRef.current) {
          onVoiceCommandRef.current(command, cleanedText)
        }
      }
    }

    setIsRecording(false)
    setIsConnected(false)
    window.electronAPI.notifyRecordingState(false)

    // Call callback if transcript has content (and no voice command was triggered)
    if (transcript && onRecordingStopped) {
      const result = await onRecordingStopped(transcript, duration)
      // If callback returns a modified transcript, update the edited state
      if (typeof result === 'string' && result !== transcript) {
        setEditedTranscript(result)
      }
    }
  }, [getFullTranscript, onRecordingStopped, stopAudioAnalysis])

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([])
    setEditedTranscript(null)
  }, [])

  // Listen for toggle recording events from main process
  useEffect(() => {
    window.electronAPI.onToggleRecording(async () => {
      if (isRecording) {
        stopRecording()
      } else {
        // Save existing transcript to history before starting new recording
        if (transcriptSegments.length > 0 || editedTranscript !== null) {
          const currentText =
            editedTranscript ??
            transcriptSegments
              .map((s) => s.text)
              .join(' ')
              .trim()
          if (currentText && onSaveTranscript) {
            await onSaveTranscript(currentText)
          }
          setTranscriptSegments([])
          setEditedTranscript(null)
        }
        startRecording()
      }
    })

    return () => {
      window.electronAPI.removeAllListeners('toggle-recording')
    }
  }, [
    isRecording,
    startRecording,
    stopRecording,
    transcriptSegments,
    editedTranscript,
    onSaveTranscript,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        console.log('Component unmounting - closing session')
        try {
          connectionRef.current.close()
        } catch (err) {
          console.error('Error closing connection on unmount:', err)
        }
      }
    }
  }, [])

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
  }
}
