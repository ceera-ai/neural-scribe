/**
 * SessionsChart Component
 *
 * Displays sessions completed over time as a bar chart
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DataPoint } from '../types'
import styles from './SessionsChart.module.css'

interface SessionsChartProps {
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
        <p className={styles.tooltipValue}>
          {payload[0].value} {payload[0].value === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    )
  }
  return null
}

export function SessionsChart({ data }: SessionsChartProps) {
  // Check if there's any data
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0)

  if (!hasData) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📅 Sessions Completed</h3>
        <div className={styles.emptyState}>
          <p>No sessions in this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📅 Sessions Completed</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
