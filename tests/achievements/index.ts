/**
 * Achievement Testing Suite Entry Point
 *
 * Run all achievement tests and generate comprehensive reports.
 *
 * Usage:
 *   npm run test:achievements              # Run all tests
 *   npm run test:achievements -- --fast    # Skip slow tests
 *   npm run test:achievements -- --category=ai-mastery  # Test specific category
 */

import { AchievementTestRunner } from './testRunner'
import { GamificationSimulator } from './gamificationSimulator'
import { getAllTestCases, runTestCase, type AchievementTestCase } from './testCases'

/**
 * Main test execution
 */
async function main() {
  console.log('🧪 Achievement Testing Suite\n')
  console.log('Testing all 76 achievements...\n')

  const sim = new GamificationSimulator()
  const runner = new AchievementTestRunner()

  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    const fastMode = args.includes('--fast')
    const categoryArg = args.find((arg) => arg.startsWith('--category='))
    const category = categoryArg?.split('=')[1]

    // Get test cases
    let testCases = getAllTestCases()

    // Filter by category if specified
    if (category) {
      testCases = testCases.filter((tc) => tc.category === category)
      console.log(`🔍 Filtering tests for category: ${category}`)
      console.log(`Found ${testCases.length} test(s)\n`)
    }

    // Filter out slow tests in fast mode
    if (fastMode) {
      // Skip tests that require many iterations
      testCases = testCases.filter((tc) => {
        const slowTests = [
          'veteran',
          'transcription-master',
          'claudes-partner',
          'formatting-pro',
          'command-master',
        ]
        return !slowTests.includes(tc.id)
      })
      console.log(`⚡ Fast mode: Running ${testCases.length} tests (skipping slow tests)\n`)
    }

    // Run all test cases
    const results: Awaited<ReturnType<typeof runTestCase>>[] = []
    let passed = 0
    let failed = 0

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name} (${testCase.category})`)

      // Reset gamification state before each test
      await sim.reset()

      // Run test
      const result = await runTestCase(testCase, sim)
      results.push(result)

      // Track results
      if (result.passed) {
        passed++
        console.log(`   ✅ PASSED (${result.duration}ms)`)
        if (result.xpAwarded) {
          console.log(`   💎 XP Awarded: ${result.xpAwarded}`)
        }
      } else {
        failed++
        console.log(`   ❌ FAILED (${result.duration}ms)`)
        if (result.error) {
          console.log(`   ⚠️  Error: ${result.error}`)
        }
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))
    console.log(`Total: ${testCases.length}`)
    console.log(`Passed: ✅ ${passed}`)
    console.log(`Failed: ❌ ${failed}`)
    console.log(`Pass Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)
    console.log('='.repeat(60))

    // Cleanup
    await sim.cleanup()

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    await sim.cleanup()
    process.exit(1)
  }
}

// Run if executed directly (ES module check)
const isMainModule = import.meta.url === `file://${process.argv[1]}`

if (isMainModule) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main as runAchievementTests }
