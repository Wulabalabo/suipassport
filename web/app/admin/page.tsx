'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminStamp from './@stamp/page'
import AdminDashboard from './@dashboard/page'

const mockStamp = [
    { id: 1, name: "Stamp 1" },
    { id: 2, name: "Stamp 2" },
    { id: 3, name: "Stamp 3" },
    { id: 4, name: "Stamp 4" },
    { id: 5, name: "Stamp 5" },
    { id: 6, name: "Stamp 6" },
    { id: 7, name: "Stamp 7" },
    { id: 8, name: "Stamp 8" },
    { id: 9, name: "Stamp 9" },
    { id: 10, name: "Stamp 10" },
]

export default function AdminPage() {
  const router = useRouter()
  const media = useMediaQuery('(max-width: 1024px)')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && media) {
      router.replace('/admin/stamp')
    }
  }, [media, isClient, router])

  if (!isClient) return null

  return (
    <div className="w-full p-24 pb-48 bg-gray-100 space-y-24">
      {!media && (
        <>
          <AdminStamp mockStamp={mockStamp} admin={true} />
          <AdminDashboard />
        </>
      )}
    </div>
  )
} 