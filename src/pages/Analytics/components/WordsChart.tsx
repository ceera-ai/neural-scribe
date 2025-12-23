/**
 * WordsChart Component
 *
 * Displays words transcribed over time as a line chart
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DataPoint } from '../types'
import styles from './WordsChart.module.css'

interface WordsChartProps {
  data: DataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { date: string }; value: number }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
        <p className={styles.tooltipValue}>{payload[0].value.toLocaleString()} words</p>
      </div>
    )
  }
  return null
}

export function WordsChart({ data }: WordsChartProps) {
  // Check if there's any data
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0)

  if (!hasData) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📊 Words Transcribed</h3>
        <div className={styles.emptyState}>
          <p>No words transcribed in this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📊 Words Transcribed</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6' }}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#a78bfa', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
