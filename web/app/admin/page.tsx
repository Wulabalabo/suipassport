'use client'
  
import { useEffect } from 'react'
import AdminStamp from './@stamp/page'
import AdminDashboard from './@dashboard/page'
import { useNetworkVariables } from '@/config'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'

export default function AdminPage() {
  const networkVariables = useNetworkVariables()
  const { refreshStamps, stamps } = usePassportsStamps()

  useEffect(() => {
    refreshStamps(networkVariables)
  }, [networkVariables, refreshStamps])

  return (
    <div className="w-full lg:p-24 lg:pb-48 bg-gray-100 space-y-24">
      {(
        <>
          <AdminStamp stamps={stamps} admin={true} />
          <AdminDashboard />
        </>
      )}
    </div>
  )
} 