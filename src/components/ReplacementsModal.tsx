/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react'
import type { WordReplacement } from '../types/electron'
import './ReplacementsModal.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface ReplacementsModalProps {
  isOpen: boolean
  onClose: () => void
  initialFromText?: string
}

export function ReplacementsModal({ isOpen, onClose, initialFromText }: ReplacementsModalProps) {
  const [replacements, setReplacements] = useState<WordReplacement[]>([])
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadReplacements()
      setNewFrom(initialFromText || '')
      setNewTo('')
      setSearchQuery('')
    }
  }, [isOpen, initialFromText])

  const loadReplacements = async () => {
    if (!isElectron) return

    setIsLoading(true)
    try {
      const data = await window.electronAPI.getReplacements()
      setReplacements(data)
    } catch (err) {
      console.error('Failed to load replacements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newFrom.trim() || !newTo.trim()) return
    if (!isElectron) return

    const replacement: WordReplacement = {
      id: Date.now().toString(),
      from: newFrom.trim(),
      to: newTo.trim(),
      caseSensitive: false,
      wholeWord: true,
      enabled: true,
    }

    await window.electronAPI.addReplacement(replacement)
    setReplacements([...replacements, replacement])
    setNewFrom('')
    setNewTo('')
    // Track word replacement added
    window.electronAPI.trackFeatureUsage('word-replacement-add')
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    if (!isElectron) return
    await window.electronAPI.updateReplacement(id, { enabled })
    setReplacements(replacements.map((r) => (r.id === id ? { ...r, enabled } : r)))
  }

  const handleDelete = async (id: string) => {
    if (!isElectron) return
    await window.electronAPI.deleteReplacement(id)
    setReplacements(replacements.filter((r) => r.id !== id))
  }

  const filteredReplacements = replacements.filter((r) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return r.from.toLowerCase().includes(query) || r.to.toLowerCase().includes(query)
  })

  const enabledCount = replacements.filter((r) => r.enabled).length

  if (!isOpen) return null

  return (
    <div className="cyber-modal-overlay" onClick={onClose}>
      <div className="cyber-replacements-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cyber-modal-header">
          <div className="modal-title-section">
            <h2>Word Replacements</h2>
            <span className="replacements-count">
              {enabledCount}/{replacements.length} active
            </span>
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

        {/* Add New Section */}
        <div className="replacements-add-section">
          <p className="section-description">Auto-correct misheard words after recording stops</p>
          <div className="add-replacement-row">
            <div className="input-group">
              <label className="input-label">Misheard</label>
              <input
                type="text"
                placeholder="e.g., claude"
                value={newFrom}
                onChange={(e) => setNewFrom(e.target.value)}
                className="cyber-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="arrow-divider">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className="input-group">
              <label className="input-label">Correct</label>
              <input
                type="text"
                placeholder="e.g., Claude"
                value={newTo}
                onChange={(e) => setNewTo(e.target.value)}
                className="cyber-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newFrom.trim() || !newTo.trim()}
              className="cyber-add-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Search */}
        {replacements.length > 5 && (
          <div className="replacements-search">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search replacements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-search-input"
            />
          </div>
        )}

        {/* Replacements List */}
        <div className="replacements-list-container">
          {isLoading ? (
            <div className="replacements-loading">
              <div className="cyber-spinner" />
              <span>Loading replacements...</span>
            </div>
          ) : filteredReplacements.length === 0 ? (
            <div className="replacements-empty">
              {searchQuery ? (
                <>
                  <span className="empty-icon">🔍</span>
                  <p>No matches found for "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <span className="empty-icon">📝</span>
                  <p>No word replacements yet</p>
                  <p className="empty-hint">Add commonly misheard words above</p>
                </>
              )}
            </div>
          ) : (
            <div className="replacements-list">
              {filteredReplacements.map((replacement) => (
                <div
                  key={replacement.id}
                  className={`replacement-card ${!replacement.enabled ? 'disabled' : ''}`}
                >
                  <label className="cyber-toggle-inline">
                    <input
                      type="checkbox"
                      checked={replacement.enabled}
                      onChange={(e) => handleToggle(replacement.id, e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>

                  <div className="replacement-content">
                    <span className="replacement-from">{replacement.from}</span>
                    <svg
                      className="replacement-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="replacement-to">{replacement.to}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(replacement.id)}
                    className="replacement-delete-btn"
                    title="Delete replacement"
                  >
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
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="replacements-footer">
          <span className="footer-tip">Tip: Use whole words for best results</span>
        </div>
      </div>
    </div>
  )
}
