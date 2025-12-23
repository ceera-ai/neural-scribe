import { FC } from 'react'
import './HotkeyFooter.css'

interface HotkeyFooterProps {
  recordHotkey: string
  pasteHotkey: string
  formattingEnabled: boolean
  voiceCommandsEnabled: boolean
  onFormattingChange: (enabled: boolean) => Promise<void>
  onVoiceCommandsChange: (enabled: boolean) => Promise<void>
}

export const HotkeyFooter: FC<HotkeyFooterProps> = ({
  recordHotkey,
  pasteHotkey,
  formattingEnabled,
  voiceCommandsEnabled,
  onFormattingChange,
  onVoiceCommandsChange,
}) => {
  const formatHotkeyForDisplay = (hotkey: string) => {
    return hotkey
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Option', '⌥')
      .replace(/\+/g, ' ')
      .trim()
  }

  const handleTestOverlay = async () => {
    await window.electronAPI.testShowComparisonOverlay()
  }

  return (
    <div className="hotkey-bar cyber-hotkey-bar">
      <div className="hotkey-left">
        <span>
          <kbd className="cyber-kbd">{formatHotkeyForDisplay(recordHotkey)}</kbd> Toggle recording
        </span>
        <span>
          <kbd className="cyber-kbd">{formatHotkeyForDisplay(pasteHotkey)}</kbd> Copy last
        </span>
        <button
          onClick={handleTestOverlay}
          className="test-overlay-btn"
          title="Test comparison overlay (select original or formatted)"
        >
          Test Comparison
        </button>
      </div>
      <div className="hotkey-right">
        <label
          className="footer-switch"
          title={formattingEnabled ? 'AI formatting enabled' : 'AI formatting disabled'}
        >
          <span className="switch-label">Format</span>
          <input
            type="checkbox"
            checked={formattingEnabled}
            onChange={(e) => onFormattingChange(e.target.checked)}
          />
          <span className="switch-track">
            <span className="switch-thumb"></span>
          </span>
        </label>
        <label
          className="footer-switch"
          title={voiceCommandsEnabled ? 'Voice commands enabled' : 'Voice commands disabled'}
        >
          <span className="switch-label">Voice</span>
          <input
            type="checkbox"
            checked={voiceCommandsEnabled}
            onChange={(e) => onVoiceCommandsChange(e.target.checked)}
          />
          <span className="switch-track">
            <span className="switch-thumb"></span>
          </span>
        </label>
      </div>
    </div>
  )
}
