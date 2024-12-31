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
import { edit_passport, show_stamp } from '@/contracts/passport'
import { useBetterSignAndExecuteTransaction } from '@/hooks/use-better-tx'
import { useToast } from '@/hooks/use-toast'
import { displayStamp } from '@/types/stamp'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import { useUserCrud } from '@/hooks/use-user-crud'

export default function UserPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount()
  const { userProfile, refreshProfile } = useUserProfile();
  const { updateUserData } = useUserCrud();
  const { stamps } = usePassportsStamps();
  const networkVariables = useNetworkVariables();
  const { handleSignAndExecuteTransaction: handleEditStamp } = useBetterSignAndExecuteTransaction({
    tx: edit_passport
  })
  const { handleSignAndExecuteTransaction: handleShowStamp } = useBetterSignAndExecuteTransaction({
    tx: show_stamp
  })
  const { toast } = useToast()

  const onStampSent = async (stamp: displayStamp) => {
    if (!stamp?.eventId || !userProfile?.current_user) return
    await fetch(`/api/claim-stamps/add`, {
      method: "PATCH",
      body: JSON.stringify({
        stamp_id: stamp?.eventId
      })
    })
    await updateUserData(userProfile?.current_user, {
      stamp: { id: stamp?.eventId, claim_count: 1 },
      points: stamp?.points
    })
  }

  const handleEdit = async (passportFormValues: PassportFormValues) => {
    if (!userProfile?.id.id || !currentAccount?.address) {
      return
    }
    await handleEditStamp({
      passport: userProfile?.id.id,
      name: passportFormValues.name,
      avatar: passportFormValues.avatar ?? '',
      introduction: passportFormValues.introduction ?? '',
      x: passportFormValues.x ?? '',
      github: passportFormValues.github ?? '',
      email: "",
    }).onSuccess(async () => {
      await refreshProfile(currentAccount?.address ?? '', networkVariables)
      toast({
        title: "Edit Success",
        description: "Your passport has been updated",
        variant: "default"
      })
    }).execute()
  }

  const handleCollect = async (stamp: displayStamp) => {
    if (!stamp.isCollectable) {
      toast({
        title: "Collect Failed",
        description: "You have already collected this stamp",
        variant: "default"
      })
      return
    }
    if (!userProfile?.id.id || !currentAccount?.address) {
      return
    }
    await handleShowStamp({
      passport: userProfile?.id.id,
      stamp: stamp.id,
    }).onSuccess(async () => {
      await onStampSent(stamp)
      await refreshProfile(currentAccount?.address ?? '', networkVariables)
      toast({
        title: "Collect Success",
        description: "You have collected this stamp",
        variant: "default"
      })
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
  }, [currentAccount?.address, networkVariables, refreshProfile, userProfile, router, stamps])

  return (
    <div className="lg:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} onEdit={handleEdit} />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid userProfile={userProfile!} allstamps={stamps || []} collection_detail={userProfile?.collection_detail || []} onCollect={handleCollect} />
      </div>
    </div>
  )
} 