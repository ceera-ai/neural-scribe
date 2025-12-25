import { FC } from 'react'
import './PasteButton.css'

interface PasteButtonProps {
  hasTranscript: boolean
  pasteStatus: 'idle' | 'success' | 'permission' | 'no-terminal' | 'error' | 'formatting'
  onPaste: () => void
}

export const PasteButton: FC<PasteButtonProps> = ({ hasTranscript, pasteStatus, onPaste }) => {
  return (
    <div className="terminal-section">
      <div className="paste-button-row">
        <button
          onClick={onPaste}
          className="btn btn-paste"
          disabled={!hasTranscript || pasteStatus === 'formatting'}
        >
          {pasteStatus === 'formatting' ? (
            <>
              <span className="formatting-spinner" />
              Formatting...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Paste to Terminal
            </>
          )}
        </button>
      </div>
    </div>
  )
}
