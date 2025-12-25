import { useState, useMemo } from 'react'
import type { TranscriptionRecord, FormattedVersion } from '../types/electron'
import { DictateButton } from './DictateButton'
import './ReformatDialog.css'

interface ReformatDialogProps {
  record: TranscriptionRecord
  isOpen: boolean
  onClose: () => void
  onReformat: (sourceVersionId: string, customInstructions?: string) => Promise<void>
}

type SourceOption = {
  id: string
  label: string
  text: string
  timestamp?: number
}

function formatShortTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ReformatDialog({ record, isOpen, onClose, onReformat }: ReformatDialogProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('original')
  const [customInstructions, setCustomInstructions] = useState('')
  const [isDictating, setIsDictating] = useState(false)
  const [dictationBaseText, setDictationBaseText] = useState('')
  const [isFormatting, setIsFormatting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sourceOptions = useMemo<SourceOption[]>(() => {
    const options: SourceOption[] = []

    const originalText = record.originalText || record.text
    options.push({
      id: 'original',
      label: 'Original Transcription',
      text: originalText,
    })

    if (record.formattedVersions && record.formattedVersions.length > 0) {
      const sortedVersions = [...record.formattedVersions].sort((a, b) => b.timestamp - a.timestamp)
      sortedVersions.forEach((version, index) => {
        const label = version.customInstructions
          ? `Custom Format ${sortedVersions.length - index}`
          : index === 0
            ? 'Latest Formatted'
            : `Formatted V${sortedVersions.length - index}`
        options.push({
          id: version.id,
          label,
          text: version.text,
          timestamp: version.timestamp,
        })
      })
    } else if (record.wasFormatted && record.formattedText) {
      options.push({
        id: 'formatted-legacy',
        label: 'Formatted Version',
        text: record.formattedText,
      })
    }

    return options
  }, [record])

  const selectedSource = sourceOptions.find((o) => o.id === selectedSourceId) || sourceOptions[0]

  if (!isOpen) return null

  const handleReformat = async () => {
    setIsFormatting(true)
    setError(null)
    try {
      await onReformat(selectedSourceId, customInstructions.trim() || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formatting failed')
    } finally {
      setIsFormatting(false)
    }
  }

  return (
    <div className="cyber-modal-overlay reformat-overlay" onClick={onClose}>
      <div className="cyber-reformat-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reformat-header">
          <h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Reformat Transcription
          </h2>
          <button className="cyber-close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="reformat-body">
          {/* Source Selection */}
          <div className="reformat-section">
            <label className="section-label">Source Version</label>
            <p className="section-hint">Choose which version to use as the starting point</p>
            <div className="source-options">
              {sourceOptions.map((option) => (
                <button
                  key={option.id}
                  className={`source-option ${selectedSourceId === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSourceId(option.id)}
                >
                  <div className="source-option-left">
                    <span className="source-icon">{option.id === 'original' ? '📝' : '✨'}</span>
                    <span className="source-label">{option.label}</span>
                  </div>
                  {option.timestamp && (
                    <span className="source-time">{formatShortTime(option.timestamp)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Source Preview */}
          <div className="reformat-section">
            <label className="section-label">Source Preview</label>
            <div className="source-preview">
              {selectedSource.text.length > 300
                ? selectedSource.text.slice(0, 300) + '...'
                : selectedSource.text}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="reformat-section">
            <div className="section-label-row">
              <label className="section-label">
                Custom Instructions
                <span className="optional-tag">Optional</span>
              </label>
              <DictateButton
                onRecordingChange={(recording) => {
                  if (recording) {
                    setIsDictating(true)
                    setDictationBaseText(customInstructions)
                  } else {
                    setIsDictating(false)
                  }
                }}
                onPartialTranscript={(text) => {
                  const separator = dictationBaseText ? ' ' : ''
                  setCustomInstructions(dictationBaseText + separator + text)
                }}
                onFinalTranscript={(text) => {
                  const separator = dictationBaseText ? ' ' : ''
                  setCustomInstructions(dictationBaseText + separator + text)
                  setDictationBaseText('')
                }}
                disabled={isFormatting}
              />
            </div>
            <p className="section-hint">
              Add specific instructions for this reformat, or leave empty for default formatting
            </p>
            <textarea
              className={`cyber-textarea ${isDictating ? 'dictating' : ''}`}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Make it more formal, Add bullet points, Summarize in 3 sentences..."
              rows={3}
              readOnly={isDictating}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="reformat-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="reformat-footer">
          <button className="cyber-btn cancel-btn" onClick={onClose} disabled={isFormatting}>
            Cancel
          </button>
          <button
            className="cyber-btn reformat-btn"
            onClick={handleReformat}
            disabled={isFormatting}
          >
            {isFormatting ? (
              <>
                <div className="cyber-spinner-sm" />
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
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Reformat
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
