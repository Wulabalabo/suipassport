export interface StampItem {
    id: string | number
    name: string
    imageUrl?: string
    description?: string
    totalSupply?: number
    point?: number
}

export interface StampGridProps {
    items: StampItem[]
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
} 