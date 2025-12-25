import { useState, useRef, useCallback } from 'react'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface UsePasteToTerminalOptions {
  formattingEnabled: boolean
  saveTranscriptionWithFormatting: (data: {
    originalText: string
    formattedText?: string
    title?: string
    duration: number
  }) => Promise<void>
}

interface UsePasteToTerminalReturn {
  pasteStatus: 'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'
  historySaved: string | null
  formatAndPaste: (text: string, shouldSaveToHistory?: boolean, duration?: number) => Promise<void>
  handlePasteToTerminal: (
    getCurrentTranscript: () => string,
    isRecording: boolean,
    stopRecording: () => void,
    recordingTime: number,
    pendingPasteRef: React.MutableRefObject<string | null>
  ) => Promise<void>
}

/**
 * Custom hook to handle paste to terminal with optional AI formatting
 *
 * @remarks
 * This hook manages:
 * - Paste status notifications (formatting, success, error, etc.)
 * - AI formatting via Claude (if enabled)
 * - Title generation for history entries
 * - Saving to transcription history
 * - Prevention of concurrent paste operations
 *
 * The paste operation can be triggered manually or via voice commands.
 *
 * @param options - Configuration options including formatting enabled state and history save function
 * @returns Paste state and handler functions
 */
export function usePasteToTerminal({
  formattingEnabled,
  saveTranscriptionWithFormatting,
}: UsePasteToTerminalOptions): UsePasteToTerminalReturn {
  const [pasteStatus, setPasteStatus] = useState<
    'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'
  >('idle')
  const [historySaved, setHistorySaved] = useState<string | null>(null)
  const isPastingRef = useRef<boolean>(false)

  /**
   * Format text with Claude (if enabled) and paste to terminal
   *
   * @param text - The text to format and paste
   * @param shouldSaveToHistory - Whether to save to history (default: true)
   * @param duration - Recording duration in seconds (default: 0)
   */
  const formatAndPaste = useCallback(
    async (
      text: string,
      shouldSaveToHistory: boolean = true,
      duration: number = 0
    ): Promise<void> => {
      // Prevent multiple simultaneous paste operations
      if (isPastingRef.current) {
        console.log('[usePasteToTerminal] Paste already in progress, skipping...')
        return
      }

      isPastingRef.current = true
      console.log('[usePasteToTerminal] Starting paste operation...')
      console.log('[usePasteToTerminal] formattingEnabled:', formattingEnabled)

      if (!isElectron) {
        console.warn('[usePasteToTerminal] Not in Electron environment, skipping paste')
        isPastingRef.current = false
        return
      }

      try {
        let textToPaste = text
        let formattedText: string | undefined
        let title: string | undefined
        const originalText = text

        // Format with Claude if enabled
        if (formattingEnabled) {
          setPasteStatus('formatting')
          console.log('[usePasteToTerminal] Formatting text with Claude...')
          const formatResult = await window.electronAPI.formatPrompt(text)
          console.log('[usePasteToTerminal] Format result:', formatResult)

          if (formatResult.success && !formatResult.skipped) {
            textToPaste = formatResult.formatted
            formattedText = formatResult.formatted
            console.log('[usePasteToTerminal] Formatted text:', textToPaste)
          } else if (formatResult.skipped) {
            console.log(
              '[usePasteToTerminal] Formatting was skipped (user cancelled or chose original)'
            )
          } else if (formatResult.error) {
            console.warn(
              '[usePasteToTerminal] Formatting failed, using original text:',
              formatResult.error
            )
          }
        } else {
          console.log('[usePasteToTerminal] Formatting disabled, skipping Claude formatting')
        }

        // Paste using the configured paste mode (auto, clipboard, or terminal)
        // The backend will route based on the current paste mode setting
        console.log('[usePasteToTerminal] Getting current paste mode...')
        const pasteMode = await window.electronAPI.invoke('get-paste-mode')
        console.log('[usePasteToTerminal] Current paste mode:', pasteMode)

        let result
        if (pasteMode === 'terminal') {
          // Use legacy terminal paste for terminal mode
          console.log(
            '[usePasteToTerminal] Using TERMINAL mode - calling pasteToLastActiveTerminal'
          )
          result = await window.electronAPI.pasteToLastActiveTerminal(textToPaste)
        } else {
          // Use new paste handler for auto and clipboard modes
          console.log('[usePasteToTerminal] Using AUTO/CLIPBOARD mode - calling paste-text IPC')
          result = await window.electronAPI.invoke('paste-text', textToPaste)
        }

        console.log('[usePasteToTerminal] Paste result:', result)

        // Show notification IMMEDIATELY after paste
        if (result.success) {
          setPasteStatus('success')
          setTimeout(() => setPasteStatus('idle'), 2000)
        } else if (!result.targetApp) {
          setPasteStatus('no-terminal')
          setTimeout(() => setPasteStatus('idle'), 3000)
        } else if (result.needsPermission) {
          setPasteStatus('permission')
        } else {
          setPasteStatus('permission')
        }

        // Save to history in background (don't block UI)
        if (shouldSaveToHistory && (result.success || result.copied)) {
          // Run title generation and saving in background
          ;(async () => {
            const textForTitle = formattedText || originalText
            if (textForTitle) {
              try {
                console.log('[usePasteToTerminal] Generating title in background...')
                const titleResult = await window.electronAPI.generateTitle(textForTitle)
                if (titleResult.success && titleResult.title) {
                  title = titleResult.title
                  console.log('[usePasteToTerminal] Generated title:', title)
                }
              } catch (err) {
                console.warn('[usePasteToTerminal] Title generation failed:', err)
              }
            }

            await saveTranscriptionWithFormatting({
              originalText,
              formattedText,
              title,
              duration,
            })

            // Show notification that history was saved
            setHistorySaved(title || 'Transcription')
            setTimeout(() => setHistorySaved(null), 3000)
          })()
        }
      } catch (err) {
        console.error('[usePasteToTerminal] Format/paste error:', err)
        setPasteStatus('error')
        setTimeout(() => setPasteStatus('idle'), 3000)
      } finally {
        isPastingRef.current = false
        console.log('[usePasteToTerminal] Paste operation completed')
      }
    },
    [formattingEnabled, saveTranscriptionWithFormatting]
  )

  /**
   * Handle paste to terminal button click
   *
   * @param getCurrentTranscript - Function to get current transcript
   * @param isRecording - Whether currently recording
   * @param stopRecording - Function to stop recording
   * @param recordingTime - Current recording time in seconds
   * @param pendingPasteRef - Ref to prevent duplicate pastes from voice commands
   */
  const handlePasteToTerminal = useCallback(
    async (
      getCurrentTranscript: () => string,
      isRecording: boolean,
      stopRecording: () => void,
      recordingTime: number,
      pendingPasteRef: React.MutableRefObject<string | null>
    ): Promise<void> => {
      // Mark that paste button was clicked to prevent duplicate save in handleRecordingStopped
      pendingPasteRef.current = 'paste'

      // Capture the recording time before stopping
      const currentDuration = recordingTime

      // Stop recording first if active
      if (isRecording) {
        stopRecording()
        // Small delay to ensure transcript is finalized
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const text = getCurrentTranscript()
      if (text) {
        console.log('[usePasteToTerminal] Attempting to paste to terminal...')
        await formatAndPaste(text, true, currentDuration)
      }

      // Clear the pending paste after we're done
      pendingPasteRef.current = null
    },
    [formatAndPaste]
  )

  return {
    pasteStatus,
    historySaved,
    formatAndPaste,
    handlePasteToTerminal,
  }
}
