'use client'

import { useState, useEffect } from "react"
// import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { StampItem } from "@/types/stamp"
import { useApp } from "@/contexts/app-context"
import { PassportItem } from "@/types/passport"
import Link from "next/link"
import { DbUserResponse } from "@/types/userProfile"
import { StampDistributionChart } from "@/components/ui/stamp-distribution-chart"
import { PointsDistributionChart } from "@/components/ui/points-distribution-chart"
import { UserGrowthChart } from "@/components/ui/user-growth-chart"

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

const passportColumns: ColumnDef<DbUserResponse>[] = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.address.slice(0, 6)}...</span>
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div 
          className="max-w-xs cursor-pointer underline text-blue-600 truncate" 
        >
          <Link href={`/user/${row.original.address}`} target="_blank">{row.original.name}</Link>
        </div>
      )
    }
  },
  {
    accessorKey: "points",
    header: () => <div className="text-right text-nowrap">Points</div>,
    cell: ({ row }) => {
      return <div className="text-nowrap text-right">{row.original.points}</div>
    }
  },
  {
    accessorKey: "stamp_count",
    header: () => <div className="text-right text-nowrap">Stamps</div>,
    cell: ({ row }) => {
      return <div className="text-nowrap text-right">{row.original.stamp_count}</div>
    }
  },
]

type TabValue = 'stamps' | 'passports'

type TableConfig<T> = {
  data: T[]
  columns: ColumnDef<T, unknown>[]
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('stamps')
  const [statistics, setStatistics] = useState<{
    totalUsers: number;
    totalStamps: number;
    totalPoints: number;
    stampsDistribution: { range: string; count: number }[];
    pointsDistribution: { range: string; count: number }[];
    growthByDay: { date: string; count: number }[];
  } | null>(null);
  
  const { 
    stamps, 
    users,
    pagination,
    fetchUsers,
    usersLoading
  } = useApp()

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/user/statistics');
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  const getCurrentConfig = (): TableConfig<StampItem | PassportItem | DbUserResponse> => {
    switch (activeTab) {
      case 'stamps':
        return {
          data: stamps ?? [],
          columns: stampColumns as ColumnDef<StampItem | PassportItem | DbUserResponse, unknown>[]
        }
      case 'passports':
        return {
          data: users ?? [],
          columns: passportColumns as ColumnDef<StampItem | PassportItem | DbUserResponse, unknown>[]
        } 
    }
  }

  const { data, columns } = getCurrentConfig()

  // const handleSearch = () => {
  //   if (activeTab === 'passports') {
  //     fetchUsers(1, pagination.itemsPerPage)
  //   }
  // }

  const handlePageChange = (page: number) => {
    if (activeTab === 'passports') {
      fetchUsers(page, pagination.itemsPerPage)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue)
    if (value === 'passports') {
      fetchUsers(1, pagination.itemsPerPage)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-card border border-border shadow-md shadow-border lg:rounded-3xl lg:p-12">
      <div className="lg:flex lg:justify-between lg:items-center space-y-6 lg:space-y-0 pb-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard value={stamps?.length ?? 0} label="Stamps" />
          <StatsCard value={statistics?.totalUsers ?? 0} label="Total Users" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {statistics && (
          <>
            <PointsDistributionChart data={statistics.pointsDistribution} />
            <StampDistributionChart data={statistics.stampsDistribution} />
            <div className="lg:col-span-2">
              <UserGrowthChart data={statistics.growthByDay} />
            </div>
          </>
        )}
      </div>

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
            {/* <SearchFilterBar
              searchPlaceholder="Search by name or ID"
              onSearchChange={handleSearch}
            /> */}
            {activeTab === 'passports' && (
              <div className="hidden lg:block lg:ml-auto">
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
          {(activeTab === 'passports' && usersLoading) ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DataTable
              columns={columns as ColumnDef<Record<string, unknown>, unknown>[]}
              data={data as Record<string, unknown>[]}
            />
          )}
          {activeTab === 'passports' && (
            <div className="lg:hidden">
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}