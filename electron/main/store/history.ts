/**
 * History Store Module
 *
 * Manages transcription history including save, retrieve, delete, and search operations.
 * Automatically enforces history limits and supports multiple formatted versions per record.
 *
 * @module store/history
 */

import Store from 'electron-store'
import { getHistoryLimit } from './settings'

/**
 * Formatted version of a transcription
 *
 * Tracks different formatted versions of the same transcription, allowing users
 * to reformat text with different instructions while preserving the original.
 *
 * @interface FormattedVersion
 */
export interface FormattedVersion {
  /** Unique ID for this formatted version */
  id: string
  /** Formatted text content */
  text: string
  /** When this version was created (Unix timestamp) */
  timestamp: number
  /** Source version ID ('original' or another version ID) */
  sourceVersion: 'original' | string
  /** Custom instructions used for this formatting (if any) */
  customInstructions?: string
}

/**
 * Transcription record
 *
 * Represents a single transcription session with original text, formatted versions,
 * metadata, and session statistics.
 *
 * @interface TranscriptionRecord
 */
export interface TranscriptionRecord {
  /** Unique record ID (UUID) */
  id: string
  /** Primary text (most recent formatted version or original) */
  text: string
  /** Raw transcription before any formatting */
  originalText?: string
  /** Legacy: first formatted version (kept for backward compatibility) */
  formattedText?: string
  /** Array of all formatted versions */
  formattedVersions?: FormattedVersion[]
  /** Whether any formatting was applied */
  wasFormatted?: boolean
  /** AI-generated short title/summary */
  title?: string
  /** When this record was created (Unix timestamp) */
  timestamp: number
  /** Number of words in transcription */
  wordCount: number
  /** Recording duration in seconds */
  duration: number
}

/**
 * Internal store schema for history
 *
 * @private
 */
interface HistoryStore {
  history: TranscriptionRecord[]
}

const store = new Store<HistoryStore>({
  defaults: {
    history: [],
  },
  encryptionKey: 'elevenlabs-transcription-secure-key',
})

// ============================================================================
// History Retrieval
// ============================================================================

/**
 * Retrieves all transcription records
 *
 * Records are returned in reverse chronological order (newest first).
 *
 * @returns {TranscriptionRecord[]} Array of transcription records
 *
 * @example
 * ```typescript
 * const history = getHistory()
 * console.log(`Total transcriptions: ${history.length}`)
 *
 * // Most recent transcription
 * const latest = history[0]
 * ```
 */
export function getHistory(): TranscriptionRecord[] {
  return store.get('history')
}

/**
 * Retrieves the most recent transcription record
 *
 * @returns {TranscriptionRecord | null} Most recent record or null if history is empty
 *
 * @example
 * ```typescript
 * const last = getLastTranscription()
 * if (last) {
 *   console.log(`Last transcription: "${last.text}"`)
 * }
 * ```
 */
export function getLastTranscription(): TranscriptionRecord | null {
  const history = store.get('history')
  return history.length > 0 ? history[0] : null
}

/**
 * Searches history for records matching a query
 *
 * Searches in record text, title, and original text fields (case-insensitive).
 *
 * @param {string} query - Search query
 * @returns {TranscriptionRecord[]} Matching records
 *
 * @example
 * ```typescript
 * const results = searchHistory('docker')
 * console.log(`Found ${results.length} records containing "docker"`)
 * ```
 */
export function searchHistory(query: string): TranscriptionRecord[] {
  const history = getHistory()
  const lowerQuery = query.toLowerCase()

  return history.filter((record) => {
    return (
      record.text.toLowerCase().includes(lowerQuery) ||
      record.title?.toLowerCase().includes(lowerQuery) ||
      record.originalText?.toLowerCase().includes(lowerQuery)
    )
  })
}

/**
 * Finds a transcription record by ID
 *
 * @param {string} id - Record ID
 * @returns {TranscriptionRecord | null} Record if found, null otherwise
 *
 * @example
 * ```typescript
 * const record = findTranscriptionById('uuid-123')
 * if (record) {
 *   console.log(record.text)
 * }
 * ```
 */
export function findTranscriptionById(id: string): TranscriptionRecord | null {
  const history = getHistory()
  return history.find((r) => r.id === id) || null
}

// ============================================================================
// History Modification
// ============================================================================

/**
 * Saves a transcription record to history
 *
 * If a record with the same ID exists, it will be updated in place.
 * Otherwise, the record is added to the beginning of the history.
 *
 * History limit (from settings) is automatically enforced for new records.
 *
 * @param {TranscriptionRecord} record - Record to save
 *
 * @example
 * ```typescript
 * const record: TranscriptionRecord = {
 *   id: crypto.randomUUID(),
 *   text: 'npm install express',
 *   originalText: 'install express',
 *   timestamp: Date.now(),
 *   wordCount: 3,
 *   duration: 2.5,
 *   wasFormatted: true,
 *   title: 'Install Express'
 * }
 *
 * saveTranscription(record)
 * ```
 */
export function saveTranscription(record: TranscriptionRecord): void {
  const history = store.get('history')

  // Check if this is an update to an existing record
  const existingIndex = history.findIndex((r) => r.id === record.id)
  let updated: TranscriptionRecord[]

  if (existingIndex >= 0) {
    // Update existing record in place
    updated = [...history]
    updated[existingIndex] = record
  } else {
    // Add new record at the beginning
    const limit = getHistoryLimit()
    const newHistory = [record, ...history]
    // Apply limit only if it's greater than 0 (0 = no limit)
    updated = limit > 0 ? newHistory.slice(0, limit) : newHistory
  }

  store.set('history', updated)
}

/**
 * Updates an existing transcription record
 *
 * Only updates if a record with the given ID exists.
 * For partial updates, use this instead of saveTranscription.
 *
 * @param {string} id - Record ID
 * @param {Partial<TranscriptionRecord>} updates - Fields to update
 * @returns {boolean} True if record was found and updated
 *
 * @example
 * ```typescript
 * // Add a title to an existing record
 * updateTranscription('uuid-123', {
 *   title: 'Install Dependencies'
 * })
 *
 * // Add a new formatted version
 * updateTranscription('uuid-123', {
 *   formattedVersions: [
 *     ...record.formattedVersions,
 *     {
 *       id: crypto.randomUUID(),
 *       text: 'npm install express cors',
 *       timestamp: Date.now(),
 *       sourceVersion: 'original'
 *     }
 *   ]
 * })
 * ```
 */
export function updateTranscription(id: string, updates: Partial<TranscriptionRecord>): boolean {
  const history = store.get('history')
  const index = history.findIndex((r) => r.id === id)

  if (index < 0) {
    return false
  }

  const updated = [...history]
  updated[index] = { ...updated[index], ...updates }
  store.set('history', updated)

  return true
}

/**
 * Deletes a transcription record by ID
 *
 * @param {string} id - Record ID to delete
 * @returns {boolean} True if record was found and deleted
 *
 * @example
 * ```typescript
 * const deleted = deleteTranscription('uuid-123')
 * if (deleted) {
 *   console.log('Record deleted successfully')
 * }
 * ```
 */
export function deleteTranscription(id: string): boolean {
  const history = store.get('history')
  const initialLength = history.length
  const filtered = history.filter((r) => r.id !== id)

  if (filtered.length === initialLength) {
    return false // Record not found
  }

  store.set('history', filtered)
  return true
}

/**
 * Deletes multiple transcription records by ID
 *
 * @param {string[]} ids - Array of record IDs to delete
 * @returns {number} Number of records actually deleted
 *
 * @example
 * ```typescript
 * const deletedCount = deleteTranscriptions(['uuid-1', 'uuid-2', 'uuid-3'])
 * console.log(`Deleted ${deletedCount} records`)
 * ```
 */
export function deleteTranscriptions(ids: string[]): number {
  const history = store.get('history')
  const idsSet = new Set(ids)
  const initialLength = history.length
  const filtered = history.filter((r) => !idsSet.has(r.id))

  store.set('history', filtered)
  return initialLength - filtered.length
}

/**
 * Clears all transcription history
 *
 * @warning This operation cannot be undone
 *
 * @example
 * ```typescript
 * clearHistory()
 * console.log('All history cleared')
 * ```
 */
export function clearHistory(): void {
  store.set('history', [])
}

// ============================================================================
// History Statistics
// ============================================================================

/**
 * Gets history statistics
 *
 * @returns Statistics object with counts and totals
 *
 * @example
 * ```typescript
 * const stats = getHistoryStats()
 * console.log(`Total records: ${stats.totalRecords}`)
 * console.log(`Total words: ${stats.totalWords}`)
 * console.log(`Total duration: ${stats.totalDuration}s`)
 * ```
 */
export function getHistoryStats(): {
  totalRecords: number
  totalWords: number
  totalDuration: number
  formattedCount: number
  averageWordCount: number
  averageDuration: number
} {
  const history = getHistory()

  const totalRecords = history.length
  const totalWords = history.reduce((sum, r) => sum + r.wordCount, 0)
  const totalDuration = history.reduce((sum, r) => sum + r.duration, 0)
  const formattedCount = history.filter((r) => r.wasFormatted).length

  return {
    totalRecords,
    totalWords,
    totalDuration,
    formattedCount,
    averageWordCount: totalRecords > 0 ? totalWords / totalRecords : 0,
    averageDuration: totalRecords > 0 ? totalDuration / totalRecords : 0,
  }
}

/**
 * Gets recent transcriptions (last N records)
 *
 * @param {number} limit - Maximum number of records to return
 * @returns {TranscriptionRecord[]} Recent records
 *
 * @example
 * ```typescript
 * const recent = getRecentTranscriptions(10)
 * console.log(`Last 10 transcriptions:`)
 * recent.forEach(r => console.log(`- ${r.title || r.text.substring(0, 50)}`))
 * ```
 */
export function getRecentTranscriptions(limit: number): TranscriptionRecord[] {
  const history = getHistory()
  return history.slice(0, limit)
}

/**
 * Gets transcriptions within a date range
 *
 * @param {number} startDate - Start timestamp (Unix ms)
 * @param {number} endDate - End timestamp (Unix ms)
 * @returns {TranscriptionRecord[]} Records within range
 *
 * @example
 * ```typescript
 * const today = new Date().setHours(0, 0, 0, 0)
 * const tomorrow = today + 24 * 60 * 60 * 1000
 * const todaysRecords = getTranscriptionsByDateRange(today, tomorrow)
 * console.log(`Transcriptions today: ${todaysRecords.length}`)
 * ```
 */
export function getTranscriptionsByDateRange(
  startDate: number,
  endDate: number
): TranscriptionRecord[] {
  const history = getHistory()
  return history.filter((r) => r.timestamp >= startDate && r.timestamp <= endDate)
}
