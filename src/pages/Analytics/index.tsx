/**
 * Analytics Page
 *
 * Displays time-series analytics for transcription activity
 */

import { useState } from 'react'
import { DateRangeSelector } from './components/DateRangeSelector'
import { WordsChart } from './components/WordsChart'
import { SessionsChart } from './components/SessionsChart'
import { TimeSpentChart } from './components/TimeSpentChart'
import { useAnalyticsData } from './hooks/useAnalyticsData'
import { TimeRange } from './types'
import styles from './Analytics.module.css'

export function Analytics() {
  const [range, setRange] = useState<TimeRange>('week')
  const { data, loading, error } = useAnalyticsData(range)

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Failed to load analytics data</p>
          <p className={styles.errorDetail}>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <DateRangeSelector selected={range} onChange={setRange} />

      <div className={styles.chartsGrid}>
        <div className={styles.mainChart}>
          <WordsChart data={data?.words || []} />
        </div>

        <div className={styles.sideCharts}>
          <SessionsChart data={data?.sessions || []} />
          <TimeSpentChart data={data?.timeSpent || []} />
        </div>
      </div>
    </div>
  )
}
