'use client'

import { useState, useEffect } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useUserCrud } from "@/hooks/use-user-crud"
import { stamp } from "@/types/db"
import Link from "next/link"

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
      return <Link href={`/user/${address}`} target="_blank" className="text-blue-500 hover:underline">View</Link>
    }
  },
]

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [rankings, setRankings] = useState<RankItem[]>([])
  const { fetchUsers } = useUserCrud()

  const ITEMS_PER_PAGE = 7

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchUsers()
      if (users) {
        const sortedUsers = users.sort((a, b) => b.points - a.points)
        const rankings = await Promise.all(sortedUsers.map(async (user, index) => {
          const stamps = JSON.parse(user.stamps as unknown as string) as stamp[]
          let stampsCount = 0
          stamps.forEach((stamp) => {
            stampsCount += stamp.claim_count
          })
          return {
            rank: index + 1,
            user: user.name ?? '',
            address: user.address,
            points: user.points,
            stampsCount: stampsCount
          }
        }))
        setRankings(rankings)
      }
    }
    fetchData()
  }, [])

  // 处理搜索过滤
  const filteredData = rankings.filter(item =>
    item.user.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.points - a.points)

  // 处理分页
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


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