'use client'

import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useState } from "react"
import { CreateEventDialog } from "./components/create-event-dialog"
import Link from "next/link"

interface AdminEventProps {
    mockEvent: Array<{ id: number; name: string }>
}

export default function AdminEvent({ mockEvent }: AdminEventProps) {
    const [currentPage, setCurrentPage] = useState(1)
    
    const ITEMS_PER_PAGE = 5
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentEvents = mockEvent.slice(startIndex, endIndex)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <p className="text-4xl font-bold">Events</p>
                <CreateEventDialog />
            </div>
            <p className="text-lg py-9">Lorem ipsum dolor sit amet...</p>
            
            <div className="py-6">
                <SearchFilterBar searchPlaceholder="Name / ID" filterPlaceholder="Sort By" />
                <div className="pt-6 space-y-2">
                    {currentEvents.map((event) => (
                        <Link
                            key={event.id}
                            href={`/admin/events/${event.id}`}
                            className="block bg-gray-200 rounded-sm p-5 hover:bg-gray-300 transition-colors"
                        >
                            <div className="font-bold text-lg">{event.name}</div>
                        </Link>
                    ))}
                </div>
            </div>

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