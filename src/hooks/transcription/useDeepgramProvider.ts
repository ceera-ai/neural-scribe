import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents, LiveClient } from '@deepgram/sdk'
import type {
  TranscriptionProvider,
  TranscriptionProviderOptions,
  TranscriptSegment,
} from './types'
import { detectVoiceCommand, type VoiceCommands } from './voiceCommands'

/**
 * React hook for real-time speech transcription using Deepgram API
 *
 * @remarks
 * This hook manages the complete WebSocket lifecycle for real-time transcription,
 * including connection management, microphone streaming, transcript reception,
 * and automatic cleanup. It provides both partial (real-time) and committed (final)
 * transcription results.
 *
 * Features:
 * - Real-time interim transcripts that update as you speak
 * - Final transcripts that are finalized and won't change
 * - Voice command detection (e.g., "send it", "clear", "cancel")
 * - Automatic connection management
 * - Microphone device selection
 * - Multiple model support (Nova 3, Nova 2, Flux)
 * - Session tracking with unique IDs
 *
 * WebSocket Events Handled:
 * - open: Connection established
 * - transcript: Transcript received (interim or final)
 * - close: Connection closed
 * - error: Error occurred
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
 * } = useDeepgramProvider({
 *   selectedMicrophoneId: 'default',
 *   voiceCommandsEnabled: true,
 *   onRecordingStopped: async (transcript, duration) => {
 *     console.log(`Recorded ${duration}ms:`, transcript)
 *   }
 * })
 * ```
 */
export function useDeepgramProvider(
  options: TranscriptionProviderOptions = {}
): TranscriptionProvider {
  const {
    selectedMicrophoneId,
    onRecordingStopped,
    onVoiceCommand,
    voiceCommandsEnabled = true,
    onSaveTranscript: _onSaveTranscript, // Handled in useTranscriptionEngine
    onFormattingOverride,
  } = options

  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null)

  const connectionRef = useRef<LiveClient | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const transcriptSegmentsRef = useRef<TranscriptSegment[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const voiceCommandTriggeredRef = useRef<boolean>(false)
  const voiceCommandsEnabledRef = useRef<boolean>(voiceCommandsEnabled)
  const onVoiceCommandRef = useRef(onVoiceCommand)
  const voiceCommandsRef = useRef<VoiceCommands>({ send: [], clear: [], cancel: [] })

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

  // Helper function to perform the actual stop logic
  const performStopRecording = useCallback(async () => {
    console.log('[Deepgram] Stopping recording')

    // IMMEDIATELY update state to prevent any further processing
    setIsRecording(false)
    setIsConnected(false)

    // Notify main process IMMEDIATELY
    if (isElectron) {
      window.electronAPI.notifyRecordingState(false)
    }

    // Stop audio level analysis IMMEDIATELY
    stopAudioAnalysis()

    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    // Stop the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    // Close the WebSocket connection
    if (connectionRef.current) {
      const connection = connectionRef.current
      connectionRef.current = null

      try {
        connection.finish()
      } catch (err) {
        console.error('[Deepgram] Error closing connection:', err)
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
      try {
        const result = await onRecordingStopped(transcript, duration)
        if (typeof result === 'string' && result !== transcript) {
          setEditedTranscript(result)
        }
      } catch (err) {
        console.error('[Deepgram] Error in onRecordingStopped callback:', err)
      }
    }

    // Reset formatting override when recording stops
    if (onFormattingOverride) {
      onFormattingOverride(null)
    }
  }, [stopAudioAnalysis, getFullTranscript, onRecordingStopped, isElectron, onFormattingOverride])

  // Start audio level analysis for overlay visualization
  const startAudioAnalysis = useCallback(
    async (microphoneId?: string | null) => {
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

        // Start analyzing using frequency data
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        let prevLevel = 0
        const prevBars = new Array(24).fill(0)

        const analyze = () => {
          if (!analyserRef.current) return

          // Get frequency data
          analyserRef.current.getByteFrequencyData(dataArray)

          // Focus on voice frequency range
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
          const factor = diff > 0 ? 0.5 : 0.4
          const smoothedLevel = prevLevel + diff * factor
          prevLevel = smoothedLevel

          // Send audio level for cloud animations
          if (isElectron) {
            window.electronAPI.sendAudioLevel(smoothedLevel)
          }

          // Extract 24 frequency bins for spectrum visualization
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
            const normalizedBar = Math.min(1, (barAvg / 255) * 1.8)
            const barDiff = normalizedBar - prevBars[i]
            const barFactor = barDiff > 0 ? 0.6 : 0.4
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
    },
    [isElectron]
  )

  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ [Deepgram] Starting recording')

      setError(null)
      voiceCommandTriggeredRef.current = false

      // Load voice commands from store
      if (isElectron) {
        try {
          const commands = await window.electronAPI.getEnabledVoiceCommands()
          voiceCommandsRef.current = commands
        } catch (err) {
          console.error('[Deepgram] Failed to load voice commands:', err)
          voiceCommandsRef.current = { send: [], clear: [], cancel: [] }
        }
      }

      // Generate session ID
      if (!sessionId) {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        setSessionId(newSessionId)
      }

      // Get API key and settings from main process
      if (!isElectron) {
        throw new Error('Cannot get Deepgram API key: Not in Electron environment')
      }

      const apiKey = await window.electronAPI.getDeepgramApiKey()

      if (!apiKey) {
        throw new Error('Deepgram API key not configured. Please add your API key in settings.')
      }

      // Get selected model and language settings
      const settings = await window.electronAPI.getSettings()
      const requestedModel = settings.deepgramModel || 'nova-2'
      const isMultilingual = settings.deepgramMultilingual ?? false

      // Map legacy/fictional model names to real Deepgram models
      const modelMap: Record<string, string> = {
        'nova-3': 'nova-3',
        'nova-2': 'nova-2',
        'nova-2-meeting': 'nova-2-meeting',
        enhanced: 'enhanced',
        base: 'base',
        'nova-3-monolingual': 'nova-3',
        'nova-3-multilingual': 'nova-3',
        flux: 'nova-2',
      }

      const model = modelMap[requestedModel] || 'nova-2'
      const language = isMultilingual ? 'multi' : 'en'

      console.log(`[Deepgram] Using model: ${model}, language: ${language}`)

      // Create Deepgram client
      const deepgram = createClient(apiKey)

      // Build microphone config
      const microphoneConfig: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          ...(selectedMicrophoneId && { deviceId: { exact: selectedMicrophoneId } }),
        },
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia(microphoneConfig)
      mediaStreamRef.current = stream

      // Create live transcription connection
      const connectionConfig = {
        model,
        language,
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
      }

      const connection = deepgram.listen.live(connectionConfig)
      connectionRef.current = connection

      // Handle connection opened
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('[Deepgram] Connection opened')

        setIsConnected(true)
        setIsRecording(true)
        recordingStartTimeRef.current = Date.now()

        // Notify main process
        if (isElectron) {
          window.electronAPI.notifyRecordingState(true)
        }

        // Start audio level analysis for overlay visualization
        startAudioAnalysis(selectedMicrophoneId)

        // Start sending audio data
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })

        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && connection.getReadyState() === 1) {
            connection.send(event.data)
          }
        })

        mediaRecorder.addEventListener('error', (error) => {
          console.error('[Deepgram] MediaRecorder error:', error)
        })

        mediaRecorder.start(250)
      })

      // Handle transcripts
      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript
        const isFinal = data.is_final

        if (!transcript) return

        // Check for voice commands
        if (voiceCommandsEnabledRef.current && transcript && !voiceCommandTriggeredRef.current) {
          const { command, cleanedText } = detectVoiceCommand(transcript, voiceCommandsRef.current)

          if (command) {
            console.log(`[Deepgram] Voice command detected: "${command}"`)
            voiceCommandTriggeredRef.current = true

            // Get full transcript with cleaned text
            const existingFinalText = transcriptSegmentsRef.current
              .filter((s) => s.isFinal)
              .map((s) => s.text)
              .join(' ')
            const fullCleanedTranscript = existingFinalText
              ? `${existingFinalText} ${cleanedText}`.trim()
              : cleanedText

            // Update segment with cleaned text
            const cleanedSegment: TranscriptSegment = {
              text: cleanedText,
              isFinal: isFinal,
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

            // Trigger voice command callback
            if (onVoiceCommandRef.current) {
              onVoiceCommandRef.current(command, fullCleanedTranscript)
            }

            // Auto-stop recording after voice command
            setTimeout(
              () => {
                performStopRecording()
              },
              isFinal ? 100 : 200
            )

            return
          }
        }

        // Add segment
        const newSegment: TranscriptSegment = {
          text: transcript,
          isFinal: isFinal,
          timestamp: Date.now(),
        }

        setTranscriptSegments((prev) => {
          // Replace last interim segment if it exists (for both interim and final transcripts)
          if (prev.length > 0 && !prev[prev.length - 1].isFinal) {
            const updated = [...prev]
            updated[updated.length - 1] = newSegment
            return updated
          }
          // Otherwise append as new segment
          return [...prev, newSegment]
        })
      })

      // Handle errors
      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('[Deepgram] Error:', error?.message || error)
        setError(error?.message || 'An error occurred during transcription')
      })

      // Handle connection close
      connection.on(LiveTranscriptionEvents.Close, async () => {
        console.log('[Deepgram] Connection closed')

        // Check if this was already handled
        if (!connectionRef.current) {
          return
        }

        // Unexpected close - clean up
        await performStopRecording()
      })
    } catch (err) {
      console.error('[Deepgram] Error starting recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setIsRecording(false)
      setIsConnected(false)

      if (isElectron) {
        window.electronAPI.notifyRecordingState(false)
      }
    }
  }, [sessionId, selectedMicrophoneId, startAudioAnalysis, performStopRecording, isElectron])

  const stopRecording = useCallback(async () => {
    await performStopRecording()
  }, [performStopRecording])

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([])
    setEditedTranscript(null)
  }, [])

  // Toggle recording listener is now handled in useTranscriptionEngine
  // to prevent conflicts when both providers are mounted

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      if (connectionRef.current) {
        try {
          connectionRef.current.finish()
        } catch (err) {
          console.error('[Deepgram] Error closing connection on unmount:', err)
        }
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
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
