'use client'

import AdminStamp from './admin/@stamp/page'
import { PassportFormDialog } from '@/components/passport/passport-form-dialog'
import { z } from 'zod'
import { useNetworkVariables } from '@/contracts'
import { mint_passport } from '@/contracts/passport'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useUserProfile } from '@/contexts/user-profile-context'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import AdminDashboard from './admin/@dashboard/page'
import { useEffect } from 'react'
import { passportFormSchema } from '@/components/passport/passport-form'
import { useBetterSignAndExecuteTransaction } from '@/hooks/use-better-tx'
import { toast } from '@/hooks/use-toast'

export default function Home() {
  const networkVariables = useNetworkVariables();
  const { stamps,refreshPassportStamps } = usePassportsStamps()
  const { refreshProfile } = useUserProfile()
  const currentAccount = useCurrentAccount()
  const { handleSignAndExecuteTransaction } = useBetterSignAndExecuteTransaction({
    tx: mint_passport,
    onSuccess: () => {
      toast({
        title: "Passport minted successfully",
        description: "You can now view your passport in the profile page",
      })
    },
    onSettled: async () =>  {      
      if (currentAccount?.address) {
        // Add a delay to allow time for blockchain data to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        refreshProfile(currentAccount?.address ?? '', networkVariables)
        refreshPassportStamps(networkVariables)
      }
    }
    
  })

  const handleSubmit = async (values: z.infer<typeof passportFormSchema>) => {
    await handleSignAndExecuteTransaction({
      name: values.name,
      avatar: values.avatar,
      introduction: values.introduction,
      x: values.x ?? '',
      github: values.github ?? '',
      email: ''
    });
  }

  useEffect(() => {
    refreshPassportStamps(networkVariables)
  }, [networkVariables, refreshPassportStamps])

  return (
    <div className="">
      <div className="w-full lg:p-24 lg:pb-48 bg-gray-100 lg:space-y-24">
        <>
          <div className="flex flex-col gap-4 px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:gap-x-3 gap-y-4">
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-x-3">
                <h1 className="text-3xl lg:text-4xl font-bold pt-8 lg:pt-0">Make your mark on the Sui Community with the</h1>
                <div className="text-center">
                  <span className="text-primary text-6xl font-medium leading-loose tracking-tight md:text-2xl lg:font-bold lg:text-4xl">Sui </span>
                  <span className="text-6xl font-medium leading-loose tracking-tight md:text-2xl lg:font-bold lg:text-4xl">Passport</span>
                </div>
              </div>
              <div className="lg:ml-auto text-center">
                <PassportFormDialog onSubmit={handleSubmit} />
              </div>
            </div>
            <p className="text-base lg:text-lg">The Sui community flourishes because of passionate members like you. Through content, conferences, events, and hackathons, your contributions help elevate our Sui Community. Now it&apos;s time to showcase your impact, gain recognition, and unlock rewards for your active participation. Connect your wallet today and claim your first stamp!</p>
          </div>
          <AdminStamp stamps={stamps} admin={false} />
          <AdminDashboard/>
        </>
      </div>
    </div>
  )
}
