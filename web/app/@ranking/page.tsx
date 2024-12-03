'use client'

import { useState, useEffect } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RankItem {
  rank: number
  user: string
  points: number
  stampsCount: number
}

const columns: ColumnDef<RankItem>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
  },
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "stampsCount",
    header: "Stamps",
  },
]

const randomUser = () => {
  const users = ["anto.sui", "john.sui", "jane.sui", "alice.sui", "bob.sui"]
  return users[Math.floor(Math.random() * users.length)]
}

// 示例数据
const mockData: RankItem[] = Array.from({ length: 15 }, (_, i) => ({
  rank: i + 1,
  user: randomUser(),
  points: Math.floor(Math.random() * 1000),
  stampsCount: Math.floor(Math.random() * 20),
}))

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const ITEMS_PER_PAGE = 7

  // 处理搜索过滤
  const filteredData = mockData.filter(item =>
    item.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 处理分页
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // 实现同步逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      console.log("Syncing rankings...")
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="p-6 space-y-6 lg:bg-white lg:rounded-3xl lg:p-12">
      <div className="lg:flex lg:justify-between lg:items-center space-y-6 lg:space-y-0 pb-6">
        <h1 className="text-4xl font-bold">Top Contributors</h1>
        <Button 
          onClick={handleSync} 
          className="rounded-full"
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="lg:flex lg:justify-between lg:items-center lg:gap-8">
          <SearchFilterBar
            searchPlaceholder="Search by address"
            onSearchChange={setSearchQuery}
            filterOptions={[{label: "All", value: "all"}, {label: "Stamps", value: "stamps"}]}
          />
          <div className="hidden lg:block">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={paginatedData}
        />
        
        <div className="lg:hidden">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}