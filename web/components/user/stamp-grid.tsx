'use client'

import { useState, useMemo, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { StampDialog } from "./stamp-dialog"
import { StampCard } from "./stamp-card"
import { StampItem } from "@/types/stamp"
import { PaginationControls } from "@/components/ui/pagination-controls"

type displayStamp = StampItem & {
    isActive?: boolean
}

interface StampGridProps {
    stamps: StampItem[]
    collection_detail: string[]
    isVisitor?: boolean
    onCollect?: (stamp: StampItem) => void
}

export function StampGrid({ stamps,collection_detail,isVisitor,onCollect }: StampGridProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null)
    const [items, setItems] = useState<displayStamp[]>([])

    // 使用媒体查询来确定是否为桌面版
    const isDesktop = useMediaQuery("(min-width: 1024px)")
    const itemsPerPage = isDesktop ? 5 : 4

    useEffect(()=>{
        if(isVisitor){
            const visitorStamps = stamps.some(stamp=>collection_detail.includes(stamp.id)) ? stamps : []
            const activeStamps = visitorStamps.map(stamp=>({
                ...stamp,
                isActive: collection_detail?.includes(stamp.id)
            }))
            setItems(activeStamps)
            return
        }
        if(stamps && !isVisitor){
            const activeStamps = stamps.map(stamp=>({
                ...stamp,
                isActive: collection_detail?.includes(stamp.id)
            }))
            setItems(activeStamps)
        }
    },[stamps,collection_detail,isVisitor])
    
    // 计算分页数据
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return items?.slice(startIndex, endIndex)
    }, [items, currentPage, itemsPerPage])

    const totalPages = Math.ceil(items!.length / itemsPerPage)

    const handleClick = (isActive: boolean,stamp: StampItem) => {
        if(isActive){
            setSelectedStamp(stamp)
        }else{
            onCollect?.(stamp)
        }
    }

    return (
        <div className="space-y-6 px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-3">
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
                        onClick={handleClick}
                        isActive={item.isActive ?? false}
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