'use client'

import { useState } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"

// 定义基础接口
interface BaseItem {
  id: string
  name: string
  status: string
  createdAt: string
}

interface StampItem extends BaseItem {
  type: string
}

interface PassportItem extends BaseItem {
  userId: string
}

const stampColumns: ColumnDef<StampItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

const passportColumns: ColumnDef<PassportItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

// 示例数据
const mockData = {
  stamps: Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Stamp ${i + 1}`,
    status: "Active",
    type: "Sample Type",
    createdAt: "2024-03-20",
  })),
  passports: Array.from({ length: 18 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Passport ${i + 1}`,
    userId: `user-${i + 1}`,
    status: "Active",
    createdAt: "2024-03-20",
  })),
}

// 定义 Tab 值的类型
type TabValue = 'stamps' | 'passports'

// 修改 getCurrentConfig 的返回类型
type TableConfig<T> = {
  data: T[]
  columns: ColumnDef<T, unknown>[]
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('stamps')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const ITEMS_PER_PAGE = 7

  // 修改 getCurrentConfig 函数
  const getCurrentConfig = (): TableConfig<StampItem | PassportItem> => {
    switch (activeTab) {
      case 'stamps':
        return {
          data: mockData.stamps,
          columns: stampColumns as ColumnDef<StampItem | PassportItem, unknown>[]
        }
      case 'passports':
        return {
          data: mockData.passports,
          columns: passportColumns as ColumnDef<StampItem | PassportItem, unknown>[]
        }
    }
  }

  const { data, columns } = getCurrentConfig()

  // 处理搜索过滤
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.includes(searchQuery)
  )

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
          <StatsCard value={mockData.stamps.length} label="Stamps" />
          <StatsCard value={mockData.passports.length} label="Passports" />
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