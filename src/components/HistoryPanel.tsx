import { useMemo, useState } from 'react';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { HistoryDetailModal } from './HistoryDetailModal';
import { ReformatDialog } from './ReformatDialog';
import type { TranscriptionRecord, FormattedVersion } from '../types/electron';
import './HistoryPanel.css';

interface HistoryPanelProps {
  onSelectTranscription?: (text: string) => void;
}

interface DayGroup {
  dateKey: string;
  displayDate: string;
  records: TranscriptionRecord[];
  totalWords: number;
  totalDuration: number;
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDisplayDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (recordDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (recordDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function HistoryPanel({ onSelectTranscription }: HistoryPanelProps) {
  const {
    history,
    deleteTranscription,
    copyTranscription,
    clearHistory,
    updateTranscription,
  } = useTranscriptionHistory();

  // Track which records are showing original vs formatted
  const [showingOriginal, setShowingOriginal] = useState<Set<string>>(new Set());

  // Track selected record for detail modal
  const [selectedRecord, setSelectedRecord] = useState<TranscriptionRecord | null>(null);

  // Track record being reformatted
  const [reformatRecord, setReformatRecord] = useState<TranscriptionRecord | null>(null);

  // Group history by date
  const groupedHistory = useMemo((): DayGroup[] => {
    const groups = new Map<string, DayGroup>();

    for (const record of history) {
      const dateKey = getDateKey(record.timestamp);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          displayDate: getDisplayDate(record.timestamp),
          records: [],
          totalWords: 0,
          totalDuration: 0,
        });
      }

      const group = groups.get(dateKey)!;
      group.records.push(record);
      group.totalWords += record.wordCount;
      group.totalDuration += record.duration || 0;
    }

    return Array.from(groups.values());
  }, [history]);

  const getDisplayText = (record: TranscriptionRecord): string => {
    const isShowingOriginal = showingOriginal.has(record.id);
    if (isShowingOriginal && record.originalText) {
      return record.originalText;
    }
    return record.text;
  };

  const toggleVersion = (recordId: string) => {
    setShowingOriginal(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleCopy = async (record: TranscriptionRecord) => {
    await copyTranscription(getDisplayText(record));
  };

  const handleSelect = (record: TranscriptionRecord) => {
    // Open detail modal instead of directly loading to editor
    setSelectedRecord(record);
  };

  const handleLoadToEditor = (text: string) => {
    if (onSelectTranscription) {
      onSelectTranscription(text);
    }
  };

  const handleDelete = async (record: TranscriptionRecord) => {
    await deleteTranscription(record.id);
  };

  const handleDeleteFromModal = async () => {
    if (selectedRecord) {
      await deleteTranscription(selectedRecord.id);
      setSelectedRecord(null);
    }
  };

  const handleCopyText = async (text: string) => {
    await copyTranscription(text);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      await clearHistory();
    }
  };

  // Handle opening reformat dialog
  const handleStartReformat = (record: TranscriptionRecord) => {
    setSelectedRecord(null); // Close detail modal
    setReformatRecord(record);
  };

  // Handle the actual reformatting
  const handleDoReformat = async (sourceVersionId: string, customInstructions?: string) => {
    if (!reformatRecord) return;

    // Get the source text based on the selected version
    let sourceText: string;
    if (sourceVersionId === 'original') {
      sourceText = reformatRecord.originalText || reformatRecord.text;
    } else if (sourceVersionId === 'formatted-legacy') {
      sourceText = reformatRecord.formattedText || reformatRecord.text;
    } else {
      const version = reformatRecord.formattedVersions?.find(v => v.id === sourceVersionId);
      sourceText = version?.text || reformatRecord.text;
    }

    // Call the reformat API
    const result = await window.electronAPI.reformatText(sourceText, customInstructions);

    if (!result.success) {
      throw new Error(result.error || 'Formatting failed');
    }

    // Create new formatted version
    const newVersion: FormattedVersion = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: result.formatted,
      timestamp: Date.now(),
      sourceVersion: sourceVersionId,
      customInstructions: customInstructions,
    };

    // Update the record with the new version
    const updatedRecord: TranscriptionRecord = {
      ...reformatRecord,
      text: result.formatted, // Update primary text to latest formatted
      formattedVersions: [
        ...(reformatRecord.formattedVersions || []),
        newVersion,
      ],
      wasFormatted: true,
    };

    // If this is the first formatted version and we have legacy formattedText,
    // migrate it to formattedVersions
    if (!reformatRecord.formattedVersions && reformatRecord.formattedText) {
      updatedRecord.formattedVersions = [
        {
          id: 'formatted-legacy',
          text: reformatRecord.formattedText,
          timestamp: reformatRecord.timestamp,
          sourceVersion: 'original',
        },
        newVersion,
      ];
    }

    await updateTranscription(updatedRecord);
    setReformatRecord(null);
  };

  if (history.length === 0) {
    return (
      <div className="history-panel">
        <div className="history-header">
          <h3>History</h3>
        </div>
        <div className="history-empty">
          <p>No transcriptions yet</p>
          <p className="history-empty-hint">Your transcriptions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>History ({history.length})</h3>
        <button onClick={handleClearAll} className="history-clear-btn">
          Clear All
        </button>
      </div>
      <div className="history-list">
        {groupedHistory.map((group) => (
          <div key={group.dateKey} className="history-day-group">
            <div className="history-day-header">
              <span className="history-day-title">{group.displayDate}</span>
              <span className="history-day-summary">
                {group.totalWords} words
                {group.totalDuration > 0 && ` · ${formatDuration(group.totalDuration)}`}
              </span>
            </div>
            <div className="history-day-items">
              {group.records.map((record) => {
                const hasVersions = record.wasFormatted && record.originalText;
                const isShowingOriginal = showingOriginal.has(record.id);

                return (
                  <div key={record.id} className="history-item">
                    <div
                      className="history-content"
                      onClick={() => handleSelect(record)}
                      title="Click to view details"
                    >
                      {record.title ? (
                        <div className="history-title">{record.title}</div>
                      ) : (
                        <div className="history-preview">
                          {truncateText(getDisplayText(record), 100)}
                        </div>
                      )}
                      <div className="history-meta">
                        <span className="history-time">{formatTime(record.timestamp)}</span>
                        <span className="history-words">{record.wordCount} words</span>
                        {record.duration > 0 && (
                          <span className="history-duration">{formatDuration(record.duration)}</span>
                        )}
                        {hasVersions && (
                          <span className="history-formatted-badge">
                            {isShowingOriginal ? 'Original' : 'Formatted'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="history-actions">
                      {hasVersions && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVersion(record.id); }}
                          className="history-action-btn history-toggle-btn"
                          title={isShowingOriginal ? 'Show formatted' : 'Show original'}
                        >
                          {isShowingOriginal ? 'Formatted' : 'Original'}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(record)}
                        className="history-action-btn"
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="history-action-btn history-delete-btn"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedRecord && (
        <HistoryDetailModal
          record={selectedRecord}
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          onLoadToEditor={handleLoadToEditor}
          onCopy={handleCopyText}
          onDelete={handleDeleteFromModal}
          onReformat={handleStartReformat}
        />
      )}

      {reformatRecord && (
        <ReformatDialog
          record={reformatRecord}
          isOpen={true}
          onClose={() => setReformatRecord(null)}
          onReformat={handleDoReformat}
        />
      )}
    </div>
  );
}
