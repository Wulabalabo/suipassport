'use client'

import { useState } from "react"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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

interface EventItem extends BaseItem {
  location: string
}

interface StampItem extends BaseItem {
  eventId: string
}

interface PassportItem extends BaseItem {
  userId: string
}

// 定义联合类型来表示所有可能的数据类型
type DataItem = EventItem | StampItem | PassportItem

// 定义不同表格的列
const eventColumns: ColumnDef<EventItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
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
    accessorKey: "eventId",
    header: "Event ID",
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
  events: Array.from({ length: 23 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Event ${i + 1}`,
    location: `Location ${i + 1}`,
    status: "Active",
    createdAt: "2024-03-20",
  })),
  stamps: Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Stamp ${i + 1}`,
    eventId: `event-${i + 1}`,
    status: "Active",
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
type TabValue = 'events' | 'stamps' | 'passports'

// 修改 getCurrentConfig 的返回类型
type TableConfig<T> = {
    data: T[]
    columns: ColumnDef<T, any>[]
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabValue>('events')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    
    const ITEMS_PER_PAGE = 7

    // 修改 getCurrentConfig 函数
    const getCurrentConfig = (): TableConfig<EventItem | StampItem | PassportItem> => {
        switch (activeTab) {
            case 'events':
                return { 
                    data: mockData.events, 
                    columns: eventColumns as ColumnDef<EventItem | StampItem | PassportItem, any>[] 
                }
            case 'stamps':
                return { 
                    data: mockData.stamps, 
                    columns: stampColumns as ColumnDef<EventItem | StampItem | PassportItem, any>[] 
                }
            case 'passports':
                return { 
                    data: mockData.passports, 
                    columns: passportColumns as ColumnDef<EventItem | StampItem | PassportItem, any>[] 
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
        <div className="p-6 space-y-6">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard value={mockData.events.length} label="Events" />
                <StatsCard value={mockData.stamps.length} label="Stamps" />
                <StatsCard value={mockData.passports.length} label="Passports" />
            </div>

            {/* Tabs */}
            <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange} 
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="stamps">Stamps</TabsTrigger>
                    <TabsTrigger value="passports">Passports</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                    <SearchFilterBar 
                        searchPlaceholder="Search by name or ID" 
                        onSearchChange={setSearchQuery}
                    />
                    <DataTable 
                        columns={columns} 
                        data={paginatedData}
                    />
                    <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </Tabs>
        </div>
    )
}