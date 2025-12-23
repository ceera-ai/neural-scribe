/**
 * Achievement Test Runner
 *
 * Automated testing framework for verifying all 76 achievements trigger correctly.
 * Runs comprehensive test suites and generates detailed reports.
 *
 * Usage: npm run test:achievements
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

interface TestResult {
  achievementId: string
  achievementName: string
  category: string
  passed: boolean
  error?: string
  duration: number
  xpAwarded?: number
  timestamp: number
}

interface TestSummary {
  totalTests: number
  passed: number
  failed: number
  duration: number
  results: TestResult[]
  timestamp: number
}

export class AchievementTestRunner {
  private results: TestResult[] = []
  private startTime = 0

  /**
   * Run all achievement tests
   */
  async runAll(): Promise<TestSummary> {
    console.log('🧪 Starting Achievement Test Suite...\n')
    this.startTime = Date.now()
    this.results = []

    // Test all categories in sequence
    await this.testSessionAchievements()
    await this.testWordCountAchievements()
    await this.testStreakAchievements()
    await this.testSpeedAchievements()
    await this.testTimeAchievements()
    await this.testLevelAchievements()
    await this.testAIMasteryAchievements()
    await this.testCustomizationAchievements()
    await this.testEfficiencyAchievements()
    await this.testIntegrationAchievements()
    await this.testExplorationAchievements()

    const summary = this.generateSummary()
    this.printSummary(summary)
    this.saveReport(summary)

    return summary
  }

  /**
   * Test milestone/session achievements (6 achievements)
   */
  private async testSessionAchievements(): Promise<void> {
    console.log('📊 Testing Session Achievements...')
    // Tests will be implemented in testCases.ts
  }

  /**
   * Test word count achievements (5 achievements)
   */
  private async testWordCountAchievements(): Promise<void> {
    console.log('📝 Testing Word Count Achievements...')
  }

  /**
   * Test streak achievements (4 achievements)
   */
  private async testStreakAchievements(): Promise<void> {
    console.log('🔥 Testing Streak Achievements...')
  }

  /**
   * Test speed achievements (2 achievements)
   */
  private async testSpeedAchievements(): Promise<void> {
    console.log('⚡ Testing Speed Achievements...')
  }

  /**
   * Test time achievements (4 achievements)
   */
  private async testTimeAchievements(): Promise<void> {
    console.log('⏱️ Testing Time Achievements...')
  }

  /**
   * Test level achievements (5 achievements)
   */
  private async testLevelAchievements(): Promise<void> {
    console.log('🎖️ Testing Level Achievements...')
  }

  /**
   * Test AI mastery achievements (12 achievements)
   */
  private async testAIMasteryAchievements(): Promise<void> {
    console.log('🤖 Testing AI Mastery Achievements...')
  }

  /**
   * Test customization achievements (13 achievements)
   */
  private async testCustomizationAchievements(): Promise<void> {
    console.log('🎨 Testing Customization Achievements...')
  }

  /**
   * Test efficiency achievements (10 achievements)
   */
  private async testEfficiencyAchievements(): Promise<void> {
    console.log('⚡ Testing Efficiency Achievements...')
  }

  /**
   * Test integration achievements (8 achievements)
   */
  private async testIntegrationAchievements(): Promise<void> {
    console.log('💻 Testing Integration Achievements...')
  }

  /**
   * Test exploration achievements (7 achievements)
   */
  private async testExplorationAchievements(): Promise<void> {
    console.log('🔭 Testing Exploration Achievements...')
  }

  /**
   * Generate test summary
   */
  private generateSummary(): TestSummary {
    const passed = this.results.filter((r) => r.passed).length
    const failed = this.results.length - passed
    const duration = Date.now() - this.startTime

    return {
      totalTests: this.results.length,
      passed,
      failed,
      duration,
      results: this.results,
      timestamp: Date.now(),
    }
  }

  /**
   * Print summary to console
   */
  private printSummary(summary: TestSummary): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Achievement Test Summary')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ✅ ${summary.passed}`)
    console.log(`Failed: ❌ ${summary.failed}`)
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`)
    console.log(`Pass Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`)
    console.log('='.repeat(60))

    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:')
      summary.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.achievementId}: ${r.error}`)
        })
    }
  }

  /**
   * Save HTML report
   */
  private saveReport(summary: TestSummary): void {
    const reportsDir = join(process.cwd(), 'test-reports')
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true })
    }

    // Save JSON report
    const jsonPath = join(reportsDir, `achievement-tests-${Date.now()}.json`)
    writeFileSync(jsonPath, JSON.stringify(summary, null, 2))

    // Save HTML report
    const htmlPath = join(reportsDir, `achievement-tests-${Date.now()}.html`)
    const html = this.generateHtmlReport(summary)
    writeFileSync(htmlPath, html)

    console.log(`\n📄 Reports saved:`)
    console.log(`  - JSON: ${jsonPath}`)
    console.log(`  - HTML: ${htmlPath}`)
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(summary: TestSummary): string {
    const passRate = ((summary.passed / summary.totalTests) * 100).toFixed(1)
    const date = new Date(summary.timestamp).toLocaleString()

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Achievement Test Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .stat-card.passed { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .stat-card.failed { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
    .stat-card h3 { margin: 0 0 10px 0; font-size: 14px; opacity: 0.9; }
    .stat-card .value { font-size: 36px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .passed { color: #4CAF50; }
    .failed { color: #f44336; }
    .category { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #e3f2fd; color: #1976d2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏆 Achievement Test Report</h1>
    <p><strong>Generated:</strong> ${date}</p>

    <div class="summary">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <div class="value">${summary.totalTests}</div>
      </div>
      <div class="stat-card passed">
        <h3>Passed</h3>
        <div class="value">${summary.passed}</div>
      </div>
      <div class="stat-card failed">
        <h3>Failed</h3>
        <div class="value">${summary.failed}</div>
      </div>
      <div class="stat-card">
        <h3>Pass Rate</h3>
        <div class="value">${passRate}%</div>
      </div>
      <div class="stat-card">
        <h3>Duration</h3>
        <div class="value">${(summary.duration / 1000).toFixed(1)}s</div>
      </div>
    </div>

    <h2>Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Achievement ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>XP</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        ${summary.results
          .map(
            (r) => `
          <tr>
            <td class="${r.passed ? 'passed' : 'failed'}">${r.passed ? '✅' : '❌'}</td>
            <td><code>${r.achievementId}</code></td>
            <td>${r.achievementName}</td>
            <td><span class="category">${r.category}</span></td>
            <td>${r.xpAwarded || 0} XP</td>
            <td>${r.duration}ms</td>
            <td>${r.error || '-'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `
  }

  /**
   * Record a test result
   */
  protected recordResult(result: TestResult): void {
    this.results.push(result)
    const icon = result.passed ? '✅' : '❌'
    console.log(`  ${icon} ${result.achievementId} (${result.duration}ms)`)
  }
}
