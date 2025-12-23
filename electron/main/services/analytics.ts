/**
 * Analytics Service
 *
 * Handles data aggregation for analytics dashboard.
 * Provides time-series data grouped by hour, day, week, or month.
 *
 * @module services/analytics
 */

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface TranscriptionRecord {
  id: string
  timestamp: number
  wordCount: number
  duration: number // in seconds
}

export interface AggregatedDataPoint {
  date: string
  words: number
  sessions: number
  timeSpent: number // in minutes
}

interface TimeBucket {
  start: Date
  end: Date
  granularity: 'hour' | 'day' | 'week' | 'month'
}

/**
 * Calculate time buckets for aggregation based on selected range
 *
 * @param range - The time range to generate buckets for
 * @returns Array of time buckets with start/end dates and granularity
 */
export function calculateBuckets(range: TimeRange): TimeBucket[] {
  const now = new Date()
  const buckets: TimeBucket[] = []

  switch (range) {
    case 'today': {
      // 24 hourly buckets for today
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      for (let i = 0; i < 24; i++) {
        const start = new Date(startOfDay)
        start.setHours(i, 0, 0, 0)
        const end = new Date(start)
        end.setHours(i + 1, 0, 0, 0)
        buckets.push({ start, end, granularity: 'hour' })
      }
      break
    }

    case 'week': {
      // 7 daily buckets for last 7 days
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        buckets.push({ start, end, granularity: 'day' })
      }
      break
    }

    case 'month': {
      // 30 daily buckets for last 30 days
      for (let i = 29; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        buckets.push({ start, end, granularity: 'day' })
      }
      break
    }

    case 'quarter': {
      // 12 weekly buckets for last quarter (12 weeks = ~3 months)
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i * 7)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        buckets.push({ start, end, granularity: 'week' })
      }
      break
    }

    case 'year': {
      // 12 monthly buckets for this year
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        buckets.push({ start, end, granularity: 'month' })
      }
      break
    }

    case 'all': {
      // Monthly buckets from beginning of time to now
      // We'll calculate this dynamically based on the oldest record
      // For now, default to 12 months
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        buckets.push({ start, end, granularity: 'month' })
      }
      break
    }
  }

  return buckets
}

/**
 * Format bucket label for display
 *
 * @param bucket - The time bucket to format
 * @returns Formatted label string
 */
export function formatBucketLabel(bucket: TimeBucket): string {
  const { start, granularity } = bucket

  switch (granularity) {
    case 'hour':
      return start.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    case 'day':
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'week': {
      const endOfWeek = new Date(start)
      endOfWeek.setDate(start.getDate() + 6)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    case 'month':
      return start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    default:
      return start.toLocaleDateString()
  }
}

/**
 * Aggregate transcription records into time buckets
 *
 * @param records - Array of transcription records to aggregate
 * @param buckets - Time buckets to group records into
 * @returns Array of aggregated data points
 */
export function aggregateData(
  records: TranscriptionRecord[],
  buckets: TimeBucket[]
): AggregatedDataPoint[] {
  return buckets.map((bucket) => {
    // Filter records that fall within this bucket
    const recordsInBucket = records.filter((record) => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= bucket.start && recordDate < bucket.end
    })

    // Calculate aggregates
    const words = recordsInBucket.reduce((sum, r) => sum + r.wordCount, 0)
    const sessions = recordsInBucket.length
    const timeSpent = recordsInBucket.reduce((sum, r) => sum + r.duration / 60, 0) // Convert seconds to minutes

    return {
      date: formatBucketLabel(bucket),
      words,
      sessions,
      timeSpent: Math.round(timeSpent),
    }
  })
}

/**
 * Calculate all-time buckets dynamically based on oldest record
 *
 * @param records - Array of transcription records
 * @returns Array of monthly buckets from first record to now
 */
export function calculateAllTimeBuckets(records: TranscriptionRecord[]): TimeBucket[] {
  if (records.length === 0) {
    // No records, return last 12 months
    return calculateBuckets('year')
  }

  // Find oldest record
  const oldestTimestamp = Math.min(...records.map((r) => r.timestamp))
  const oldestDate = new Date(oldestTimestamp)
  const now = new Date()

  // Generate monthly buckets from oldest to now
  const buckets: TimeBucket[] = []
  const currentDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1)

  while (currentDate <= now) {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    end.setMonth(end.getMonth() + 1)

    buckets.push({ start, end, granularity: 'month' })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return buckets
}

/**
 * Get analytics data for a specific time range
 *
 * @param records - All transcription records
 * @param range - Time range to aggregate for
 * @returns Aggregated data points for the range
 */
export function getAnalyticsData(
  records: TranscriptionRecord[],
  range: TimeRange
): AggregatedDataPoint[] {
  // For 'all' time, calculate buckets dynamically
  const buckets = range === 'all' ? calculateAllTimeBuckets(records) : calculateBuckets(range)

  return aggregateData(records, buckets)
}
