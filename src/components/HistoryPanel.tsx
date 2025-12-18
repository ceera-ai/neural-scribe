import { useMemo } from 'react';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import type { TranscriptionRecord } from '../types/electron';
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
    clearHistory
  } = useTranscriptionHistory();

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

  const handleCopy = async (record: TranscriptionRecord) => {
    await copyTranscription(record.text);
  };

  const handleSelect = (record: TranscriptionRecord) => {
    if (onSelectTranscription) {
      onSelectTranscription(record.text);
    }
  };

  const handleDelete = async (record: TranscriptionRecord) => {
    await deleteTranscription(record.id);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      await clearHistory();
    }
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
              {group.records.map((record) => (
                <div key={record.id} className="history-item">
                  <div
                    className="history-content"
                    onClick={() => handleSelect(record)}
                    title="Click to load into editor"
                  >
                    <div className="history-preview">
                      {truncateText(record.text, 100)}
                    </div>
                    <div className="history-meta">
                      <span className="history-time">{formatTime(record.timestamp)}</span>
                      <span className="history-words">{record.wordCount} words</span>
                      {record.duration > 0 && (
                        <span className="history-duration">{formatDuration(record.duration)}</span>
                      )}
                    </div>
                  </div>
                  <div className="history-actions">
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
