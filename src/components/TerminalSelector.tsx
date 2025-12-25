import { useState, useEffect, useCallback } from 'react'
import type { TerminalWindow } from '../types/electron'
import './TerminalSelector.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

interface TerminalSelectorProps {
  onPaste: (bundleId: string, windowName?: string) => void
  disabled?: boolean
}

export function TerminalSelector({ onPaste, disabled }: TerminalSelectorProps) {
  const [windows, setWindows] = useState<TerminalWindow[]>([])
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadWindows = useCallback(async () => {
    if (!isElectron) return

    setIsRefreshing(true)
    try {
      const terminalWindows = await window.electronAPI.getTerminalWindows()
      setWindows(terminalWindows)

      // Load saved selection or select first window
      const settings = await window.electronAPI.getSettings()
      if (settings.selectedTerminalId && terminalWindows.length > 0) {
        // Try to find the saved window (format: bundleId::windowName)
        const savedWindow = terminalWindows.find(
          (w) => `${w.bundleId}::${w.windowName}` === settings.selectedTerminalId
        )
        if (savedWindow) {
          setSelectedWindow(`${savedWindow.bundleId}::${savedWindow.windowName}`)
        } else {
          // Fall back to first window
          const first = terminalWindows[0]
          setSelectedWindow(`${first.bundleId}::${first.windowName}`)
        }
      } else if (terminalWindows.length > 0) {
        const first = terminalWindows[0]
        setSelectedWindow(`${first.bundleId}::${first.windowName}`)
      } else {
        setSelectedWindow(null)
      }
    } catch (err) {
      console.error('Failed to load terminal windows:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadWindows()
    // Refresh every 10 seconds
    const interval = setInterval(loadWindows, 10000)
    return () => clearInterval(interval)
  }, [loadWindows])

  const handleWindowChange = async (value: string) => {
    setSelectedWindow(value)
    if (isElectron) {
      await window.electronAPI.setSettings({ selectedTerminalId: value })
    }
  }

  const handlePaste = async () => {
    if (!selectedWindow) return

    // Split by :: to get bundleId and windowName
    const separatorIndex = selectedWindow.indexOf('::')
    if (separatorIndex === -1) return

    const bundleId = selectedWindow.substring(0, separatorIndex)
    const windowName = selectedWindow.substring(separatorIndex + 2)
    onPaste(bundleId, windowName)
  }

  return (
    <div className="terminal-selector">
      <div className="terminal-row">
        <div className="terminal-select-group">
          <label>Paste to:</label>
          <select
            value={selectedWindow || ''}
            onChange={(e) => handleWindowChange(e.target.value)}
            disabled={disabled || windows.length === 0}
            className="terminal-select"
          >
            {windows.length === 0 ? (
              <option value="">No terminal windows detected</option>
            ) : (
              windows.map((win) => (
                <option
                  key={`${win.bundleId}::${win.windowName}`}
                  value={`${win.bundleId}::${win.windowName}`}
                >
                  {win.displayName}
                </option>
              ))
            )}
          </select>
          <button
            onClick={loadWindows}
            className="terminal-refresh-btn"
            disabled={isRefreshing}
            title="Refresh window list"
          >
            {isRefreshing ? '...' : '↻'}
          </button>
        </div>
        <button
          onClick={handlePaste}
          disabled={disabled || !selectedWindow || windows.length === 0}
          className="terminal-paste-btn"
        >
          Paste to Terminal
        </button>
      </div>
    </div>
  )
}
