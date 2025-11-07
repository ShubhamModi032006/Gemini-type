'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Define the shape of the data
interface ChartData {
  taken_at: string
  wpm: number
  accuracy: number
  test_level: string
}

// Format the date for the X-axis
const formatDate = (tickItem: string) => {
  return new Date(tickItem).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function StatsChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
        >
          <XAxis 
            dataKey="taken_at" 
            tickFormatter={formatDate} 
            stroke="#9ca3af"
          />
          <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Accuracy', angle: 90, position: 'insideRight', fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wpm"
            stroke="#3b82f6"
            strokeWidth={2}
            name="WPM"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            stroke="#22c55e"
            strokeWidth={2}
            name="Accuracy (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}