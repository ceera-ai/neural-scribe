import { useEffect, useRef, useState, useCallback } from 'react'
import { Scribe, RealtimeEvents } from '@elevenlabs/client'
import type { TranscriptionProvider, TranscriptionProviderOptions, TranscriptSegment } from './types'
import { detectVoiceCommand, type VoiceCommands } from './voiceCommands'

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
 * } = useElevenLabsProvider({
 *   selectedMicrophoneId: 'default',
 *   voiceCommandsEnabled: true,
 *   onRecordingStopped: async (transcript, duration) => {
 *     console.log(`Recorded ${duration}ms:`, transcript)
 *   }
 * })
 * ```
 */
export function useElevenLabsProvider(
  options: TranscriptionProviderOptions = {}
): TranscriptionProvider {
  const {
    selectedMicrophoneId,
    onRecordingStopped,
    onVoiceCommand,
    voiceCommandsEnabled = true,
    onSaveTranscript,
    onFormattingOverride,
  } = options

  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

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
    if (isElectron) {
      window.electronAPI.sendAudioLevel(0)
      // Reset spectrum bars
      window.electronAPI.sendFrequencyData(new Array(24).fill(0))
    }

    console.log('[AudioAnalysis] Stopped')
  }, [isElectron])

  // Helper function to perform the actual stop logic (avoids circular dependencies)
  const performStopRecording = useCallback(async () => {
    console.log('[CRITICAL] performStopRecording - IMMEDIATELY updating state')

    // IMMEDIATELY update state to prevent any further processing
    setIsRecording(false)
    setIsConnected(false)

    // Notify main process IMMEDIATELY
    if (isElectron) {
      window.electronAPI.notifyRecordingState(false)
    }

    // Stop audio level analysis IMMEDIATELY
    stopAudioAnalysis()

    // Close the WebSocket connection IMMEDIATELY and aggressively
    if (connectionRef.current) {
      console.log('[CRITICAL] Closing WebSocket connection NOW')
      const connection = connectionRef.current
      connectionRef.current = null // Clear ref FIRST to prevent any race conditions

      try {
        // Force close the connection
        connection.close()
        console.log('[CRITICAL] WebSocket connection.close() called')
      } catch (err) {
        console.error('[CRITICAL] Error closing connection:', err)
      }
    }

    // Get the full transcript and duration
    const transcript = getFullTranscript()
    const duration =
      recordingStartTimeRef.current > 0
        ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        : 0

    // Call callback if transcript has content
    if (transcript && onRecordingStopped) {
      console.log('[CRITICAL] Calling onRecordingStopped callback')
      try {
        const result = await onRecordingStopped(transcript, duration)
        if (typeof result === 'string' && result !== transcript) {
          setEditedTranscript(result)
        }
      } catch (err) {
        console.error('[CRITICAL] Error in onRecordingStopped callback:', err)
      }
    }

    // Reset formatting override when recording stops
    if (onFormattingOverride) {
      onFormattingOverride(null)
    }

    console.log('[CRITICAL] performStopRecording complete')
  }, [stopAudioAnalysis, getFullTranscript, onRecordingStopped, isElectron, onFormattingOverride])

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
        if (isElectron) {
          window.electronAPI.sendAudioLevel(smoothedLevel)
        }

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
        if (isElectron) {
          window.electronAPI.sendFrequencyData(frequencyData)
        }

        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      analyze()
      console.log('[AudioAnalysis] Started')
    } catch (err) {
      console.error('[AudioAnalysis] Failed to start:', err)
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ ========================================')
      console.log('🎙️ USING ELEVENLABS SCRIBE PROVIDER (PREMIUM)')
      console.log('🎙️ ========================================')

      setError(null)
      voiceCommandTriggeredRef.current = false // Reset for new recording

      // Load voice commands from store
      if (isElectron) {
        try {
          const commands = await window.electronAPI.getEnabledVoiceCommands()
          voiceCommandsRef.current = commands
          console.log('[VoiceCommand] Loaded triggers:', commands)
        } catch (err) {
          console.error('Failed to load voice commands:', err)
          voiceCommandsRef.current = { send: [], clear: [], cancel: [] }
        }
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
      if (!isElectron) {
        throw new Error('Cannot get Scribe token: Not in Electron environment')
      }
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
        if (isElectron) {
          window.electronAPI.notifyRecordingState(true)
        }
        // Start audio level analysis for overlay visualization
        startAudioAnalysis(selectedMicrophoneId)
      })

      // Handle partial (interim) transcripts
      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (...args: unknown[]) => {
        const data = args[0] as { text: string }
        console.log('🎙️ [ElevenLabs] ⏳ INTERIM transcript:', `"${data.text}"`)

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
              console.log('[VoiceCommand] Auto-stopping recording via performStopRecording()...')
              performStopRecording()
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
        console.log('🎙️ [ElevenLabs] ✅ FINAL transcript:', `"${data.text}"`)

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

              // Auto-stop recording after voice command
              setTimeout(() => {
                console.log('[VoiceCommand] Auto-stopping recording via performStopRecording()...')
                performStopRecording()
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
        if (isElectron) {
          window.electronAPI.notifyRecordingState(false)
        }
      })

      // Handle general errors
      connection.on(RealtimeEvents.ERROR, (errorData: any) => {
        console.error('Transcription error:', errorData)
        setError(errorData?.message || 'An error occurred during transcription')
      })

      // Handle connection close
      connection.on(RealtimeEvents.CLOSE, async () => {
        console.log('[WebSocket] CLOSE event received')

        // Check if this was already handled by stopRecording (connection ref is null)
        if (!connectionRef.current) {
          console.log('[WebSocket] CLOSE event already handled by performStopRecording, skipping')
          return
        }

        // This path is only reached if the connection closed unexpectedly
        // (not via manual stopRecording call)
        console.log('[WebSocket] Unexpected connection close - cleaning up via performStopRecording')

        await performStopRecording()
      })
    } catch (err) {
      console.error('Error starting recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setIsRecording(false)
      setIsConnected(false)
      if (isElectron) {
        window.electronAPI.notifyRecordingState(false)
      }
    }
  }, [sessionId, selectedMicrophoneId, startAudioAnalysis, performStopRecording])

  const stopRecording = useCallback(async () => {
    console.log('[CRITICAL] stopRecording called')
    await performStopRecording()
  }, [performStopRecording])

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([])
    setEditedTranscript(null)
  }, [])

  // Listen for toggle recording events from main process
  useEffect(() => {
    if (!isElectron) return

    const handleToggleRecording = async (withFormatting: boolean) => {
      // Check if ElevenLabs is the active engine
      const settings = await window.electronAPI.getSettings()
      const activeEngine = settings.transcriptionEngine || 'elevenlabs'

      if (activeEngine !== 'elevenlabs') {
        console.log('[ElevenLabs] Ignoring hotkey - not the active engine (active:', activeEngine, ')')
        return
      }

      console.log('[ElevenLabs] Hotkey pressed, withFormatting:', withFormatting)

      if (isRecording) {
        stopRecording()
        // Reset formatting override when stopping
        if (onFormattingOverride) {
          onFormattingOverride(null)
        }
      } else {
        // Set formatting override based on which hotkey was pressed
        if (onFormattingOverride) {
          onFormattingOverride(withFormatting)
        }

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
    }

    window.electronAPI.onToggleRecording(handleToggleRecording)

    return () => {
      window.electronAPI.removeAllListeners('toggle-recording')
    }
  }, [
    isElectron,
    isRecording,
    startRecording,
    stopRecording,
    transcriptSegments,
    editedTranscript,
    onSaveTranscript,
    onFormattingOverride,
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
