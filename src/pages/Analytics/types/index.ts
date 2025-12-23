/**
 * Analytics Page Type Definitions
 */

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface DataPoint {
  date: string
  value: number
}

export interface AnalyticsData {
  words: DataPoint[]
  sessions: DataPoint[]
  timeSpent: DataPoint[]
}

export interface DateRangePreset {
  value: TimeRange
  label: string
}
