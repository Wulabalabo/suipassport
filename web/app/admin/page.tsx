'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const account = useCurrentAccount()
  const router = useRouter()

  // Add your admin validation logic here
  const isAdmin = false // Replace with your admin validation logic

  useEffect(() => {
    if (!account || !isAdmin) {
      router.push('/')
    }
  }, [account, isAdmin, router])

  if (!account || !isAdmin) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg mb-4">Admin Address: {account.address}</p>
        {/* Add your admin dashboard content here */}
      </div>
    </div>
  )
} 