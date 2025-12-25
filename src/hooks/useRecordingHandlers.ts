import { useCallback, useState } from 'react'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface UseRecordingHandlersOptions {
  recordSession: (wordCount: number, duration: number) => Promise<void>
  saveTranscription: (text: string, duration: number) => Promise<void>
  pendingPasteRef: React.MutableRefObject<string | null>
}

interface UseRecordingHandlersReturn {
  lastVoiceCommand: string | null
  lastXpGained: number | null
  handleRecordingComplete: (
    transcript: string,
    duration: number,
    source:
      | 'stop_button'
      | 'voice_send'
      | 'voice_clear'
      | 'voice_cancel'
      | 'hotkey'
      | 'paste'
      | 'auto'
  ) => Promise<string>
  handleRecordingStopped: (transcript: string, duration: number) => Promise<string>
  handleVoiceCommand: (command: 'send' | 'clear' | 'cancel', transcript: string) => Promise<void>
  handleSaveTranscript: (transcript: string) => Promise<void>
}

/**
 * Custom hook to handle recording lifecycle and voice commands
 *
 * @remarks
 * This hook manages:
 * - Recording completion with word replacements
 * - Gamification tracking (word count, duration)
 * - Voice command handling (send, clear, cancel)
 * - Transcript saving to history
 *
 * The handlers coordinate between the transcription service,
 * gamification system, and history storage.
 *
 * @param options - Configuration including gamification and history functions
 * @returns Recording handlers and voice command state
 */
export function useRecordingHandlers({
  recordSession,
  saveTranscription,
  pendingPasteRef,
}: UseRecordingHandlersOptions): UseRecordingHandlersReturn {
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null)
  const [lastXpGained, setLastXpGained] = useState<number | null>(null)

  /**
   * Centralized recording completion handler
   *
   * @remarks
   * This handler ensures gamification is ALWAYS triggered for recordings.
   * It applies word replacements and tracks statistics.
   *
   * @param transcript - The recorded transcript
   * @param duration - Recording duration in seconds
   * @param source - How the recording was completed
   * @returns Processed transcript with replacements applied
   */
  const handleRecordingComplete = useCallback(
    async (
      transcript: string,
      duration: number,
      source:
        | 'stop_button'
        | 'voice_send'
        | 'voice_clear'
        | 'voice_cancel'
        | 'hotkey'
        | 'paste'
        | 'auto'
    ): Promise<string> => {
      console.log(
        `[useRecordingHandlers] Recording complete via: ${source}, duration: ${duration}s`
      )

      // Apply word replacements if enabled
      let processedTranscript = transcript
      if (isElectron) {
        try {
          const settings = await window.electronAPI.getSettings()
          if (settings.replacementsEnabled) {
            processedTranscript = await window.electronAPI.applyReplacements(transcript)
          }
        } catch (err) {
          console.error('Failed to apply replacements:', err)
        }
      }

      // CRITICAL: Always record session for gamification (except for cancel)
      // This fixes the bug where voice commands weren't being tracked
      if (source !== 'voice_cancel' && processedTranscript.trim()) {
        const wordCount = processedTranscript.trim().split(/\s+/).length
        if (wordCount > 0) {
          console.log(
            `[useRecordingHandlers] Recording gamification: ${wordCount} words, ${duration}s`
          )
          const xpGained = await recordSession(wordCount, duration * 1000) // Convert to milliseconds
          setLastXpGained(xpGained)
          // Clear XP notification after 4 seconds
          setTimeout(() => setLastXpGained(null), 4000)
        }
      }

      return processedTranscript
    },
    [recordSession]
  )

  /**
   * Handle recording stopped event
   *
   * @remarks
   * Determines the source of the recording stop and processes the transcript.
   * Only auto-saves if there's no pending paste operation.
   *
   * @param transcript - The recorded transcript
   * @param duration - Recording duration in seconds
   * @returns Processed transcript
   */
  const handleRecordingStopped = useCallback(
    async (transcript: string, duration: number): Promise<string> => {
      // Determine source based on context
      const source = pendingPasteRef.current ? 'voice_send' : 'auto'

      // Always trigger gamification via centralized handler
      const processedTranscript = await handleRecordingComplete(transcript, duration, source)

      // Only auto-save if there's no pending paste operation
      // If there's a pending paste, formatAndPaste will handle saving with formatting
      if (processedTranscript.trim() && !pendingPasteRef.current) {
        await saveTranscription(processedTranscript, duration)
      }

      // Return the processed transcript to update the UI
      return processedTranscript
    },
    [saveTranscription, handleRecordingComplete, pendingPasteRef]
  )

  /**
   * Handle voice commands from user
   *
   * @remarks
   * Processes voice commands and stores state for pending operations.
   * Commands are executed after recording stops.
   *
   * @param command - The voice command (send, clear, cancel)
   * @param transcript - The current transcript
   */
  const handleVoiceCommand = useCallback(
    async (command: 'send' | 'clear' | 'cancel', transcript: string): Promise<void> => {
      console.log(
        `[useRecordingHandlers] Voice command received: ${command}, transcript: "${transcript}"`
      )

      setLastVoiceCommand(command)
      setTimeout(() => setLastVoiceCommand(null), 2000)

      // Track voice command usage for gamification
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          await window.electronAPI.trackFeatureUsage(`voice-command-${command}`)
        } catch (err) {
          console.error('[useRecordingHandlers] Failed to track voice command usage:', err)
        }
      }

      switch (command) {
        case 'send':
          // Store transcript for paste, will be executed after recording stops
          if (transcript.trim()) {
            pendingPasteRef.current = transcript
          }
          break
        case 'clear':
          // Will be handled after recording stops
          break
        case 'cancel':
          // Will be handled after recording stops
          break
      }
    },
    [pendingPasteRef]
  )

  /**
   * Handle saving transcript when starting new recording via hotkey
   *
   * @remarks
   * Applies word replacements before saving to history.
   * Duration is set to 0 since we don't track it for hotkey-triggered saves.
   *
   * @param transcript - The transcript to save
   */
  const handleSaveTranscript = useCallback(
    async (transcript: string): Promise<void> => {
      if (transcript.trim()) {
        // Apply word replacements before saving
        let processedText = transcript
        if (isElectron) {
          try {
            const settings = await window.electronAPI.getSettings()
            if (settings.replacementsEnabled) {
              processedText = await window.electronAPI.applyReplacements(transcript)
            }
          } catch (err) {
            console.error('Failed to apply replacements:', err)
          }
        }
        // Save to history with 0 duration (since we don't track it for hotkey-triggered saves)
        await saveTranscription(processedText, 0)
      }
    },
    [saveTranscription]
  )

  return {
    lastVoiceCommand,
    lastXpGained,
    handleRecordingComplete,
    handleRecordingStopped,
    handleVoiceCommand,
    handleSaveTranscript,
  }
}
