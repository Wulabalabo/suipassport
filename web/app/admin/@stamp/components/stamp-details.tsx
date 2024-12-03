'use client'

import { Button } from "@/components/ui/button"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useState } from "react"
import { EditIcon } from "lucide-react"
import { CreateStampDialog } from "./create-stamp-dialog"
import { StampDialog } from "@/components/user/stamp-dialog"
import { StampItem } from "@/types/stamp"

interface StampDetailsProps {
  stamp: {
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
    
export function StampDetails({ stamp }: StampDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{stamp.name}</h1>
        </div>
        <Button className="rounded-full" variant="outline" size="sm">
          <span className="mr-2">Edit</span>
          <EditIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-8 ">
        {/* Description */}
        <p className="text-gray-600">{stamp.description}</p>

        {/* Event Details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Date</div>
            <div>{`${stamp.startDate} - ${stamp.endDate}`}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Event Type</div>
            <div>{stamp.eventType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Mint by</div>
            <div>{stamp.mintType}</div>
          </div>
        </div>
        
          {/* Event Stamp Section */}
          <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Event Stamp</h3>
            <CreateStampDialog />
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
          <div className="mt-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-3 gap-4 p-4 text-sm text-gray-500 border-b">
              <div>ATTRIBUTE</div>
              <div>ATTRIBUTE</div>
              <div>ATTRIBUTE</div>
            </div>

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedStamp({
                  id: index.toString(),
                  name: `Stamp ${index}`,
                  description: "Sample description",
                  imageUrl: "/sample-image.jpg",
                  eventName: stamp.name,
                  totalSupply: 100,
                  point: 50,
                  attribution: "Sample Attribution",
                  type: "Sample Type"
                })}
              >
                <div>Data</div>
                <div>Data</div>
                <div>Data</div>
              </div>
            ))}
          </div>

          {/* Add StampDialog */}
          <StampDialog
            stamp={selectedStamp}
            open={!!selectedStamp}
            admin={true}
            onOpenChange={(open) => !open && setSelectedStamp(null)}
          />

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
    </div>
  )
} 