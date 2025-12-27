/**
 * Replacements Store Module
 *
 * Manages word replacement rules for automatic text correction during transcription.
 * Supports case-sensitive/insensitive matching and whole-word replacement.
 *
 * @module store/replacements
 */

import Store from 'electron-store'
import { getUserDataPath } from '../config/app-config'

/**
 * Word replacement rule
 *
 * @interface WordReplacement
 */
export interface WordReplacement {
  /** Unique ID */
  id: string
  /** Text to find */
  from: string
  /** Replacement text */
  to: string
  /** Whether matching is case-sensitive */
  caseSensitive: boolean
  /** Whether to match whole words only */
  wholeWord: boolean
  /** Whether this rule is enabled */
  enabled: boolean
}

interface ReplacementsStore {
  replacements: WordReplacement[]
}

const store = new Store<ReplacementsStore>({
  defaults: {
    replacements: [],
  },
  encryptionKey: 'elevenlabs-transcription-secure-key',
  cwd: getUserDataPath(),
})

/**
 * Gets all word replacement rules
 *
 * @returns {WordReplacement[]} Array of replacement rules
 */
export function getReplacements(): WordReplacement[] {
  return store.get('replacements') || []
}

/**
 * Adds a new word replacement rule
 *
 * @param {WordReplacement} replacement - Replacement rule to add
 */
export function addReplacement(replacement: WordReplacement): void {
  const replacements = store.get('replacements') || []
  store.set('replacements', [...replacements, replacement])
}

/**
 * Updates an existing replacement rule
 *
 * @param {string} id - Rule ID
 * @param {Partial<WordReplacement>} updates - Fields to update
 */
export function updateReplacement(id: string, updates: Partial<WordReplacement>): void {
  const replacements = store.get('replacements') || []
  store.set(
    'replacements',
    replacements.map((r) => (r.id === id ? { ...r, ...updates } : r))
  )
}

/**
 * Deletes a replacement rule
 *
 * @param {string} id - Rule ID to delete
 */
export function deleteReplacement(id: string): void {
  const replacements = store.get('replacements') || []
  store.set(
    'replacements',
    replacements.filter((r) => r.id !== id)
  )
}

/**
 * Applies all enabled replacement rules to text
 *
 * @param {string} text - Text to process
 * @returns {string} Text with replacements applied
 */
export function applyReplacements(text: string): string {
  const replacements = store.get('replacements') || []
  let result = text

  for (const replacement of replacements) {
    if (!replacement.enabled) continue

    let pattern: RegExp
    const flags = replacement.caseSensitive ? 'g' : 'gi'

    if (replacement.wholeWord) {
      pattern = new RegExp(`\\b${escapeRegex(replacement.from)}\\b`, flags)
    } else {
      pattern = new RegExp(escapeRegex(replacement.from), flags)
    }

    result = result.replace(pattern, replacement.to)
  }

  return result
}

/**
 * Escapes special regex characters
 *
 * @private
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
