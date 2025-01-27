'use client'

import { useCallback, useEffect, useState } from 'react'
import { ConnectModal, useAccounts, useCurrentAccount, useCurrentWallet, useDisconnectWallet, useSwitchAccount } from '@mysten/dapp-kit'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Wallet } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/user-profile-context'
import { useNetworkVariables } from '@/contracts'
import { isValidSuiObjectId } from '@mysten/sui/utils'
import { removeToken } from '@/lib/jwtManager'
import { showToast } from '@/lib/toast'

export function CustomConnectButton() {
  const [open, setOpen] = useState(false)
  const { mutate: disconnect } = useDisconnectWallet()
  const { mutate: switchAccount } = useSwitchAccount()
  const { connectionStatus } = useCurrentWallet()
  const accounts = useAccounts()
  const router = useRouter()
  const pathname = usePathname()
  const { clearProfile, refreshProfile, userProfile } = useUserProfile()
  const networkVariables = useNetworkVariables()
  const currentAccount = useCurrentAccount()


  const onConnected = useCallback(async () => {
    if (currentAccount?.address && connectionStatus === "connected") { 
      const address = currentAccount.address
      await refreshProfile(address, networkVariables)
    }
    if (connectionStatus === "disconnected") {
      await removeToken()
    }
  }, [currentAccount?.address, connectionStatus, networkVariables, refreshProfile])

  useEffect(() => {
    onConnected()
  }, [onConnected])

  if (!accounts.length) {
    return (
      <ConnectModal
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        }
      />
    )
  }



  const handleDisconnect = () => {
    disconnect()
    clearProfile()
    setOpen(false)
  }

  const handleProfile = () => {
    if (!userProfile?.id.id) {
      showToast.error("Please create your passport first")
      return
    }
    router.push(pathname === '/user' ? '/' : '/user')
  }

  const handleAdminCap = () => {
    router.push('/admin')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          {truncateAddress(currentAccount?.address ?? '')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {accounts.length > 1 && (
          <>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.address}
                onClick={() => switchAccount({ account })}
              >
                <User className="mr-2 h-4 w-4" />
                {truncateAddress(account.address)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          {pathname === '/user' ? 'Home' : 'Profile'}
        </DropdownMenuItem>
        { userProfile?.admincap && isValidSuiObjectId(userProfile?.admincap) && (
          <DropdownMenuItem onClick={handleAdminCap}>
            <User className="mr-2 h-4 w-4" />
            Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 