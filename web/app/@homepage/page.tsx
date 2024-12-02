'use client'

import { useMediaQuery } from "@/hooks/use-media-query"
import AdminEvent from "../admin/@event/page"
import AdminDashboard from "../admin/@dashboard/page"

const mockEvent = [
    { id: 1, name: "Event 1" },
    { id: 2, name: "Event 2" },
    { id: 3, name: "Event 3" },
    { id: 4, name: "Event 4" },
    { id: 5, name: "Event 5" },
    { id: 6, name: "Event 6" },
    { id: 7, name: "Event 7" },
    { id: 8, name: "Event 8" },
    { id: 9, name: "Event 9" },
    { id: 10, name: "Event 10" },
]

export default function HomePage() {
    const media = useMediaQuery('(max-width: 1024px)')
    return <div className="w-full p-24 pb-48 bg-gray-100 space-y-24">
        {!media && (
        <>
          <AdminEvent mockEvent={mockEvent} />
          <AdminDashboard />
        </>
      )}
    </div>
}

