'use client'
  
import { useEffect } from 'react'
import AdminStamp from './@stamp/page'
import AdminDashboard from './@dashboard/page'
import { useNetworkVariables } from '@/contracts'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import { useUserProfile } from '@/contexts/user-profile-context'
import { isValidSuiObjectId } from '@mysten/sui/utils'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const networkVariables = useNetworkVariables()
  const { refreshPassportStamps, stamps} = usePassportsStamps()
  const { userProfile } = useUserProfile()
  const router = useRouter()
  
  useEffect(() => {
    if (!userProfile?.admincap || !isValidSuiObjectId(userProfile.admincap)) {
      router.push('/')
      return
    }
    refreshPassportStamps(networkVariables)
  }, [networkVariables, refreshPassportStamps, userProfile,router])

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