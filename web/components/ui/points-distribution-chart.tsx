'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface PointsDistributionChartProps {
  data: {
    range: string
    count: number
  }[] | undefined
}

export function PointsDistributionChart({ data = [] }: PointsDistributionChartProps) {
  const chartData = data.map(item => ({
    name: `${item.range} points`,
    value: item.count
  }))

  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Points Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 