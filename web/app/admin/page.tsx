'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminEvent from './@event/page'
import AdminDashboard from './@dashboard/page'

const mockEvent = [
    { id: 1, name: "Event 1" },
    { id: 2, name: "Event 2" },
    { id: 3, name: "Event 3" },
    { id: 4, name: "Event 4" },
    { id: 5, name: "Event 5" },
    { id: 6, name: "Event 6" },
    { id: 7, name: "Event 7" },
    { id: 8, name: "Event 8" },
    { id: 9, name: "Event 9" },
    { id: 10, name: "Event 10" },
]

export default function AdminPage() {
  const account = useCurrentAccount()
  const router = useRouter()
  const media = useMediaQuery('(max-width: 1024px)')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && media) {
      router.replace('/admin/events')
    }
  }, [media, isClient, router])

  if (!isClient) return null

  return (
    <div className="w-full">
      {!media && (
        <>
          <AdminEvent mockEvent={mockEvent} />
          <AdminDashboard />
        </>
      )}
    </div>
  )
} 