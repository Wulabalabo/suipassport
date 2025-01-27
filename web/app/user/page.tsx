'use client'

import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { useNetworkVariables } from '@/contracts'
import { useUserProfile } from '@/contexts/user-profile-context'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PassportFormValues } from '@/components/passport/passport-form'
import { edit_passport, show_stamp } from '@/contracts/passport'
import { useBetterSignAndExecuteTransaction } from '@/hooks/use-better-tx'
import { displayStamp } from '@/types/stamp'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import { useUserCrud } from '@/hooks/use-user-crud'
import { showToast } from '@/lib/toast'
import { useClaimStamps } from '@/hooks/use-stamp-crud'

export default function UserPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount()
  const { userProfile, refreshProfile } = useUserProfile();
  const { updateUserData } = useUserCrud();
  const { increaseClaimStampCount } = useClaimStamps();
  const { stamps } = usePassportsStamps();
  const networkVariables = useNetworkVariables();
  const { handleSignAndExecuteTransaction: handleEditStamp, isLoading: isEditingStamp } = useBetterSignAndExecuteTransaction({
    tx: edit_passport
  })
  const { handleSignAndExecuteTransaction: handleShowStamp } = useBetterSignAndExecuteTransaction({
    tx: show_stamp
  })

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
      await refreshProfile(currentAccount?.address, networkVariables)
      showToast.success("Edit Success")
    }).execute()
  }

  const handleCollect = async (stamp: displayStamp) => {    
    if (!currentAccount?.address) {
      showToast.error("Please connect your wallet first")
      return
    }

    if (!userProfile?.id.id) {
      showToast.error("Please create your passport first")
      return
    }

    if (!stamp.eventId) {
      showToast.error("Invalid stamp ID")
      return
    }

    if (!stamp.isCollectable) {
      showToast.error("You have already collected this stamp")
      return
    }

    await handleShowStamp({
      passport: userProfile?.id.id,
      stamp: stamp.id,
    }).onSuccess(async () => {
      showToast.success("Collect Success")
      await increaseClaimStampCount(stamp.eventId ?? '')
      await updateUserData(userProfile?.current_user, {
        stamp: { id: stamp.eventId ?? '', claim_count: 1 },
        points: stamp?.points
      })
      await refreshProfile(currentAccount?.address ?? '', networkVariables)
    }).execute()
  }

  // const fetchUserProfile = useCallback(async () => {
  //   if (currentAccount?.address && isValidSuiAddress(currentAccount.address)) {
  //     await refreshProfile(currentAccount.address, networkVariables)
  //   } else {
  //     if (!userProfile) {
  //       router.push("/")
  //     }
  //   }
  // }, [currentAccount?.address, networkVariables, refreshProfile, userProfile, router])

  useEffect(() => {
    if (!userProfile) {
      router.push("/")
    }
  }, [userProfile, router])

  return (
    <div className="lg:p-24 bg-background">
      <div className="bg-card lg:shadow-lg lg:shadow-border lg:border border-border rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard userProfile={userProfile} onEdit={handleEdit} isLoading={isEditingStamp} />
        <p className="pt-6 lg:pt-12 px-6 text-muted-foreground text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamps
        </p>
        <StampGrid userProfile={userProfile!} allstamps={stamps || []} collection_detail={userProfile?.collection_detail || []} onCollect={handleCollect} />
      </div>
    </div>
  )
} 