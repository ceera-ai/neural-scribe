import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Test Launch Mode Configuration
// ============================================================================
// This module provides test mode detection and configuration.
// It MUST NOT import any store modules to avoid circular dependencies.

/**
 * Detects if we're running in unit test environment (Vitest)
 */
const isUnitTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test'

/**
 * Detects if the app is running in test launch mode
 * Test mode uses a separate data directory to allow testing first-launch
 * experience without affecting real user data.
 */
export const isTestMode = process.env.TEST_LAUNCH === 'true'

// Initialize app name and test mode IMMEDIATELY when this module loads
// This ensures the correct userData path is set before any Store instances are created
console.log('[TestMode] TEST_LAUNCH env:', process.env.TEST_LAUNCH)
console.log('[TestMode] isTestMode:', isTestMode)

// IMPORTANT: Set app name BEFORE accessing userData path
// In dev mode, Electron uses "Electron" by default, which changes the data directory
// Skip this in unit test environment where Electron app is not available
if (!isUnitTest && app) {
  app.setName('Neural Scribe')
}

/**
 * Clears all data from a directory (non-recursively, files only)
 */
function clearDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    return
  }

  try {
    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isFile()) {
        fs.unlinkSync(filePath)
        console.log('[TestMode] Deleted:', file)
      } else if (stats.isDirectory()) {
        // Recursively delete directories
        fs.rmSync(filePath, { recursive: true, force: true })
        console.log('[TestMode] Deleted directory:', file)
      }
    }
    console.log('[TestMode] ✓ Test directory cleared')
  } catch (error) {
    console.error('[TestMode] Error clearing test directory:', error)
  }
}

if (!isUnitTest && app) {
  if (isTestMode) {
    // Use separate directory for test data
    const normalUserData = app.getPath('userData')
    const testUserData = normalUserData + '-test'

    console.log('[TestMode] BEFORE setting test path:')
    console.log('[TestMode]   Current userData:', app.getPath('userData'))

    app.setPath('userData', testUserData)

    console.log('[TestMode] AFTER setting test path:')
    console.log('[TestMode]   Test userData:', app.getPath('userData'))

    // Clear all test data on startup
    console.log('[TestMode] Clearing test data directory...')
    clearDirectory(testUserData)

    console.log('╔════════════════════════════════════════════════════════════════╗')
    console.log('║                     🧪 TEST LAUNCH MODE                        ║')
    console.log('╟────────────────────────────────────────────────────────────────╢')
    console.log('║  Using temporary test data directory:                         ║')
    console.log(`║  ${testUserData.padEnd(60)} ║`)
    console.log('║                                                                ║')
    console.log('║  Your real data is safe at:                                   ║')
    console.log(`║  ${normalUserData.padEnd(60)} ║`)
    console.log('║                                                                ║')
    console.log('║  Test data is cleared on each launch.                         ║')
    console.log('║  Changes in test mode will NOT affect your real data.         ║')
    console.log('╚════════════════════════════════════════════════════════════════╝')
  } else {
    console.log('📦 Normal launch mode - using real data directory')
    console.log('   App name:', app.getName())
    console.log('   Data location:', app.getPath('userData'))
  }
}

/**
 * Gets the appropriate user data directory based on test mode
 * Returns the current userData path (which has already been set correctly)
 */
export function getUserDataPath(): string {
  // In unit test environment, return a mock path
  if (isUnitTest || !app) {
    return path.join(process.cwd(), '.test-data')
  }
  return app.getPath('userData')
}
