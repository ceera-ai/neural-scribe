/**
 * Voice Commands Store Module
 *
 * Manages voice command trigger phrases for controlling transcription sessions.
 * Supports built-in and custom triggers for send, clear, and cancel commands.
 *
 * @module store/voice-commands
 */

import Store from 'electron-store'
import { getUserDataPath } from '../config/app-config'

/**
 * Voice command trigger
 *
 * @interface VoiceCommandTrigger
 */
export interface VoiceCommandTrigger {
  /** Unique ID */
  id: string
  /** Trigger phrase (e.g., "send it") */
  phrase: string
  /** Command type */
  command: 'send' | 'clear' | 'cancel'
  /** Whether this trigger is enabled */
  enabled: boolean
  /** Whether this is a custom user-added trigger */
  isCustom: boolean
}

/**
 * Default built-in voice command triggers
 */
const DEFAULT_VOICE_COMMAND_TRIGGERS: VoiceCommandTrigger[] = [
  // Send commands
  { id: 'send-1', phrase: 'send it', command: 'send', enabled: true, isCustom: false },
  { id: 'send-2', phrase: 'send this', command: 'send', enabled: true, isCustom: false },
  { id: 'send-3', phrase: 'paste it', command: 'send', enabled: true, isCustom: false },
  { id: 'send-4', phrase: 'paste this', command: 'send', enabled: true, isCustom: false },
  { id: 'send-5', phrase: 'submit', command: 'send', enabled: true, isCustom: false },
  { id: 'send-6', phrase: 'go ahead', command: 'send', enabled: false, isCustom: false },
  { id: 'send-7', phrase: 'execute', command: 'send', enabled: false, isCustom: false },
  // Clear commands
  { id: 'clear-1', phrase: 'clear it', command: 'clear', enabled: true, isCustom: false },
  { id: 'clear-2', phrase: 'clear this', command: 'clear', enabled: true, isCustom: false },
  { id: 'clear-3', phrase: 'start over', command: 'clear', enabled: true, isCustom: false },
  // Cancel commands
  { id: 'cancel-1', phrase: 'cancel', command: 'cancel', enabled: true, isCustom: false },
  { id: 'cancel-2', phrase: 'never mind', command: 'cancel', enabled: true, isCustom: false },
]

interface VoiceCommandsStore {
  voiceCommandTriggers: VoiceCommandTrigger[]
}

const store = new Store<VoiceCommandsStore>({
  defaults: {
    voiceCommandTriggers: DEFAULT_VOICE_COMMAND_TRIGGERS,
  },
  encryptionKey: 'elevenlabs-transcription-secure-key',
  cwd: getUserDataPath(),
})

/**
 * Gets all voice command triggers
 *
 * If no triggers exist (first run or after reset), returns default triggers.
 *
 * @returns {VoiceCommandTrigger[]} Array of voice command triggers
 */
export function getVoiceCommandTriggers(): VoiceCommandTrigger[] {
  const triggers = store.get('voiceCommandTriggers')
  if (!triggers || triggers.length === 0) {
    store.set('voiceCommandTriggers', DEFAULT_VOICE_COMMAND_TRIGGERS)
    return DEFAULT_VOICE_COMMAND_TRIGGERS
  }
  return triggers
}

/**
 * Updates an existing voice command trigger
 *
 * @param {string} id - Trigger ID
 * @param {Partial<VoiceCommandTrigger>} updates - Fields to update
 */
export function updateVoiceCommandTrigger(id: string, updates: Partial<VoiceCommandTrigger>): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set(
    'voiceCommandTriggers',
    triggers.map((t) => (t.id === id ? { ...t, ...updates } : t))
  )
}

/**
 * Adds a new custom voice command trigger
 *
 * @param {VoiceCommandTrigger} trigger - Trigger to add
 */
export function addVoiceCommandTrigger(trigger: VoiceCommandTrigger): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set('voiceCommandTriggers', [...triggers, trigger])
}

/**
 * Deletes a voice command trigger
 *
 * @param {string} id - Trigger ID to delete
 */
export function deleteVoiceCommandTrigger(id: string): void {
  const triggers = store.get('voiceCommandTriggers') || []
  store.set(
    'voiceCommandTriggers',
    triggers.filter((t) => t.id !== id)
  )
}

/**
 * Resets all voice command triggers to defaults
 *
 * Removes all custom triggers and restores built-in triggers.
 */
export function resetVoiceCommandTriggers(): void {
  store.set('voiceCommandTriggers', DEFAULT_VOICE_COMMAND_TRIGGERS)
}

/**
 * Gets enabled voice command phrases grouped by command type
 *
 * @returns Object with arrays of enabled phrases for each command type
 */
export function getEnabledVoiceCommands(): {
  send: string[]
  clear: string[]
  cancel: string[]
} {
  const triggers = getVoiceCommandTriggers()
  return {
    send: triggers.filter((t) => t.command === 'send' && t.enabled).map((t) => t.phrase),
    clear: triggers.filter((t) => t.command === 'clear' && t.enabled).map((t) => t.phrase),
    cancel: triggers.filter((t) => t.command === 'cancel' && t.enabled).map((t) => t.phrase),
  }
}
