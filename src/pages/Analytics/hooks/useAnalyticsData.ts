/**
 * useAnalyticsData Hook
 *
 * Fetches and manages analytics data from the main process
 */

import { useState, useEffect } from 'react'
import type { TimeRange, AnalyticsData, CustomDateRange } from '../types'

export function useAnalyticsData(
  range: TimeRange,
  offset: number = 0,
  customRange?: CustomDateRange
) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Calculate the actual date range based on preset and offset
        const dateRange = customRange || calculateDateRange(range, offset)

        const result = await window.electronAPI.getAnalyticsData(range, dateRange)

        setData(result as AnalyticsData)
      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range, offset, customRange])

  return { data, loading, error }
}

function calculateDateRange(range: TimeRange, offset: number): CustomDateRange {
  const now = new Date()
  let start: Date
  let end: Date

  switch (range) {
    case 'today':
      end = new Date(now)
      end.setDate(now.getDate() - offset)
      start = new Date(end)
      break
    case 'week':
      end = new Date(now)
      end.setDate(now.getDate() - offset * 7)
      start = new Date(end)
      start.setDate(end.getDate() - 6)
      break
    case 'month':
      end = new Date(now)
      end.setDate(now.getDate() - offset * 30)
      start = new Date(end)
      start.setDate(end.getDate() - 29)
      break
    case 'quarter':
      end = new Date(now)
      end.setMonth(now.getMonth() - offset * 3)
      start = new Date(end)
      start.setMonth(end.getMonth() - 3)
      break
    case 'year': {
      const year = now.getFullYear() - offset
      start = new Date(year, 0, 1)
      end = new Date(year, 11, 31)
      break
    }
    case 'all':
      start = new Date(0)
      end = now
      break
    default:
      start = now
      end = now
  }

  return { start, end }
}
