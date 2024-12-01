'use client'

import { use } from 'react'
import { EventDetails } from "@/app/admin/@event/components/event-details"

interface EventPageProps {
  params: Promise<{
    eventId: string
  }>
}

export default function EventPage({ params }: EventPageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.eventId

  // 这里可以使用 eventId 获取事件数据
  const mockEventData = {
    id: parseInt(eventId),
    name: "Event Name",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    eventType: "Event Type",
    mintType: "Manual",
    startDate: "DD/MM/YYYY HH/MM",
    endDate: "DD/MM/YYYY HH/MM"
  }

  return (
    <div className="p-6">
      <EventDetails event={mockEventData} />
    </div>
  )
}   