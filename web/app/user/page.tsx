'use client'

import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { useNetworkVariables } from '@/config'
import { useUserProfile } from '@/contexts/user-profile-context'
import { mockStamp } from '@/mock'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useEffect } from 'react'



export default function UserPage() {

  const currentAccount = useCurrentAccount()
  const { userProfile, refreshProfile } = useUserProfile();
  const networkVariables = useNetworkVariables();
  useEffect(() => {
    if (currentAccount?.address && isValidSuiAddress(currentAccount.address)) {
      if (!userProfile) {
        refreshProfile(currentAccount.address, networkVariables)
      }
    }
  }, [currentAccount?.address, networkVariables, refreshProfile, userProfile])

  return (
    <div className="lg:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid items={mockStamp} />
      </div>
    </div>
  )
} 