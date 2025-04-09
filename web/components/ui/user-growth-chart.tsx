'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface UserGrowthData {
  date: string
  count: number
}

interface UserGrowthChartProps {
  data: UserGrowthData[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="New Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 