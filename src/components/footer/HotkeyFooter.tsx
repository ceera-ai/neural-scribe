import { FC } from 'react'
import './HotkeyFooter.css'

interface HotkeyFooterProps {
  recordHotkey: string
  pasteHotkey: string
  formattingEnabled: boolean
  formattingOverride: boolean | null
  voiceCommandsEnabled: boolean
  onFormattingChange: (enabled: boolean) => Promise<void>
  onVoiceCommandsChange: (enabled: boolean) => Promise<void>
}

export const HotkeyFooter: FC<HotkeyFooterProps> = ({
  recordHotkey,
  pasteHotkey,
  formattingEnabled,
  formattingOverride,
  voiceCommandsEnabled,
  onFormattingChange,
  onVoiceCommandsChange,
}) => {
  // Determine effective formatting (override takes precedence)
  const effectiveFormatting = formattingOverride ?? formattingEnabled
  const hasOverride = formattingOverride !== null
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

  return (
    <div className="hotkey-bar cyber-hotkey-bar">
      <div className="hotkey-left">
        <span>
          <kbd className="cyber-kbd">{formatHotkeyForDisplay(recordHotkey)}</kbd> Toggle recording
        </span>
        <span>
          <kbd className="cyber-kbd">{formatHotkeyForDisplay(pasteHotkey)}</kbd> Copy last
        </span>
      </div>
      <div className="hotkey-right">
        <label
          className="footer-switch"
          title={
            hasOverride
              ? `AI formatting ${effectiveFormatting ? 'ON' : 'OFF'} (session override)`
              : formattingEnabled
                ? 'AI formatting enabled'
                : 'AI formatting disabled'
          }
          style={hasOverride ? { opacity: 0.7 } : undefined}
        >
          <span className="switch-label">
            Format{hasOverride && <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>*</span>}
          </span>
          <input
            type="checkbox"
            checked={formattingEnabled}
            onChange={(e) => onFormattingChange(e.target.checked)}
            disabled={hasOverride}
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
