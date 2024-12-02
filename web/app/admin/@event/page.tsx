'use client'

import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useState } from "react"
import { CreateEventDialog } from "./components/create-event-dialog"
import Link from "next/link"

interface AdminEventProps {
    mockEvent: Array<{ id: number; name: string }>
    admin: boolean
}

export default function AdminEvent({ mockEvent, admin }: AdminEventProps) {
    const [currentPage, setCurrentPage] = useState(1)

    const ITEMS_PER_PAGE = 6
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentEvents = mockEvent.slice(startIndex, endIndex)

    return (
        <div className="p-6 lg:flex lg:gap-16">
            <div className="lg:max-w-sm flex flex-col">
                <div className="flex justify-between items-center">
                    <p className="text-4xl font-bold py-6">Events</p>
                    <div className="lg:hidden">
                        {admin && <CreateEventDialog />}
                    </div>
                </div>
                <p className="text-lg py-9">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vehicula nisl vel risus facilisis, ac facilisis erat suscipit. Fusce sed nulla et justo luctus blandit. Nulla facilisi. Proin egestas justo nec ullamcorper volutpat.</p>
                <div className="lg:block hidden mt-auto">
                    {admin && <CreateEventDialog />}
                </div>
            </div>
            <div className="py-6 lg:w-full lg:py-0">
                <div className="lg:flex justify-between ">
                    <SearchFilterBar searchPlaceholder="Name / ID" filterPlaceholder="Sort By" />
                    <div className="py-4 lg:block hidden">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={Math.ceil(mockEvent.length / ITEMS_PER_PAGE)}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
                <div className="pt-6 space-y-2 lg:hidden">
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
                <div className="lg:block hidden">
                    <div className="grid grid-cols-3 gap-6">
                        {currentEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/admin/events/${event.id}`}
                                className="block bg-white rounded-lg p-5 hover:bg-gray-300 transition-colors"
                            >
                                <div className="flex flex-col justify-start items-start min-h-[100px] p-6 gap-y-2">
                                    <div className="font-bold text-lg">{event.name}</div>
                                    <div className="text-blue-400">
                                    Description Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur.
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        DD/MM/YYYY - DD/MM/YYYY
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-4 lg:hidden">
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(mockEvent.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    )
}