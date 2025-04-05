'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DbUserResponse } from '@/types/userProfile'

interface StampDistributionData {
  name: string
  value: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

function prepareStampDistributionData(users: DbUserResponse[]): StampDistributionData[] {
  const distribution = {
    '0 stamps': 0,
    '1 stamp': 0,
    '2+ stamps': 0
  }

  users.forEach(user => {
    const stampCount = user.stamp_count
    if (stampCount === 0) distribution['0 stamps']++
    else if (stampCount === 1) distribution['1 stamp']++
    else distribution['2+ stamps']++
  })

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }))
}

interface StampDistributionChartProps {
  users: DbUserResponse[]
}

export function StampDistributionChart({ users }: StampDistributionChartProps) {
  const data = prepareStampDistributionData(users)

  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Stamp Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
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