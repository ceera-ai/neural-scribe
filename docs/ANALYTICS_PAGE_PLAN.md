# Analytics Page Implementation Plan

**Feature:** Time-Series Analytics Dashboard
**Priority:** High
**Estimated Effort:** 3-5 days
**Target Release:** Next version

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Design & Wireframes](#design--wireframes)
4. [Technical Architecture](#technical-architecture)
5. [Data Aggregation Strategy](#data-aggregation-strategy)
6. [Component Structure](#component-structure)
7. [Implementation Plan](#implementation-plan)
8. [Mobile Responsiveness](#mobile-responsiveness)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### Goal

Add a third tab to the Stats & Progress modal called "Analytics" that displays time-series graphs showing transcription activity over various time periods.

### User Value

- **Visualize productivity patterns** over time
- **Identify peak usage periods** for better workflow planning
- **Track progress toward goals** with visual feedback
- **Understand transcription habits** through data-driven insights

### Key Features

- **Multiple metrics**: Words transcribed, sessions completed, time spent
- **Flexible time ranges**: Today, week, month, quarter, year, all-time
- **Interactive charts**: Hover tooltips, clickable data points, zoom/pan
- **Scrollable timeline**: Navigate through historical data
- **Mobile-optimized**: Responsive charts that work on all screen sizes

---

## Requirements

### Functional Requirements

#### FR-1: Time Range Selection

- User can select from preset ranges: Today, Last 7 Days, Last 30 Days, Last Quarter, This Year, All Time
- Selected range is highlighted visually
- Actual date range is displayed below buttons (e.g., "Dec 16 - Dec 23, 2025")
- Default selection is "Last 7 Days"

#### FR-2: Multiple Chart Display

- Display 3 separate charts in a grid layout:
  1. **Words Transcribed** (line chart)
  2. **Sessions Completed** (bar chart)
  3. **Time Spent** (area chart)
- Each chart shows data aggregated for the selected time range

#### FR-3: Data Aggregation

- **Today**: Hourly buckets (24 data points)
- **Last 7 Days**: Daily buckets (7 data points)
- **Last 30 Days**: Daily buckets (30 data points)
- **Last Quarter**: Weekly buckets (12-13 data points)
- **This Year**: Monthly buckets (12 data points)
- **All Time**: Monthly buckets (variable)

#### FR-4: Interactive Features

- **Hover tooltips** showing exact values and dates
- **Legend toggle** to show/hide metrics (if combined chart)
- **Empty state** when no data exists for selected range

#### FR-5: Performance

- Charts should render in < 300ms even with 365+ data points
- Smooth animations when changing time ranges
- No UI blocking during data aggregation

### Non-Functional Requirements

#### NFR-1: Responsive Design

- Desktop (> 1024px): 3-column grid
- Tablet (768-1024px): 2-column grid
- Mobile (< 768px): Single column, stacked charts

#### NFR-2: Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Sufficient color contrast (WCAG AA)
- Alternative text descriptions for chart data

#### NFR-3: Cyberpunk Theme

- Purple/indigo gradient colors (#6366f1, #8b5cf6)
- Dark backgrounds matching Stats tab
- Glow effects on hover
- Smooth transitions

---

## Design & Wireframes

### Desktop Layout (> 1024px)

```
┌───────────────────────────────────────────────────────────────┐
│  Stats & Progress Modal                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [Stats] [Achievements] [Analytics] ←  Tabs             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Date Range Selector                                    │  │
│  │  [Today] [Last 7 Days]* [Last 30 Days] [Quarter] [Year]│  │
│  │  Dec 16 - Dec 23, 2025                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │   📊 Words Transcribed                                  │ │
│  │                                                          │ │
│  │   [Line Chart: 300px height]                            │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Sessions    │  │  Time Spent  │  │  Avg/Day     │        │
│  │  [Bar Chart] │  │  [Area Chart]│  │  [Stats Card]│        │
│  │  200px       │  │  200px       │  │  200px       │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────────────────┐
│  Stats & Progress Modal     │
│  ┌─────┬────────┬─────────┐ │
│  │Stats│Achieve.│Analytics│ │
│  └─────┴────────┴─────────┘ │
│                             │
│  ┌─────────────────────────┐│
│  │ [Today] [Week] [Month]  ││
│  │ Dec 16-23               ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 📊 Words Transcribed    ││
│  │ [Line Chart: 200px]     ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 📅 Sessions             ││
│  │ [Bar Chart: 200px]      ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ ⏱️ Time Spent            ││
│  │ [Area Chart: 200px]     ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Chart Color Palette (Cyberpunk Theme)

```css
/* Primary gradient */
--chart-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--chart-line: #8b5cf6;
--chart-fill: rgba(139, 92, 246, 0.2);

/* Secondary metrics */
--chart-secondary: #a78bfa;
--chart-tertiary: #6366f1;

/* Grid and axes */
--chart-grid: rgba(255, 255, 255, 0.1);
--chart-text: #d1d5db;
--chart-axis: #9ca3af;

/* Hover/interactive */
--chart-tooltip-bg: #1f2937;
--chart-tooltip-border: #6366f1;
--chart-hover-glow: rgba(139, 92, 246, 0.4);
```

---

## Technical Architecture

### Component Hierarchy

```
src/pages/Analytics/
├── index.tsx                          # Main Analytics page component
├── Analytics.module.css               # Styles
├── components/
│   ├── DateRangeSelector.tsx          # Time range buttons
│   ├── DateRangeSelector.module.css
│   ├── WordsChart.tsx                 # Words transcribed line chart
│   ├── WordsChart.module.css
│   ├── SessionsChart.tsx              # Sessions bar chart
│   ├── SessionsChart.module.css
│   ├── TimeSpentChart.tsx             # Time spent area chart
│   ├── TimeSpentChart.module.css
│   ├── StatsCard.tsx                  # Summary statistics card
│   ├── StatsCard.module.css
│   └── EmptyState.tsx                 # No data placeholder
├── hooks/
│   ├── useAnalyticsData.ts            # Fetch and manage analytics data
│   └── useDataAggregation.ts          # Client-side aggregation utilities
└── types/
    └── index.ts                       # TypeScript interfaces
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Interaction                                           │
│  Select time range → "Last 7 Days"                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  React Component (Analytics.tsx)                            │
│  - Update range state                                       │
│  - Trigger data fetch                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Custom Hook (useAnalyticsData)                             │
│  - Call IPC: getAnalyticsData(range)                        │
│  - Handle loading/error states                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  IPC Handler (Main Process)                                 │
│  electron/main/ipc-handlers.ts                              │
│  - Fetch history from database                              │
│  - Call aggregation service                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Analytics Service                                          │
│  electron/main/services/analytics.ts                        │
│  - Group records by time bucket (hour/day/week/month)       │
│  - Calculate aggregates (sum words, count sessions, etc.)   │
│  - Format for chart consumption                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Return to Renderer                                         │
│  {                                                           │
│    words: [{ date, value }],                                │
│    sessions: [{ date, value }],                             │
│    timeSpent: [{ date, value }]                             │
│  }                                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Chart Components                                           │
│  - WordsChart (Recharts LineChart)                          │
│  - SessionsChart (Recharts BarChart)                        │
│  - TimeSpentChart (Recharts AreaChart)                      │
│  - Render with cyberpunk styling                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Aggregation Strategy

### Aggregation Rules Table

| Time Range   | Granularity | Buckets  | Aggregation Method | Chart Type |
| ------------ | ----------- | -------- | ------------------ | ---------- |
| Today        | Hourly      | 24       | Sum                | Line       |
| Last 7 Days  | Daily       | 7        | Sum                | Bar/Line   |
| Last 30 Days | Daily       | 30       | Sum                | Line       |
| Last Quarter | Weekly      | 12-13    | Sum                | Line       |
| This Year    | Monthly     | 12       | Sum                | Bar        |
| All Time     | Monthly     | Variable | Sum                | Line       |

### Bucket Calculation Algorithm

```typescript
/**
 * Calculate time buckets for aggregation
 */
function calculateBuckets(range: TimeRange): { start: Date; end: Date; granularity: string }[] {
  const now = new Date()
  const buckets: { start: Date; end: Date; granularity: string }[] = []

  switch (range) {
    case 'today':
      // 24 hourly buckets
      for (let i = 0; i < 24; i++) {
        const start = new Date(now)
        start.setHours(i, 0, 0, 0)
        const end = new Date(start)
        end.setHours(i + 1, 0, 0, 0)
        buckets.push({ start, end, granularity: 'hour' })
      }
      break

    case 'week':
      // 7 daily buckets
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        buckets.push({ start, end, granularity: 'day' })
      }
      break

    case 'month':
      // 30 daily buckets
      for (let i = 29; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        buckets.push({ start, end, granularity: 'day' })
      }
      break

    case 'quarter':
      // 12 weekly buckets (12 weeks = ~3 months)
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i * 7)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        buckets.push({ start, end, granularity: 'week' })
      }
      break

    case 'year':
      // 12 monthly buckets
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        buckets.push({ start, end, granularity: 'month' })
      }
      break

    case 'all':
      // Monthly buckets from first record to now
      // Calculated dynamically based on first record date
      break
  }

  return buckets
}
```

### Aggregation Function

```typescript
interface TranscriptionRecord {
  id: string
  timestamp: number
  wordCount: number
  duration: number // in seconds
}

interface AggregatedData {
  date: string
  words: number
  sessions: number
  timeSpent: number // in minutes
}

function aggregateData(
  records: TranscriptionRecord[],
  buckets: { start: Date; end: Date; granularity: string }[]
): AggregatedData[] {
  return buckets.map((bucket) => {
    const recordsInBucket = records.filter((record) => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= bucket.start && recordDate < bucket.end
    })

    const words = recordsInBucket.reduce((sum, r) => sum + r.wordCount, 0)
    const sessions = recordsInBucket.length
    const timeSpent = recordsInBucket.reduce((sum, r) => sum + r.duration / 60, 0) // Convert to minutes

    return {
      date: formatBucketLabel(bucket),
      words,
      sessions,
      timeSpent: Math.round(timeSpent),
    }
  })
}

function formatBucketLabel(bucket: { start: Date; granularity: string }): string {
  switch (bucket.granularity) {
    case 'hour':
      return bucket.start.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    case 'day':
      return bucket.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'week':
      return `Week of ${bucket.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    case 'month':
      return bucket.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    default:
      return bucket.start.toLocaleDateString()
  }
}
```

---

## Component Structure

### 1. DateRangeSelector Component

```typescript
// src/pages/Analytics/components/DateRangeSelector.tsx
import { useState } from 'react';
import styles from './DateRangeSelector.module.css';

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

interface DateRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const PRESETS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  const formatDateRange = (range: TimeRange): string => {
    const now = new Date();
    let start: Date;

    switch (range) {
      case 'today':
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(now.getDate() - 29);
        break;
      case 'quarter':
        start = new Date(now);
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return 'All Time';
      default:
        return '';
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

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
  );
}
```

### 2. WordsChart Component

```typescript
// src/pages/Analytics/components/WordsChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './WordsChart.module.css';

interface WordsChartProps {
  data: Array<{ date: string; words: number }>;
  range: string;
}

export function WordsChart({ data, range }: WordsChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
          <p className={styles.tooltipValue}>{payload[0].value.toLocaleString()} words</p>
        </div>
      );
    }
    return null;
  };

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
            dataKey="words"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6' }}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#a78bfa', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 3. useAnalyticsData Hook

```typescript
// src/pages/Analytics/hooks/useAnalyticsData.ts
import { useState, useEffect } from 'react'
import { TimeRange } from '../components/DateRangeSelector'

interface AnalyticsData {
  words: Array<{ date: string; value: number }>
  sessions: Array<{ date: string; value: number }>
  timeSpent: Array<{ date: string; value: number }>
}

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

        setData(result)
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
```

---

## Implementation Plan

### Phase 1: Backend Foundation (Day 1)

#### Step 1: Install Recharts

```bash
npm install recharts
npm install --save-dev @types/recharts
```

#### Step 2: Create Analytics Service

**File:** `electron/main/services/analytics.ts`

- Implement bucket calculation logic
- Implement aggregation functions
- Add TypeScript interfaces for data structures
- Write unit tests for aggregation logic

#### Step 3: Add IPC Handler

**File:** `electron/main/ipc-handlers.ts`

```typescript
ipcMain.handle('get-analytics-data', async (_, range: string) => {
  const history = historyStore.getHistory()
  const buckets = calculateBuckets(range)
  const aggregated = aggregateData(history, buckets)

  return {
    words: aggregated.map((d) => ({ date: d.date, value: d.words })),
    sessions: aggregated.map((d) => ({ date: d.date, value: d.sessions })),
    timeSpent: aggregated.map((d) => ({ date: d.date, value: d.timeSpent })),
  }
})
```

#### Step 4: Update Preload Script

**File:** `electron/preload/index.ts`

```typescript
const electronAPI = {
  // ... existing methods ...
  getAnalyticsData: (range: string) => ipcRenderer.invoke('get-analytics-data', range),
}
```

### Phase 2: Frontend Components (Day 2-3)

#### Step 5: Create Component Files

```bash
mkdir -p src/pages/Analytics/components
mkdir -p src/pages/Analytics/hooks
mkdir -p src/pages/Analytics/types

# Create files
touch src/pages/Analytics/index.tsx
touch src/pages/Analytics/Analytics.module.css
touch src/pages/Analytics/components/DateRangeSelector.tsx
touch src/pages/Analytics/components/WordsChart.tsx
touch src/pages/Analytics/components/SessionsChart.tsx
touch src/pages/Analytics/components/TimeSpentChart.tsx
touch src/pages/Analytics/hooks/useAnalyticsData.ts
```

#### Step 6: Implement DateRangeSelector

- Create button group with 6 presets
- Apply cyberpunk styling (purple/indigo)
- Add active state highlighting
- Display current date range below buttons

#### Step 7: Implement Chart Components

- **WordsChart**: LineChart with purple gradient
- **SessionsChart**: BarChart with indigo bars
- **TimeSpentChart**: AreaChart with purple fill

All charts include:

- Custom tooltips with cyberpunk styling
- Dark grid lines
- Purple accent colors
- Responsive sizing
- Smooth animations

#### Step 8: Implement Main Analytics Page

- Tab integration with existing Stats/Achievements
- Layout grid for charts
- Loading states
- Empty states when no data
- Error handling

### Phase 3: Styling & Polish (Day 4)

#### Step 9: Apply Cyberpunk Theme

**Colors:**

- Primary: `#8b5cf6` (line/bar color)
- Secondary: `#6366f1` (hover/active)
- Fill: `rgba(139, 92, 246, 0.2)` (area charts)
- Grid: `rgba(255, 255, 255, 0.1)` (grid lines)
- Text: `#d1d5db` (axis labels)

**Effects:**

- Glow on hover: `box-shadow: 0 0 20px rgba(139, 92, 246, 0.4)`
- Smooth transitions: `transition: all 0.2s ease`
- Border gradients for containers

#### Step 10: Mobile Responsive Design

**Breakpoints:**

- Desktop (> 1024px): 3-column grid
- Tablet (768-1024px): 2-column grid
- Mobile (< 768px): Single column

**Mobile Optimizations:**

- Reduce chart height (200px instead of 300px)
- Simplify tooltip content
- Reduce X-axis tick count
- Stack date range buttons vertically
- Hide less important metrics

### Phase 4: Testing & Refinement (Day 5)

#### Step 11: Write Tests

```typescript
// __tests__/analytics.service.test.ts
describe('Analytics Service', () => {
  describe('calculateBuckets', () => {
    it('should generate 24 hourly buckets for today', () => {
      const buckets = calculateBuckets('today')
      expect(buckets).toHaveLength(24)
      expect(buckets[0].granularity).toBe('hour')
    })

    it('should generate 7 daily buckets for week', () => {
      const buckets = calculateBuckets('week')
      expect(buckets).toHaveLength(7)
      expect(buckets[0].granularity).toBe('day')
    })
  })

  describe('aggregateData', () => {
    it('should sum words correctly', () => {
      const records = [
        { id: '1', timestamp: Date.now(), wordCount: 100, duration: 60 },
        { id: '2', timestamp: Date.now(), wordCount: 150, duration: 90 },
      ]
      const buckets = [
        {
          start: new Date(),
          end: new Date(Date.now() + 3600000),
          granularity: 'hour',
        },
      ]

      const result = aggregateData(records, buckets)
      expect(result[0].words).toBe(250)
      expect(result[0].sessions).toBe(2)
    })
  })
})
```

#### Step 12: Manual Testing Checklist

- [ ] All time ranges display correctly
- [ ] Charts render without errors
- [ ] Tooltips show accurate data
- [ ] Mobile layout works on actual device
- [ ] Empty state displays when no data
- [ ] Loading state displays during fetch
- [ ] Animations are smooth
- [ ] Colors match cyberpunk theme
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces data

#### Step 13: Performance Optimization

- Memoize chart data to prevent unnecessary re-renders
- Debounce range changes if needed
- Implement data downsampling for very large datasets (> 1000 points)
- Use React.memo for chart components
- Test with 1 year of data (365 points)

---

## Mobile Responsiveness

### Responsive CSS Example

```css
/* Desktop (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
}

.chartsRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Tablet */
@media (max-width: 1024px) {
  .chartsRow {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .grid {
    padding: 1rem;
    gap: 1rem;
  }

  .chartsRow {
    grid-template-columns: 1fr;
  }

  .dateRangeButtons {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .dateRangeButtons button {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}
```

---

## Testing Strategy

### Unit Tests

- `analytics.service.test.ts`: Test bucket calculation and aggregation
- `DateRangeSelector.test.tsx`: Test button selection and date formatting
- `useAnalyticsData.test.ts`: Test data fetching and error handling

### Integration Tests

- Test full flow: select range → fetch data → render charts
- Test IPC communication between renderer and main process
- Test with varying dataset sizes (0, 10, 100, 1000+ records)

### Manual Testing

- Test each time range with real data
- Test empty states
- Test error states (simulated IPC failure)
- Test responsiveness on different screen sizes
- Test accessibility with keyboard navigation
- Test screen reader compatibility

---

## Future Enhancements

### V2 Features (After Initial Release)

1. **Export Functionality**
   - Export chart as PNG image
   - Export data as CSV
   - Share button for social media

2. **Advanced Filtering**
   - Filter by formatted/unformatted transcriptions
   - Filter by word count ranges
   - Filter by duration ranges

3. **Comparison Mode**
   - Compare current period to previous period
   - Show percentage change indicators
   - Highlight trends (up/down arrows)

4. **Goals & Milestones**
   - Set daily/weekly/monthly word goals
   - Visual progress indicators on charts
   - Celebration animations when goals are met

5. **Heatmap View**
   - Calendar heatmap showing activity intensity
   - GitHub-style contribution graph
   - Click to drill down into specific days

6. **Custom Date Ranges**
   - Date picker for selecting arbitrary ranges
   - "Compare custom ranges" feature
   - Saved custom ranges

---

## Summary

This Analytics page will provide users with powerful visual insights into their transcription activity, helping them understand productivity patterns and track progress over time. By following this plan, we'll deliver a professional, cyberpunk-themed analytics dashboard that integrates seamlessly with the existing gamification system.

**Next Steps:**

1. Review and approve this plan
2. Install Recharts dependency
3. Begin Phase 1: Backend implementation
4. Iterate through phases 2-4
5. Gather user feedback and refine

---

**Last Updated:** December 23, 2025
**Status:** Ready for implementation
**Estimated Timeline:** 3-5 days
