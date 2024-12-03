'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'
import { mockStamp } from '@/app/mock'



export default function UserPage() {
  const account = useCurrentAccount()
  const router = useRouter()


  return (
    <div className="lg:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid items={mockStamp}/>
      </div>
    </div>
  )
} 