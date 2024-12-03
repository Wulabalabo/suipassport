'use client'

import { use } from 'react'
import { StampDetails } from "@/app/admin/@stamp/components/stamp-details"

interface StampPageProps {
  params: Promise<{
    stampId: string
  }>
}

export default function StampPage({ params }: StampPageProps) {
  const resolvedParams = use(params)
  const stampId = resolvedParams.stampId

  // 这里可以使用 stampId 获取事件数据
  const mockStampData = {
    id: parseInt(stampId),
    name: "Stamp Name",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    eventType: "Stamp Type",
    mintType: "Manual",
    startDate: "DD/MM/YYYY HH/MM",
    endDate: "DD/MM/YYYY HH/MM"
  }

  return (
    <div className="p-6">
      <StampDetails stamp={mockStampData} />
    </div>
  )
}   