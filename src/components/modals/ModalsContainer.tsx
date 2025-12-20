import { FC } from 'react'
import { SettingsModal } from '../SettingsModal'
import { ReplacementsModal } from '../ReplacementsModal'
import { GamificationModal } from '../gamification/GamificationModal'
import type { GamificationStats, UserLevel, XPProgress, Achievement } from '../../types/gamification'
import './ModalsContainer.css'

interface ModalsContainerProps {
  // Context menu state
  contextMenu: { x: number; y: number; text: string } | null
  onAddToReplacements: () => void

  // Settings modal
  showSettings: boolean
  onCloseSettings: () => void
  onOpenReplacements: () => void
  voiceCommandsEnabled: boolean
  onVoiceCommandsEnabledChange: (enabled: boolean) => void

  // Replacements modal
  showReplacements: boolean
  onCloseReplacements: () => void
  replacementInitialText: string | undefined

  // Gamification modal
  showGamification: boolean
  onCloseGamification: () => void
  stats: GamificationStats
  level: UserLevel
  xpProgress: XPProgress
  achievements: Achievement[]
}

/**
 * Container for all modal dialogs and context menus in the application
 *
 * @remarks
 * This component manages:
 * - Context menu for adding text to replacements
 * - Settings modal for app configuration
 * - Replacements modal for word/phrase substitutions
 * - Gamification modal for stats and achievements
 *
 * All modals are conditionally rendered based on their visibility state.
 */
export const ModalsContainer: FC<ModalsContainerProps> = ({
  contextMenu,
  onAddToReplacements,
  showSettings,
  onCloseSettings,
  onOpenReplacements,
  voiceCommandsEnabled,
  onVoiceCommandsEnabledChange,
  showReplacements,
  onCloseReplacements,
  replacementInitialText,
  showGamification,
  onCloseGamification,
  stats,
  level,
  xpProgress,
  achievements,
}) => {
  return (
    <>
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button onClick={onAddToReplacements} className="context-menu-item">
            Add "
            {contextMenu.text.length > 20
              ? contextMenu.text.slice(0, 20) + '...'
              : contextMenu.text}
            " to replacements
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={onCloseSettings}
        onOpenReplacements={onOpenReplacements}
        voiceCommandsEnabled={voiceCommandsEnabled}
        onVoiceCommandsEnabledChange={onVoiceCommandsEnabledChange}
      />

      {/* Replacements Modal */}
      <ReplacementsModal
        isOpen={showReplacements}
        onClose={onCloseReplacements}
        initialFromText={replacementInitialText}
      />

      {/* Gamification Stats Modal */}
      <GamificationModal
        isOpen={showGamification}
        onClose={onCloseGamification}
        stats={stats}
        level={level}
        xpProgress={xpProgress}
        achievements={achievements}
      />
    </>
  )
}
