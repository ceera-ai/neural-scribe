/**
 * TimeSpentChart Component
 *
 * Displays time spent transcribing over time as an area chart
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DataPoint } from '../types'
import styles from './TimeSpentChart.module.css'

interface TimeSpentChartProps {
  data: DataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { date: string }; value: number }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const minutes = payload[0].value
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    let timeStr
    if (hours > 0) {
      timeStr = `${hours}h ${mins}m`
    } else {
      timeStr = `${mins}m`
    }

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
        <p className={styles.tooltipValue}>{timeStr}</p>
      </div>
    )
  }
  return null
}

export function TimeSpentChart({ data }: TimeSpentChartProps) {
  // Check if there's any data
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0)

  if (!hasData) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>⏱️ Time Spent</h3>
        <div className={styles.emptyState}>
          <p>No time recorded in this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>⏱️ Time Spent</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorTime)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
