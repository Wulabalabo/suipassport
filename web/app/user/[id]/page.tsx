'use client'

import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useUserProfile } from '@/contexts/user-profile-context'
import { useNetworkVariables } from '@/contracts'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const resolvedParams = use(params)
  const userId = resolvedParams.id
  const [isLoading, setIsLoading] = useState(true)
  const { userProfile, refreshProfile } = useUserProfile();
  const networkVariables = useNetworkVariables();
  const [isVisitor, setIsVisitor] = useState(false)

  useEffect(() => {
    if(!isValidSuiAddress(userId)){
      router.replace('/')
      return
    }
    if (currentAccount?.address === userId) {
      router.replace('/user')
      setIsVisitor(false)
      return
    }
    setIsVisitor(true)
    setIsLoading(false)
    if(!userProfile){
      refreshProfile(userId, networkVariables)
    }
  }, [currentAccount?.address, userId, networkVariables, router, refreshProfile, userProfile])
  
  return (
    !isLoading ? <div className="lg:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid stamps={userProfile?.stamps || []} collection_detail={userProfile?.collection_detail || []} isVisitor={isVisitor}/>
      </div>
    </div> : null
  )
} 