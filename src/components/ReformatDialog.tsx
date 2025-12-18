import { useState, useMemo } from 'react';
import type { TranscriptionRecord, FormattedVersion } from '../types/electron';
import { DictateButton } from './DictateButton';
import './ReformatDialog.css';

interface ReformatDialogProps {
  record: TranscriptionRecord;
  isOpen: boolean;
  onClose: () => void;
  onReformat: (sourceVersionId: string, customInstructions?: string) => Promise<void>;
}

type SourceOption = {
  id: string;
  label: string;
  text: string;
  timestamp?: number;
};

function formatShortTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ReformatDialog({
  record,
  isOpen,
  onClose,
  onReformat,
}: ReformatDialogProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('original');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationBaseText, setDictationBaseText] = useState(''); // Text before dictation started
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build source options
  const sourceOptions = useMemo<SourceOption[]>(() => {
    const options: SourceOption[] = [];

    // Original always first
    const originalText = record.originalText || record.text;
    options.push({
      id: 'original',
      label: 'Original Transcription',
      text: originalText,
    });

    // Add formatted versions
    if (record.formattedVersions && record.formattedVersions.length > 0) {
      const sortedVersions = [...record.formattedVersions].sort((a, b) => b.timestamp - a.timestamp);
      sortedVersions.forEach((version, index) => {
        const label = version.customInstructions
          ? `Custom Format ${sortedVersions.length - index}`
          : index === 0
          ? 'Latest Formatted'
          : `Formatted Version ${sortedVersions.length - index}`;
        options.push({
          id: version.id,
          label,
          text: version.text,
          timestamp: version.timestamp,
        });
      });
    } else if (record.wasFormatted && record.formattedText) {
      // Legacy formatted version
      options.push({
        id: 'formatted-legacy',
        label: 'Formatted Version',
        text: record.formattedText,
      });
    }

    return options;
  }, [record]);

  const selectedSource = sourceOptions.find(o => o.id === selectedSourceId) || sourceOptions[0];

  if (!isOpen) return null;

  const handleReformat = async () => {
    setIsFormatting(true);
    setError(null);
    try {
      await onReformat(selectedSourceId, customInstructions.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formatting failed');
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="modal-overlay reformat-overlay" onClick={onClose}>
      <div className="reformat-dialog" onClick={e => e.stopPropagation()}>
        <div className="reformat-header">
          <h2>Reformat Transcription</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="reformat-body">
          {/* Source Selection */}
          <div className="reformat-section">
            <label className="reformat-label">Source Version</label>
            <p className="reformat-hint">Choose which version to use as the starting point for reformatting.</p>
            <div className="source-options">
              {sourceOptions.map(option => (
                <button
                  key={option.id}
                  className={`source-option ${selectedSourceId === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSourceId(option.id)}
                >
                  <div className="source-option-header">
                    <span className="source-option-icon">{option.id === 'original' ? '📝' : '✨'}</span>
                    <span className="source-option-label">{option.label}</span>
                  </div>
                  {option.timestamp && (
                    <span className="source-option-time">{formatShortTime(option.timestamp)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Source Preview */}
          <div className="reformat-section">
            <label className="reformat-label">Source Text Preview</label>
            <div className="source-preview">
              {selectedSource.text.length > 300
                ? selectedSource.text.slice(0, 300) + '...'
                : selectedSource.text}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="reformat-section">
            <div className="reformat-label-row">
              <label className="reformat-label">
                Custom Instructions <span className="optional-badge">(optional)</span>
              </label>
              <DictateButton
                onRecordingChange={(recording) => {
                  if (recording) {
                    // Recording started - save current text as base
                    setIsDictating(true);
                    setDictationBaseText(customInstructions);
                  } else {
                    // Recording stopped - make editable
                    setIsDictating(false);
                  }
                }}
                onPartialTranscript={(text) => {
                  // Show real-time dictation combined with existing text
                  const separator = dictationBaseText ? ' ' : '';
                  setCustomInstructions(dictationBaseText + separator + text);
                }}
                onFinalTranscript={(text) => {
                  // Finalize the dictation
                  const separator = dictationBaseText ? ' ' : '';
                  setCustomInstructions(dictationBaseText + separator + text);
                  setDictationBaseText('');
                }}
                disabled={isFormatting}
              />
            </div>
            <p className="reformat-hint">
              Add specific instructions for this reformat. Leave empty to use the default formatting instructions.
            </p>
            <textarea
              className={`reformat-instructions ${isDictating ? 'dictating' : ''}`}
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="e.g., Make it more formal, Add bullet points, Summarize in 3 sentences..."
              rows={3}
              readOnly={isDictating}
            />
          </div>

          {error && (
            <div className="reformat-error">
              {error}
            </div>
          )}
        </div>

        <div className="reformat-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isFormatting}>
            Cancel
          </button>
          <button
            className="btn-do-reformat"
            onClick={handleReformat}
            disabled={isFormatting}
          >
            {isFormatting ? (
              <>
                <span className="reformat-spinner" />
                Formatting...
              </>
            ) : (
              '✨ Reformat'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
