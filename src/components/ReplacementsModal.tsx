import { useState, useEffect } from 'react';
import type { WordReplacement } from '../types/electron';
import './ReplacementsModal.css';

interface ReplacementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFromText?: string;
}

export function ReplacementsModal({ isOpen, onClose, initialFromText }: ReplacementsModalProps) {
  const [replacements, setReplacements] = useState<WordReplacement[]>([]);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load replacements on mount
  useEffect(() => {
    if (isOpen) {
      loadReplacements();
      // Set or clear the "from" field based on initialFromText
      setNewFrom(initialFromText || '');
      setNewTo('');
    }
  }, [isOpen, initialFromText]);

  const loadReplacements = async () => {
    setIsLoading(true);
    try {
      const data = await window.electronAPI.getReplacements();
      setReplacements(data);
    } catch (err) {
      console.error('Failed to load replacements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newFrom.trim() || !newTo.trim()) return;

    const replacement: WordReplacement = {
      id: Date.now().toString(),
      from: newFrom.trim(),
      to: newTo.trim(),
      caseSensitive: false,
      wholeWord: true,
      enabled: true
    };

    await window.electronAPI.addReplacement(replacement);
    setReplacements([...replacements, replacement]);
    setNewFrom('');
    setNewTo('');
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await window.electronAPI.updateReplacement(id, { enabled });
    setReplacements(replacements.map(r =>
      r.id === id ? { ...r, enabled } : r
    ));
  };

  const handleDelete = async (id: string) => {
    await window.electronAPI.deleteReplacement(id);
    setReplacements(replacements.filter(r => r.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Word Replacements</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Add words that are commonly misheard. They will be automatically corrected after recording stops.
          </p>

          {/* Add new replacement */}
          <div className="add-replacement-form">
            <input
              type="text"
              placeholder="From (misheard)"
              value={newFrom}
              onChange={e => setNewFrom(e.target.value)}
              className="replacement-input"
            />
            <span className="arrow">→</span>
            <input
              type="text"
              placeholder="To (correct)"
              value={newTo}
              onChange={e => setNewTo(e.target.value)}
              className="replacement-input"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newFrom.trim() || !newTo.trim()}
              className="add-btn"
            >
              Add
            </button>
          </div>

          {/* Replacements list */}
          <div className="replacements-list">
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : replacements.length === 0 ? (
              <div className="empty-state">
                No replacements yet. Add some common misheard words above.
              </div>
            ) : (
              replacements.map(replacement => (
                <div key={replacement.id} className={`replacement-item ${!replacement.enabled ? 'disabled' : ''}`}>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={replacement.enabled}
                      onChange={e => handleToggle(replacement.id, e.target.checked)}
                    />
                    <span className="replacement-text">
                      <span className="from">{replacement.from}</span>
                      <span className="arrow">→</span>
                      <span className="to">{replacement.to}</span>
                    </span>
                  </label>
                  <button
                    onClick={() => handleDelete(replacement.id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
