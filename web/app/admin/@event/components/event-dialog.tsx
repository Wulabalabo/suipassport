'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useState } from "react"

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: number
    name: string
    description: string
    eventType: string
    mintType: string
    startDate: string
    endDate: string
  }
}

interface StampData {
  id: string
  value: number
  name: string
}

const mockStamps: StampData[] = [
  { id: "A", value: 100, name: "Stamp A" },
  { id: "B", value: 100, name: "Stamp B" },
  { id: "C", value: 100, name: "Stamp C" },
]

export function EventDialog({ isOpen, onClose, event }: EventDialogProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">{event.name}</DialogTitle>
            <Button variant="outline" size="sm">
              <span className="mr-2">Edit</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.22541 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L4.42166 9.28547Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">{event.description}</p>

          {/* Date and Event Type */}
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Date</div>
            <div>{`${event.startDate} - ${event.endDate}`}</div>
            
            <div className="text-sm text-gray-500">Event Type</div>
            <div>{event.eventType}</div>
            
            <div className="text-sm text-gray-500">Mint by</div>
            <div>{event.mintType}</div>
          </div>

          {/* Event Stamp Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Event Stamp</h3>
              <Button>Create</Button>
            </div>

            {/* Stamps Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {mockStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="bg-blue-100 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold">{stamp.value}</div>
                  <div className="text-sm text-gray-600">{stamp.name}</div>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <SearchFilterBar
              searchPlaceholder="Name / ID"
              filterPlaceholder="Event Type"
            />

            {/* Data Table */}
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 mb-2">
                <div>ATTRIBUTE</div>
                <div>ATTRIBUTE</div>
                <div>ATTRIBUTE</div>
              </div>

              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 py-2 border-b"
                >
                  <div>Data</div>
                  <div>Data</div>
                  <div>Data</div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 