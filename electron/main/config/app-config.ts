import { app } from 'electron'

// ============================================================================
// Test Launch Mode Configuration
// ============================================================================
// This module provides test mode detection and configuration.
// It MUST NOT import any store modules to avoid circular dependencies.

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
// Use lowercase to match package.json name (maintains compatibility with existing data)
app.setName('neural-scribe')

if (isTestMode) {
  // Use separate directory for test data
  const normalUserData = app.getPath('userData')
  const testUserData = normalUserData + '-test'

  console.log('[TestMode] BEFORE setting test path:')
  console.log('[TestMode]   Current userData:', app.getPath('userData'))

  app.setPath('userData', testUserData)

  console.log('[TestMode] AFTER setting test path:')
  console.log('[TestMode]   Test userData:', app.getPath('userData'))

  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║                     🧪 TEST LAUNCH MODE                        ║')
  console.log('╟────────────────────────────────────────────────────────────────╢')
  console.log('║  Using temporary test data directory:                         ║')
  console.log(`║  ${testUserData.padEnd(60)} ║`)
  console.log('║                                                                ║')
  console.log('║  Your real data is safe at:                                   ║')
  console.log(`║  ${normalUserData.padEnd(60)} ║`)
  console.log('║                                                                ║')
  console.log('║  Changes in test mode will NOT affect your real data.         ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')
} else {
  console.log('📦 Normal launch mode - using real data directory')
  console.log('   App name:', app.getName())
  console.log('   Data location:', app.getPath('userData'))
}

/**
 * Gets the appropriate user data directory based on test mode
 * Returns the current userData path (which has already been set correctly)
 */
export function getUserDataPath(): string {
  return app.getPath('userData')
}
