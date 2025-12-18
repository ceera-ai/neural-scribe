import { useState, useMemo } from 'react';
import type { TranscriptionRecord, FormattedVersion } from '../types/electron';
import './HistoryDetailModal.css';

interface HistoryDetailModalProps {
  record: TranscriptionRecord;
  isOpen: boolean;
  onClose: () => void;
  onLoadToEditor: (text: string) => void;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onReformat?: (record: TranscriptionRecord) => void;
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

type VersionTab = {
  id: string;
  label: string;
  text: string;
  isOriginal: boolean;
  customInstructions?: string;
  timestamp?: number;
};

export function HistoryDetailModal({
  record,
  isOpen,
  onClose,
  onLoadToEditor,
  onCopy,
  onDelete,
  onReformat,
}: HistoryDetailModalProps) {
  const [copied, setCopied] = useState(false);

  // Build version tabs from record data
  const versionTabs = useMemo<VersionTab[]>(() => {
    const tabs: VersionTab[] = [];

    // Original transcription always first
    const originalText = record.originalText || record.text;
    tabs.push({
      id: 'original',
      label: 'Original',
      text: originalText,
      isOriginal: true,
    });

    // Add formatted versions if they exist
    if (record.formattedVersions && record.formattedVersions.length > 0) {
      // Sort by timestamp (newest first)
      const sortedVersions = [...record.formattedVersions].sort((a, b) => b.timestamp - a.timestamp);
      sortedVersions.forEach((version, index) => {
        const label = version.customInstructions
          ? `Custom ${sortedVersions.length - index}`
          : index === 0
          ? 'Latest'
          : `Version ${sortedVersions.length - index}`;
        tabs.push({
          id: version.id,
          label,
          text: version.text,
          isOriginal: false,
          customInstructions: version.customInstructions,
          timestamp: version.timestamp,
        });
      });
    } else if (record.wasFormatted && record.formattedText) {
      // Legacy: single formatted version
      tabs.push({
        id: 'formatted-legacy',
        label: 'Formatted',
        text: record.formattedText,
        isOriginal: false,
      });
    }

    return tabs;
  }, [record]);

  // Start with the most recent formatted version, or original if none
  const [selectedTabId, setSelectedTabId] = useState<string>(() => {
    if (versionTabs.length > 1) {
      return versionTabs[1].id; // First formatted version (after original)
    }
    return 'original';
  });

  const selectedTab = versionTabs.find(t => t.id === selectedTabId) || versionTabs[0];

  if (!isOpen) return null;

  const handleCopy = async (text: string) => {
    await onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this transcription?')) {
      onDelete();
      onClose();
    }
  };

  const handleReformat = () => {
    if (onReformat) {
      onReformat(record);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="history-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{record.title || 'Transcription Details'}</h2>
            <div className="modal-meta">
              <span>{formatDateTime(record.timestamp)}</span>
              {record.duration > 0 && (
                <span className="modal-duration">{formatDuration(record.duration)}</span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Version Tabs */}
        {versionTabs.length > 1 && (
          <div className="version-tabs">
            {versionTabs.map(tab => (
              <button
                key={tab.id}
                className={`version-tab ${selectedTabId === tab.id ? 'active' : ''} ${tab.isOriginal ? 'tab-original' : 'tab-formatted'}`}
                onClick={() => setSelectedTabId(tab.id)}
                title={tab.customInstructions ? `Custom: ${tab.customInstructions}` : undefined}
              >
                {tab.isOriginal ? '📝' : '✨'} {tab.label}
                {tab.timestamp && !tab.isOriginal && (
                  <span className="tab-time">{formatShortTime(tab.timestamp)}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="history-detail-body">
          <div className="version-panel-single">
            <div className="version-header">
              <div className="version-header-left">
                <h3>{selectedTab.isOriginal ? 'Original Transcription' : 'Formatted Version'}</h3>
                {selectedTab.customInstructions && (
                  <span className="custom-instructions-badge" title={selectedTab.customInstructions}>
                    Custom Instructions
                  </span>
                )}
              </div>
              <span className="version-word-count">{countWords(selectedTab.text)} words</span>
            </div>
            <div className="version-content">
              {selectedTab.text}
            </div>
            <div className="version-actions">
              <button
                className="btn-version-action"
                onClick={() => handleCopy(selectedTab.text)}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="btn-version-action btn-primary"
                onClick={() => { onLoadToEditor(selectedTab.text); onClose(); }}
              >
                Load to Editor
              </button>
            </div>
          </div>
        </div>

        <div className="history-detail-footer">
          <button className="btn-delete" onClick={handleDelete}>
            Delete
          </button>
          <div className="footer-right">
            {onReformat && (
              <button className="btn-reformat" onClick={handleReformat}>
                ✨ Reformat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
