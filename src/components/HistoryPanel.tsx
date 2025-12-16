import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import type { TranscriptionRecord } from '../types/electron';
import './HistoryPanel.css';

interface HistoryPanelProps {
  onSelectTranscription?: (text: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Different year
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
        {history.map((record) => (
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
                <span className="history-time">{formatDate(record.timestamp)}</span>
                <span className="history-words">{record.wordCount} words</span>
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
  );
}
