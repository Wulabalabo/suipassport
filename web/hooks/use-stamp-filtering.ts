import { useState } from 'react'
import { DisplayStamp } from '@/app/@stamp/page'

interface UseStampFilteringProps {
  stamps: DisplayStamp[]
  itemsPerPage: number
}

export function useStampFiltering({ stamps, itemsPerPage }: UseStampFilteringProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortDirection, setSortDirection] = useState<'all' | 'claimable'>('all')

  const filteredStamps = stamps
    ?.filter(stamp =>
      (stamp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stamp.id.includes(searchQuery)) &&
      (sortDirection === 'all' || (sortDirection === 'claimable' && stamp.isClaimable))
    )
    .sort((a, b) => {
      const dateA = new Date(a.timestamp ?? 0).getTime()
      const dateB = new Date(b.timestamp ?? 0).getTime()
      return dateB - dateA
    })

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStamps = filteredStamps?.slice(startIndex, endIndex)
  const totalPages = Math.max(1, Math.ceil((filteredStamps?.length ?? 0) / itemsPerPage))
  const shouldShowPagination = (filteredStamps?.length ?? 0) > itemsPerPage

  const handleFilterChange = (value: string) => {
    setSortDirection(value === 'All' ? 'all' : 'claimable')
  }

  return {
    currentStamps,
    totalPages,
    currentPage,
    shouldShowPagination,
    setCurrentPage,
    setSearchQuery,
    handleFilterChange
  }
}