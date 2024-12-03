'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminStamp from './@stamp/page'
import AdminDashboard from './@dashboard/page'
import { mockStamp } from '../mock'

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