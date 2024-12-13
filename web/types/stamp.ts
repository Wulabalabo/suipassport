export type StampItem = {
    id: string 
    name: string
    imageUrl?: string
    description?: string
    points?: number
    timestamp?: number
}

export interface StampGridProps {
    items: StampItem[]
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
} 