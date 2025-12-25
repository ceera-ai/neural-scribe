/**
 * DateRangeSelector Component
 *
 * Allows users to select time range for analytics data
 */

import { useState } from 'react'
import type { TimeRange, DateRangePreset } from '../types'
import styles from './DateRangeSelector.module.css'

interface DateRangeSelectorProps {
  selected: TimeRange
  onChange: (range: TimeRange, customRange?: { start: Date; end: Date }) => void
  currentOffset?: number
  onOffsetChange?: (offset: number) => void
}

const PRESETS: DateRangePreset[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

export function DateRangeSelector({
  selected,
  onChange,
  currentOffset = 0,
  onOffsetChange,
}: DateRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const getDateRangeWithOffset = (range: TimeRange, offset: number) => {
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

  const formatDateRange = (range: TimeRange, offset: number = 0): string => {
    if (range === 'all') return 'All Time'

    const { start, end } = getDateRangeWithOffset(range, offset)

    if (range === 'today') {
      return start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const handlePrevious = () => {
    if (selected === 'all') return
    if (onOffsetChange) {
      onOffsetChange(currentOffset + 1)
    }
  }

  const handleNext = () => {
    if (selected === 'all' || currentOffset === 0) return
    if (onOffsetChange) {
      onOffsetChange(Math.max(0, currentOffset - 1))
    }
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart)
      const end = new Date(customEnd)
      onChange('custom', { start, end })
      setShowCustomPicker(false)
    }
  }

  const canNavigate = selected !== 'all'

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            className={`${styles.button} ${selected === preset.value ? styles.active : ''}`}
            onClick={() => {
              onChange(preset.value)
              if (onOffsetChange) onOffsetChange(0)
            }}
            aria-pressed={selected === preset.value}
          >
            {preset.label}
          </button>
        ))}
        <button
          className={`${styles.button} ${styles.customButton} ${selected === 'custom' ? styles.active : ''}`}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
        >
          Custom Range
        </button>
      </div>

      {showCustomPicker && (
        <div className={styles.customPicker}>
          <div className={styles.customInputs}>
            <div className={styles.inputGroup}>
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>
          <button
            className={styles.applyButton}
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
          >
            Apply
          </button>
        </div>
      )}

      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          disabled={!canNavigate}
          aria-label="Previous period"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.dateRange}>{formatDateRange(selected, currentOffset)}</div>
        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={!canNavigate || currentOffset === 0}
          aria-label="Next period"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
