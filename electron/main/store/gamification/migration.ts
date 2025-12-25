/**
 * Gamification Data Migration Module
 *
 * Handles upgrading gamification data structures between versions.
 * Ensures backward compatibility for existing users.
 *
 * @module store/gamification/migration
 */

import { DEFAULT_FEATURE_USAGE, type UserStats } from './stats'
import type { GamificationData } from './index'

/**
 * Migrates gamification data from older versions to the current version
 *
 * @param {any} data - Raw gamification data from store
 * @returns {GamificationData} Migrated data compatible with current version
 *
 * @example
 * ```typescript
 * const rawData = store.get('gamification')
 * const migratedData = migrateGamificationData(rawData)
 * // Now safe to use with current code
 * ```
 */
export function migrateGamificationData(data: any): GamificationData {
  if (!data || typeof data !== 'object') {
    throw new Error('[Migration] Invalid gamification data')
  }

  const version = data.version || '1.0'

  switch (version) {
    case '1.0':
      console.log('[Migration] Migrating gamification data from v1.0 to v2.0')
      return migrateFrom1_0To2_0(data)

    case '2.0':
      // Already current version, no migration needed
      return data as GamificationData

    default:
      console.warn(`[Migration] Unknown version ${version}, attempting to use as-is`)
      return data as GamificationData
  }
}

/**
 * Migrates data from version 1.0 to 2.0
 *
 * Changes in v2.0:
 * - Added featureUsage field to UserStats
 * - Updated version field to '2.0'
 *
 * @private
 */
function migrateFrom1_0To2_0(data: any): GamificationData {
  const migratedStats: UserStats = {
    ...data.stats,
    // Add new featureUsage field with default values
    featureUsage: DEFAULT_FEATURE_USAGE,
  }

  const migratedData: GamificationData = {
    ...data,
    version: '2.0',
    stats: migratedStats,
  }

  console.log('[Migration] Successfully migrated to v2.0')
  console.log('[Migration] Added feature usage tracking')

  return migratedData
}

/**
 * Checks if data needs migration
 *
 * @param {any} data - Raw gamification data
 * @returns {boolean} True if migration is needed
 */
export function needsMigration(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false
  }

  const version = data.version || '1.0'
  return version !== '2.0'
}

/**
 * Gets the version of gamification data
 *
 * @param {any} data - Raw gamification data
 * @returns {string} Version string
 */
export function getDataVersion(data: any): string {
  if (!data || typeof data !== 'object') {
    return 'unknown'
  }

  return data.version || '1.0'
}
