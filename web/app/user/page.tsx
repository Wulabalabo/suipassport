'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfileCard } from '@/components/user/profile-card'
import { StampGrid } from '@/components/user/stamp-grid'

const mockStamps = [
  {
    id: 1,
    name: "Stamp 1",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Stamp 2",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Stamp 3",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Stamp 4",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "Stamp 5",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 6,
    name: "Stamp 6",
    type: "Stamp",
    imageUrl: "https://via.placeholder.com/150",
  },
]

export default function UserPage() {
  const account = useCurrentAccount()
  const router = useRouter()


  return (
    <div className="lg:p-24 bg-gray-50">
      <div className="bg-white rounded-t-2xl lg:pb-6 lg:rounded-b-2xl">
        <ProfileCard />
        <p className="pt-6 lg:pt-12 px-6 text-gray-500 text-2xl font-medium leading-loose tracking-tight lg:text-3xl lg:font-bold">
          My Stamp
        </p>
        <StampGrid items={mockStamps}/>
      </div>
    </div>
  )
} 