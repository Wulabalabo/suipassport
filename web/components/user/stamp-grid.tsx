'use client'

import { useState, useMemo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { StampDialog } from "./stamp-dialog"
import { StampCard } from "./stamp-card"
import { StampItem } from "@/types/stamp"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"

interface StampGridProps {
    items: StampItem[]
}

export function StampGrid({ items }: StampGridProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null)

    // 使用媒体查询来确定是否为桌面版
    const isDesktop = useMediaQuery("(min-width: 1024px)")
    const itemsPerPage = isDesktop ? 5 : 4

    // 计算分页数据
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return items.slice(startIndex, endIndex)
    }, [items, currentPage, itemsPerPage])

    const totalPages = Math.ceil(items.length / itemsPerPage)

    const filterOptions = [
        { value: "all", label: "All Events" },
        { value: "upcoming", label: "Upcoming Events" },
        { value: "past", label: "Past Events" },
    ]

    return (
        <div className="space-y-6 px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-3">
                {/* <Tabs
                    value="all"
                    onValueChange={(value) => console.log('Tab:', value)}
                    className="flex-shrink-0"
                >
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="private">Private Stamps</TabsTrigger>
                        <TabsTrigger value="best">Best Stamps</TabsTrigger>
                    </TabsList>
                </Tabs> */}
                {/* <SearchFilterBar
                    searchPlaceholder="Name / ID"
                    filterPlaceholder="Event Type"
                    filterOptions={filterOptions}
                    onSearchChange={(value) => console.log('Search:', value)}
                    onFilterChange={(value) => console.log('Filter:', value)}
                /> */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="hidden lg:flex justify-end"
                />
            </div>

            {/* Stamp Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {paginatedData.map((item) => (
                    <StampCard
                        key={item.id}
                        stamp={item}
                        onClick={() => setSelectedStamp(item)}
                    />
                ))}
            </div>


            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-6 lg:hidden"
            />

            <StampDialog
                stamp={selectedStamp}
                open={!!selectedStamp}
                onOpenChange={(open) => !open && setSelectedStamp(null)}
            />
        </div>
    )
} 