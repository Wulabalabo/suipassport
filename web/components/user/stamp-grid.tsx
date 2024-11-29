'use client'

import { useState } from "react"
import { StampDialog } from "./stamp-dialog"
import { StampCard } from "./stamp-card"
import { StampItem, StampGridProps } from "@/types/stamp"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function StampGrid({ items, currentPage = 1, totalPages = 1, onPageChange }: StampGridProps) {
    const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null)

    return (
        <div className="space-y-6 p-6">
            {/* Stamp Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                {items.map((item) => (
                    <StampCard 
                        key={item.id}
                        stamp={item}
                        onClick={() => setSelectedStamp(item)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <StampDialog 
                stamp={selectedStamp}
                open={!!selectedStamp}
                onOpenChange={(open) => !open && setSelectedStamp(null)}
            />
        </div>
    )
} 