/**
 * Analytics Page Type Definitions
 */

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom'

export interface CustomDateRange {
  start: Date
  end: Date
}

export interface DateRangeSelection {
  preset: TimeRange
  custom?: CustomDateRange
}

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
