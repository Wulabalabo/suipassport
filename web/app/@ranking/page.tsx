'use client'

import { useState } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useUserCrud } from "@/hooks/use-user-crud"
import { stamp } from "@/types/db"
import Link from "next/link"
import useSWR from "swr"

interface RankItem {
  rank: number
  user: string
  address: string
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
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.original.address
      return <div className="max-w-28 truncate lg:max-w-64">
        {address}
      </div>
    }
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "stampsCount",
    header: "Stamps",
  },
  {
    accessorKey: "view",
    header: "View",
    cell: ({ row }) => {
      const address = row.original.address
      return <Link href={`/user/${address}`} className="text-blue-500 hover:underline">View</Link>
    }
  },
]

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const ITEMS_PER_PAGE = 7
  const { fetchUsers } = useUserCrud()

  // 使用 SWR 获取数据
  const { data: rankings = [], isLoading, error } = useSWR<RankItem[]>(
    'rankings',
    async () => {
      const users = await fetchUsers()
      
      if (!users) return []
      
      const sortedUsers = users.sort((a, b) => b.points - a.points)
      return Promise.all(sortedUsers.map(async (user, index) => {
        const stamps = JSON.parse(user.stamps as unknown as string) as stamp[]
        const stampsCount = stamps.reduce((acc, stamp) => acc + stamp.claim_count, 0)
        
        return {
          rank: index + 1,
          user: user.name ?? '',
          address: user.address,
          points: user.points,
          stampsCount
        }
      }))
    },
    {
      refreshInterval: 300000, // 每30秒自动刷新一次
      revalidateOnFocus: false, // 窗口获得焦点时不重新验证
    }
  )

  // 处理搜索过滤
  const filteredData = rankings.filter((item: RankItem) =>
    item.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 处理分页
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 加载状态
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 lg:rounded-3xl bg-card shadow-lg shadow-border border border-border lg:p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-[400px] bg-muted rounded" />
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="p-6 space-y-6 lg:rounded-3xl bg-card shadow-lg shadow-border border border-border lg:p-12">
        <div className="text-destructive">
          Error loading rankings. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 lg:rounded-3xl bg-card shadow-lg shadow-border border border-border lg:p-12">
      <div className="lg:flex lg:justify-between lg:items-center space-y-6 lg:space-y-0 pb-6">
        <h1 className="text-4xl font-bold">Top Contributors</h1>
      </div>

      <div className="mt-6 space-y-4">
        <div className="lg:flex lg:justify-between lg:items-center lg:gap-8">
          <SearchFilterBar
            searchPlaceholder="Search by address"
            onSearchChange={setSearchQuery}
            filterDisabled={true}
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
          columns={columns as ColumnDef<Record<string, unknown>>[]}
          data={paginatedData as unknown as Record<string, unknown>[]}
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
