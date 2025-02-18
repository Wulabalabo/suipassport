'use client'

import AdminStamp from './@stamp/page'
import { PassportFormDialog } from '@/components/passport/passport-form-dialog'
import { z } from 'zod'
import { useNetworkVariables } from '@/contracts'
import { mint_passport } from '@/contracts/passport'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useUserProfile } from '@/contexts/user-profile-context'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import { useEffect } from 'react'
import { passportFormSchema } from '@/components/passport/passport-form'
import { useBetterSignAndExecuteTransactionWithSponsor } from '@/hooks/use-better-tx'
import RankingPage from './@ranking/page'
import { showToast } from '@/lib/toast'
import { apiFetch } from '@/lib/apiClient'

export default function Home() {
  const networkVariables = useNetworkVariables();
  const { stamps, refreshPassportStamps } = usePassportsStamps()
  const { refreshProfile, isLoading: isUserLoading } = useUserProfile()
  const currentAccount = useCurrentAccount()
  // const { handleSignAndExecuteTransaction, isLoading: isMintingPassport } = useBetterSignAndExecuteTransaction({
  //   tx: mint_passport
  // })

  const { handleSignAndExecuteTransactionWithSponsor, isLoading: isMintingPassportWithSponsor } = useBetterSignAndExecuteTransactionWithSponsor({
    tx: mint_passport
  })

  const handleSubmit = async (values: z.infer<typeof passportFormSchema>) => {
    const isConnected = await apiFetch<{ isConnected: boolean }>('/api/check', { method: 'GET' });
    if (!isConnected.isConnected) {
      showToast.error("Database connection error")
      return
    }
    await handleSignAndExecuteTransactionWithSponsor(
      process.env.NEXT_PUBLIC_NETWORK as 'testnet' | 'mainnet', 
      currentAccount?.address ?? '',
      [currentAccount?.address ?? ''],
      {
        name: values.name,
        avatar: values.avatar ?? '',
        introduction: values.introduction ?? '',
        x: values.x ?? '',
        github: values.github ?? '',
        email: ''
      }
    ).onSuccess(async () => {
      showToast.success("Passport minted successfully")
      await onPassportCreated()
    }).onError((error) => {
      showToast.error(`Error minting passport: ${error.message}`)
    }).execute()
  }

  const onPassportCreated = async () => {
    if (!currentAccount?.address) {
      showToast.error("You need to connect your wallet to create a passport")
      return
    }
    await refreshProfile(currentAccount?.address ?? '', networkVariables)
    await refreshPassportStamps(networkVariables)
  }

  useEffect(() => {
    refreshPassportStamps(networkVariables)
  }, [networkVariables, refreshPassportStamps])

  return (
    <div className="">
      <div className="w-full lg:p-24 lg:pb-48 bg-background lg:space-y-24">
        <>
          <div className="flex flex-col gap-4 px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:gap-x-3 gap-y-4">
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-x-3">
                <h1 className="text-3xl lg:text-3xl font-bold pt-8 lg:pt-0">Make your mark on the Sui Community with the</h1>
                <div className="text-center">
                  <span className="text-primary text-5xl font-medium leading-loose tracking-tight md:text-2xl lg:font-bold lg:text-4xl">Sui </span>
                  <span className="text-5xl font-medium leading-loose tracking-tight md:text-2xl lg:font-bold lg:text-4xl">Passport</span>
                </div>
              </div>
              <div className="lg:ml-auto text-center">
                <PassportFormDialog onSubmit={handleSubmit} isLoading={isUserLoading || isMintingPassportWithSponsor} />
              </div>
            </div>
            <p className="text-base lg:text-lg">The Sui community flourishes because of passionate members like you. Through content, conferences, events, and hackathons, your contributions help elevate our Sui Community. Now it&apos;s time to showcase your impact, gain recognition, and unlock rewards for your active participation. Connect your wallet today and claim your first stamp!</p>
          </div>
          <AdminStamp stamps={stamps} admin={false} />
          <RankingPage />
        </>
      </div>
    </div>
  )
}
