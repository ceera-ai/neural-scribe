/**
 * useAnalyticsData Hook
 *
 * Fetches and manages analytics data from the main process
 */

import { useState, useEffect } from 'react'
import { TimeRange, AnalyticsData } from '../types'

export function useAnalyticsData(range: TimeRange) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const result = await window.electronAPI.getAnalyticsData(range)

        setData(result as AnalyticsData)
      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range])

  return { data, loading, error }
}
