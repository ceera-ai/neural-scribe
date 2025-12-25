# Achievement Testing Suite

Comprehensive automated testing framework for verifying all 76 gamification achievements.

## Overview

This test suite validates that:

- ✅ All achievements unlock under correct conditions
- ✅ XP is awarded correctly
- ✅ Achievement tracking is accurate
- ✅ No false positives or missed triggers

## Test Coverage

**76 Total Achievements** across 11 categories:

| Category      | Count | Examples                                           |
| ------------- | ----- | -------------------------------------------------- |
| Milestone     | 6     | First Steps, Regular User, Veteran                 |
| Words         | 5     | Wordsmith, Articulate, Orator                      |
| Streak        | 4     | Fire Starter, Week Warrior, Unstoppable            |
| Speed         | 2     | Lightning Fast, Speed Demon                        |
| Time          | 4     | Time Keeper, Marathon Runner                       |
| Level         | 5     | Level 5, Level 10, Level 25                        |
| AI Mastery    | 12    | AI Assistant, Model Curious, Formatting Pro        |
| Customization | 13    | Voice Commander, Word Smith, Replacement Architect |
| Efficiency    | 10    | Hotkey Hero, Shortcut Master, History Hunter       |
| Integration   | 8     | Terminal Novice, Multi-Terminal User               |
| Exploration   | 7     | Settings Explorer, Feature Discoverer              |

## Quick Start

```bash
# Run all tests
npm run test:achievements

# Fast mode (skip slow tests)
npm run test:achievements -- --fast

# Test specific category
npm run test:achievements -- --category=ai-mastery
npm run test:achievements -- --category=integration
npm run test:achievements -- --category=customization
```

## Test Architecture

### 1. Test Runner (`testRunner.ts`)

- Orchestrates test execution
- Generates HTML and JSON reports
- Provides real-time progress updates
- Calculates pass/fail statistics

### 2. Gamification Simulator (`gamificationSimulator.ts`)

- Simulates user actions programmatically
- Provides isolated test environment
- Tracks state changes
- Verifies achievement unlocking

### 3. Test Cases (`testCases.ts`)

- Defines all 76 achievement tests
- Organized by category
- Each test includes:
  - Setup phase (optional)
  - Execution phase (trigger conditions)
  - Verification phase (check unlocking)

### 4. Entry Point (`index.ts`)

- CLI interface
- Command-line argument parsing
- Test filtering and execution
- Result reporting

## Test Case Structure

Each achievement test follows this pattern:

```typescript
{
  id: 'terminal-novice',
  name: 'Terminal Novice',
  category: 'integration',
  expectedXP: 50,
  execute: async (sim) => {
    // Simulate the action that should unlock the achievement
    return await sim.simulateTerminalPaste('com.apple.Terminal')
  },
  verify: async (sim, unlocked) => {
    // Verify the achievement was actually unlocked
    return unlocked.includes('terminal-novice') &&
           await sim.isAchievementUnlocked('terminal-novice')
  }
}
```

## Available Simulators

The `GamificationSimulator` provides methods for:

**Session Actions:**

- `simulateSession(words, durationMs)` - Record transcription session

**AI Formatting:**

- `simulateFormatting(model)` - Use AI formatting
- `simulateReformatting(model)` - Reformat text
- `simulateTitleGeneration()` - Generate title
- `simulateCustomInstructionsChange()` - Change instructions

**Voice Commands:**

- `simulateVoiceCommand(command)` - Use voice command
- `simulateAddVoiceCommand()` - Add custom command
- `simulateVoiceTriggerModify()` - Modify trigger

**Word Replacements:**

- `simulateAddReplacement()` - Add replacement rule
- `simulateApplyReplacement()` - Apply replacements

**Terminal:**

- `simulateTerminalPaste(bundleId)` - Paste to terminal

**Shortcuts:**

- `simulateHotkeyChange()` - Change hotkey
- `simulatePasteHotkeyUse()` - Use paste hotkey
- `simulateRecordHotkeyUse()` - Use record hotkey

**Other:**

- `simulateHistorySearch()` - Search history
- `simulateSettingsChange()` - Change settings
- `simulateFeatureToggle()` - Toggle feature

## Reports

Tests generate two report types:

### 1. JSON Report (`test-reports/achievement-tests-*.json`)

Machine-readable format for CI/CD integration:

```json
{
  "totalTests": 76,
  "passed": 74,
  "failed": 2,
  "duration": 45623,
  "results": [...]
}
```

### 2. HTML Report (`test-reports/achievement-tests-*.html`)

Human-readable format with:

- Visual pass/fail indicators
- Detailed error messages
- Category breakdown
- Duration tracking
- XP verification

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Achievement Tests
  run: npm run test:achievements

- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: achievement-test-reports
    path: test-reports/
```

## Writing New Tests

To add a test for a new achievement:

1. **Add to `testCases.ts`:**

```typescript
export const newCategoryTestCases: AchievementTestCase[] = [
  {
    id: 'new-achievement',
    name: 'New Achievement',
    category: 'new-category',
    expectedXP: 100,
    execute: async (sim) => {
      // Trigger the achievement
      return await sim.simulateNewAction()
    },
    verify: async (sim, unlocked) => {
      // Verify it unlocked
      return unlocked.includes('new-achievement')
    },
  },
]
```

2. **Add simulator method if needed** (`gamificationSimulator.ts`):

```typescript
async simulateNewAction(): Promise<string[]> {
  return trackFeatureUsage('new-action-type')
}
```

3. **Export test cases** in `getAllTestCases()`:

```typescript
export function getAllTestCases(): AchievementTestCase[] {
  return [...existingCases, ...newCategoryTestCases]
}
```

## Troubleshooting

**Tests failing unexpectedly:**

- Check that gamification data is being reset between tests
- Verify achievement definitions match test expectations
- Review console output for detailed error messages

**Slow test execution:**

- Use `--fast` mode to skip tests requiring many iterations
- Consider parallelizing test execution (future enhancement)

**Simulator issues:**

- Ensure test store is properly isolated
- Verify all IPC handlers are properly mocked/stubbed

## Future Enhancements

- [ ] Parallel test execution
- [ ] Visual regression testing for achievement UI
- [ ] Performance benchmarking
- [ ] Flaky test detection
- [ ] Code coverage reporting
- [ ] Integration with GitHub Actions
- [ ] Automated screenshot capture
- [ ] Test result trending over time

## Contributing

When adding new achievements:

1. Add achievement definition to `achievementDefinitions.ts`
2. Add test case to appropriate category in `testCases.ts`
3. Run tests to verify: `npm run test:achievements`
4. Ensure pass rate remains 100%
