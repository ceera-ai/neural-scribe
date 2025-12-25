import { FC } from 'react'
import './RecordingControls.css'

interface RecordingControlsProps {
  isRecording: boolean
  hasTranscript: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onClearAndStart: () => void
  onCopy: () => void
  onClear: () => void
  onToggleHistory: () => void
  showHistory: boolean
}

/**
 * Recording control buttons for starting/stopping recording and managing transcript
 *
 * @remarks
 * This component provides the main UI controls for the transcription workflow:
 * - Start/Stop/Continue recording buttons
 * - Copy and Clear transcript actions
 * - History panel toggle
 *
 * The component adapts its UI based on recording state and transcript availability.
 *
 * @param props - Component props
 * @param props.isRecording - Whether recording is currently active
 * @param props.hasTranscript - Whether there is transcript text available
 * @param props.onStartRecording - Callback to start/continue recording
 * @param props.onStopRecording - Callback to stop recording
 * @param props.onClearAndStart - Callback to clear transcript and start new recording
 * @param props.onCopy - Callback to copy transcript to clipboard
 * @param props.onClear - Callback to clear transcript
 * @param props.onToggleHistory - Callback to toggle history panel visibility
 * @param props.showHistory - Whether history panel is currently visible
 */
export const RecordingControls: FC<RecordingControlsProps> = ({
  isRecording,
  hasTranscript,
  onStartRecording,
  onStopRecording,
  onClearAndStart,
  onCopy,
  onClear,
  onToggleHistory,
  showHistory,
}) => {
  return (
    <div className="controls-bar">
      <div className="controls-left">
        {!isRecording ? (
          <>
            <button onClick={onStartRecording} className="btn btn-record">
              <span className="record-icon" />
              {hasTranscript ? 'Continue' : 'Start Recording'}
            </button>
            {hasTranscript && (
              <button
                onClick={onClearAndStart}
                className="btn btn-new"
                title="Clear and start new recording"
              >
                New
              </button>
            )}
          </>
        ) : (
          <button onClick={onStopRecording} className="btn btn-stop">
            <span className="stop-icon" />
            Stop
          </button>
        )}
      </div>
      <div className="controls-right">
        {hasTranscript && (
          <>
            <button onClick={onCopy} className="btn btn-icon" title="Copy to clipboard">
              Copy
            </button>
            <button onClick={onClear} className="btn btn-icon" title="Clear transcript">
              Clear
            </button>
          </>
        )}
        <button
          onClick={onToggleHistory}
          className={`btn btn-icon ${showHistory ? 'active' : ''}`}
          title="Toggle history"
        >
          History
        </button>
      </div>
    </div>
  )
}
