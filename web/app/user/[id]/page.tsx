'use client'

import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useUserProfile } from '@/contexts/user-profile-context'
import { useNetworkVariables } from '@/contracts'
import { UserProfile } from '@/types'

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
  const { getPageUserProfile} = useUserProfile();
  const networkVariables = useNetworkVariables();
  const [isVisitor, setIsVisitor] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if(!isValidSuiAddress(userId)){
      router.replace('/')
      return
    }
    if (currentAccount?.address === userId) {      
      setIsVisitor(false)
      router.replace('/user')
      return
    }
    setIsVisitor(true)
    setIsLoading(false)
    if(!userProfile){
      getPageUserProfile(userId, networkVariables).then((profile) => {
        if(profile){
          setUserProfile(profile)
        }
      })
    }
  }, [currentAccount?.address, userId, networkVariables, router, userProfile, getPageUserProfile])
  
  return (
    !isLoading ? <div className="lg:p-24 bg-background">
      <div className="bg-card border border-border shadow-md shadow-border rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} />
        <p className="pt-6 lg:pt-12 px-6 text-muted-foreground text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          Stamps
        </p>  
        <StampGrid userProfile={userProfile!} allstamps={[]} collection_detail={userProfile?.collection_detail || []} isVisitor={isVisitor}/>
      </div>
    </div> : null
  )
} 