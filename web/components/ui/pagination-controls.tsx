'use client'

import { useEffect, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (totalPages <= 1) return null

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    onPageChange(validPage)
  }

  function getPageNumbers() {
    const pages: (number | string)[] = []
    
    if (isMobile) {
      return [currentPage]
    }
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    // 显示当前页及其前后页
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    pages.push(totalPages)

    return pages
  }

  return (
    <Pagination className={className}>
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className="cursor-pointer h-9 px-2 sm:px-4"
          />
        </PaginationItem>
        
        {getPageNumbers().map((pageNum, index) => (
          <PaginationItem key={index} className="hidden sm:inline-block">
            {pageNum === '...' ? (
              <span className="px-2 py-2">...</span>
            ) : (
              <PaginationLink 
                isActive={currentPage === pageNum} 
                onClick={() => handlePageChange(pageNum as number)}
                className="cursor-pointer h-9 w-9"
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <div className="sm:hidden flex items-center">
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
        </div>

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className="cursor-pointer h-9 px-2 sm:px-4"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}