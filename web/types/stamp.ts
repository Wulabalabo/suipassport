export type StampItem = {
    id: string 
    name: string
    imageUrl?: string
    description?: string
    points?: number
    timestamp?: number
    hasClaimCode?: boolean
    claimCodeStartTimestamp?: string
    claimCodeEndTimestamp?: string
    totalCountLimit?: number
    userCountLimit?: number
    claimCount?: number
    event?: string
}

export interface StampGridProps {
    items: StampItem[]
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
} 

export interface ClaimStampProps {
    stampId: string
    claimCode: string
    claimCodeStartTimestamp: number
    claimCodeEndTimestamp: number
}

export type displayStamp = StampItem & {
    isActive?: boolean
    eventId?: string
    isCollectable?: boolean
}

export type VerifyClaimStampRequest = {
    stamp_id: string
    claim_code: string
    passport_id: string
    last_time: number
}

