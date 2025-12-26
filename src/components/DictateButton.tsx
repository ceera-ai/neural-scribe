import { useState } from 'react'
import { useDictation } from '../hooks/useDictation'
import './DictateButton.css'

interface DictateButtonProps {
  onPartialTranscript: (text: string) => void // Called with real-time updates
  onFinalTranscript: (text: string) => void // Called when recording stops
  onRecordingChange?: (isRecording: boolean) => void // Called when recording state changes
  disabled?: boolean
}

/**
 * Dictate Button Component
 *
 * Provides voice dictation using the selected transcription engine from settings.
 * Automatically switches between ElevenLabs and Deepgram based on user preference.
 */
export function DictateButton({
  onPartialTranscript,
  onFinalTranscript,
  onRecordingChange,
  disabled,
}: DictateButtonProps) {
  const [displayError, setDisplayError] = useState<string | null>(null)

  const { isRecording, startDictation, stopDictation, error, engine } = useDictation({
    onPartialTranscript,
    onFinalTranscript,
    onRecordingChange,
  })

  // Show errors from the hook
  if (error && error !== displayError) {
    setDisplayError(error)
  }

  const handleClick = async () => {
    if (isRecording) {
      stopDictation()
    } else {
      setDisplayError(null)
      await startDictation()
    }
  }

  // Generate tooltip with engine info
  const tooltip = isRecording
    ? 'Stop dictating'
    : `Dictate instructions (Using ${engine === 'deepgram' ? 'Deepgram' : 'ElevenLabs'})`

  return (
    <div className="dictate-container">
      <button
        type="button"
        className={`dictate-btn ${isRecording ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        title={tooltip}
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
      {displayError && <span className="dictate-error">{displayError}</span>}
    </div>
  )
}
