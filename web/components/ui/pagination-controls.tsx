'use client'

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
  if (totalPages <= 1) return null

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    onPageChange(validPage)
  }

  function getPageNumbers() {
    const pages: (number | string)[] = []
    
    // 在移动端只显示当前页码
    if (window.innerWidth < 640) {
      return [currentPage]
    }
    
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 始终添加第一页
    pages.push(1)

    if (currentPage > 2) {
      pages.push('...')
    }

    // 在较大页数时只显示当前页
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(currentPage)
    }

    if (currentPage < totalPages - 1) {
      pages.push('...')
    }

    // 始终添加最后一页
    if (totalPages > 1) {
      pages.push(totalPages)
    }

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

        {/* 移动端显示当前页码 */}
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