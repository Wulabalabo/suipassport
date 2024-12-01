'use client'

import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useState } from "react"
import { CreateEventDialog } from "./components/create-event-dialog"

interface AdminEventProps {
    mockEvent: Array<{ id: number; name: string }>
}

export default function AdminEvent({ mockEvent }: AdminEventProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedEvent, setSelectedEvent] = useState<string[]>([])
    
    const ITEMS_PER_PAGE = 5
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentEvents = mockEvent.slice(startIndex, endIndex)

    return (
        <div className="p-6">
            {/* Event */}
            <div className="flex justify-between items-center">
                <p className="text-4xl font-bold">Events</p>
                <CreateEventDialog />
            </div>
            <p className="text-lg py-9">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vehicula nisl vel risus facilisis, ac facilisis erat suscipit. Fusce sed nulla et justo luctus blandit. Nulla facilisi. Proin egestas justo nec ullamcorper volutpat.</p>
            {/* Event Table */}
            <div className="py-6">
                <SearchFilterBar searchPlaceholder="Name / ID" filterPlaceholder="Sort By" />
                <div className="pt-6 space-y-2">
                    {currentEvents.map((event) => (
                        <div key={event.id} className="bg-gray-200 rounded-sm p-5" >
                            <div className="font-bold text-lg">{event.name}</div>
                        </div>
                    ))}
                </div>

            </div>
            {/* Pagination */}
            <div className="py-4">
                <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={Math.ceil(mockEvent.length / ITEMS_PER_PAGE)} 
                    onPageChange={setCurrentPage} 
                />
            </div>
        </div>
    )
}