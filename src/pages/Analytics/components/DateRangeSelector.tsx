/**
 * DateRangeSelector Component
 *
 * Allows users to select time range for analytics data
 */

import { TimeRange, DateRangePreset } from '../types'
import styles from './DateRangeSelector.module.css'

interface DateRangeSelectorProps {
  selected: TimeRange
  onChange: (range: TimeRange) => void
}

const PRESETS: DateRangePreset[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

export function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  const formatDateRange = (range: TimeRange): string => {
    const now = new Date()
    let start: Date

    switch (range) {
      case 'today':
        return now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      case 'week':
        start = new Date(now)
        start.setDate(now.getDate() - 6)
        break
      case 'month':
        start = new Date(now)
        start.setDate(now.getDate() - 29)
        break
      case 'quarter':
        start = new Date(now)
        start.setMonth(now.getMonth() - 3)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
        return 'All Time'
      default:
        return ''
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            className={`${styles.button} ${selected === preset.value ? styles.active : ''}`}
            onClick={() => onChange(preset.value)}
            aria-pressed={selected === preset.value}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className={styles.dateRange}>{formatDateRange(selected)}</div>
    </div>
  )
}
