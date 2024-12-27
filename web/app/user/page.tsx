'use client'

import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { useNetworkVariables } from '@/contracts'
import { useUserProfile } from '@/contexts/user-profile-context'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PassportFormValues } from '@/components/passport/passport-form'
import { edit_passport } from '@/contracts/passport'
import { useBetterSignAndExecuteTransaction } from '@/hooks/use-better-tx'
import { toast } from '@/hooks/use-toast'


export default function UserPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount()
  const { userProfile, refreshProfile } = useUserProfile();
  const networkVariables = useNetworkVariables();
  const { handleSignAndExecuteTransaction } = useBetterSignAndExecuteTransaction({
    tx: edit_passport
  })

  const handleEdit = async (passportFormValues: PassportFormValues) => {
    if (!userProfile?.id.id || !passportFormValues.x || !passportFormValues.github || !currentAccount?.address) {
      return
    }
    await handleSignAndExecuteTransaction({
      passport: userProfile?.id.id,
      name: passportFormValues.name,
      avatar: passportFormValues.avatar,
      introduction: passportFormValues.introduction,
      x: passportFormValues.x,
      github: passportFormValues.github,
      email: "",
    }).onSuccess(async () => {
      await refreshProfile(currentAccount?.address ?? '', networkVariables)
    }).execute()
  }

  useEffect(() => {
    if (!userProfile || userProfile?.last_time === 0) {
      router.push("/")
      return
    }
    if (currentAccount?.address && isValidSuiAddress(currentAccount.address)) {
      if (!userProfile) {
        refreshProfile(currentAccount.address, networkVariables)
      }
    }
    console.log(userProfile)
  }, [currentAccount?.address, networkVariables, refreshProfile, userProfile, router])

  return (
    <div className="lg:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} onEdit={handleEdit} />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid items={userProfile?.stamps || []} />
      </div>
    </div>
  )
} 