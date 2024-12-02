'use client'

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
    return <div className="w-full lg:p-24 lg:pb-48 bg-gray-100 lg:space-y-24">
        <>
            <AdminEvent mockEvent={mockEvent} admin={false} />
            <AdminDashboard />
        </>
    </div>
}

