export interface StampItem {
    id: string | number
    name: string
    type: string
    imageUrl?: string
    description?: string
    eventName?: string
    totalSupply?: number
    point?: number
    attribution?: string
}

export interface StampGridProps {
    items: StampItem[]
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
} 