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
    // 初始化检查
    setIsMobile(window.innerWidth < 640)

    // 添加resize监听
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener('resize', handleResize)

    // 清理监听器
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (totalPages <= 1) return null

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    onPageChange(validPage)
  }

  function getPageNumbers() {
    const pages: (number | string)[] = []
    
    // 使用 isMobile 状态而不是直接检查 window
    if (isMobile) {
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