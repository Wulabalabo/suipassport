'use client'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ProfileCard } from '../components/user/profile-card'

export default function Home() {
  const account = useCurrentAccount()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {account ? <ProfileCard /> : <div>Connect your wallet to see your profile</div>}
      </div>
    </div>
  )
}
