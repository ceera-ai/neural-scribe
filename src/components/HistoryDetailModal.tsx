import { useState, useMemo } from 'react'
import type { TranscriptionRecord, FormattedVersion } from '../types/electron'
import './HistoryDetailModal.css'

interface HistoryDetailModalProps {
  record: TranscriptionRecord
  isOpen: boolean
  onClose: () => void
  onLoadToEditor: (text: string) => void
  onCopy: (text: string) => void
  onDelete: () => void
  onReformat?: (record: TranscriptionRecord) => void
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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

function formatDuration(seconds: number): string {
  if (seconds === 0) return ''
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

type VersionTab = {
  id: string
  label: string
  text: string
  isOriginal: boolean
  customInstructions?: string
  timestamp?: number
}

export function HistoryDetailModal({
  record,
  isOpen,
  onClose,
  onLoadToEditor,
  onCopy,
  onDelete,
  onReformat,
}: HistoryDetailModalProps) {
  const [copied, setCopied] = useState(false)

  const versionTabs = useMemo<VersionTab[]>(() => {
    const tabs: VersionTab[] = []

    const originalText = record.originalText || record.text
    tabs.push({
      id: 'original',
      label: 'Original',
      text: originalText,
      isOriginal: true,
    })

    if (record.formattedVersions && record.formattedVersions.length > 0) {
      const sortedVersions = [...record.formattedVersions].sort((a, b) => b.timestamp - a.timestamp)
      sortedVersions.forEach((version, index) => {
        const label = version.customInstructions
          ? `Custom ${sortedVersions.length - index}`
          : index === 0
            ? 'Latest'
            : `V${sortedVersions.length - index}`
        tabs.push({
          id: version.id,
          label,
          text: version.text,
          isOriginal: false,
          customInstructions: version.customInstructions,
          timestamp: version.timestamp,
        })
      })
    } else if (record.wasFormatted && record.formattedText) {
      tabs.push({
        id: 'formatted-legacy',
        label: 'Formatted',
        text: record.formattedText,
        isOriginal: false,
      })
    }

    return tabs
  }, [record])

  const [selectedTabId, setSelectedTabId] = useState<string>(() => {
    if (versionTabs.length > 1) {
      return versionTabs[1].id
    }
    return 'original'
  })

  const selectedTab = versionTabs.find((t) => t.id === selectedTabId) || versionTabs[0]

  if (!isOpen) return null

  const handleCopy = async (text: string) => {
    await onCopy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this transcription?')) {
      onDelete()
      onClose()
    }
  }

  const handleReformat = () => {
    if (onReformat) {
      onReformat(record)
    }
  }

  return (
    <div className="cyber-modal-overlay" onClick={onClose}>
      <div className="cyber-history-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-title-section">
            <h2>{record.title || 'Transcription'}</h2>
            <div className="detail-meta">
              <span className="meta-datetime">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDateTime(record.timestamp)}
              </span>
              {record.duration > 0 && (
                <span className="meta-duration">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDuration(record.duration)}
                </span>
              )}
            </div>
          </div>
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

        {/* Version Tabs */}
        {versionTabs.length > 1 && (
          <div className="version-tabs">
            {versionTabs.map((tab) => (
              <button
                key={tab.id}
                className={`version-tab ${selectedTabId === tab.id ? 'active' : ''} ${tab.isOriginal ? 'original' : 'formatted'}`}
                onClick={() => setSelectedTabId(tab.id)}
                title={tab.customInstructions ? `Custom: ${tab.customInstructions}` : undefined}
              >
                <span className="tab-icon">{tab.isOriginal ? '📝' : '✨'}</span>
                <span className="tab-label">{tab.label}</span>
                {tab.timestamp && !tab.isOriginal && (
                  <span className="tab-time">{formatShortTime(tab.timestamp)}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="detail-body">
          <div className="content-panel">
            <div className="content-header">
              <div className="content-header-left">
                <span
                  className={`content-type ${selectedTab.isOriginal ? 'original' : 'formatted'}`}
                >
                  {selectedTab.isOriginal ? 'Original Transcription' : 'Formatted Version'}
                </span>
                {selectedTab.customInstructions && (
                  <span className="custom-badge" title={selectedTab.customInstructions}>
                    Custom
                  </span>
                )}
              </div>
              <span className="word-count">{countWords(selectedTab.text)} words</span>
            </div>

            <div className="content-text">{selectedTab.text}</div>

            <div className="content-actions">
              <button className="cyber-btn copy-btn" onClick={() => handleCopy(selectedTab.text)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="cyber-btn primary load-btn"
                onClick={() => {
                  onLoadToEditor(selectedTab.text)
                  onClose()
                }}
              >
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
                Load to Editor
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="detail-footer">
          <button className="cyber-btn danger delete-btn" onClick={handleDelete}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
          <div className="footer-right">
            {onReformat && (
              <button className="cyber-btn accent reformat-btn" onClick={handleReformat}>
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
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
