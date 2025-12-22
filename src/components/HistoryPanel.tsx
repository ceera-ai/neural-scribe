import { useMemo, useState } from 'react'
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory'
import { HistoryDetailModal } from './HistoryDetailModal'
import { ReformatDialog } from './ReformatDialog'
import type { TranscriptionRecord, FormattedVersion } from '../types/electron'
import './HistoryPanel.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface HistoryPanelProps {
  onSelectTranscription?: (text: string) => void
}

interface DayGroup {
  dateKey: string
  displayDate: string
  records: TranscriptionRecord[]
  totalWords: number
  totalDuration: number
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getDisplayDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (recordDate.getTime() === today.getTime()) {
    return 'Today'
  }
  if (recordDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) {
    return `${mins}m`
  }
  return `${mins}m ${secs}s`
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

const ITEMS_PER_PAGE = 10

export function HistoryPanel({ onSelectTranscription }: HistoryPanelProps) {
  const { history, deleteTranscription, copyTranscription, clearHistory, updateTranscription } =
    useTranscriptionHistory()

  const [showingOriginal, setShowingOriginal] = useState<Set<string>>(new Set())
  const [selectedRecord, setSelectedRecord] = useState<TranscriptionRecord | null>(null)
  const [reformatRecord, setReformatRecord] = useState<TranscriptionRecord | null>(null)
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE)

  const { groupedHistory, totalItems, hasMore } = useMemo(() => {
    const groups = new Map<string, DayGroup>()
    let itemCount = 0

    for (const record of history) {
      const dateKey = getDateKey(record.timestamp)

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          displayDate: getDisplayDate(record.timestamp),
          records: [],
          totalWords: 0,
          totalDuration: 0,
        })
      }

      const group = groups.get(dateKey)!

      // Only add records up to the display limit
      if (itemCount < displayLimit) {
        group.records.push(record)
        group.totalWords += record.wordCount
        group.totalDuration += record.duration || 0
      }
      itemCount++
    }

    // Filter out empty groups
    const filteredGroups = Array.from(groups.values()).filter((g) => g.records.length > 0)

    return {
      groupedHistory: filteredGroups,
      totalItems: history.length,
      hasMore: displayLimit < history.length,
    }
  }, [history, displayLimit])

  const getDisplayText = (record: TranscriptionRecord): string => {
    const isShowingOriginal = showingOriginal.has(record.id)
    if (isShowingOriginal && record.originalText) {
      return record.originalText
    }
    return record.text
  }

  const toggleVersion = (recordId: string) => {
    setShowingOriginal((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

  const handleCopy = async (record: TranscriptionRecord) => {
    await copyTranscription(getDisplayText(record))
  }

  const handleSelect = (record: TranscriptionRecord) => {
    setSelectedRecord(record)
  }

  const handleLoadToEditor = (text: string) => {
    if (onSelectTranscription) {
      onSelectTranscription(text)
    }
  }

  const handleDelete = async (record: TranscriptionRecord) => {
    await deleteTranscription(record.id)
  }

  const handleDeleteFromModal = async () => {
    if (selectedRecord) {
      await deleteTranscription(selectedRecord.id)
      setSelectedRecord(null)
    }
  }

  const handleCopyText = async (text: string) => {
    await copyTranscription(text)
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      await clearHistory()
    }
  }

  const handleStartReformat = (record: TranscriptionRecord) => {
    setSelectedRecord(null)
    setReformatRecord(record)
  }

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)
  }

  const handleDoReformat = async (sourceVersionId: string, customInstructions?: string) => {
    if (!reformatRecord) return

    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    let sourceText: string
    if (sourceVersionId === 'original') {
      sourceText = reformatRecord.originalText || reformatRecord.text
    } else if (sourceVersionId === 'formatted-legacy') {
      sourceText = reformatRecord.formattedText || reformatRecord.text
    } else {
      const version = reformatRecord.formattedVersions?.find((v) => v.id === sourceVersionId)
      sourceText = version?.text || reformatRecord.text
    }

    const result = await window.electronAPI.reformatText(sourceText, customInstructions)

    if (!result.success) {
      throw new Error(result.error || 'Formatting failed')
    }

    const newVersion: FormattedVersion = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: result.formatted,
      timestamp: Date.now(),
      sourceVersion: sourceVersionId,
      customInstructions: customInstructions,
    }

    const updatedRecord: TranscriptionRecord = {
      ...reformatRecord,
      text: result.formatted,
      formattedVersions: [...(reformatRecord.formattedVersions || []), newVersion],
      wasFormatted: true,
    }

    if (!reformatRecord.formattedVersions && reformatRecord.formattedText) {
      updatedRecord.formattedVersions = [
        {
          id: 'formatted-legacy',
          text: reformatRecord.formattedText,
          timestamp: reformatRecord.timestamp,
          sourceVersion: 'original',
        },
        newVersion,
      ]
    }

    await updateTranscription(updatedRecord)
    setReformatRecord(null)
  }

  if (history.length === 0) {
    return (
      <div className="cyber-history-panel">
        <div className="history-header">
          <h3>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </h3>
        </div>
        <div className="history-empty">
          <div className="empty-orb">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 6v6l4 2" />
              <path d="M22 2L12 12" />
            </svg>
          </div>
          <p>No transcriptions yet</p>
          <p className="empty-hint">Your recordings will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-history-panel">
      <div className="history-header">
        <h3>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
          <span className="history-count">{history.length}</span>
        </h3>
        <button onClick={handleClearAll} className="clear-all-btn">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          Clear All
        </button>
      </div>

      <div className="history-list">
        {groupedHistory.map((group) => (
          <div key={group.dateKey} className="history-day-group">
            <div className="day-header">
              <span className="day-title">{group.displayDate}</span>
              <span className="day-stats">
                {group.totalWords.toLocaleString()} words
                {group.totalDuration > 0 && ` · ${formatDuration(group.totalDuration)}`}
              </span>
            </div>

            <div className="day-items">
              {group.records.map((record) => {
                const hasVersions = record.wasFormatted && record.originalText
                const isShowingOriginal = showingOriginal.has(record.id)

                return (
                  <div
                    key={record.id}
                    className="history-card"
                    onClick={() => handleSelect(record)}
                  >
                    <div className="card-content">
                      {record.title ? (
                        <div className="card-title">{record.title}</div>
                      ) : (
                        <div className="card-preview">
                          {truncateText(getDisplayText(record), 80)}
                        </div>
                      )}
                      <div className="card-meta">
                        <span className="meta-time">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatTime(record.timestamp)}
                        </span>
                        <span className="meta-words">{record.wordCount} words</span>
                        {record.duration > 0 && (
                          <span className="meta-duration">{formatDuration(record.duration)}</span>
                        )}
                        {hasVersions && (
                          <span
                            className={`version-badge ${isShowingOriginal ? 'original' : 'formatted'}`}
                          >
                            {isShowingOriginal ? 'Original' : 'Formatted'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      {hasVersions && (
                        <button
                          onClick={() => toggleVersion(record.id)}
                          className="action-btn toggle-btn"
                          title={isShowingOriginal ? 'Show formatted' : 'Show original'}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(record)}
                        className="action-btn copy-btn"
                        title="Copy to clipboard"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {hasMore && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Load More ({totalItems - displayLimit} remaining)
          </button>
        )}
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
  )
}
