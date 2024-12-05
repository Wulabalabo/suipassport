'use client'

import RankingPage from './@ranking/page'
import AdminStamp from './admin/@stamp/page'
import { mockStamp } from '../mock'
import { PassportFormDialog, passportFormSchema } from '@/components/passport/passport-form-dialog'
import { z } from 'zod'
import { useNetworkVariables } from '@/config'
import { mint_passport } from '@/contracts/passport'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { toast } from '@/hooks/use-toast'

export default function Home() {
  const networkVariables = useNetworkVariables();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const handleSubmit = async (values: z.infer<typeof passportFormSchema>) => {
    const tx = await mint_passport(networkVariables, values.name, values.avatar, values.introduction, values.x ?? '', values.github ?? '', values.email ?? '');
    await signAndExecuteTransaction({ transaction: tx },{onSuccess: () => {
      toast({
        title: "Passport minted successfully",
        description: "You can now view your passport in the ranking page",
      });
    },onError: () => {
      toast({
        title: "Failed to mint passport",
        description: "Please try again",
        variant: "destructive"
      });
    }});
  }
  return (
    <div className="">
      <div className="w-full lg:p-24 lg:pb-48 bg-gray-100 lg:space-y-24">
        <>
          <div className="flex flex-col gap-4 px-8">
            <div className="flex gap-x-3">
              <h1 className="text-4xl font-bold">Make your mark on the Sui Community with the</h1>
              <div className="text-center">
                <span className="text-primary text-2xl font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Sui </span>
                <span className="text-2xl font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Passport</span>
              </div>
              <div className="ml-auto">
                <PassportFormDialog onSubmit={handleSubmit} />
              </div>
            </div>
            <p className="text-lg">The Sui community flourishes because of passionate members like you. Through content, conferences, events, and hackathons, your contributions help elevate our Sui Community. Now it’s time to showcase your impact, gain recognition, and unlock rewards for your active participation. Connect your wallet today and claim your first stamp!</p>
          </div>
          <AdminStamp mockStamp={mockStamp} admin={false} />
          <RankingPage />
        </>
      </div>
    </div>
  )
}
