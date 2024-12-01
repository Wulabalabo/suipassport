'use client'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ProfileCard } from '../components/user/profile-card'
import Link from 'next/link'

export default function Home() {
  const account = useCurrentAccount()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-10">
        <h1 className="text-3xl">
          Test Effect Version
        </h1>
        <div className="flex gap-6">
          <Link 
            href="/admin" 
            className="px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/user"
            className="px-6 py-3 text-lg font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors" 
          >
            User
          </Link>
        </div>
      </div>
    </div>
  )
}
