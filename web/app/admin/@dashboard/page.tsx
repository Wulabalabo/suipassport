'use client'

import { useState } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { StampItem } from "@/types/stamp"
import { usePassportsStamps } from "@/contexts/passports-stamps-context"
import { PassportItem } from "@/types/passport"

const stampColumns: ColumnDef<StampItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.id.slice(0, 6)}...</span>
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="truncate max-w-xs">{row.original.name}</div>
    }
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return <div className="text-nowrap truncate max-w-xs">{row.original.description}</div>
    }
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "timestamp",
    header: () => <div className="text-right text-nowrap">Created At</div>,
    cell: ({ row }) => {
      const createdAt = new Date(row.original.timestamp ?? 0).toLocaleDateString()
      return <div className="text-nowrap text-right">{createdAt}</div>
    }
  },
]

const passportColumns: ColumnDef<PassportItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.id.slice(0, 6)}...</span>
    }
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => {
      return (
        <div 
          className="max-w-xs cursor-pointer underline text-blue-600" 
          onClick={() => window.open(`/user/${row.original.sender}`, '_blank')}
        >
          {row.original.sender}
        </div>
      )
    }
  },
  {
    accessorKey: "timestamp",
    header: () => <div className="text-right text-nowrap">Created At</div>,
    cell: ({ row }) => {
      const createdAt = new Date(row.original.timestamp ?? 0).toLocaleDateString()
      return <div className="text-nowrap text-right">{createdAt}</div>
    }
  },
]

// 定义 Tab 值的类型
type TabValue = 'stamps' | 'passports'

// 修改 getCurrentConfig 的返回类型
type TableConfig<T> = {
  data: T[]
  columns: ColumnDef<T, unknown>[]
}

// 简化排序类型
type SortDirection = 'asc' | 'desc'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('stamps')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  // 简化排序状态
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { stamps, passport } = usePassportsStamps()

  const ITEMS_PER_PAGE = 7

  // 修改 getCurrentConfig 函数
  const getCurrentConfig = (): TableConfig<StampItem | PassportItem> => {
    switch (activeTab) {
      case 'stamps':
        return {
          data: stamps ?? [],
          columns: stampColumns as ColumnDef<StampItem | PassportItem, unknown>[]
        }
      case 'passports':
        return {
          data: passport ?? [],
          columns: passportColumns as ColumnDef<StampItem | PassportItem, unknown>[]
        }
    }
  }

  const { data, columns } = getCurrentConfig()

  // 简化排序处理函数
  const handleFilterChange = (value: string) => {
    setSortDirection(value === 'createdAt↑' ? 'asc' : 'desc')
  }

  // 简化数据过滤和排序逻辑
  const filteredData = data
    .filter(item =>
      'name' in item && item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      'id' in item && item.id.includes(searchQuery)
    )
    .sort((a, b) => {
      const dateA = new Date('timestamp' in a && a.timestamp ? a.timestamp : 0).getTime()
      const dateB = new Date('timestamp' in b && b.timestamp ? b.timestamp : 0).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    })

  // 处理分页
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 标签页切换时重置分页
  const handleTabChange = (value: string) => {
    // 类型断言确保 value 是有效的 TabValue
    setActiveTab(value as TabValue)
    setCurrentPage(1)
  }

  return (
    <div className="p-6 space-y-6 lg:bg-white lg:rounded-3xl lg:p-12">
      <div className="lg:flex lg:justify-between lg:items-center space-y-6 lg:space-y-0 pb-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard value={stamps?.length ?? 0} label="Stamps" />
          <StatsCard value={passport?.length ?? 0} label="Passports" />
        </div>
      </div>


      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:hidden">
          <TabsTrigger value="stamps">Stamps</TabsTrigger>
          <TabsTrigger value="passports">Passports</TabsTrigger>
        </TabsList>
        <div className="mt-6 space-y-4">
          <div className="lg:flex lg:justify-start lg:items-center lg:gap-8">
            <div className="lg:block hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stamps">Stamps</TabsTrigger>
                <TabsTrigger value="passports">Passports</TabsTrigger>
              </TabsList>
            </div>
            <SearchFilterBar
              searchPlaceholder="Search by name or ID"
              onSearchChange={setSearchQuery}
              filterOptions={[
                {
                  value: "createdAt↑",
                  label: "Created At ↑"
                },
                {
                  value: "createdAt↓",
                  label: "Created At ↓"
                }
              ]}
              onFilterChange={handleFilterChange}
            />
            <div className="hidden lg:block lg:ml-auto">
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
      </Tabs>
    </div>
  )
}