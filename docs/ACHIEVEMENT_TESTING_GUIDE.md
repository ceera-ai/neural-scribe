# Achievement Testing Guide

Comprehensive guide for testing the gamification achievement system.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Architecture](#test-architecture)
- [Running Tests](#running-tests)
- [Understanding Reports](#understanding-reports)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)

## Overview

The achievement testing system validates all 76 achievements in the gamification system. It ensures:

✅ **Correctness**: Achievements unlock under the right conditions
✅ **Reliability**: No false positives or missed triggers
✅ **XP Accuracy**: Correct XP amounts are awarded
✅ **State Integrity**: Stats are tracked correctly
✅ **Regression Prevention**: Changes don't break existing achievements

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run all achievement tests
npm run test:achievements

# Fast mode (skips slow tests requiring 100+ iterations)
npm run test:achievements:fast

# Test specific category
npm run test:achievements -- --category=ai-mastery
npm run test:achievements -- --category=integration
npm run test:achievements -- --category=customization
```

## Test Architecture

### 1. Test Runner (`tests/achievements/testRunner.ts`)

Orchestrates test execution and generates reports.

**Key Features:**

- Runs tests sequentially to avoid race conditions
- Tracks pass/fail statistics
- Generates HTML and JSON reports
- Provides real-time console output

**Methods:**

```typescript
class AchievementTestRunner {
  async runAll(): Promise<TestSummary>
  private async testSessionAchievements()
  private async testAIMasteryAchievements()
  // ... category-specific test methods
}
```

### 2. Gamification Simulator (`tests/achievements/gamificationSimulator.ts`)

Provides programmatic access to the gamification system without running the full app.

**Key Features:**

- Isolated test environment
- Direct stats manipulation
- Achievement verification
- State inspection

**Core Methods:**

```typescript
class GamificationSimulator {
  // Session simulation
  async simulateSession(params: { words: number; durationMs: number })

  // AI formatting
  async simulateFormatting(model: 'sonnet' | 'opus' | 'haiku')
  async simulateReformatting(model)
  async simulateTitleGeneration()

  // Customization
  async simulateVoiceCommand(command: 'send' | 'clear' | 'cancel')
  async simulateAddReplacement()

  // Integration
  async simulateTerminalPaste(bundleId?: string)

  // Verification
  async isAchievementUnlocked(id: string): Promise<boolean>
  async getAchievementXP(id: string): Promise<number | null>
}
```

### 3. Test Cases (`tests/achievements/testCases.ts`)

Defines all achievement test scenarios organized by category.

**Test Case Structure:**

```typescript
interface AchievementTestCase {
  id: string // Achievement ID
  name: string // Human-readable name
  category: string // Category (ai-mastery, integration, etc.)
  expectedXP: number // Expected XP reward
  setup?: (sim) => Promise<void> // Optional setup
  execute: (sim) => Promise<string[]> // Trigger achievement
  verify: (sim, unlocked) => Promise<boolean> // Verify unlock
}
```

**Example:**

```typescript
{
  id: 'terminal-novice',
  name: 'Terminal Novice',
  category: 'integration',
  expectedXP: 50,
  execute: async (sim) => {
    return await sim.simulateTerminalPaste('com.apple.Terminal')
  },
  verify: async (sim, unlocked) => {
    return unlocked.includes('terminal-novice') &&
           await sim.isAchievementUnlocked('terminal-novice')
  }
}
```

## Running Tests

### Basic Execution

```bash
# Run all 76 tests
npm run test:achievements
```

**Output:**

```
🧪 Achievement Testing Suite

Testing all 76 achievements...

📊 Testing Session Achievements...
  ✅ first-steps (45ms)
  ✅ getting-started (523ms)
  ✅ regular-user (2145ms)

🤖 Testing AI Mastery Achievements...
  ✅ ai-assistant (156ms)
  ✅ model-curious (89ms)

...

=============================================================
📊 Test Summary
=============================================================
Total Tests: 76
Passed: ✅ 74
Failed: ❌ 2
Duration: 45.23s
Pass Rate: 97.4%
=============================================================

📄 Reports saved:
  - JSON: test-reports/achievement-tests-1703123456789.json
  - HTML: test-reports/achievement-tests-1703123456789.html
```

### Fast Mode

Skip tests that require 100+ iterations (useful for quick checks):

```bash
npm run test:achievements:fast
```

Skipped tests:

- `veteran` (500 sessions)
- `transcription-master` (1000 sessions)
- `claudes-partner` (1000 formatting operations)
- `formatting-pro` (100 formatting operations)
- `command-master` (50 voice commands)

### Category-Specific Testing

Test only achievements in a specific category:

```bash
# AI mastery achievements (12 tests)
npm run test:achievements -- --category=ai-mastery

# Integration achievements (8 tests)
npm run test:achievements -- --category=integration

# Customization achievements (13 tests)
npm run test:achievements -- --category=customization
```

**Available Categories:**

- `milestone` - Session count milestones (6)
- `words` - Word count achievements (5)
- `streak` - Consecutive day streaks (4)
- `speed` - Words per minute (2)
- `time` - Recording time (4)
- `level` - Level milestones (5)
- `ai-mastery` - AI formatting features (12)
- `customization` - Voice commands, replacements (13)
- `efficiency` - Keyboard shortcuts, history (10)
- `integration` - Terminal paste (8)
- `exploration` - Feature discovery (7)

## Understanding Reports

### JSON Report

Machine-readable format for CI/CD:

```json
{
  "totalTests": 76,
  "passed": 74,
  "failed": 2,
  "duration": 45234,
  "timestamp": 1703123456789,
  "results": [
    {
      "achievementId": "terminal-novice",
      "achievementName": "Terminal Novice",
      "category": "integration",
      "passed": true,
      "duration": 42,
      "xpAwarded": 50,
      "timestamp": 1703123456789
    },
    {
      "achievementId": "some-failed-test",
      "achievementName": "Some Failed Test",
      "category": "efficiency",
      "passed": false,
      "error": "Achievement did not unlock",
      "duration": 67,
      "timestamp": 1703123456789
    }
  ]
}
```

### HTML Report

Human-readable format with visual indicators:

**Features:**

- Color-coded pass/fail status (green/red)
- Pass rate percentage
- Duration tracking
- Detailed error messages
- Category grouping
- XP verification

**Report Location:**

```
test-reports/
  ├── achievement-tests-1703123456789.json
  └── achievement-tests-1703123456789.html  ← Open in browser
```

## Writing New Tests

### Step 1: Add Achievement Definition

First, add the achievement to `electron/main/gamification/achievementDefinitions.ts`:

```typescript
{
  id: 'pdf-export-master',
  name: 'PDF Export Master',
  description: 'Export 50 transcriptions to PDF',
  icon: '📄',
  xpReward: 200,
  category: 'efficiency',
  order: 11,
}
```

### Step 2: Add Achievement Checker

Add logic to check the achievement in `electron/main/store/gamification/achievementChecker.ts`:

```typescript
export function checkEfficiencyAchievements(
  stats: UserStats,
  achievements: AchievementsState
): string[] {
  const newlyUnlocked: string[] = []

  if (!stats.featureUsage) return newlyUnlocked

  const { pdfExportsCount } = stats.featureUsage

  if (pdfExportsCount >= 50 && !isAchievementUnlocked(achievements, 'pdf-export-master')) {
    newlyUnlocked.push('pdf-export-master')
  }

  return newlyUnlocked
}
```

### Step 3: Add Feature Tracking

Add tracking to `electron/main/store/gamification/featureTracking.ts`:

```typescript
export type FeatureType =
  | 'formatting-sonnet'
  // ... existing types
  | 'pdf-export' // NEW

function updateFeatureStats(stats, featureType, metadata, today) {
  switch (featureType) {
    // ... existing cases
    case 'pdf-export':
      featureUsage.pdfExportsCount++
      break
  }
}
```

### Step 4: Add IPC Handler

Track the feature in your IPC handler:

```typescript
ipcMain.handle('export-to-pdf', async (_, data) => {
  // ... export logic
  await trackFeatureAndNotify('pdf-export')
  return result
})
```

### Step 5: Add Simulator Method

Add method to `tests/achievements/gamificationSimulator.ts`:

```typescript
async simulatePdfExport(): Promise<string[]> {
  return trackFeatureUsage('pdf-export')
}
```

### Step 6: Add Test Case

Add test to `tests/achievements/testCases.ts`:

```typescript
export const efficiencyTestCases: AchievementTestCase[] = [
  // ... existing tests
  {
    id: 'pdf-export-master',
    name: 'PDF Export Master',
    category: 'efficiency',
    expectedXP: 200,
    execute: async (sim) => {
      let allUnlocked: string[] = []
      // Export 50 PDFs
      for (let i = 0; i < 50; i++) {
        const unlocked = await sim.simulatePdfExport()
        allUnlocked.push(...unlocked)
      }
      return allUnlocked
    },
    verify: async (sim, unlocked) => {
      return (
        unlocked.includes('pdf-export-master') &&
        (await sim.isAchievementUnlocked('pdf-export-master'))
      )
    },
  },
]
```

### Step 7: Run Tests

```bash
npm run test:achievements -- --category=efficiency
```

## Troubleshooting

### Test Fails: "Achievement did not unlock"

**Possible Causes:**

1. Achievement checker logic is incorrect
2. Feature tracking not called in IPC handler
3. Stats not being incremented properly
4. Achievement ID mismatch

**Debug Steps:**

```typescript
// Add logging to your test
execute: async (sim) => {
  const before = await sim.getState()
  console.log('Before:', before.stats.featureUsage)

  const unlocked = await sim.simulateAction()

  const after = await sim.getState()
  console.log('After:', after.stats.featureUsage)
  console.log('Unlocked:', unlocked)

  return unlocked
}
```

### Test Fails: "XP mismatch"

**Cause:** Expected XP doesn't match actual XP awarded

**Fix:** Update `expectedXP` in test case to match achievement definition:

```typescript
{
  id: 'my-achievement',
  expectedXP: 150,  // Must match xpReward in achievementDefinitions.ts
  // ...
}
```

### Tests Run Too Slowly

**Solutions:**

1. Use fast mode: `npm run test:achievements:fast`
2. Test specific category: `npm run test:achievements -- --category=integration`
3. Reduce iteration counts during development (restore before commit)

### State Pollution Between Tests

**Cause:** Previous test's state affects current test

**Fix:** Ensure `sim.reset()` is called before each test (already implemented in test runner)

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-achievements:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run achievement tests
        run: npm run test:achievements:fast

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: achievement-test-reports
          path: test-reports/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(
              fs.readFileSync('test-reports/achievement-tests-latest.json', 'utf8')
            );
            const body = `## Achievement Test Results

            - Total: ${report.totalTests}
            - Passed: ✅ ${report.passed}
            - Failed: ❌ ${report.failed}
            - Pass Rate: ${((report.passed / report.totalTests) * 100).toFixed(1)}%
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run achievement tests before commit
npm run test:achievements:fast

# If tests fail, prevent commit
if [ $? -ne 0 ]; then
  echo "❌ Achievement tests failed. Fix issues before committing."
  exit 1
fi
```

## Best Practices

### 1. Always Test After Changes

Run tests after modifying:

- Achievement definitions
- Achievement checker logic
- Feature tracking
- Stats updates

### 2. Keep Tests Fast

- Use `--fast` mode during development
- Only run full suite before releases
- Parallelize where possible (future enhancement)

### 3. Verify XP Rewards

Always check that:

```typescript
test.expectedXP === achievementDefinition.xpReward
```

### 4. Test Edge Cases

Consider:

- First occurrence (unlock immediately)
- Boundary conditions (exactly N occurrences)
- Already unlocked (no duplicate unlock)

### 5. Maintain Test Coverage

Every achievement MUST have a test. When adding a new achievement:

1. Add achievement definition
2. Add achievement checker logic
3. Add feature tracking
4. **Add test case** ← Don't forget!
5. Run tests to verify

## Performance Optimization

### Current Performance

- Average test duration: ~0.5s per achievement
- Full suite (76 tests): ~45s
- Fast mode (60 tests): ~25s

### Future Improvements

- [ ] Parallel test execution (estimated 10x speedup)
- [ ] Mocked store operations (estimated 5x speedup)
- [ ] Test result caching (skip unchanged tests)

## Support

For questions or issues:

1. Check this guide
2. Review test code comments
3. Consult `tests/achievements/README.md`
4. Ask the development team

## Changelog

### Version 1.0.0 (2025-01-XX)

- Initial test suite implementation
- 76 achievement tests
- HTML and JSON report generation
- Category filtering
- Fast mode support
