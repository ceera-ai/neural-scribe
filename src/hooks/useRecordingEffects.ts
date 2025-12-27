import { useEffect, useRef, useState } from 'react'
import type { TranscriptSegment } from '../hooks/useElevenLabsScribe'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface UseRecordingEffectsOptions {
  isRecording: boolean
  isConnected: boolean
  formattingEnabled: boolean
  transcriptSegments: TranscriptSegment[]
  transcriptEndRef: React.RefObject<HTMLDivElement>
  pendingPasteRef: React.MutableRefObject<string | null>
  formatAndPaste: (text: string, shouldSaveToHistory?: boolean, duration?: number) => Promise<void>
}

interface UseRecordingEffectsReturn {
  recordingTime: number
}

/**
 * Custom hook to handle recording-related side effects
 *
 * @remarks
 * This hook manages:
 * - Recording timer (seconds counter)
 * - Pending paste execution after voice "send it" command
 * - Sending voice commands to overlay window
 * - Sending recording status to overlay
 * - Sending live transcript preview to overlay
 * - Auto-scrolling transcript display
 *
 * These effects coordinate the main app with the overlay window
 * and manage the recording timer state.
 *
 * @param options - Configuration including recording state and refs
 * @returns Recording time in seconds
 */
export function useRecordingEffects({
  isRecording,
  isConnected,
  formattingEnabled,
  transcriptSegments,
  transcriptEndRef,
  pendingPasteRef,
  formatAndPaste,
}: UseRecordingEffectsOptions): UseRecordingEffectsReturn {
  const [recordingTime, setRecordingTime] = useState(0)

  // Store previous recording time for voice command pastes
  const previousRecordingTime = useRef(0)

  // Update previous recording time whenever it changes
  useEffect(() => {
    if (isRecording) {
      previousRecordingTime.current = recordingTime
    }
  }, [recordingTime, isRecording])

  // Handle pending paste after recording stops (triggered by "send it" voice command)
  useEffect(() => {
    if (!isRecording && pendingPasteRef.current) {
      const textToPaste = pendingPasteRef.current
      const duration = previousRecordingTime.current // Use captured duration from before recording stopped

      pendingPasteRef.current = null

      // Execute paste to terminal with formatting
      if (isElectron) {
        ;(async () => {
          try {
            // Apply replacements first
            const processedText = await window.electronAPI.applyReplacements(textToPaste)
            console.log(
              '[useRecordingEffects] Voice command paste:',
              processedText,
              'duration:',
              duration
            )

            // Use the formatAndPaste helper with duration
            await formatAndPaste(processedText, true, duration)
          } catch (err) {
            console.error('[useRecordingEffects] Voice command paste error:', err)
          }
        })()
      }
    }
  }, [isRecording, pendingPasteRef, formatAndPaste])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecordingTime(0)
      if (isElectron) {
        window.electronAPI.sendRecordingTime(0)
      }
      interval = setInterval(() => {
        setRecordingTime((t) => {
          const newTime = t + 1
          if (isElectron) {
            window.electronAPI.sendRecordingTime(newTime)
          }
          return newTime
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // Send voice commands and status to overlay when recording starts
  useEffect(() => {
    if (isRecording && isElectron) {
      // Send voice commands
      window.electronAPI
        .getEnabledVoiceCommands()
        .then((commands) => {
          window.electronAPI.sendVoiceCommands(commands)
        })
        .catch((err) => {
          console.error('Failed to get voice commands for overlay:', err)
        })

      // Send status (connected, formatting enabled)
      window.electronAPI.sendOverlayStatus({
        connected: isConnected,
        formattingEnabled: formattingEnabled,
      })
    }
  }, [isRecording, isConnected, formattingEnabled])

  // Send live transcript preview to overlay
  useEffect(() => {
    if (isRecording && isElectron) {
      const fullText = transcriptSegments
        .map((s) => s.text)
        .join(' ')
        .trim()
      const wordCount = fullText ? fullText.split(/\s+/).length : 0
      console.log(`[useRecordingEffects] Sending preview: ${wordCount} words`)
      window.electronAPI.sendTranscriptPreview(fullText, wordCount)
    }
  }, [transcriptSegments, isRecording])

  // Auto-scroll to bottom when new transcript appears
  useEffect(() => {
    requestAnimationFrame(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [transcriptSegments, transcriptEndRef])

  return {
    recordingTime,
  }
}
