import { FC, RefObject } from 'react'
import { GlitchText } from '../cyberpunk/GlitchText'
import './TranscriptDisplay.css'

interface TranscriptDisplayProps {
  hasTranscript: boolean
  transcript: string
  transcriptInputRef: RefObject<HTMLTextAreaElement>
  transcriptEndRef: RefObject<HTMLDivElement>
  recordHotkey: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onContextMenu: (e: React.MouseEvent<HTMLTextAreaElement>) => void
}

/**
 * Transcript display area with placeholder and editable textarea
 *
 * @remarks
 * This component displays either a placeholder message prompting the user to start recording,
 * or an editable textarea containing the transcribed text. The textarea supports context menu
 * operations and auto-scrolls to show new content.
 *
 * @param props - Component props
 * @param props.hasTranscript - Whether there is transcript text to display
 * @param props.transcript - The current transcript text
 * @param props.transcriptInputRef - Ref to the textarea element
 * @param props.transcriptEndRef - Ref to auto-scroll anchor element
 * @param props.recordHotkey - Hotkey combination to display in placeholder
 * @param props.onChange - Handler for transcript text changes
 * @param props.onContextMenu - Handler for right-click context menu
 */
export const TranscriptDisplay: FC<TranscriptDisplayProps> = ({
  hasTranscript,
  transcript,
  transcriptInputRef,
  transcriptEndRef,
  recordHotkey,
  onChange,
  onContextMenu,
}) => {
  // Format hotkey for display (e.g., "CommandOrControl+Shift+R" -> "Cmd+Shift+R")
  const displayHotkey = recordHotkey
    .replace('CommandOrControl', process.platform === 'darwin' ? 'Cmd' : 'Ctrl')
    .replace('+', '+')

  return (
    <div className="transcript-area cyber-panel">
      {!hasTranscript ? (
        <div className="transcript-placeholder cyber-placeholder">
          <p className="cyber-placeholder-text">
            <GlitchText intensity="subtle">Click the orb or press</GlitchText>
          </p>
          <p className="placeholder-hint">
            <kbd className="cyber-kbd">{displayHotkey}</kbd> to begin
          </p>
        </div>
      ) : (
        <textarea
          ref={transcriptInputRef}
          className="transcript-input"
          value={transcript}
          onChange={onChange}
          onContextMenu={onContextMenu}
          placeholder="Your transcript will appear here..."
        />
      )}
      <div ref={transcriptEndRef} />
    </div>
  )
}
