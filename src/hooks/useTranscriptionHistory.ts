import { useState, useEffect, useCallback } from 'react';
import type { TranscriptionRecord, FormattedVersion } from '../types/electron';

interface SaveTranscriptionOptions {
  originalText?: string;
  formattedText?: string;
  title?: string;
  duration?: number;
}

interface UseTranscriptionHistoryReturn {
  history: TranscriptionRecord[];
  saveTranscription: (text: string, duration?: number) => Promise<void>;
  saveTranscriptionWithFormatting: (options: SaveTranscriptionOptions) => Promise<void>;
  updateTranscription: (record: TranscriptionRecord) => Promise<void>;
  deleteTranscription: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  copyTranscription: (text: string) => Promise<void>;
  pasteTranscription: (text: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export const useTranscriptionHistory = (): UseTranscriptionHistoryReturn => {
  const [history, setHistory] = useState<TranscriptionRecord[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const records = await window.electronAPI.getHistory();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  const saveTranscription = useCallback(async (text: string, duration: number = 0) => {
    if (!text.trim()) return;

    const record: TranscriptionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: text.trim(),
      timestamp: Date.now(),
      wordCount: text.trim().split(/\s+/).length,
      duration,
    };

    try {
      await window.electronAPI.saveTranscription(record);
      setHistory(prev => [record, ...prev]);
    } catch (err) {
      console.error('Failed to save transcription:', err);
    }
  }, []);

  const saveTranscriptionWithFormatting = useCallback(async (options: SaveTranscriptionOptions) => {
    const { originalText, formattedText, title, duration = 0 } = options;

    // Need at least one text
    if (!originalText?.trim() && !formattedText?.trim()) return;

    const primaryText = formattedText?.trim() || originalText?.trim() || '';
    const wasFormatted = !!(formattedText && originalText && formattedText !== originalText);
    const timestamp = Date.now();

    // Create formattedVersions array if formatting was applied
    let formattedVersions: FormattedVersion[] | undefined;
    if (wasFormatted && formattedText) {
      formattedVersions = [{
        id: `${timestamp}-${Math.random().toString(36).substring(2, 11)}`,
        text: formattedText.trim(),
        timestamp,
        sourceVersion: 'original',
      }];
    }

    const record: TranscriptionRecord = {
      id: `${timestamp}-${Math.random().toString(36).substring(2, 11)}`,
      text: primaryText,
      originalText: originalText?.trim(),
      formattedText: wasFormatted ? formattedText?.trim() : undefined, // Keep for backward compatibility
      formattedVersions,
      wasFormatted,
      title: title?.trim() || undefined,
      timestamp,
      wordCount: primaryText.split(/\s+/).length,
      duration,
    };

    try {
      await window.electronAPI.saveTranscription(record);
      setHistory(prev => [record, ...prev]);
    } catch (err) {
      console.error('Failed to save transcription:', err);
    }
  }, []);

  const updateTranscription = useCallback(async (record: TranscriptionRecord) => {
    try {
      await window.electronAPI.saveTranscription(record);
      setHistory(prev => prev.map(r => r.id === record.id ? record : r));
    } catch (err) {
      console.error('Failed to update transcription:', err);
    }
  }, []);

  const deleteTranscription = useCallback(async (id: string) => {
    try {
      await window.electronAPI.deleteTranscription(id);
      setHistory(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete transcription:', err);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await window.electronAPI.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, []);

  const copyTranscription = useCallback(async (text: string) => {
    try {
      await window.electronAPI.copyToClipboard(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const pasteTranscription = useCallback(async (text: string) => {
    try {
      // For now, just copy to clipboard
      // The user can then paste manually
      await window.electronAPI.copyToClipboard(text);
    } catch (err) {
      console.error('Failed to paste transcription:', err);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  // Load history on mount and listen for changes
  useEffect(() => {
    loadHistory();

    // Listen for history changes from main process
    window.electronAPI.onHistoryChanged(() => {
      loadHistory();
    });

    return () => {
      window.electronAPI.removeAllListeners('history-changed');
    };
  }, [loadHistory]);

  return {
    history,
    saveTranscription,
    saveTranscriptionWithFormatting,
    updateTranscription,
    deleteTranscription,
    clearHistory,
    copyTranscription,
    pasteTranscription,
    refreshHistory,
  };
};
