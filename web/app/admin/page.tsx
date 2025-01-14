'use client'

import { useEffect, useState } from 'react'
import AdminStamp from '../@stamp/page'
import AdminDashboard from './@dashboard/page'
import { useNetworkVariables } from '@/contracts'
import { usePassportsStamps } from '@/contexts/passports-stamps-context'
import { useUserProfile } from '@/contexts/user-profile-context'
import { isValidSuiAddress, isValidSuiObjectId } from '@mysten/sui/utils'
import { useRouter } from 'next/navigation'
import { useBetterSignAndExecuteTransaction } from '@/hooks/use-better-tx'
import { set_admin } from '@/contracts/stamp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/toast'

export default function AdminPage() {
  const networkVariables = useNetworkVariables()
  const { refreshPassportStamps, stamps } = usePassportsStamps()
  const { userProfile } = useUserProfile()
  const router = useRouter()
  const { handleSignAndExecuteTransaction: handleSetAdminTx } = useBetterSignAndExecuteTransaction({
    tx: set_admin
  })
  const [recipient, setRecipient] = useState('')

  const handleSetAdmin = async () => {
    if (!userProfile?.admincap || !isValidSuiObjectId(userProfile.admincap)) {
      showToast.error('Admin Cap is not valid')
      return
    }
    if (!isValidSuiAddress(recipient)) {
      showToast.error('Recipient is not valid')
      return
    }
    await handleSetAdminTx({
      adminCap: userProfile?.admincap,
      recipient: recipient
    }).onSuccess(() => {
      showToast.success('Admin set successfully')
    }).execute()
  }

  useEffect(() => {
    if (!userProfile?.admincap || !isValidSuiObjectId(userProfile.admincap)) {
      router.push('/')
      return
    }
    refreshPassportStamps(networkVariables)
  }, [networkVariables, refreshPassportStamps, userProfile, router])

  return (
    <div className="w-full lg:p-24 lg:pb-48 bg-background space-y-24">
      {(
        <>
          <div className="lg:absolute top-32 right-24 p-4">
            <div className="flex w-72 gap-4 bg-card border border-border shadow-md shadow-border p-4 rounded-lg">
              <Input placeholder="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              <Button onClick={handleSetAdmin}>Set Admin</Button>
            </div>
          </div>
          <AdminStamp stamps={stamps} admin={true} />
          <AdminDashboard />
        </>
      )}
    </div>
  )
} 